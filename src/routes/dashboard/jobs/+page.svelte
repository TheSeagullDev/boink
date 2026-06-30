<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

{#if data.profile?.role === 'admin'}

	<div class="p-6 space-y-6">

		<!-- Jobs Table -->
		<div class="rounded-lg border bg-white overflow-hidden">
			<div class="px-5 py-4 border-b">
				<h2 class="text-lg font-semibold">
					Jobs
				</h2>
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
						</tr>
					</thead>

					<tbody class="divide-y">
						{#each data.jobs as job}
							<tr class="hover:bg-gray-50 transition">
								<td class="px-4 py-3">
									<a
										class="text-blue-600 hover:underline font-medium"
										href="/dashboard/jobs/view/{job.job_number}"
									>
										{job.job_number}
									</a>
								</td>

								<td class="px-4 py-3">
									{job.name}
								</td>

								<td class="px-4 py-3">
									{job.client}
								</td>

								<td class="px-4 py-3">
									{job.location}
								</td>

								<td class="px-4 py-3">
									{job.start_date}
								</td>

								<td class="px-4 py-3">
									{job.end_date}
								</td>

								<td class="px-4 py-3 max-w-xs truncate">
									{job.notes}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>


		<!-- Create Job -->
		<div class="rounded-lg border bg-white p-5 max-w-xl">
			<h2 class="text-lg font-semibold mb-4">
				Create Job
			</h2>

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
						<input
							type="date"
							name="start_date"
							class="mt-1 w-full rounded-md border px-3 py-2"
						/>
					</label>

					<label class="text-sm">
						End Date
						<input
							type="date"
							name="end_date"
							class="mt-1 w-full rounded-md border px-3 py-2"
						/>
					</label>

				</div>


				<textarea
					name="notes"
					placeholder="Notes"
					class="w-full rounded-md border px-3 py-2 min-h-24"
				></textarea>


				<button
					formaction="?/createJob"
					class="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800 transition"
				>
					Create Job
				</button>

			</form>
		</div>

	</div>

{/if}