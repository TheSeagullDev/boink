<script>
	let { data } = $props();
</script>

<div class="p-6 space-y-6">

	<!-- Job Header -->
	<div class="rounded-lg border bg-white p-5">
		<div class="flex justify-between items-start">

			<div>
				<h1 class="text-2xl font-semibold">
					{data.job.name}
				</h1>

				<p class="text-sm text-gray-500 mt-1">
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
			<div class="mt-4 pt-4 border-t text-sm text-gray-600">
				{data.job.notes}
			</div>
		{/if}

	</div>


	<!-- Positions -->
	<div class="rounded-lg border bg-white overflow-hidden">

		<div class="px-5 py-4 border-b">
			<h2 class="text-lg font-semibold">
				Positions
			</h2>
		</div>


		{#if data.job.positions?.length}

			<div class="divide-y">

				{#each data.job.positions as position}

					<div class="flex items-center justify-between p-5">

						<div>

							<h3 class="font-medium">
								{position.title}
							</h3>

							<div class="text-sm text-gray-500 mt-1 space-x-3">

								<span>
									{position.department}
								</span>

								<span>
									Status: {position.status}
								</span>

							</div>


							{#if position.notes}

								<p class="text-sm mt-2 text-gray-600">
									{position.notes}
								</p>

							{/if}

						</div>


						<a
							href="/dashboard/jobs/view/{data.job.job_number}/position/{position.id}"
							class="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 transition"
						>
							View Schedule
						</a>


					</div>

				{/each}

			</div>


		{:else}

			<div class="p-5 text-gray-500">
				No positions created yet.
			</div>

		{/if}

	</div>

</div>