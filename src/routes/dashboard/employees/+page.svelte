<script>
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let isLoading = $state(false);

	let { data, form } = $props();
</script>

{#if data.profile?.role === 'admin'}
	<form
		method="POST"
		action="?/createWorker"
		use:enhance={() => {
			isLoading = true;
			return async ({ update }) => {
				isLoading = false;
				await update();
			};
		}}
	>
		<input type="text" name="name" placeholder="Full name" bind:value={name} required />
		<input type="email" name="email" placeholder="Email" bind:value={email} required />
		<input type="tel" name="phone" placeholder="Phone (optional)" bind:value={phone} />

		<button type="submit" disabled={isLoading}>
			{isLoading ? 'Sending invite...' : 'Send Invite'}
		</button>

		{#if form?.success}
			<p class="text-green-600">{form.message}</p>
		{:else if form?.error}
			<p class="text-red-600">{form.error}</p>
		{/if}
	</form>

	<div>
		<table>
			<thead>
                <tr>
					<th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
				</tr>
            </thead>
			<tbody>
                {#each data.employees as employee}
					<tr>
                        <td>{employee.name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.phone}</td>
                    </tr>
                {/each}
			</tbody>
		</table>
	</div>
{/if}
