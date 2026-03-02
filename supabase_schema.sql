-- Create the todos table
create table todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  task text check (char_length(task) > 0),
  is_complete boolean default false,
  inserted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table todos enable row level security;

-- Create Policies
-- Users can only view their own tasks
create policy "Users can view their own todos."
  on todos for select
  using ( auth.uid() = user_id );

-- Users can only insert their own tasks
create policy "Users can insert their own todos."
  on todos for insert
  with check ( auth.uid() = user_id );

-- Users can only update their own tasks
create policy "Users can update their own todos."
  on todos for update
  using ( auth.uid() = user_id );

-- Users can only delete their own tasks
create policy "Users can delete their own todos."
  on todos for delete
  using ( auth.uid() = user_id );

-- Turn on Realtime for the table
alter publication supabase_realtime add table todos;
