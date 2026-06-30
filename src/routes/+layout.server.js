export async function load({ locals, cookies }) {
	const { session, user } = await locals.safeGetSession();

	return {
		session,
		user,
		profile: locals.profile,
		cookies: cookies.getAll()
	};
}
