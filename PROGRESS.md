# Video Ledger — Progress

## Plan

| # | Task | Status |
|---|------|--------|
| 1 | Signup photo upload silently fails when "Confirm email" is on (no session → storage RLS rejects) | done |
| 2 | Profile photo: validation (type, 2 MB), clean up old files, "Remove photo" | done |
| 3 | `avatars` bucket: force public + size/type limits even if it was created by hand | done |
| 4 | SQL script not re-runnable (storage policy DROP/CREATE names differed) | done |
| 5 | "Delete my account" did not delete the login or the photo files | done |
| 6 | Ledger edit form lost focus after every keystroke (components defined inside render) | done |
| 7 | Missing CSS: `/8` and `/12` opacity classes, `bg-ledger-bg` | done |
| 8 | Silent errors on load / delete; `navigate()` called during render | done |
| 9 | Owner: re-run `supabase_setup.sql` in Supabase SQL Editor | waiting (owner) |
| 10 | Owner: check Auth → URL Configuration has the Vercel URL + `/reset-password` and `/login` | waiting (owner) |
| 11 | Test logged-in flows on the live site after deploy (upload, edit, delete account) | not started |

## Done log

- 2026-11-27 — Tasks 1–8 on branch `fix/storage-and-bugs` (see commit history).
