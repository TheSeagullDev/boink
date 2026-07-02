<script>
	let { data } = $props();

	import { formatDate, formatTime } from '$lib/utils/format.js';
</script>

<svelte:head>
	<title>{data.job.name} - Schedule</title>

	<style>
		@media print {
			@page {
				margin: 0.5in;
			}

			body {
				background: white;
			}

			.print-card {
				border: none !important;
				box-shadow: none !important;
			}

			.print-table-header {
				background: white !important;
			}
		}
	</style>
</svelte:head>

<div class="space-y-6 p-6">
	<!-- Header -->
	<div class="print-card rounded-lg border bg-white p-5">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-semibold">
					{data.job.name}
				</h1>

				<p class="text-gray-500">
					Job #{data.job.job_number}
				</p>

				{#if data.job.client}
					<p class="mt-2 text-sm">
						Client: {data.job.client}
					</p>
				{/if}
			</div>

			<button
				onclick={() => window.print()}
				class="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 print:hidden"
			>
				Print Schedule
			</button>
		</div>
	</div>

	<!-- Schedule -->
	{#each Object.entries(data.schedule) as [date, rows]}
		<div class="print-card overflow-hidden rounded-lg border bg-white">
			<div class="print-table-header border-b bg-gray-50 px-5 py-4">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold">
						{formatDate(date)}
					</h2>

					<div class="text-sm text-gray-500">
						{rows.filter((r) => r.worker).length}
						/
						{rows.length}
						Filled
					</div>
				</div>
			</div>

			<table class="w-full text-sm print:text-xs">
				<thead class="bg-gray-50 text-left">
					<tr>
						<th class="px-4 py-3">Position</th>
						<th class="px-4 py-3">Worker</th>
						<th class="px-4 py-3">Call</th>
						<th class="px-4 py-3">Type</th>
						<th class="px-4 py-3">Location</th>
					</tr>
				</thead>

				<tbody class="divide-y">
					{#each rows as row}
						<tr>
							<td class="px-4 py-3">
								<div class="font-medium">
									{row.position}
								</div>

								{#if row.department}
									<div class="text-xs text-gray-500">
										{row.department}
									</div>
								{/if}
							</td>

							<td class="px-4 py-3">
								{#if row.worker}
									<div>
										{row.worker}
									</div>

									{#if row.status}
										<div class="text-xs text-gray-500">
											{row.status}
										</div>
									{/if}
								{:else}
									<span class="text-red-500"> Unassigned </span>
								{/if}
							</td>

							<td class="px-4 py-3">
								{formatTime(row.start_time)}

								{#if row.end_time}
									-
									{formatTime(row.end_time)}
								{/if}
							</td>

							<td class="px-4 py-3">
								{row.call_type}
							</td>

							<td class="px-4 py-3">
								{row.location}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/each}
</div>
