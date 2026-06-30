import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	// Check if user is already authenticated
	const { session } = await locals.safeGetSession();

	if (session) {
		// If they already have a session, redirect to dashboard
		throw redirect(303, '/dashboard');
	}

	// Otherwise, let them proceed to the confirmation page
	// The client-side code will handle the hash-based token
	return {};
}
