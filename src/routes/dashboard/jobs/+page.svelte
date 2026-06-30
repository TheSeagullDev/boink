<script>
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let { data, form } = $props();
</script>

	{#if data.profile?.role === 'admin'}
		<div>
			<table>
				<thead>
					<tr>
						<th>Job Number</th>
						<th>Name</th>
						<th>Client</th>
						<th>Location</th>
						<th>Start Date</th>
						<th>End Date</th>
						<th>Notes</th>
					</tr>
				</thead>
				<tbody>
					{#each data.jobs as job}
						<tr>
							<td><a href="/dashboard/jobs/view/{job.job_number}">{job.job_number}</a></td>
							<td>{job.name}</td>
							<td>{job.client}</td>
							<td>{job.location}</td>
							<td>{job.start_date}</td>
							<td>{job.end_date}</td>
							<td>{job.notes}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="p-4 w-1/2 bg-orange-200 m-4">
        <h2>Create Job</h2>
            <form method="POST" class="flex flex-col">
                <input name="job_number" placeholder="Job Number" required />
                <input name="name" placeholder="Job Name" required />
                <input name="client" placeholder="Client" />
                <input name="location" placeholder="Location" />
                <label>
                    Start Date
                    <input type="date" name="start_date" />
                </label>
                <label>
                    End Date
                    <input type="date" name="end_date" />
                </label>
                <textarea name="notes" placeholder="Notes"></textarea>
                <button formaction="?/createJob"> Create Job </button>
            </form>
        </div>
	{/if}
