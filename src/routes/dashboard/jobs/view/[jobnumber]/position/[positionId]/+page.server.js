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

		// create assignment

		const { data: assignment, error } = await locals.supabase
			.from('assignments')
			.insert({
				worker_id,
				position_id: params.positionId,
				status: 'sent',
				rate,
				message
			})
			.select()
			.single();

		if (error) {
			return {
				error: error.message
			};
		}

		// link blocks

		const rows = call_blocks.map((id) => ({
			assignment_id: assignment.id,
			call_block_id: id
		}));

		const { error: blockError } = await locals.supabase.from('assignment_blocks').insert(rows);

		if (blockError) {
			return {
				error: blockError.message
			};
		}

		return {
			success: true
		};
	}
};
