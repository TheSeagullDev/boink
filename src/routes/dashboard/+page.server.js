export async function load({ locals }) {
    const profile = locals.profile;

		const { data: assignments, error } = await locals.supabase
			.from('assignments')
			.select(
				`
			id,
			status,
			rate,
			message,

			position:positions (
				title,
				jobs (
					job_number,
					name,
					client,
					location
				)
			),

			assignment_blocks (
				call_blocks (
					date,
					start_time,
					end_time,
					location,
					call_type
				)
			)
		`
			)
			.eq('worker_id', profile.id)
			.order('id');

		if (error) {
			console.error(error);
		}

		return {
			assignments: assignments ?? []
		};
}