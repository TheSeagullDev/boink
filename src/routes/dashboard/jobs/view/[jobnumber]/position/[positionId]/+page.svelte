<script>
	let { data } = $props();

	let showModal = $state(false);

	function formatTime(time) {
		if (!time) return '';

		return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6 p-6">
	<!-- Header -->
	<div class="rounded-lg border bg-white p-5">
		<p class="text-sm text-gray-500">
			Job #{data.position.jobs.job_number}
		</p>

		<h1 class="text-2xl font-semibold">
			{data.position.title}
		</h1>

		<p class="mt-1 text-gray-600">
			{data.position.jobs.name}
		</p>

		<div class="mt-3 text-sm">
			<span class="font-medium"> Department: </span>

			{data.position.department}
		</div>

		{#if data.position.notes}
			<p class="mt-3 text-sm text-gray-600">
				{data.position.notes}
			</p>
		{/if}
	</div>

	<!-- Schedule -->
	<div class="overflow-hidden rounded-lg border bg-white">
		<div class="flex items-center justify-between border-b px-5 py-4">
			<h2 class="text-lg font-semibold">Call Blocks</h2>

			<button
				onclick={() => (showModal = true)}
				class="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
			>
				Add Call Block
			</button>
		</div>

		{#if data.position.call_blocks?.length}
			<table class="w-full text-sm">
				<thead class="bg-gray-50 text-left">
					<tr>
						<th class="px-4 py-3">Date</th>
						<th class="px-4 py-3">Call</th>
						<th class="px-4 py-3">End</th>
						<th class="px-4 py-3">Location</th>
						<th class="px-4 py-3">Cast Call</th>
						<th class="px-4 py-3">Type</th>
					</tr>
				</thead>

				<tbody class="divide-y">
					{#each data.position.call_blocks as block}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3">
								{block.date}
							</td>

							<td class="px-4 py-3">
								{formatTime(block.start_time)}
							</td>

							<td class="px-4 py-3">
								{formatTime(block.end_time)}
							</td>

							<td class="px-4 py-3">
								{block.location}
							</td>

							<td class="px-4 py-3">
								{formatTime(block.cast_call_time)}
							</td>

							<td class="px-4 py-3">
								{block.call_type}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div class="p-5 text-gray-500">No call blocks created yet.</div>
		{/if}
	</div>
</div>

{#if showModal}
	<div class="fixed top-8 left-1/4 z-50 flex w-1/2 items-center justify-center">
		<div class="w-full max-w-lg rounded-lg border bg-white p-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Add Call Block</h2>

				<button onclick={() => (showModal = false)} class="text-gray-500 hover:text-black">
					✕
				</button>
			</div>

			<form method="POST" class="space-y-3">
				<input type="date" name="date" required class="w-full rounded-md border px-3 py-2" />

				<div class="grid grid-cols-2 gap-3">
					<label class="text-sm">
						Start Time
						<input
							type="time"
							name="start_time"
							required
							class="mt-1 w-full rounded-md border px-3 py-2"
						/>
					</label>

					<label class="text-sm">
						End Time
						<input type="time" name="end_time" class="mt-1 w-full rounded-md border px-3 py-2" />
					</label>
				</div>

				<label class="text-sm">
					Cast Call Time
					<input
						type="time"
						name="cast_call_time"
						class="mt-1 w-full rounded-md border px-3 py-2"
					/>
				</label>

				<input name="location" placeholder="Location" class="w-full rounded-md border px-3 py-2" />

				<input
					name="call_type"
					placeholder="Call Type (Load In, Show, Strike...)"
					class="w-full rounded-md border px-3 py-2"
				/>

				<textarea
					name="break_notes"
					placeholder="Break Notes"
					class="w-full rounded-md border px-3 py-2"
				></textarea>

				<textarea
					name="public_notes"
					placeholder="Public Notes"
					class="w-full rounded-md border px-3 py-2"
				></textarea>

				<textarea
					name="internal_notes"
					placeholder="Internal Notes"
					class="w-full rounded-md border px-3 py-2"
				></textarea>

				<button
					formaction="?/createCallBlock"
					class="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
				>
					Create Call Block
				</button>
			</form>
		</div>
	</div>
{/if}
