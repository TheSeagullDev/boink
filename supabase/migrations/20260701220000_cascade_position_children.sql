alter table assignments
drop constraint if exists assignments_position_id_fkey;

alter table assignments
add constraint assignments_position_id_fkey
foreign key (position_id) references positions(id) on delete cascade;

alter table targeted_postings
drop constraint if exists targeted_postings_position_id_fkey;

alter table targeted_postings
add constraint targeted_postings_position_id_fkey
foreign key (position_id) references positions(id) on delete cascade;

alter table timesheet_entries
drop constraint if exists timesheet_entries_call_block_id_fkey;

alter table timesheet_entries
add constraint timesheet_entries_call_block_id_fkey
foreign key (call_block_id) references call_blocks(id) on delete cascade;
