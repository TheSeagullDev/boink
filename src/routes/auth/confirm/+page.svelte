<script>
	import { goto } from '$app/navigation';

	let { data } = $props();

	let password = $state('');
	let passwordConfirm = $state('');
	let isLoading = $state(false);
	let showPassword = $state(false);
	let error = $state('');
	let success = $state(false);

	let passwordsMatch = $derived(password === passwordConfirm);
	let passwordValid = $derived(password.length >= 8);
	let isValid = $derived(passwordsMatch && passwordValid && password.length > 0);

	// Parse hash and set session
	$effect.pre(async () => {
		try {
			// Get the hash from URL
			const hash = window.location.hash.substring(1); // Remove the #
			
			if (!hash) {
				error = 'No invitation found. Make sure you clicked the link in the email.';
				return;
			}

			// Parse the hash parameters
			const params = new URLSearchParams(hash);
			const accessToken = params.get('access_token');
			const refreshToken = params.get('refresh_token');
			const expiresIn = params.get('expires_in');
			const tokenType = params.get('token_type');

			if (!accessToken) {
				error = 'Invalid invitation link. Please ask your admin to resend.';
				return;
			}

			// Manually set the session
			const { error: sessionError } = await data.supabase.auth.setSession({
				access_token: accessToken,
				refresh_token: refreshToken || '',
				expires_in: parseInt(expiresIn) || 3600,
				token_type: tokenType || 'bearer'
			});

			if (sessionError) {
				console.error('Session error:', sessionError);
				error = 'Failed to authenticate. Please try the invite link again.';
				return;
			}

			// Session is now set, form is ready
		} catch (err) {
			console.error('Error:', err);
			error = 'Something went wrong. Please refresh and try again.';
		}
	});

	async function handleSubmit(e) {
		e.preventDefault();

		if (!isValid) return;
		isLoading = true;
		error = '';

		try {
			const { error: updateError } = await data.supabase.auth.updateUser({
				password: password
			});

			if (updateError) {
				error = updateError.message;
				isLoading = false;
				return;
			}

			success = true;
			setTimeout(() => {
				goto('/dashboard');
			}, 1500);
		} catch (err) {
			error = err.message || 'Error setting password';
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="bg-white rounded-lg shadow-xl p-8">
			<h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome!</h1>
			<p class="text-gray-600 mb-8">Set up your password to complete your account</p>

			{#if success}
				<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
					<p class="text-green-800 font-medium">✓ Success!</p>
					<p class="text-green-700 text-sm">Redirecting to dashboard...</p>
				</div>
			{:else if error}
				<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
					<p class="text-red-800 font-medium">Error</p>
					<p class="text-red-700 text-sm">{error}</p>
				</div>
			{:else}
				<form onsubmit={handleSubmit}>
					<div class="space-y-4">
						<div>
							<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<div class="relative">
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									bind:value={password}
									placeholder="At least 8 characters"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
									disabled={isLoading}
									required
								/>
								<button
									type="button"
									onclick={() => (showPassword = !showPassword)}
									class="absolute right-3 top-2.5 text-gray-500 text-sm"
									disabled={isLoading}
								>
									{showPassword ? '🙈 Hide' : '👁️ Show'}
								</button>
							</div>
							{#if password && password.length < 8}
								<p class="text-red-600 text-xs mt-1">Minimum 8 characters</p>
							{/if}
						</div>

						<div>
							<label for="confirm" class="block text-sm font-medium text-gray-700 mb-2">
								Confirm Password
							</label>
							<input
								id="confirm"
								type={showPassword ? 'text' : 'password'}
								bind:value={passwordConfirm}
								placeholder="Re-enter your password"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
								disabled={isLoading}
								required
							/>
							{#if passwordConfirm && !passwordsMatch}
								<p class="text-red-600 text-xs mt-1">Passwords do not match</p>
							{/if}
						</div>

						<button
							type="submit"
							disabled={!isValid || isLoading}
							class="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg"
						>
							{isLoading ? 'Setting up...' : 'Create Account'}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</div>
</div>

<style>
	input:-webkit-autofill {
		-webkit-box-shadow: 0 0 0 1000px white inset !important;
	}
</style>