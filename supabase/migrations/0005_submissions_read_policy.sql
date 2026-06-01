-- Allow anonymous reads of submissions so that
--   (a) the quiz server action can return the inserted row's id via RETURNING, and
--   (b) the public results page can fetch a submission by its UUID.
-- Submission IDs are unguessable UUIDs, so this is treated as a shareable-link policy.

create policy submissions_read on public.submissions for select using (true);
