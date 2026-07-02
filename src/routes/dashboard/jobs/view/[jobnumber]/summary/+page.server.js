import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	const { data: job, error: dbError } = await locals.supabase
		.from('jobs')
		.select(
			`
			*,
			positions (
				id,
				title,
				department,
				call_blocks (
					id,
					date,
					start_time,
					end_time,
					call_type,
					location,
					assignment_blocks (
						assignments (
							status,
							profiles (
								name
							)
						)
					)
				)
			)
		`
		)
		.eq('job_number', params.jobnumber)
		.single();

	if (dbError || !job) {
		throw error(404, 'Job not found');
	}

	const schedule = {};

	for (const position of job.positions) {
		for (const block of position.call_blocks) {
			if (!schedule[block.date]) {
				schedule[block.date] = [];
			}

			const assignment = block.assignment_blocks[0]?.assignments;

			schedule[block.date].push({
				position: position.title,
				department: position.department,
				call_type: block.call_type,
				location: block.location,
				start_time: block.start_time,
				end_time: block.end_time,
				worker: assignment?.profiles?.name ?? null,
				status: assignment?.status ?? null
			});
		}
	}

	// Sort each day
	for (const day of Object.values(schedule)) {
		day.sort((a, b) => a.start_time.localeCompare(b.start_time));
	}

	return {
		job,
		schedule
	};
}
