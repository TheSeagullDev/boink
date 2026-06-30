import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { VITE_APP_URL } from '$env/static/private';

export async function load({ locals }) {
	const { data: employees } = await locals.supabase.from('profiles').select('*').order('name');

	return { employees };
}

export const actions = {
	createWorker: async ({ request, locals }) => {
		const form = await request.formData();
		const name = form.get('name')?.trim();
		const email = form.get('email')?.trim().toLowerCase();
		const phone = form.get('phone')?.trim();

		// ============================================
		// 1. AUTHENTICATION & AUTHORIZATION
		// ============================================
		const { user } = await locals.safeGetSession();

		if (!user) {
			return { success: false, error: 'You must be logged in' };
		}

		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profile?.role !== 'admin') {
			return { success: false, error: 'Only admins can create workers' };
		}

		// ============================================
		// 2. VALIDATION
		// ============================================
		if (!name || !email) {
			return { success: false, error: 'Name and email are required' };
		}

		if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
			return { success: false, error: 'Invalid email address' };
		}

		// ============================================
		// 3. CHECK IF USER ALREADY EXISTS
		// ============================================
		const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
		const userExists = existingUser.users.some((u) => u.email === email);

		if (userExists) {
			return { success: false, error: 'User with this email already exists' };
		}

		// ============================================
		// 4. CREATE AUTH USER (SEND INVITE)
		// ============================================
		const { data: inviteData, error: inviteError } =
			await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
				redirectTo: `${VITE_APP_URL || 'http://localhost:5173'}/auth/confirm`
			});

		if (inviteError) {
			console.error('Invite error:', inviteError);
			return { success: false, error: `Failed to send invite: ${inviteError.message}` };
		}

		if (!inviteData.user) {
			return { success: false, error: 'Failed to create user account' };
		}

		// ============================================
		// 5. CREATE PROFILE
		// ============================================
		const { error: profileError } = await supabaseAdmin.from('profiles').insert({
			id: inviteData.user.id,
			name,
			email,
			phone: phone || null,
			role: 'worker'
		});

		if (profileError) {
			// Clean up: delete the auth user if profile creation fails
			await supabaseAdmin.auth.admin.deleteUser(inviteData.user.id);
			console.error('Profile creation error:', profileError);
			return { success: false, error: `Failed to create profile: ${profileError.message}` };
		}

		// ============================================
		// 6. SUCCESS
		// ============================================
		return {
			success: true,
			message: `Invite sent to ${email}. They'll receive an email to set up their account.`,
			user: {
				id: inviteData.user.id,
				email: inviteData.user.email
			}
		};
	}
};
