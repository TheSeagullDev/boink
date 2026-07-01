function canManage(locals) {
	return locals.profile && ['admin', 'manager'].includes(locals.profile.role);
}

function formValue(form, name) {
	const value = form.get(name);
	return value === '' || value === null ? null : value;
}

export async function load({ locals }) {
	const { data: jobs } = await locals.supabase.from('jobs').select('*').order('job_number');

	return { jobs };
}

import { fail } from '@sveltejs/kit';

export const actions = {
	createJob: async ({ request, locals }) => {
		if (!canManage(locals)) {
			return fail(403, { error: 'Forbidden' });
		}

		const form = await request.formData();

		const job = {
			job_number: Number(formValue(form, 'job_number')),
			name: formValue(form, 'name'),
			client: formValue(form, 'client'),
			location: formValue(form, 'location'),
			start_date: formValue(form, 'start_date'),
			end_date: formValue(form, 'end_date'),
			notes: formValue(form, 'notes')
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
	},

	updateJob: async ({ request, locals }) => {
		if (!canManage(locals)) {
			return fail(403, { error: 'Forbidden' });
		}

		const form = await request.formData();
		const jobId = formValue(form, 'job_id');

		if (!jobId) {
			return fail(400, { error: 'Job id is required' });
		}

		const job = {
			job_number: Number(formValue(form, 'job_number')),
			name: formValue(form, 'name'),
			client: formValue(form, 'client'),
			location: formValue(form, 'location'),
			start_date: formValue(form, 'start_date'),
			end_date: formValue(form, 'end_date'),
			notes: formValue(form, 'notes')
		};

		const { error } = await locals.supabase.from('jobs').update(job).eq('id', jobId);

		if (error) {
			console.error(error);

			return fail(400, {
				error: error.message
			});
		}

		return {
			success: true
		};
	},

	deleteJob: async ({ request, locals }) => {
		if (!canManage(locals)) {
			return fail(403, { error: 'Forbidden' });
		}

		const form = await request.formData();
		const jobId = formValue(form, 'job_id');

		if (!jobId) {
			return fail(400, { error: 'Job id is required' });
		}

		const { error } = await locals.supabase.from('jobs').delete().eq('id', jobId);

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
