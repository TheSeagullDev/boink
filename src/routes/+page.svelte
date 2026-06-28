<script>
	import { supabase } from "$lib/supabaseClient";
	import { goto } from "$app/navigation";
	import bg from "$lib/assets/login-bg.png";
	import logo from "$lib/assets/main-logo-white.png";
	import { fade } from "svelte/transition";

	let { data } = $props();

	let email = $state();
	let password = $state();
	let authError = $state();

	let loginActive = $state(true);
	let signupActive = $derived(!loginActive);

	async function authenticate(event) {
		event.preventDefault();
		authError = "";

		const { error } = loginActive
			? await supabase.auth.signInWithPassword({
					email,
					password
				})
			: await supabase.auth.signUp({
					email,
					password
				});

		if (error) {
			authError = error.message;
			return;
		}

		goto("/dashboard");
	}

	function toggleLoginSignup() {
		loginActive = !loginActive;
		email = "";
		password = "";
		authError = "";
	}
</script>

<div
	class="flex h-screen items-center justify-center bg-cover text-gray-50"
	style={`background-image: url(${bg})`}
>
	<div
		class="m-4 flex flex-col items-center justify-center rounded-2xl bg-gray-800/20 p-4 shadow-xl sm:w-1/2"
	>
		<img src={logo} class="w-1/2" alt="background" />
		<h1 class="my-4 text-5xl tracking-widest font-stretch-200%">BOINK</h1>
		<h2 class="text-3xl font-stretch-150%">
			{loginActive ? "Login" : "Sign Up"}
		</h2>

		{#if authError}
			<h2 class="text-red-300" transition:fade>
				Something went wrong: {authError}
			</h2>
		{/if}

		<form onsubmit={authenticate} class="my-4 flex min-w-1/2 flex-col">
			<label for="email">Email:</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				class="my-2 rounded-2xl border-0 bg-gray-800/30 p-2 transition focus:scale-105 focus:ring-0 focus:outline-none"
			/>

			<label for="password">Password:</label>
			<input
				type="password"
				id="password"
				bind:value={password}
				class="my-2 rounded-2xl border-0 bg-gray-800/30 p-2 transition focus:scale-105 focus:ring-0 focus:outline-none"
			/>

			<input
				type="submit"
				value={loginActive ? "Login" : "Sign Up"}
				class="my-2 rounded-2xl bg-gray-800/40 p-2 shadow-sm transition hover:bg-gray-800/60"
			/>
		</form>
		<h3>
			{#if loginActive}
				Don"t have an account?
			{:else}
				Already have an account?
			{/if}

			<button class="cursor-pointer text-blue-500" onclick={toggleLoginSignup}>
				{loginActive ? "Create one." : "Login."}
			</button>
		</h3>
	</div>
</div>
