<script>
    import { supabase } from "$lib/supabaseClient";

	let { data } = $props();

	let signupEmail = $state();
	let signupPassword = $state();

	async function userSignup(event) {
        event.preventDefault();

		const { data, error } = await supabase.auth.signUp({
			email: signupEmail,
			password: signupPassword
		});

        if (error) {
            console.error(error.message);
            return;
        }

        console.log(data);
	}
</script>

<form onsubmit={userSignup}>
	<label for="email">Email:</label>
	<input type="email" name="email" id="email" bind:value={signupEmail} />
	<label for="password">Password:</label>
	<input type="password" name="password" id="password" bind:value={signupPassword} />
	<input type="submit" value="Submit" />
</form>