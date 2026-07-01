<script>
	let { data } = $props();

	let showPositionModal = $state(false);
	let editingPosition = $state(null);
	let positionId = $state('');
	let positionTitle = $state('');
	let positionDepartment = $state('');
	let positionStatus = $state('open');
	let positionNotes = $state('');

	function openPositionModal(position = null) {
		editingPosition = position;
		positionId = position?.id ?? '';
		positionTitle = position?.title ?? '';
		positionDepartment = position?.department ?? '';
		positionStatus = position?.status ?? 'open';
		positionNotes = position?.notes ?? '';
		showPositionModal = true;
	}

	function closePositionModal() {
		showPositionModal = false;
		editingPosition = null;
	}
</script>

<div class="space-y-6 p-6">
	<!-- Job Header -->
	<div class="rounded-lg border bg-white p-5">
		<div class="flex items-start justify-between gap-4">
			<div>
				<h1 class="text-2xl font-semibold">{data.job.name}</h1>

				<p class="mt-1 text-sm text-gray-500">Job #{data.job.job_number}</p>
			</div>

			<div class="flex flex-col items-end gap-2 text-sm">
				<div class="text-right">
					<p><span class="font-medium">Client:</span> {data.job.client}</p>
					<p><span class="font-medium">Location:</span> {data.job.location}</p>
					<p><span class="font-medium">Dates:</span> {data.job.start_date} - {data.job.end_date}</p>
				</div>
			</div>
		</div>

		{#if data.job.notes}
			<div class="mt-4 border-t pt-4 text-sm text-gray-600">{data.job.notes}</div>
		{/if}
	</div>

	<!-- Positions -->
	<div class="overflow-hidden rounded-lg border bg-white">
		<div class="flex items-center justify-between border-b px-5 py-4">
			<h2 class="text-lg font-semibold">Positions</h2>

			<button
				class="cursor-pointer rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
				onclick={() => openPositionModal()}
			>
				Add Position
			</button>
		</div>

		{#if data.job.positions?.length}
			<div class="divide-y">
				{#each data.job.positions as position}
					<div class="flex items-center justify-between gap-4 p-5">
						<div>
							<h3 class="font-medium">{position.title}</h3>

							<div class="mt-1 space-x-3 text-sm text-gray-500">
								<span>{position.department}</span>
								<span>Status: {position.status}</span>
							</div>

							{#if position.notes}
								<p class="mt-2 text-sm text-gray-600">{position.notes}</p>
							{/if}
						</div>

						<div class="flex shrink-0 items-center gap-2">
							<button
								type="button"
								class="rounded-md border px-3 py-2 text-sm transition hover:bg-gray-50"
								onclick={() => openPositionModal(position)}
							>
								Edit
							</button>

							<form method="POST">
								<input type="hidden" name="position_id" value={position.id} />
								<button
									formaction="?/deletePosition"
									class="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50"
									onclick={(event) => {
										if (
											!confirm(
												`Delete position "${position.title}"? This will remove its call blocks and assignments.`
											)
										) {
											event.preventDefault();
										}
									}}
								>
									Delete
								</button>
							</form>

							<a
								href="/dashboard/jobs/view/{data.job.job_number}/position/{position.id}"
								class="rounded-md border px-3 py-2 text-sm transition hover:bg-gray-50"
							>
								View Schedule
							</a>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="p-5 text-gray-500">No positions created yet.</div>
		{/if}
	</div>
</div>

{#if showPositionModal}
	<div class="fixed inset-0 z-40 bg-gray-800/30"></div>
	<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6">
		<div class="mt-8 w-full max-w-lg rounded-lg border bg-white p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">{editingPosition ? 'Edit Position' : 'Add Position'}</h2>

				<button type="button" onclick={closePositionModal} class="text-gray-500 hover:text-black">
					✕
				</button>
			</div>

			<form method="POST" class="space-y-3">
				<input type="hidden" name="job_id" value={data.job.id} />
				<input type="hidden" name="position_id" value={positionId} />

				<input
					name="title"
					required
					placeholder="Position Title"
					class="w-full rounded-md border px-3 py-2"
					bind:value={positionTitle}
				/>

				<input
					name="department"
					placeholder="Department"
					class="w-full rounded-md border px-3 py-2"
					bind:value={positionDepartment}
				/>

				<select name="status" class="w-full rounded-md border px-3 py-2" bind:value={positionStatus}>
					<option value="open">Open</option>
					<option value="filled">Filled</option>
					<option value="cancelled">Cancelled</option>
				</select>

				<textarea
					name="notes"
					placeholder="Notes"
					class="w-full rounded-md border px-3 py-2"
					bind:value={positionNotes}
				></textarea>

				<button
					formaction={editingPosition ? '?/updatePosition' : '?/createPosition'}
					class="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
				>
					{editingPosition ? 'Save Changes' : 'Create Position'}
				</button>
			</form>
		</div>
	</div>
{/if}
