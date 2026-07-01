import { error, fail, redirect } from '@sveltejs/kit';

function canManage(locals) {
	return locals.profile && ['admin', 'manager'].includes(locals.profile.role);
}

function formValue(form, name) {
	const value = form.get(name);
	return value === '' || value === null ? null : value;
}

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
		if (!canManage(locals)) {
			return fail(403, {
				error: 'Forbidden'
			});
		}

		const form = await request.formData();

		const callBlock = {
			position_id: params.positionId,

			date: formValue(form, 'date'),
			start_time: formValue(form, 'start_time'),
			end_time: formValue(form, 'end_time'),

			location: formValue(form, 'location'),
			call_type: formValue(form, 'call_type'),

			cast_call_time: formValue(form, 'cast_call_time'),

			break_notes: formValue(form, 'break_notes'),
			public_notes: formValue(form, 'public_notes'),
			internal_notes: formValue(form, 'internal_notes')
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

	updateCallBlock: async ({ request, locals }) => {
		if (!canManage(locals)) {
			return fail(403, {
				error: 'Forbidden'
			});
		}

		const form = await request.formData();
		const callBlockId = formValue(form, 'call_block_id');

		if (!callBlockId) {
			return fail(400, { error: 'Call block id is required' });
		}

		const callBlock = {
			date: formValue(form, 'date'),
			start_time: formValue(form, 'start_time'),
			end_time: formValue(form, 'end_time'),
			location: formValue(form, 'location'),
			call_type: formValue(form, 'call_type'),
			cast_call_time: formValue(form, 'cast_call_time'),
			break_notes: formValue(form, 'break_notes'),
			public_notes: formValue(form, 'public_notes'),
			internal_notes: formValue(form, 'internal_notes')
		};

		const { error } = await locals.supabase.from('call_blocks').update(callBlock).eq('id', callBlockId);

		if (error) {
			return fail(400, { error: error.message });
		}

		return {
			success: true
		};
	},

	deleteCallBlock: async ({ request, locals }) => {
		if (!canManage(locals)) {
			return fail(403, {
				error: 'Forbidden'
			});
		}

		const form = await request.formData();
		const callBlockId = formValue(form, 'call_block_id');

		if (!callBlockId) {
			return fail(400, { error: 'Call block id is required' });
		}

		const { error } = await locals.supabase.from('call_blocks').delete().eq('id', callBlockId);

		if (error) {
			return fail(400, { error: error.message });
		}

		return {
			success: true
		};
	},

	deletePosition: async ({ request, locals, params }) => {
		if (!canManage(locals)) {
			return fail(403, {
				error: 'Forbidden'
			});
		}

		const form = await request.formData();
		const positionId = formValue(form, 'position_id');

		if (!positionId) {
			return fail(400, { error: 'Position id is required' });
		}

		const { error } = await locals.supabase.from('positions').delete().eq('id', positionId);

		if (error) {
			return fail(400, { error: error.message });
		}

		throw redirect(303, `/dashboard/jobs/view/${params.jobnumber}`);
	},

	createAssignment: async ({ request, locals, params }) => {
		if (!canManage(locals)) {
			return fail(403, {
				error: 'Forbidden'
			});
		}

		const form = await request.formData();

		const worker_id = form.get('worker_id');
		const rate = form.get('rate');
		const message = form.get('message');
		const callBlocksValue = form.get('call_blocks');
		const call_blocks = callBlocksValue ? JSON.parse(callBlocksValue) : [];

		if (!worker_id) {
			return fail(400, { error: 'Worker is required' });
		}

		if (!rate || rate === '') {
			return fail(400, { error: 'Rate is required' });
		}

		const numericRate = Number(rate);

		if (!Number.isFinite(numericRate)) {
			return fail(400, { error: 'Rate must be a valid number' });
		}

		if (!call_blocks.length) {
			return fail(400, { error: 'Select at least one call block' });
		}

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
					rate: numericRate,
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
