create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null check (role in ('admin', 'manager', 'worker')),
    name text not null,
    email text not null,
    phone text,
    created_at timestamptz default now()
);

create table jobs (
    id uuid primary key default gen_random_uuid(),
    job_number text,
    name text not null,
    client text,
    location text,
    start_date date,
    end_date date,
    notes text,
    tags text[],
    created_at timestamptz default now()
);

create table positions (
    id uuid primary key default gen_random_uuid(),
    job_id uuid not null references jobs(id) on delete cascade,
    title text not null,
    department text,
    status text default 'open',
    notes text
);

create table call_blocks (
    id uuid primary key default gen_random_uuid(),
    position_id uuid not null references positions(id) on delete cascade,

    date date not null,
    start_time time not null,
    end_time time,

    location text,
    call_type text,

    cast_call_time time,

    break_notes text,
    public_notes text,
    internal_notes text
);

create table assignments (
    id uuid primary key default gen_random_uuid(),

    worker_id uuid not null references profiles(id),

    position_id uuid references positions(id),

    status text default 'draft',

    rate numeric,

    message text,

    created_at timestamptz default now()
);

create table assignment_blocks (
    assignment_id uuid references assignments(id) on delete cascade,
    call_block_id uuid references call_blocks(id) on delete cascade,

    primary key (assignment_id, call_block_id)
);

create table targeted_postings (
    id uuid primary key default gen_random_uuid(),

    position_id uuid references positions(id),

    message text,

    rate numeric,

    created_at timestamptz default now()
);

create table posting_workers (
    posting_id uuid references targeted_postings(id) on delete cascade,

    worker_id uuid references profiles(id) on delete cascade,

    response text default 'pending',

    primary key (posting_id, worker_id)
);

create table timesheets (
    id uuid primary key default gen_random_uuid(),

    worker_id uuid references profiles(id),

    week_start date,

    status text default 'draft'
);

create table timesheet_entries (
    id uuid primary key default gen_random_uuid(),

    timesheet_id uuid references timesheets(id) on delete cascade,

    call_block_id uuid references call_blocks(id),

    clock_in timestamptz,

    clock_out timestamptz,

    break_minutes integer default 0,

    notes text
);

create table audit_log (
    id uuid primary key default gen_random_uuid(),

    table_name text,

    row_id uuid,

    old jsonb,

    new jsonb,

    user_id uuid references profiles(id),

    created_at timestamptz default now()
);