import { fail } from '@sveltejs/kit';

function canManage(locals) {
	return locals.profile && ['admin', 'manager'].includes(locals.profile.role);
}

function formValue(form, name) {
	const value = form.get(name);
	return value === '' || value === null ? null : value;
}

export async function load({ params, locals }) {
	const { data: job, error } = await locals.supabase
		.from('jobs')
		.select(
			`
			*,
			positions (
				*,
				call_blocks (*)
			)
		`
		)
		.eq('job_number', params.jobnumber)
		.single();

	if (error) {
		throw error;
	}

	return {
		job
	};
}

export const actions = {
	createPosition: async ({ request, params, locals }) => {
		if (!canManage(locals)) {
			return fail(403, { error: 'Forbidden' });
		}

		const form = await request.formData();

		const position = {
			job_id: formValue(form, 'job_id'),
			title: formValue(form, 'title'),
			department: formValue(form, 'department'),
			status: formValue(form, 'status'),
			notes: formValue(form, 'notes')
		};

		const { error } = await locals.supabase.from('positions').insert(position);

		if (error) {
            console.log("error assigning");
			return fail(400, {
				error: error.message
			});
		}

		return {
			success: true
		};
	},

	updatePosition: async ({ request, locals }) => {
		if (!canManage(locals)) {
			return fail(403, { error: 'Forbidden' });
		}

		const form = await request.formData();
		const positionId = formValue(form, 'position_id');

		if (!positionId) {
			return fail(400, { error: 'Position id is required' });
		}

		const position = {
			title: formValue(form, 'title'),
			department: formValue(form, 'department'),
			status: formValue(form, 'status'),
			notes: formValue(form, 'notes')
		};

		const { error } = await locals.supabase.from('positions').update(position).eq('id', positionId);

		if (error) {
			return fail(400, {
				error: error.message
			});
		}

		return {
			success: true
		};
	},

	deletePosition: async ({ request, locals }) => {
		if (!canManage(locals)) {
			return fail(403, { error: 'Forbidden' });
		}

		const form = await request.formData();
		const positionId = formValue(form, 'position_id');

		if (!positionId) {
			return fail(400, { error: 'Position id is required' });
		}

		const { error } = await locals.supabase.from('positions').delete().eq('id', positionId);

		if (error) {
			return fail(400, {
				error: error.message
			});
		}

		return {
			success: true
		};
	}
};
