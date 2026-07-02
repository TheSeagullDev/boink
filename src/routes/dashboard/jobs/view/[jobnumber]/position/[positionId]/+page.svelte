<script>
	import { enhance } from '$app/forms';
    import { formatDate, formatTime } from "$lib/utils/format.js";

	let { data } = $props();

	let showPositionModal = $state(false);
	let showBlockModal = $state(false);
	let showAssignmentModal = $state(false);

	let editingCallBlock = $state(null);
	let callBlockId = $state('');
	let callBlockDate = $state('');
	let callBlockStartTime = $state('');
	let callBlockEndTime = $state('');
	let callBlockLocation = $state('');
	let callBlockType = $state('');
	let callBlockCastCallTime = $state('');
	let callBlockBreakNotes = $state('');
	let callBlockPublicNotes = $state('');
	let callBlockInternalNotes = $state('');

	let positionTitle = $state('');
	let positionDepartment = $state('');
	let positionStatus = $state('open');
	let positionNotes = $state('');

	let selectedBlocks = $state([]);
	let assignmentError = $state('');
	let isAssigning = $state(false);

	function toggleBlock(id) {
		if (selectedBlocks.includes(id)) {
			selectedBlocks = selectedBlocks.filter((x) => x !== id);
		} else {
			selectedBlocks = [...selectedBlocks, id];
		}
	}

	function openPositionModal() {
		positionTitle = data.position.title ?? '';
		positionDepartment = data.position.department ?? '';
		positionStatus = data.position.status ?? 'open';
		positionNotes = data.position.notes ?? '';
		showPositionModal = true;
	}

	function openCallBlockModal(block = null) {
		editingCallBlock = block;
		callBlockId = block?.id ?? '';
		callBlockDate = block?.date ?? '';
		callBlockStartTime = block?.start_time ?? '';
		callBlockEndTime = block?.end_time ?? '';
		callBlockLocation = block?.location ?? '';
		callBlockType = block?.call_type ?? '';
		callBlockCastCallTime = block?.cast_call_time ?? '';
		callBlockBreakNotes = block?.break_notes ?? '';
		callBlockPublicNotes = block?.public_notes ?? '';
		callBlockInternalNotes = block?.internal_notes ?? '';
		showBlockModal = true;
	}

	function closePositionModal() {
		showPositionModal = false;
	}

	function closeCallBlockModal() {
		showBlockModal = false;
		editingCallBlock = null;
	}

	function openAssignmentModal() {
		assignmentError = '';
		showAssignmentModal = true;
	}
</script>

<div class="space-y-6 p-6">
	<!-- Header -->
	<div class="rounded-lg border bg-white p-5">
		<div class="flex items-start justify-between gap-4">
			<div>
				<p class="text-sm text-gray-500">Job #{data.position.jobs.job_number}</p>

				<h1 class="text-2xl font-semibold">{data.position.title}</h1>

				<p class="mt-1 text-gray-600">{data.position.jobs.name}</p>

				<div class="mt-3 text-sm">
					<span class="font-medium">Department:</span>
					{data.position.department}
				</div>

				{#if data.position.notes}
					<p class="mt-3 text-sm text-gray-600">{data.position.notes}</p>
				{/if}
			</div>

			<div class="flex shrink-0 gap-2">
				<button
					type="button"
					class="rounded-md border px-3 py-2 text-sm transition hover:bg-gray-50"
					onclick={() => openPositionModal()}
				>
					Edit Position
				</button>

				<form method="POST">
					<input type="hidden" name="position_id" value={data.position.id} />
					<button
						formaction="?/deletePosition"
						class="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50"
						onclick={(event) => {
							if (
								!confirm(
									`Delete position "${data.position.title}"? This will remove its call blocks, assignments, and related postings.`
								)
							) {
								event.preventDefault();
							}
						}}
					>
						Delete Position
					</button>
				</form>
			</div>
		</div>
	</div>

	<!-- Schedule -->
	<div class="overflow-hidden rounded-lg border bg-white">
		<div class="flex items-center gap-2 border-b px-5 py-4">
			<h2 class="flex-1 text-lg font-semibold">Call Blocks</h2>

			<button
				disabled={!selectedBlocks.length}
				onclick={openAssignmentModal}
				class="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-40"
			>
				Assign Selected ({selectedBlocks.length})
			</button>

			<button
				onclick={() => openCallBlockModal()}
				class="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-gray-800"
			>
				Add Call Block
			</button>
		</div>

		{#if data.position.call_blocks?.length}
			<table class="w-full text-sm">
				<thead class="bg-gray-50 text-left">
					<tr>
						<th class="px-4 py-3"></th>
						<th class="px-4 py-3">Date</th>
						<th class="px-4 py-3">Call</th>
						<th class="px-4 py-3">End</th>
						<th class="px-4 py-3">Location</th>
						<th class="px-4 py-3">Cast Call</th>
						<th class="px-4 py-3">Type</th>
						<th class="px-4 py-3">Assigned To</th>
						<th class="px-4 py-3 text-right">Actions</th>
					</tr>
				</thead>

				<tbody class="divide-y">
					{#each data.position.call_blocks as block}
						<tr class="hover:bg-gray-50">
							<td class="px-4 py-3">
								<input
									type="checkbox"
									checked={selectedBlocks.includes(block.id)}
									onchange={() => toggleBlock(block.id)}
								/>
							</td>
							<td class="px-4 py-3">{formatDate(block.date)}</td>
							<td class="px-4 py-3">{formatTime(block.start_time)}</td>
							<td class="px-4 py-3">{formatTime(block.end_time)}</td>
							<td class="px-4 py-3">{block.location}</td>
							<td class="px-4 py-3">{formatTime(block.cast_call_time)}</td>
							<td class="px-4 py-3">{block.call_type}</td>
							<td class="px-4 py-3">
								{#if block.assignment_blocks?.length}
									{#each block.assignment_blocks as assignmentBlock}
										<p>{assignmentBlock.assignments.profiles.name}</p>
									{/each}
								{:else}
									<span class="text-gray-400">Unassigned</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								<div class="flex justify-end gap-2">
									<button
										type="button"
										class="rounded-md border px-3 py-2 text-xs font-medium transition hover:bg-gray-100"
										onclick={() => openCallBlockModal(block)}
									>
										Edit
									</button>

									<form method="POST">
										<input type="hidden" name="call_block_id" value={block.id} />
										<button
											formaction="?/deleteCallBlock"
											class="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
											onclick={(event) => {
												if (
													!confirm(
														'Delete this call block? This will remove assignment links and any related timesheet entries.'
													)
												) {
													event.preventDefault();
												}
											}}
										>
											Delete
										</button>
									</form>
								</div>
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

{#if showPositionModal}
	<div class="fixed inset-0 z-40 bg-gray-800/30"></div>
	<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6">
		<div class="mt-8 w-full max-w-lg rounded-lg border bg-white p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Edit Position</h2>

				<button onclick={closePositionModal} class="text-gray-500 hover:text-black">✕</button>
			</div>

			<form method="POST" class="space-y-3">
				<input type="hidden" name="position_id" value={data.position.id} />

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
					formaction="?/updatePosition"
					class="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
				>
					Save Changes
				</button>
			</form>
		</div>
	</div>
{/if}

{#if showBlockModal}
	<div class="fixed inset-0 z-40 bg-gray-800/30"></div>
	<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6">
		<div class="mt-8 w-full max-w-lg rounded-lg border bg-white p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">{editingCallBlock ? 'Edit Call Block' : 'Add Call Block'}</h2>

				<button onclick={closeCallBlockModal} class="text-gray-500 hover:text-black">✕</button>
			</div>

			<form method="POST" class="space-y-3">
				<input type="hidden" name="position_id" value={data.position.id} />
				<input type="hidden" name="call_block_id" value={callBlockId} />

				<input
					type="date"
					name="date"
					required
					class="w-full rounded-md border px-3 py-2"
					bind:value={callBlockDate}
				/>

				<div class="grid grid-cols-2 gap-3">
					<label class="text-sm">
						Start Time
						<input
							type="time"
							name="start_time"
							required
							class="mt-1 w-full rounded-md border px-3 py-2"
							bind:value={callBlockStartTime}
						/>
					</label>

					<label class="text-sm">
						End Time
						<input
							type="time"
							name="end_time"
							class="mt-1 w-full rounded-md border px-3 py-2"
							bind:value={callBlockEndTime}
						/>
					</label>
				</div>

				<label class="text-sm">
					Cast Call Time
					<input
						type="time"
						name="cast_call_time"
						class="mt-1 w-full rounded-md border px-3 py-2"
						bind:value={callBlockCastCallTime}
					/>
				</label>

				<input
					name="location"
					placeholder="Location"
					class="w-full rounded-md border px-3 py-2"
					bind:value={callBlockLocation}
				/>

				<input
					name="call_type"
					placeholder="Call Type (Load In, Show, Strike...)"
					class="w-full rounded-md border px-3 py-2"
					bind:value={callBlockType}
				/>

				<textarea
					name="break_notes"
					placeholder="Break Notes"
					class="w-full rounded-md border px-3 py-2"
					bind:value={callBlockBreakNotes}
				></textarea>

				<textarea
					name="public_notes"
					placeholder="Public Notes"
					class="w-full rounded-md border px-3 py-2"
					bind:value={callBlockPublicNotes}
				></textarea>

				<textarea
					name="internal_notes"
					placeholder="Internal Notes"
					class="w-full rounded-md border px-3 py-2"
					bind:value={callBlockInternalNotes}
				></textarea>

				<button
					formaction={editingCallBlock ? '?/updateCallBlock' : '?/createCallBlock'}
					class="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
				>
					{editingCallBlock ? 'Save Changes' : 'Create Call Block'}
				</button>
			</form>
		</div>
	</div>
{/if}

{#if showAssignmentModal}
	<div class="fixed inset-0 z-40 bg-gray-800/30"></div>
	<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6">
		<div class="mt-8 w-full max-w-lg rounded-lg border bg-white p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold">Assign Crew</h2>

				<button
					onclick={() => (showAssignmentModal = false)}
					class="text-gray-500 hover:text-black"
				>
					✕
				</button>
			</div>

			<form
				method="POST"
				use:enhance={() => {
					isAssigning = true;
					assignmentError = '';

					return async ({ result, update }) => {
						isAssigning = false;

						if (result.type === 'failure') {
							assignmentError = result.data?.error ?? 'Failed to create assignment';
							return;
						}

						selectedBlocks = [];
						showAssignmentModal = false;
						await update();
					};
				}}
			>
				<input type="hidden" name="call_blocks" value={JSON.stringify(selectedBlocks)} />

				<select name="worker_id" class="mb-3 w-full rounded border p-2" required>
					<option value="">Select worker</option>

					{#each data.workers as worker}
						<option value={worker.id}>{worker.name}</option>
					{/each}
				</select>

				<input
					name="rate"
					type="number"
					step="0.01"
					placeholder="Rate"
					class="mb-3 w-full rounded border p-2"
					required
				/>

				<textarea name="message" placeholder="Message" class="mb-3 w-full rounded border p-2"
				></textarea>

				{#if assignmentError}
					<p class="mb-3 text-sm text-red-600">{assignmentError}</p>
				{/if}

				<button
					formaction="?/createAssignment"
					class="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
					disabled={isAssigning}
				>
					{isAssigning ? 'Creating...' : 'Create Assignment'}
				</button>
			</form>
		</div>
	</div>
{/if}
