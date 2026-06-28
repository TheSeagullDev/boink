<script>
	import logo from '$lib/assets/logo-white.png';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabaseClient';
	let { children } = $props();
</script>

<header class="flex w-full gap-4 bg-orange-500 px-6 py-4 text-white">
	<img src={logo} alt="" class="h-8" />
	<div class="flex-1 text-2xl tracking-widest font-stretch-200%">BOINK</div>
	<button
		class="text-xl font-stretch-150% hover:cursor-pointer"
		onclick={async () => {
			await supabase.auth.signOut();
			goto('/');
		}}>Sign Out</button
	>
</header>

{@render children()}
