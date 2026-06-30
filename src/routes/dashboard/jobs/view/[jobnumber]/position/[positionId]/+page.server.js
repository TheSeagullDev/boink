import { error } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

export async function load({ params, locals }) {
	const { data: position, error: dbError } = await locals.supabase
		.from('positions')
		.select(
			`
			*,
			jobs (
				name,
				job_number
			),
			call_blocks (
				*
			)
		`
		)
		.eq('id', params.positionId)
		.single();

	if (dbError || !position) {
		throw error(404, 'Position not found');
	}

	return {
		position
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
	}
};
