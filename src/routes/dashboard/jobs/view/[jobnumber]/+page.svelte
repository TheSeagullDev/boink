<script>
	let { data } = $props();
</script>


<h1>
	{data.job.name}
</h1>

<p>
	Job #{data.job.job_number}
</p>

<p>
	Client: {data.job.client}
</p>


<h2>
	Positions
</h2>

{#if data.job.positions?.length}

	{#each data.job.positions as position}

		<div>
			<h3>
				{position.title}
			</h3>

			<p>
				Department: {position.department}
			</p>

			<p>
				Status: {position.status}
			</p>

			{#if position.notes}
				<p>
					Notes: {position.notes}
				</p>
			{/if}
		</div>

	{/each}

{:else}

	<p>
		No positions created yet.
	</p>

{/if}