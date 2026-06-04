-- Adds the Psychosophy test (Afanasyev): orders 4 functions (Will, Logic, Emotion, Physics)
-- into a 4-letter code such as 'VLEF'. 24 archetypes total (4!).

-- Allow the new scoring strategy + result template values.
alter table public.tests drop constraint tests_scoring_strategy_check;
alter table public.tests add constraint tests_scoring_strategy_check
  check (scoring_strategy in
    ('likert_percentage', 'mbti_dichotomy', 'enneagram_dominant', 'cognitive_stack', 'psychosophy_stack'));

alter table public.tests drop constraint tests_result_template_check;
alter table public.tests add constraint tests_result_template_check
  check (result_template in
    ('bars', 'mbti_code', 'enneagram_type', 'cognitive_stack', 'psychosophy_stack'));

-- ============================================================
-- Psychosophy
-- ============================================================
insert into public.tests (
  slug, name, tagline, description,
  question_kind, scoring_strategy, result_template,
  is_published, sort_order, estimated_minutes
) values (
  'psychosophy', 'Psychosophy',
  'Order of Will, Logic, Emotion, and Physics',
  'Psychosophy (Afanasyev) maps how confidently you operate across four aspects of the self — Will, Logic, Emotion, and Physics. The order in which these functions stack produces one of 24 distinct archetypes, each describing where you act with certainty, where you are flexible, where you are sensitive, and where you absorb the influence of others.',
  'likert', 'psychosophy_stack', 'psychosophy_stack',
  true, 5, 8
);

do $$
declare
  t_id uuid := (select id from public.tests where slug = 'psychosophy');
  v_id uuid; l_id uuid; e_id uuid; f_id uuid;
begin
  -- Traits
  insert into public.traits (test_id, slug, label, description, sort_order) values
    (t_id, 'v', 'Will', 'Drive, decision, and direction — what you want and how you pursue it.', 1)
    returning id into v_id;
  insert into public.traits (test_id, slug, label, description, sort_order) values
    (t_id, 'l', 'Logic', 'Thought, analysis, and understanding — how you reason about the world.', 2)
    returning id into l_id;
  insert into public.traits (test_id, slug, label, description, sort_order) values
    (t_id, 'e', 'Emotion', 'Feeling, expression, and atmosphere — how vividly you experience and convey inner states.', 3)
    returning id into e_id;
  insert into public.traits (test_id, slug, label, description, sort_order) values
    (t_id, 'f', 'Physics', 'Body, matter, and the material world — comfort, sensation, and practical action.', 4)
    returning id into f_id;

  -- Will questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I know what I want and pursue it with little hesitation.', v_id, 1);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'Making decisions for myself or a group comes naturally to me.', v_id, 2);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I take action even when those around me are unsure what to do.', v_id, 3);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I rarely second-guess the direction I have chosen.', v_id, 4);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I feel restless if I am not driving toward a goal of my own.', v_id, 5);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'People often defer to me when leadership is needed.', v_id, 6);

  -- Logic questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I enjoy analysing complex problems and breaking them apart.', l_id, 7);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I want to understand the underlying reasons behind every situation.', l_id, 8);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I prefer to think things through carefully before committing to a view.', l_id, 9);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I evaluate arguments by their consistency, not by who is making them.', l_id, 10);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I find satisfaction in mapping out how ideas connect to one another.', l_id, 11);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I notice when other people''s reasoning has flaws or gaps.', l_id, 12);

  -- Emotion questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'My feelings are vivid, and I express them readily.', e_id, 13);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I am easily moved by music, art, or stories.', e_id, 14);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I notice the emotional atmosphere of a room when I walk in.', e_id, 15);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I want my life to be charged with emotional intensity rather than muted.', e_id, 16);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I have no trouble articulating what I feel in the moment.', e_id, 17);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I am drawn to people who feel deeply rather than calmly.', e_id, 18);

  -- Physics questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I pay close attention to my body, comfort, and physical wellbeing.', f_id, 19);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I enjoy working with my hands and shaping material things.', f_id, 20);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'Sensory pleasure — food, touch, environment — matters a great deal to me.', f_id, 21);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I am practical about money, possessions, and physical needs.', f_id, 22);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I take care of how things look and feel in my immediate space.', f_id, 23);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I get hands-on with practical tasks rather than delegating them.', f_id, 24);

  -- Archetypes — all 24 permutations of V, L, E, F.
  insert into public.archetypes (test_id, code, label, description, long_form, sort_order) values
  (t_id, 'VLEF', 'Pasternak',
   'A purposeful visionary who reasons rigorously, feels through others, and lets the body follow the plan.',
   'Will leads with quiet conviction, supported by sharp Logic that argues openly and accepts challenge. Emotion is sensitive — easily wounded, slow to express — while Physics is the empty slot, content to be looked after.',
   1),
  (t_id, 'VLFE', 'Socrates',
   'A driven thinker who lives an examined, plainly material life and is moved by the feelings of others.',
   'Will and Logic form a confident pair: clear in aim and articulate in argument. Physics is normative — comfortable, unfussy — while Emotion is suggestive: open to inspiration but not generated within.',
   2),
  (t_id, 'VELF', 'Tolstoy',
   'A passionate leader whose convictions are charged with feeling and whose ideas are absorbed from the world.',
   'Will and Emotion drive each other: ambition fuelled by personal feeling. Logic is the painful function — sensitive to being wrong — and Physics is the open channel, where lifestyle and habits adapt freely.',
   3),
  (t_id, 'VEFL', 'Napoleon',
   'A commanding presence who feels intensely, acts decisively in the material world, and learns from sharper minds.',
   'Will and Emotion ignite ambition; Physics gives the practical reach to execute. Logic sits last — open to influence by clear thinkers and easily reshaped by a good argument.',
   4),
  (t_id, 'VFLE', 'Twardowski',
   'A self-possessed pragmatist who governs body and ideas while taking emotional cues from those nearby.',
   'Will and Physics make a grounded, capable pair. Logic is normative — flexible in debate — and Emotion is suggestive: the inner mood often reflects whoever is in the room.',
   5),
  (t_id, 'VFEL', 'Goethe',
   'A purposeful aesthete who shapes the material and the felt while letting reason emerge through others.',
   'Will and Physics are confident in design and execution. Emotion accompanies, expressive but not overwhelming, and Logic is empty — argument and analysis arrive from outside.',
   6),
  (t_id, 'LVEF', 'Lenin',
   'A theorist who argues firmly, drives forward decisively, and remains private in feeling.',
   'Logic dominates — argumentative, certain, demanding precision — and Will follows close behind, acting on the conclusion. Emotion is painful, hidden, and Physics is the empty channel, easily neglected.',
   7),
  (t_id, 'LVFE', 'Einstein',
   'A bold reasoner whose decisions follow from theory and whose feelings stir only when others spark them.',
   'Logic and Will are the working pair: ideas first, action close behind. Physics is normative, comfortable enough, and Emotion is suggestive — moved by music, art, or great company rather than generated within.',
   8),
  (t_id, 'LEVF', 'Augustine',
   'A reflective philosopher who reasons with feeling, acts under self-doubt, and absorbs the rhythms of the body.',
   'Logic frames everything; Emotion deepens it. Will is painful — slow to commit, plagued by self-doubt — and Physics is the open slot, content to follow what others establish.',
   9),
  (t_id, 'LEFV', 'Pascal',
   'A precise thinker tuned to inner feeling and outer sensation, whose direction is set by others.',
   'Logic and Emotion run the inner life together. Physics is normative, kept in good order, and Will is suggestive — the person follows leaders, projects, or causes more than initiates them.',
   10),
  (t_id, 'LFVE', 'Plato',
   'An architect of ideas grounded in the material, decisive enough, and open to emotional inspiration.',
   'Logic and Physics build careful, durable structures. Will is normative — strong without being domineering — and Emotion is the suggestive function, often kindled by others.',
   11),
  (t_id, 'LFEV', 'Aristotle',
   'A systematic mind that surveys the material and the felt while waiting for direction from outside.',
   'Logic and Physics are the confident pair; Emotion accompanies, attuned but careful. Will is empty — initiative does not come naturally, but external direction is welcomed and executed well.',
   12),
  (t_id, 'EVLF', 'Andersen',
   'An expressive dreamer who acts on feeling, doubts their reasoning, and lets the body fade into the background.',
   'Emotion leads with vivid expression; Will follows, driven by mood and inspiration. Logic is painful — uncertain, defensive — and Physics is the empty channel, easily ignored.',
   13),
  (t_id, 'EVFL', 'Pushkin',
   'A passionate spirit, decisive and embodied, whose ideas are sparked by conversation with others.',
   'Emotion and Will charge the personality with intensity. Physics is normative — capable, sensual — and Logic is the suggestive function: the person enjoys clever ideas but rarely originates them.',
   14),
  (t_id, 'ELVF', 'Bukharin',
   'A feeling thinker whose decisions are reluctant and whose body life is borrowed from those around them.',
   'Emotion and Logic interplay endlessly — feeling deepens the argument, argument refines the feeling. Will is painful, slow to act, and Physics is suggestive: lifestyle and habits adapt to context.',
   15),
  (t_id, 'ELFV', 'Rousseau',
   'A poetic mind grounded in sensation, content to be guided by others toward action.',
   'Emotion leads, Logic frames, and Physics gives a steady, practical foundation. Will is empty — the person prefers a worthy cause or guide to setting their own direction.',
   16),
  (t_id, 'EFVL', 'Borgia',
   'A sensual, expressive force, decisive in motion and quick to absorb the reasoning of others.',
   'Emotion and Physics are the dominant pair: feeling shapes the body, the body amplifies feeling. Will is normative — assertive without rigidity — and Logic is the suggestive slot, fed by skilled thinkers.',
   17),
  (t_id, 'EFLV', 'Dumas',
   'A warm, embodied companion who reasons through feeling and waits to be drawn into action.',
   'Emotion and Physics create an inviting presence — comfort, atmosphere, hospitality. Logic accompanies, never aggressive, and Will is empty: external direction or a strong partner is welcome.',
   18),
  (t_id, 'FVLE', 'Chekhov',
   'A grounded craftsman who governs body and aim with precision and is quietly moved by what surrounds them.',
   'Physics and Will run the practical life; Logic is normative — useful, undogmatic — and Emotion is suggestive, expressed mainly in response to art or atmosphere.',
   19),
  (t_id, 'FVEL', 'Tchaikovsky',
   'A composer of life — material, expressive, decisive — who leaves the conceptual work to others.',
   'Physics, Will, and Emotion combine into a vivid, embodied presence. Logic is empty — the person learns from clear thinkers but does not chase theoretical argument themselves.',
   20),
  (t_id, 'FLVE', 'Lao Tzu',
   'A patient observer of the material and the rational, decisive when required, and open to being moved.',
   'Physics and Logic create a calm, well-ordered surface. Will is normative — quiet but firm — and Emotion is suggestive: the person responds to beauty and atmosphere more than producing it.',
   21),
  (t_id, 'FLEV', 'Akhmatova',
   'A grounded, articulate spirit, emotionally vivid, who is drawn forward by others.',
   'Physics and Logic anchor the life; Emotion adds depth and colour. Will is empty — initiative is reluctant, and the person prefers to be summoned to action by a worthy purpose.',
   22),
  (t_id, 'FEVL', 'Aguilar',
   'A sensuous, expressive presence who acts on feeling and absorbs ideas from skilled thinkers.',
   'Physics and Emotion produce an intensely embodied life. Will is normative — capable but not domineering — and Logic is the suggestive channel: theory is enjoyed when delivered well.',
   23),
  (t_id, 'FELV', 'Epicurus',
   'A gentle hedonist tuned to body and feeling, content to follow others toward direction and ideas.',
   'Physics and Emotion lead with warmth and ease. Logic accompanies, used but not pushed, and Will is empty: the person prefers good company and good guidance to setting their own course.',
   24);
end $$;
