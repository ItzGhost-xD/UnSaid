# Unsaid implementation guidance

- Preserve the selected “Human Archive” direction in `docs/selected-wireframe.png`.
- Keep the product calm, warm, text-first, and low-pressure.
- Do not introduce public profiles, follows, direct messages, public rankings, or an infinite feed.
- AI or automation may organize, flag, and retrieve human writing; it must not impersonate a contributor or generate personal advice.
- Treat privacy and contributor control as core product behavior, not secondary copy.
- Keep all server mutations behind route handlers. Never expose the Supabase service-role key to browser code.
