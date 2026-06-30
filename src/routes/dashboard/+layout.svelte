<script>
	import logo from '$lib/assets/logo-white.png';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	let { children } = $props();
</script>

<header class="flex w-full gap-4 bg-orange-500 px-6 py-4 text-white">
	<a href="/dashboard" class="flex gap-4 flex-1 text-2xl tracking-widest font-stretch-200%"><img src={logo} alt="" class="h-8" />BOINK</a>
	<div><a href="/dashboard/employees" class="text-xl font-stretch-150% ">Employees</a></div>
	<div><a href="/dashboard/jobs" class="text-xl font-stretch-150% ">Jobs</a></div>
	<div>
		<button
			class="text-xl font-stretch-150% hover:cursor-pointer"
			onclick={async () => {
				await supabase.auth.signOut();
				goto('/');
			}}>Sign Out</button
		>
	</div>
</header>
<div class="min-h-screen bg-orange-100">
{@render children()}
</div>
