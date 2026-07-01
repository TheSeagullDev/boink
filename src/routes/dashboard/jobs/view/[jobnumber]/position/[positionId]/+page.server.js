import { error } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

export async function load({ params, locals }) {
	const { data: position, dbError } = await locals.supabase
		.from('positions')
		.select(
			`
		*,
		jobs (*),
		call_blocks (
			*,
			assignment_blocks (
				assignments (
					*,
					profiles (
						name
					)
				)
			)
		)
	`
		)
		.eq('id', params.positionId)
		.order('date', {
			foreignTable: 'call_blocks',
			ascending: true
		})
		.order('start_time', {
			foreignTable: 'call_blocks',
			ascending: true
		})
		.single();

	const { data: workers, error: workerError } = await locals.supabase
		.from('profiles')
		.select('id, name, email')
		.order('name');

	if (workerError) {
		throw workerError;
	}

	if (dbError || !position) {
		throw error(404, 'Position not found');
	}

	return {
		position,
		workers
	};
}

export const actions = {
	createCallBlock: async ({ request, params, locals }) => {
		const { user } = await locals.safeGetSession();

		if (!user) {
			return fail(401, {
				error: 'Unauthorized'
			});
		}

		const form = await request.formData();

		const callBlock = {
			position_id: params.positionId,

			date: form.get('date'),
			start_time: form.get('start_time'),
			end_time: form.get('end_time') || null,

			location: form.get('location'),
			call_type: form.get('call_type'),

			cast_call_time: form.get('cast_call_time') || null,

			break_notes: form.get('break_notes'),
			public_notes: form.get('public_notes'),
			internal_notes: form.get('internal_notes')
		};

		const { error } = await locals.supabase.from('call_blocks').insert(callBlock);

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

	createAssignment: async ({ request, locals, params }) => {
		const form = await request.formData();

		const worker_id = form.get('worker_id');
		const rate = form.get('rate');
		const message = form.get('message');
		const call_blocks = JSON.parse(form.get('call_blocks'));

		// Find or create the assignment for this worker + position
		const { data: existingAssignment, error: lookupError } = await locals.supabase
			.from('assignments')
			.select('id')
			.eq('worker_id', worker_id)
			.eq('position_id', params.positionId)
			.maybeSingle();

		if (lookupError) {
			return fail(500, { error: lookupError.message });
		}

		let assignmentId;

		if (existingAssignment) {
			assignmentId = existingAssignment.id;
		} else {
			const { data: newAssignment, error: createError } = await locals.supabase
				.from('assignments')
				.insert({
					worker_id,
					position_id: params.positionId,
					status: 'sent',
					rate,
					message
				})
				.select('id')
				.single();

			if (createError) {
				return fail(400, { error: createError.message });
			}

			assignmentId = newAssignment.id;
		}

		// Find every assignment for this position
		const { data: positionAssignments, error: positionError } = await locals.supabase
			.from('assignments')
			.select('id')
			.eq('position_id', params.positionId);

		if (positionError) {
			return fail(500, { error: positionError.message });
		}

		const assignmentIds = positionAssignments.map((a) => a.id);

		// Remove these call blocks from EVERY assignment in this position
		if (assignmentIds.length) {
			const { error: deleteError } = await locals.supabase
				.from('assignment_blocks')
				.delete()
				.in('assignment_id', assignmentIds)
				.in('call_block_id', call_blocks);

			if (deleteError) {
				return fail(500, { error: deleteError.message });
			}
		}

		// Find which blocks this assignment already has
		const { data: existingBlocks, error: existingBlocksError } = await locals.supabase
			.from('assignment_blocks')
			.select('call_block_id')
			.eq('assignment_id', assignmentId);

		if (existingBlocksError) {
			return fail(500, { error: existingBlocksError.message });
		}

		const existingIds = new Set(existingBlocks.map((b) => b.call_block_id));

		const rows = call_blocks
			.filter((id) => !existingIds.has(id))
			.map((id) => ({
				assignment_id: assignmentId,
				call_block_id: id
			}));

		if (rows.length) {
			const { error: insertError } = await locals.supabase.from('assignment_blocks').insert(rows);

			if (insertError) {
				return fail(400, { error: insertError.message });
			}
		}

		// Delete assignments that no longer have any call blocks
		for (const assignment of positionAssignments) {
			if (assignment.id === assignmentId) continue;

			const { count } = await locals.supabase
				.from('assignment_blocks')
				.select('*', { count: 'exact', head: true })
				.eq('assignment_id', assignment.id);

			if (count === 0) {
				await locals.supabase.from('assignments').delete().eq('id', assignment.id);
			}
		}

		return {
			success: true
		};
	}
};
