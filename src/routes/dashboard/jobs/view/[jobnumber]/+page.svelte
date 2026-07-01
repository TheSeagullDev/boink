<script>
	let { data } = $props();

	let showPositionModal = $state(false);
</script>

<div class="space-y-6 p-6">
	<!-- Job Header -->
	<div class="rounded-lg border bg-white p-5">
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-2xl font-semibold">
					{data.job.name}
				</h1>

				<p class="mt-1 text-sm text-gray-500">
					Job #{data.job.job_number}
				</p>
			</div>

			<div class="text-right text-sm">
				<p>
					<span class="font-medium">Client:</span>
					{data.job.client}
				</p>

				<p>
					<span class="font-medium">Location:</span>
					{data.job.location}
				</p>

				<p>
					<span class="font-medium">Dates:</span>
					{data.job.start_date} - {data.job.end_date}
				</p>
			</div>
		</div>

		{#if data.job.notes}
			<div class="mt-4 border-t pt-4 text-sm text-gray-600">
				{data.job.notes}
			</div>
		{/if}
	</div>

	<!-- Positions -->
	<div class="overflow-hidden rounded-lg border bg-white">
		<div class="flex items-center justify-between border-b px-5 py-4">
			<h2 class="text-lg font-semibold">Positions</h2>

			<button
				class="cursor-pointer rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
				onclick={() => (showPositionModal = true)}
			>
				Add Position
			</button>
		</div>

		{#if data.job.positions?.length}
			<div class="divide-y">
				{#each data.job.positions as position}
					<div class="flex items-center justify-between p-5">
						<div>
							<h3 class="font-medium">
								{position.title}
							</h3>

							<div class="mt-1 space-x-3 text-sm text-gray-500">
								<span>
									{position.department}
								</span>

								<span>
									Status: {position.status}
								</span>
							</div>

							{#if position.notes}
								<p class="mt-2 text-sm text-gray-600">
									{position.notes}
								</p>
							{/if}
						</div>

						<a
							href="/dashboard/jobs/view/{data.job.job_number}/position/{position.id}"
							class="rounded-md border px-3 py-2 text-sm transition hover:bg-gray-50"
						>
							View Schedule
						</a>
					</div>
				{/each}
			</div>
		{:else}
			<div class="p-5 text-gray-500">No positions created yet.</div>
		{/if}
	</div>
</div>

{#if showPositionModal}
	<div class="absolute top-0 left-0 z-49 h-screen w-screen bg-gray-800/30"></div>
	<div class="fixed top-8 left-1/4 z-50 flex w-1/2 items-center justify-center">
		<div class="w-full max-w-lg rounded-lg border bg-white p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Add Call Block</h2>

				<button onclick={() => (showPositionModal = false)} class="text-gray-500 hover:text-black">
					✕
				</button>
			</div>
			<form method="POST" class="space-y-3">
				<input type="hidden" name="job_id" value={data.job.id} />
				<input
					name="title"
					required
					placeholder="Position Title"
					class="w-full rounded-md border px-3 py-2"
				/>

				<input
					name="department"
					placeholder="Department"
					class="w-full rounded-md border px-3 py-2"
				/>

				<select name="status" class="w-full rounded-md border px-3 py-2">
					<option value="open">Open</option>
					<option value="filled">Filled</option>
					<option value="cancelled">Cancelled</option>
				</select>

				<textarea name="notes" placeholder="Notes" class="w-full rounded-md border px-3 py-2"
				></textarea>

				<button
					formaction="?/createPosition"
					class="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
				>
					Create Position
				</button>
			</form>
		</div>
	</div>
{/if}
