<script>
	let { data } = $props();

	function formatTime(time) {
		if (!time) return '';

		return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

    <h1 class="p-4 text-2xl font-semibold">My Assignments</h1>
    
    {#if data.assignments.length}
        <div class="space-y-4 p-4">
            {#each data.assignments as assignment}
                <div class="rounded-lg border bg-white p-5">
                    <h2 class="text-lg font-semibold">
                        {assignment.position.jobs.name}
                    </h2>
    
                    <p class="text-sm text-gray-600">
                        Job #{assignment.position.jobs.job_number}
                    </p>
    
                    <p class="mt-2">
                        Position:
                        {assignment.position.title}
                    </p>
    
                    <p>
                        Status:
                        {assignment.status}
                    </p>
    
                    <div class="mt-4 space-y-2">
                        {#each assignment.assignment_blocks as block}
                            <div class="rounded bg-gray-50 p-3">
                                <p>
                                    {block.call_blocks.date}
                                </p>
    
                                <p>
                                    {formatTime(block.call_blocks.start_time)}
                                    -
                                    {formatTime(block.call_blocks.end_time)}
                                </p>
    
                                <p>
                                    {block.call_blocks.location}
                                </p>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p class="text-gray-500 m-4">No assignments yet.</p>
    {/if}
