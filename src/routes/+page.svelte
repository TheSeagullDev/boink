<script>
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import bg from '$lib/assets/login-bg.png';
	import logo from '$lib/assets/main-logo-white.png';

	let { data } = $props();

	let email = $state();
	let password = $state();

	let loginActive = $state(true);
	let signupActive = $derived(!loginActive);

	async function signup() {
		const { error } = await supabase.auth.signUp({
			email,
			password
		});
		if (!error) {
			goto('/dashboard');
		}
		console.log(error);
	}

	async function login() {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (!error) {
			goto('/dashboard');
		}

		console.log(error);
	}

	function toggleLoginSignup() {
		loginActive = !loginActive;
		email = '';
		password = '';
	}
</script>

<div
	class="flex h-screen items-center justify-center bg-cover text-gray-50"
	style={`background-image: url(${bg})`}
>
	<div
		class="m-4 flex flex-col items-center justify-center rounded-2xl bg-gray-800/20 p-4 shadow-xl sm:w-1/3"
	>
		<img src={logo} class="w-1/2" />
		<h1 class="my-4 text-5xl tracking-widest font-stretch-200%">BOINK</h1>
		{#if loginActive}
			<h2 class="text-3xl font-stretch-150%">Login</h2>

			<form onsubmit={login} class="my-4 flex flex-col">
				<label for="email" class="font-stretch-125%">Email:</label>
				<input
					type="email"
					name="email"
					id="email"
					bind:value={email}
					class="my-2 rounded-2xl border-0 bg-gray-800/30 p-2 transition focus:scale-105 focus:ring-0 focus:outline-none"
				/>
				<label for="password">Password:</label>
				<input
					type="password"
					name="password"
					id="password"
					bind:value={password}
					class="my-2 rounded-2xl border-0 bg-gray-800/30 p-2 transition focus:scale-105 focus:ring-0 focus:outline-none"
				/>
				<input
					type="submit"
					value="Login"
					class="my-2 rounded-2xl bg-gray-800/40 p-2 shadow-sm transition hover:bg-gray-800/60"
				/>
			</form>

			<h3 class="font-stretch-110%">
				Don't have an account? <button
					class="cursor-pointer text-blue-500"
					onclick={toggleLoginSignup}>Create an account.</button
				>
			</h3>
		{:else}
			<h2 class="text-3xl font-stretch-150%">Sign Up</h2>

			<form onsubmit={signup} class="flex flex-col">
				<label for="email">Email:</label>
				<input
					type="email"
					name="email"
					id="email"
					bind:value={email}
					class="my-2 rounded-2xl border-0 bg-gray-800/30 p-2 transition focus:scale-105 focus:ring-0 focus:outline-none"
				/>
				<label for="password">Password:</label>
				<input
					type="password"
					name="password"
					id="password"
					bind:value={password}
					class="my-2 rounded-2xl border-0 bg-gray-800/30 p-2 transition focus:scale-105 focus:ring-0 focus:outline-none"
				/>
				<input
					type="submit"
					value="Sign Up"
					class="my-2 rounded-2xl bg-gray-800/40 p-2 shadow-sm transition hover:bg-gray-800/60"
				/>
			</form>

			<h3>
				Already have an account? <button
					class="cursor-pointer text-blue-500"
					onclick={toggleLoginSignup}>Login.</button
				>
			</h3>
		{/if}
	</div>
</div>
