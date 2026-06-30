<script>
	import logo from '$lib/assets/logo-white.png';
	import { goto, invalidateAll } from '$app/navigation';
	let { data, children } = $props();

	let links = $derived.by(() => {
		const links = [];

		const isManager = ['admin', 'manager'].includes(data.profile?.role);
		const isAdmin = data.profile?.role === 'admin';

		if (isManager) {
			links.push({ href: '/dashboard/jobs', label: 'Jobs' });
		}

		if (isAdmin) {
			links.push({ href: '/dashboard/employees', label: 'Employees' });
		}

		if (data.profile?.role === 'worker') {
			links.push({ href: '/dashboard/schedule', label: 'My Schedule' });
			links.push({ href: '/dashboard/timesheets', label: 'Timesheets' });
		}

		return links;
	});
</script>

<header class="flex w-full gap-4 bg-orange-500 px-6 py-4 text-white">
	<a href="/dashboard" class="flex flex-1 gap-4 text-2xl tracking-widest font-stretch-200%"
		><img src={logo} alt="" class="h-8" />BOINK</a
	>
	{#each links as link}
		<div><a href={link.href} class="text-xl font-stretch-150%">{link.label}</a></div>
	{/each}
	<div>
		<button
			class="text-xl font-stretch-150% hover:cursor-pointer"
			onclick={async () => {
				await data.supabase.auth.signOut();
				await invalidateAll();
				window.location.href = "/";
			}}>Sign Out</button
		>
	</div>
</header>
<div class="min-h-screen bg-orange-100">
	{@render children()}
</div>