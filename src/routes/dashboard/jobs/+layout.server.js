import { error } from '@sveltejs/kit';

export async function load({ locals }) {
	const profile = locals.profile;

	if (!profile || !['admin', 'manager'].includes(profile.role)) {
		throw error(403, 'Forbidden');
	}

	return {};
}
