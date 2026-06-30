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
