alter table assignments
add constraint assignments_worker_position_unique
unique (worker_id, position_id);

alter table assignment_blocks
add constraint assignment_blocks_unique
unique (assignment_id, call_block_id);