import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

import { createServerClient } from '@supabase/ssr';

export async function handle({ event, resolve }) {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},

			setAll(cookiesToSet, headers) {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, {
						...options,
						path: '/'
					});
				});

				if (Object.keys(headers).length > 0) {
					event.setHeaders(headers);
				}
			}
		}
	});

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error) {
			return { session: null, user: null };
		}

		return { session, user };
	};

	const { user } = await event.locals.safeGetSession();

	event.locals.user = user;
	event.locals.profile = null;

	if (user) {
		const { data: profile } = await event.locals.supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		event.locals.profile = profile;
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
}