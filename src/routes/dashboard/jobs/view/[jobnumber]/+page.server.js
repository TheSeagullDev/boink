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
		const form = await request.formData();

		const position = {
			job_id: form.get('job_id'),
			title: form.get('title'),
			department: form.get('department'),
			status: form.get('status'),
			notes: form.get('notes')
		};

		const { error } = await locals.supabase.from('positions').insert(position);

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