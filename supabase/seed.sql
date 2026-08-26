insert into public.posts (
  id, topic, title, happened, helped, wish_known, author_alias,
  session_hash, recovery_hash, status, content_note, tags, created_at
) values
(
  '14a6f86a-4bce-48e0-9000-000000000001', 'Starting over',
  'Starting over can look like falling behind',
  $$When I left the path everyone expected me to follow, it did not immediately feel brave. Mostly, it felt lonely. Other people continued moving forward while I was rebuilding routines I used to take for granted. I kept measuring my beginning against somebody else’s middle.$$, 
  $$I started choosing one ordinary next step each week and stopped using other people’s timelines as a scoreboard.$$, 
  $$Starting again rarely looks impressive from the inside. Confusion and slow progress do not automatically mean you chose incorrectly.$$, 
  'Anonymous Fox', 'seed-session-1', 'seed-recovery-1', 'published',
  'Major life changes and academic pressure', array['changing paths','comparison','new beginnings','feeling behind'], '2026-08-18T10:15:00Z'
),
(
  '14a6f86a-4bce-48e0-9000-000000000002', 'Uncertainty',
  'I kept waiting to feel certain',
  $$I thought everyone else had chosen a future and received some secret confirmation that it was correct. I kept waiting for that certainty before beginning anything. It never came, and staying still slowly became its own decision.$$, 
  $$Treating a choice as an experiment made it feel smaller. I picked one direction to explore instead of demanding an answer for the rest of my life.$$, 
  $$Clarity sometimes arrives after movement, not before it. One careful next step is enough to begin.$$, 
  'Anonymous Wren', 'seed-session-2', 'seed-recovery-2', 'published',
  'Uncertainty about future decisions', array['decisions','future','fear','choosing a direction'], '2026-08-17T14:30:00Z'
),
(
  '14a6f86a-4bce-48e0-9000-000000000003', 'Rebuilding',
  'Progress was quieter than I expected',
  $$I imagined getting my routine back would feel like a dramatic comeback. Instead, it was ordinary: finishing one task, replying to something I had avoided, and trying again after an unproductive day. Because the changes were small, I kept thinking they did not count.$$, 
  $$I kept a note of small evidence instead of waiting to feel completely transformed.$$, 
  $$Progress does not always announce itself. Sometimes it is simply doing today what yesterday felt difficult to begin.$$, 
  'Anonymous Otter', 'seed-session-3', 'seed-recovery-3', 'published',
  'Burnout and rebuilding routines', array['routines','small steps','confidence','starting again'], '2026-08-16T09:20:00Z'
),
(
  '14a6f86a-4bce-48e0-9000-000000000004', 'School',
  'The result arrived before I was ready',
  $$I had already imagined how proud I would feel when I saw my result. When it was lower than I expected, I was disappointed and embarrassed that I had expected more. For a while, I treated that grade as a conclusion instead of information.$$, 
  $$I reviewed what had worked, changed one part of how I prepared, and spoke to someone who could explain my options without judging me.$$, 
  $$A result can describe one performance without describing your whole future. You can be disappointed without deciding that you are a disappointment.$$, 
  'Anonymous Robin', 'seed-session-4', 'seed-recovery-4', 'published',
  'Disappointing academic results', array['exams','grades','comparison','academic pressure'], '2026-08-15T12:10:00Z'
),
(
  '14a6f86a-4bce-48e0-9000-000000000005', 'Family',
  'I did not need the perfect explanation',
  $$I used to rehearse difficult conversations, believing that if I found exactly the right words my family would immediately understand me. Sometimes they still did not, and I assumed that meant I had explained myself badly.$$, 
  $$Writing down the one point I needed to communicate helped me stay clear without trying to control the whole conversation.$$, 
  $$You can listen, remain respectful, and still disagree. Your voice is not automatically an act of rejection.$$, 
  'Anonymous Deer', 'seed-session-5', 'seed-recovery-5', 'published',
  'Family expectations and disagreement', array['expectations','boundaries','feeling unheard','family'], '2026-08-13T18:40:00Z'
),
(
  '14a6f86a-4bce-48e0-9000-000000000006', 'Friendship',
  'Being included was not the same as belonging',
  $$I was invited and included in every conversation, but I often left feeling as though I had performed a version of myself that was easier for everyone else to like. Nothing dramatic happened. I simply became tired of feeling lonely around people.$$, 
  $$Creating a little distance gave me room to notice which friendships felt mutual and calm.$$, 
  $$A friendship does not need to be terrible before you are allowed to admit it no longer feels right.$$, 
  'Anonymous Moth', 'seed-session-6', 'seed-recovery-6', 'published',
  'Loneliness and changing friendships', array['loneliness','belonging','changing friendships','self-respect'], '2026-08-12T16:00:00Z'
),
(
  '14a6f86a-4bce-48e0-9000-000000000007', 'Identity',
  'Changing my mind did not make me fake',
  $$I had spoken about one future for so long that changing direction felt dishonest. People associated me with that plan, and I worried they would think I had failed or never truly wanted it. The simpler truth was that I had learned more about myself.$$, 
  $$I wrote down what new information had changed my thinking. That showed me the decision was thoughtful, not random.$$, 
  $$You are allowed to outgrow a goal after learning something new. An earlier choice can be sincere without remaining permanent.$$, 
  'Anonymous Finch', 'seed-session-7', 'seed-recovery-7', 'published',
  'Changing goals and personal identity', array['changing goals','identity','future','self-trust'], '2026-08-10T11:45:00Z'
),
(
  '14a6f86a-4bce-48e0-9000-000000000008', 'Setbacks',
  'The rejection did not give me directions',
  $$I had built so many plans around one opportunity that when it rejected me, I felt as though the rest of the year had disappeared with it. The rejection never explained what I should do next, so I had to separate the opportunity I lost from everything still possible.$$, 
  $$Admitting that I cared, then choosing one small alternative action, stopped the disappointment from making every decision for me.$$, 
  $$A closed path can matter without becoming the final description of what remains possible.$$, 
  'Anonymous Badger', 'seed-session-8', 'seed-recovery-8', 'published',
  'Rejection and disappointment', array['rejection','applications','setbacks','alternative plans'], '2026-08-08T13:25:00Z'
)
on conflict (id) do nothing;

insert into public.replies (id, post_id, author_alias, body, session_hash, status, created_at) values
('24a6f86a-4bce-48e0-9000-000000000001', '14a6f86a-4bce-48e0-9000-000000000001', 'Anonymous Heron', 'I needed the reminder that a restart has its own timeline. Thank you for leaving this here.', 'seed-reply-1', 'published', '2026-08-20T09:10:00Z'),
('24a6f86a-4bce-48e0-9000-000000000002', '14a6f86a-4bce-48e0-9000-000000000001', 'Anonymous Hare', 'The difference between a beginning and somebody else’s middle is exactly what I was missing.', 'seed-reply-2', 'published', '2026-08-21T12:05:00Z'),
('24a6f86a-4bce-48e0-9000-000000000003', '14a6f86a-4bce-48e0-9000-000000000002', 'Anonymous Seal', 'Calling the next choice an experiment makes it feel possible rather than permanent.', 'seed-reply-3', 'published', '2026-08-22T15:45:00Z'),
('24a6f86a-4bce-48e0-9000-000000000004', '14a6f86a-4bce-48e0-9000-000000000004', 'Anonymous Lynx', 'A grade as information instead of identity is a much kinder and more useful way to see it.', 'seed-reply-4', 'published', '2026-08-19T08:30:00Z')
on conflict (id) do nothing;
