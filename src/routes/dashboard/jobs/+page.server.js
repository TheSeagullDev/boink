export async function load({ locals }) {
	const { data: jobs } = await locals.supabase.from('jobs').select('*').order('job_number');

	return { jobs };
}

import { fail } from '@sveltejs/kit';

export const actions = {
	createJob: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (!profile || !['admin', 'manager'].includes(profile.role)) {
			return fail(403, { error: 'Forbidden' });
		}

		const form = await request.formData();

		const job = {
			job_number: form.get('job_number'),
			name: form.get('name'),
			client: form.get('client'),
			location: form.get('location'),
			start_date: form.get('start_date'),
			end_date: form.get('end_date'),
			notes: form.get('notes')
		};

		const { error } = await locals.supabase.from('jobs').insert(job);

		if (error) {
			console.error(error);

			return fail(400, {
				error: error.message
			});
		}

		return {
			success: true
		};
	}
};