<script>
	let { data, form } = $props();

	let showJobModal = $state(false);
	let editingJob = $state(null);
	let jobId = $state('');
	let jobNumber = $state('');
	let jobName = $state('');
	let jobClient = $state('');
	let jobLocation = $state('');
	let jobStartDate = $state('');
	let jobEndDate = $state('');
	let jobNotes = $state('');

	function openJobModal(job = null) {
		editingJob = job;
		jobId = job?.id ?? '';
		jobNumber = job?.job_number ?? '';
		jobName = job?.name ?? '';
		jobClient = job?.client ?? '';
		jobLocation = job?.location ?? '';
		jobStartDate = job?.start_date ?? '';
		jobEndDate = job?.end_date ?? '';
		jobNotes = job?.notes ?? '';
		showJobModal = true;
	}

	function closeJobModal() {
		showJobModal = false;
		editingJob = null;
	}
</script>

{#if ['admin', 'manager'].includes(data.profile?.role)}
	<div class="p-6 space-y-6">
		<!-- Jobs Table -->
		<div class="overflow-hidden rounded-lg border bg-white">
			<div class="border-b px-5 py-4">
				<h2 class="text-lg font-semibold">Jobs</h2>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 text-left">
						<tr>
							<th class="px-4 py-3 font-medium">Job Number</th>
							<th class="px-4 py-3 font-medium">Name</th>
							<th class="px-4 py-3 font-medium">Client</th>
							<th class="px-4 py-3 font-medium">Location</th>
							<th class="px-4 py-3 font-medium">Start Date</th>
							<th class="px-4 py-3 font-medium">End Date</th>
							<th class="px-4 py-3 font-medium">Notes</th>
							<th class="px-4 py-3 font-medium text-right">Actions</th>
						</tr>
					</thead>

					<tbody class="divide-y">
						{#each data.jobs as job}
							<tr class="transition hover:bg-gray-50">
								<td class="px-4 py-3">
									<a
										class="font-medium text-blue-600 hover:underline"
										href="/dashboard/jobs/view/{job.job_number}"
									>
										{job.job_number}
									</a>
								</td>

								<td class="px-4 py-3">{job.name}</td>
								<td class="px-4 py-3">{job.client}</td>
								<td class="px-4 py-3">{job.location}</td>
								<td class="px-4 py-3">{job.start_date}</td>
								<td class="px-4 py-3">{job.end_date}</td>
								<td class="max-w-xs px-4 py-3 truncate">{job.notes}</td>
								<td class="px-4 py-3">
									<div class="flex justify-end gap-2">
										<button
											type="button"
											class="rounded-md border px-3 py-2 text-xs font-medium transition hover:bg-gray-100"
											onclick={() => openJobModal(job)}
										>
											Edit
										</button>

										<form method="POST">
											<input type="hidden" name="job_id" value={job.id} />
											<button
												formaction="?/deleteJob"
												class="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
												onclick={(event) => {
													if (!confirm(`Delete job ${job.job_number}? This will remove its positions and call blocks.`)) {
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
			</div>
		</div>

		<!-- Create Job -->
		<div class="max-w-xl rounded-lg border bg-white p-5">
			<h2 class="mb-4 text-lg font-semibold">Create Job</h2>

			<form method="POST" class="space-y-3">
				<input
					name="job_number"
					placeholder="Job Number"
					class="w-full rounded-md border px-3 py-2"
					required
				/>

				<input
					name="name"
					placeholder="Job Name"
					class="w-full rounded-md border px-3 py-2"
					required
				/>

				<input
					name="client"
					placeholder="Client"
					class="w-full rounded-md border px-3 py-2"
				/>

				<input
					name="location"
					placeholder="Location"
					class="w-full rounded-md border px-3 py-2"
				/>

				<div class="grid grid-cols-2 gap-3">
					<label class="text-sm">
						Start Date
						<input type="date" name="start_date" class="mt-1 w-full rounded-md border px-3 py-2" />
					</label>

					<label class="text-sm">
						End Date
						<input type="date" name="end_date" class="mt-1 w-full rounded-md border px-3 py-2" />
					</label>
				</div>

				<textarea
					name="notes"
					placeholder="Notes"
					class="min-h-24 w-full rounded-md border px-3 py-2"
				></textarea>

				<button
					formaction="?/createJob"
					class="rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-800"
				>
					Create Job
				</button>
			</form>
		</div>
	</div>

	{#if showJobModal}
		<div class="fixed inset-0 z-40 bg-gray-800/30"></div>
		<div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-6">
			<div class="mt-8 w-full max-w-xl rounded-lg border bg-white p-6 shadow-xl">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-lg font-semibold">Edit Job</h2>

					<button type="button" onclick={closeJobModal} class="text-gray-500 hover:text-black">
						✕
					</button>
				</div>

				<form method="POST" class="space-y-3">
					<input type="hidden" name="job_id" value={jobId} />

					<input
						name="job_number"
						placeholder="Job Number"
						class="w-full rounded-md border px-3 py-2"
						bind:value={jobNumber}
						required
					/>

					<input
						name="name"
						placeholder="Job Name"
						class="w-full rounded-md border px-3 py-2"
						bind:value={jobName}
						required
					/>

					<input
						name="client"
						placeholder="Client"
						class="w-full rounded-md border px-3 py-2"
						bind:value={jobClient}
					/>

					<input
						name="location"
						placeholder="Location"
						class="w-full rounded-md border px-3 py-2"
						bind:value={jobLocation}
					/>

					<div class="grid grid-cols-2 gap-3">
						<label class="text-sm">
							Start Date
							<input
								type="date"
								name="start_date"
								class="mt-1 w-full rounded-md border px-3 py-2"
								bind:value={jobStartDate}
							/>
						</label>

						<label class="text-sm">
							End Date
							<input
								type="date"
								name="end_date"
								class="mt-1 w-full rounded-md border px-3 py-2"
								bind:value={jobEndDate}
							/>
						</label>
					</div>

					<textarea
						name="notes"
						placeholder="Notes"
						class="min-h-24 w-full rounded-md border px-3 py-2"
						bind:value={jobNotes}
					></textarea>

					<button
						formaction={editingJob ? '?/updateJob' : '?/createJob'}
						class="w-full rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-800"
					>
						{editingJob ? 'Save Changes' : 'Create Job'}
					</button>
				</form>
			</div>
		</div>
	{/if}
{/if}
