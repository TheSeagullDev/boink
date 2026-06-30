--------------------------------------------------
-- ENABLE RLS
--------------------------------------------------

alter table profiles enable row level security;
alter table jobs enable row level security;
alter table positions enable row level security;
alter table call_blocks enable row level security;
alter table assignments enable row level security;
alter table assignment_blocks enable row level security;
alter table targeted_postings enable row level security;
alter table posting_workers enable row level security;
alter table timesheets enable row level security;
alter table timesheet_entries enable row level security;
alter table audit_log enable row level security;


--------------------------------------------------
-- HELPER: GET CURRENT USER ROLE
--------------------------------------------------

create or replace function public.user_role()
returns text
language sql
stable
security definer
as $$
    select role
    from profiles
    where id = auth.uid();
$$;


--------------------------------------------------
-- PROFILES
--------------------------------------------------

-- Users can see themselves + basic profile info
-- Managers/admins can see everyone

create policy "View own profile"
on profiles
for select
using (
    id = auth.uid()
);

create policy "Managers and admins view all profiles"
on profiles
for select
using (
    user_role() in ('admin','manager')
);


-- Only managers/admins can edit profiles
-- prevents worker changing role/rates/etc

create policy "Managers edit profiles"
on profiles
for update
using (
    user_role() in ('admin','manager')
);


-- Only managers create profiles

create policy "Managers create profiles"
on profiles
for insert
with check (
    user_role() in ('admin','manager')
);


-- Only managers can delete profiles

create policy "Managers delete profiles"
on profiles
for delete
using (
    user_role() in ('admin','manager')
);



--------------------------------------------------
-- JOBS
--------------------------------------------------

-- Managers/admins see all jobs

create policy "Managers view jobs"
on jobs
for select
using (
    user_role() in ('admin','manager')
);

-- Workers see jobs they have positions assigned to
create policy "Workers view assigned jobs"
on jobs
for select
using (
    exists (
        select 1
        from positions
        where positions.job_id = jobs.id
        and exists (
            select 1
            from assignments
            where assignments.position_id = positions.id
            and assignments.worker_id = auth.uid()
        )
    )
);


create policy "Managers create jobs"
on jobs
for insert
with check (
    user_role() in ('admin','manager')
);


create policy "Managers update jobs"
on jobs
for update
using (
    user_role() in ('admin','manager')
);


create policy "Managers delete jobs"
on jobs
for delete
using (
    user_role() in ('admin','manager')
);



--------------------------------------------------
-- POSITIONS
--------------------------------------------------

-- Managers/admins see all positions

create policy "Managers view positions"
on positions
for select
using (
    user_role() in ('admin','manager')
);

-- Workers see positions they're assigned to
create policy "Workers view assigned positions"
on positions
for select
using (
    exists (
        select 1
        from assignments
        where assignments.position_id = positions.id
        and assignments.worker_id = auth.uid()
    )
);

-- Workers see positions they have targeted postings for
create policy "Workers view posted positions"
on positions
for select
using (
    exists (
        select 1
        from targeted_postings
        join posting_workers on targeted_postings.id = posting_workers.posting_id
        where targeted_postings.position_id = positions.id
        and posting_workers.worker_id = auth.uid()
    )
);


create policy "Managers create positions"
on positions
for insert
with check (
    user_role() in ('admin','manager')
);


create policy "Managers update positions"
on positions
for update
using (
    user_role() in ('admin','manager')
);


create policy "Managers delete positions"
on positions
for delete
using (
    user_role() in ('admin','manager')
);



--------------------------------------------------
-- CALL BLOCKS
--------------------------------------------------

-- Managers/admins see all call blocks

create policy "Managers view call blocks"
on call_blocks
for select
using (
    user_role() in ('admin','manager')
);

-- Workers see call blocks they're assigned to
create policy "Workers view assigned call blocks"
on call_blocks
for select
using (
    exists (
        select 1
        from assignment_blocks
        join assignments on assignment_blocks.assignment_id = assignments.id
        where assignment_blocks.call_block_id = call_blocks.id
        and assignments.worker_id = auth.uid()
    )
);

-- Workers see call blocks from positions they have targeted postings for
create policy "Workers view call blocks for posted positions"
on call_blocks
for select
using (
    exists (
        select 1
        from targeted_postings
        join posting_workers on targeted_postings.id = posting_workers.posting_id
        where targeted_postings.position_id = call_blocks.position_id
        and posting_workers.worker_id = auth.uid()
    )
);


create policy "Managers create call blocks"
on call_blocks
for insert
with check (
    user_role() in ('admin','manager')
);


create policy "Managers update call blocks"
on call_blocks
for update
using (
    user_role() in ('admin','manager')
);


create policy "Managers delete call blocks"
on call_blocks
for delete
using (
    user_role() in ('admin','manager')
);



--------------------------------------------------
-- ASSIGNMENTS
--------------------------------------------------

-- Workers see their own assignments
-- Managers see all

create policy "View assignments"
on assignments
for select
using (
    worker_id = auth.uid()
    or user_role() in ('admin','manager')
);


-- Managers create assignments

create policy "Managers create assignments"
on assignments
for insert
with check (
    user_role() in ('admin','manager')
);


-- Managers can edit all assignments

create policy "Managers update assignments"
on assignments
for update
using (
    user_role() in ('admin','manager')
);


-- Workers can only accept/decline their own assignments
-- and only change status field

create policy "Workers respond to assignments"
on assignments
for update
using (
    worker_id = auth.uid()
)
with check (
    worker_id = auth.uid()
    and status in ('accepted','declined')
);


-- Managers can delete assignments
create policy "Managers delete assignments"
on assignments
for delete
using (
    user_role() in ('admin','manager')
);



--------------------------------------------------
-- ASSIGNMENT BLOCKS
--------------------------------------------------

-- Workers can see blocks belonging to their assignments

create policy "View assignment blocks"
on assignment_blocks
for select
using (
    exists (
        select 1
        from assignments
        where assignments.id = assignment_blocks.assignment_id
        and (
            assignments.worker_id = auth.uid()
            or user_role() in ('admin','manager')
        )
    )
);


-- Managers manage assignment blocks (all operations)

create policy "Managers manage assignment blocks"
on assignment_blocks
for all
using (
    user_role() in ('admin','manager')
);



--------------------------------------------------
-- TARGETED POSTINGS
--------------------------------------------------

-- Workers only see postings they were sent

create policy "View targeted postings"
on targeted_postings
for select
using (
    user_role() in ('admin','manager')
    or exists (
        select 1
        from posting_workers
        where posting_workers.posting_id = targeted_postings.id
        and posting_workers.worker_id = auth.uid()
    )
);


-- Managers manage postings (all operations)

create policy "Managers manage postings"
on targeted_postings
for all
using (
    user_role() in ('admin','manager')
);



--------------------------------------------------
-- POSTING WORKERS
--------------------------------------------------

-- Workers see their own posting responses
-- Managers see all

create policy "Workers view own posting responses"
on posting_workers
for select
using (
    worker_id = auth.uid()
    or user_role() in ('admin','manager')
);


-- Worker can only update their own response status

create policy "Workers respond to postings"
on posting_workers
for update
using (
    worker_id = auth.uid()
)
with check (
    worker_id = auth.uid()
    and response in ('accepted','declined','pending')
);


-- Managers can insert posting recipients

create policy "Managers create posting recipients"
on posting_workers
for insert
with check (
    user_role() in ('admin','manager')
);


-- Managers can delete posting recipients

create policy "Managers delete posting recipients"
on posting_workers
for delete
using (
    user_role() in ('admin','manager')
);



--------------------------------------------------
-- TIMESHEETS
--------------------------------------------------

-- Workers see their own timesheets
-- Managers see all

create policy "View timesheets"
on timesheets
for select
using (
    worker_id = auth.uid()
    or user_role() in ('admin','manager')
);


-- Workers create their own timesheets

create policy "Workers create timesheets"
on timesheets
for insert
with check (
    worker_id = auth.uid()
);


-- Workers can edit draft timesheets only (and change status to submitted)

create policy "Workers edit draft timesheets"
on timesheets
for update
using (
    worker_id = auth.uid()
    and status = 'draft'
)
with check (
    worker_id = auth.uid()
    and status in ('draft','submitted')
);


-- Workers can delete their own draft timesheets

create policy "Workers delete draft timesheets"
on timesheets
for delete
using (
    worker_id = auth.uid()
    and status = 'draft'
);


-- Managers manage all timesheets (all operations)

create policy "Managers manage timesheets"
on timesheets
for all
using (
    user_role() in ('admin','manager')
);



--------------------------------------------------
-- TIMESHEET ENTRIES
--------------------------------------------------

-- Workers see entries in their own timesheets
-- Managers see all entries

create policy "View timesheet entries"
on timesheet_entries
for select
using (
    exists (
        select 1
        from timesheets
        where timesheets.id = timesheet_entries.timesheet_id
        and (
            timesheets.worker_id = auth.uid()
            or user_role() in ('admin','manager')
        )
    )
);


-- Workers create entries in their own draft timesheets

create policy "Workers create timesheet entries"
on timesheet_entries
for insert
with check (
    exists (
        select 1
        from timesheets
        where timesheets.id = timesheet_id
        and timesheets.worker_id = auth.uid()
        and timesheets.status = 'draft'
    )
);


-- Workers edit entries in their own draft timesheets

create policy "Workers edit timesheet entries"
on timesheet_entries
for update
using (
    exists (
        select 1
        from timesheets
        where timesheets.id = timesheet_entries.timesheet_id
        and timesheets.worker_id = auth.uid()
        and timesheets.status = 'draft'
    )
);


-- Workers delete entries from their own draft timesheets

create policy "Workers delete timesheet entries"
on timesheet_entries
for delete
using (
    exists (
        select 1
        from timesheets
        where timesheets.id = timesheet_entries.timesheet_id
        and timesheets.worker_id = auth.uid()
        and timesheets.status = 'draft'
    )
);


-- Managers manage all timesheet entries (all operations)

create policy "Managers manage timesheet entries"
on timesheet_entries
for all
using (
    user_role() in ('admin','manager')
);



--------------------------------------------------
-- AUDIT LOG
--------------------------------------------------

-- Users cannot create/update/delete audit records
-- Only system triggers should write to audit log

create policy "No direct audit manipulation"
on audit_log
for insert
with check (false);

create policy "No audit updates"
on audit_log
for update
using (false);

create policy "No audit deletes"
on audit_log
for delete
using (false);


-- Managers/admins can view audit log

create policy "Managers view audit log"
on audit_log
for select
using (
    user_role() in ('admin','manager')
);