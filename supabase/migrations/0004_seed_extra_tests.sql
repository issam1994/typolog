-- Seeds MBTI, Enneagram, and Cognitive Functions tests with questions and archetypes.
-- Uses PL/pgSQL blocks for efficient multi-row inserts with FK references.

-- ============================================================
-- MBTI
-- ============================================================
insert into public.tests (
  slug, name, tagline, description,
  question_kind, scoring_strategy, result_template,
  is_published, sort_order, estimated_minutes
) values (
  'mbti', 'MBTI',
  '16 personality archetypes across four dimensions',
  'Explore four key dimensions of your personality: where you direct your energy, how you take in information, how you make decisions, and how you approach structure.',
  'forced_choice', 'mbti_dichotomy', 'mbti_code',
  true, 2, 10
);

do $$
declare
  t_id  uuid := (select id from public.tests where slug = 'mbti');
  e_id  uuid;  i_id  uuid;
  s_id  uuid;  n_id  uuid;
  tf_id uuid;  f_id  uuid;
  j_id  uuid;  p_id  uuid;
  q_id  uuid;
begin
  -- Traits
  insert into public.traits (test_id, slug, label, description, polarity, sort_order) values
    (t_id, 'e', 'Extraversion', 'Energy directed outward toward people and activity.', 'i', 1)
    returning id into e_id;
  insert into public.traits (test_id, slug, label, description, polarity, sort_order) values
    (t_id, 'i', 'Introversion', 'Energy directed inward toward ideas and reflection.', 'e', 2)
    returning id into i_id;
  insert into public.traits (test_id, slug, label, description, polarity, sort_order) values
    (t_id, 's', 'Sensing', 'Preference for concrete facts and practical reality.', 'n', 3)
    returning id into s_id;
  insert into public.traits (test_id, slug, label, description, polarity, sort_order) values
    (t_id, 'n', 'Intuition', 'Preference for patterns, possibilities, and meaning.', 's', 4)
    returning id into n_id;
  insert into public.traits (test_id, slug, label, description, polarity, sort_order) values
    (t_id, 't', 'Thinking', 'Decisions based on logic and objective analysis.', 'f', 5)
    returning id into tf_id;
  insert into public.traits (test_id, slug, label, description, polarity, sort_order) values
    (t_id, 'f', 'Feeling', 'Decisions based on values and how they affect people.', 't', 6)
    returning id into f_id;
  insert into public.traits (test_id, slug, label, description, polarity, sort_order) values
    (t_id, 'j', 'Judging', 'Preference for structure, plans, and closure.', 'p', 7)
    returning id into j_id;
  insert into public.traits (test_id, slug, label, description, polarity, sort_order) values
    (t_id, 'p', 'Perceiving', 'Preference for flexibility, spontaneity, and openness.', 'j', 8)
    returning id into p_id;

  -- E/I questions (10)
  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'At a party you usually...', 1) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Talk to many people, including strangers.', 0, e_id, 1), (q_id, 'Talk to a few people you know well.', 1, i_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'After a long and tiring day you prefer to...', 2) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Go out and spend time with friends.', 0, e_id, 1), (q_id, 'Stay home and recharge alone.', 1, i_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'When working on a problem you prefer to...', 3) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Think out loud and talk it through with others.', 0, e_id, 1), (q_id, 'Reflect privately before sharing your thoughts.', 1, i_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'In social situations you are more likely to...', 4) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Introduce yourself to new people.', 0, e_id, 1), (q_id, 'Wait for others to approach you.', 1, i_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You find small talk...', 5) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Enjoyable and easy.', 0, e_id, 1), (q_id, 'Draining or awkward.', 1, i_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'When you have free time you tend to...', 6) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Make plans with others.', 0, e_id, 1), (q_id, 'Enjoy solitary activities.', 1, i_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You would rather be known as...', 7) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Outgoing and expressive.', 0, e_id, 1), (q_id, 'Reserved and thoughtful.', 1, i_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'At work or school you prefer...', 8) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'A lively, interactive environment.', 0, e_id, 1), (q_id, 'A quiet, focused environment.', 1, i_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You tend to...', 9) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Act first and reflect later.', 0, e_id, 1), (q_id, 'Reflect first before acting.', 1, i_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'After meeting new people you feel...', 10) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Energized and excited.', 0, e_id, 1), (q_id, 'Ready for some quiet time.', 1, i_id, 2);

  -- S/N questions (10)
  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You pay more attention to...', 11) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Facts and concrete details.', 0, s_id, 1), (q_id, 'Patterns and underlying meanings.', 1, n_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You trust more...', 12) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'What is proven and practical.', 0, s_id, 1), (q_id, 'Your hunches and gut feelings.', 1, n_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'In conversation you prefer discussing...', 13) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Real events and specific experiences.', 0, s_id, 1), (q_id, 'Ideas, theories, and possibilities.', 1, n_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'When learning something new you prefer...', 14) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'A step-by-step, practical approach.', 0, s_id, 1), (q_id, 'Understanding the big picture first.', 1, n_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You are more drawn to...', 15) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'The concrete and tangible.', 0, s_id, 1), (q_id, 'The abstract and imaginative.', 1, n_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You tend to be more focused on...', 16) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Present reality and what is.', 0, s_id, 1), (q_id, 'Future possibilities and what could be.', 1, n_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You rely more on...', 17) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Your five senses and direct experience.', 0, s_id, 1), (q_id, 'Your intuition and inner insights.', 1, n_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'When reading instructions you...', 18) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Follow them carefully step by step.', 0, s_id, 1), (q_id, 'Skim for the key idea and figure out the rest.', 1, n_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You describe things more in terms of...', 19) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Specific, literal facts.', 0, s_id, 1), (q_id, 'Metaphors, analogies, and meanings.', 1, n_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You are more interested in...', 20) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'What is, as it is now.', 0, s_id, 1), (q_id, 'What could be if things changed.', 1, n_id, 2);

  -- T/F questions (10)
  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'When making decisions you primarily rely on...', 21) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Logic and objective analysis.', 0, tf_id, 1), (q_id, 'Your values and how it affects people.', 1, f_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You tend to be more...', 22) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Analytical and detached.', 0, tf_id, 1), (q_id, 'Empathetic and warm.', 1, f_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'In a disagreement you focus on...', 23) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Finding the most logical solution.', 0, tf_id, 1), (q_id, 'Maintaining harmony and understanding feelings.', 1, f_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'When giving feedback you tend to be...', 24) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Direct and honest, even if it stings.', 0, tf_id, 1), (q_id, 'Diplomatic and considerate of feelings.', 1, f_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'A good decision is one that...', 25) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Is logically consistent and fair.', 0, tf_id, 1), (q_id, 'Considers everyone involved and their needs.', 1, f_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You are more bothered by...', 26) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Logical inconsistencies.', 0, tf_id, 1), (q_id, 'People being unkind to each other.', 1, f_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'When someone comes to you with a problem you...', 27) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Analyze it and offer solutions.', 0, tf_id, 1), (q_id, 'Focus on how they feel first.', 1, f_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You believe truth should be...', 28) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Stated clearly, regardless of feelings.', 0, tf_id, 1), (q_id, 'Delivered with sensitivity and care.', 1, f_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'In your work you value more...', 29) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Competence and results.', 0, tf_id, 1), (q_id, 'Relationships and team harmony.', 1, f_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You are more influenced by...', 30) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Objective criteria and principles.', 0, tf_id, 1), (q_id, 'Circumstantial factors and personal values.', 1, f_id, 2);

  -- J/P questions (10)
  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You prefer your day to be...', 31) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Planned and organized.', 0, j_id, 1), (q_id, 'Flexible and open-ended.', 1, p_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'Deadlines make you feel...', 32) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Relieved to have a clear end date.', 0, j_id, 1), (q_id, 'Constrained; you prefer things to unfold.', 1, p_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You tend to...', 33) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Make decisions quickly and move on.', 0, j_id, 1), (q_id, 'Keep your options open as long as possible.', 1, p_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You feel more comfortable when...', 34) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Things are settled and decided.', 0, j_id, 1), (q_id, 'You can adapt as new information comes in.', 1, p_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'At work you prefer...', 35) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'A clear plan and structured schedule.', 0, j_id, 1), (q_id, 'Responding flexibly to what comes up.', 1, p_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'Your workspace is usually...', 36) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Tidy and organized.', 0, j_id, 1), (q_id, 'Spontaneous and lived-in.', 1, p_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You prefer to...', 37) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Finish one task fully before starting another.', 0, j_id, 1), (q_id, 'Work on several things at once.', 1, p_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'When traveling you...', 38) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Plan your itinerary in detail.', 0, j_id, 1), (q_id, 'Prefer to explore without a fixed plan.', 1, p_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You are more...', 39) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Systematic and scheduled.', 0, j_id, 1), (q_id, 'Spontaneous and improvisational.', 1, p_id, 2);

  insert into public.questions (test_id, kind, text, sort_order) values (t_id, 'forced_choice', 'You tend to feel uneasy when...', 40) returning id into q_id;
  insert into public.question_options (question_id, label, value, trait_id, sort_order) values (q_id, 'Plans are changed at the last minute.', 0, j_id, 1), (q_id, 'Everything is too rigid and fixed in advance.', 1, p_id, 2);

  -- MBTI archetypes (16)
  insert into public.archetypes (test_id, code, label, description, long_form, sort_order) values
  (t_id, 'INTJ', 'The Architect',
   'Strategic, independent, and driven by a vision only they can fully see.',
   'INTJs combine deep analytical thinking with a relentless drive to implement their ideas. They are confident in their own judgment, often to the point of appearing stubborn, but their long-range planning and systematic approach make them formidable problem-solvers. They value knowledge and competence above all, and have little patience for inefficiency or small talk.',
   1),
  (t_id, 'INTP', 'The Logician',
   'Inventive, precise, and endlessly curious about how things work.',
   'INTPs are driven by a desire to understand the underlying logic of everything they encounter. They are endlessly curious, love theoretical problems, and often lose track of time when exploring an interesting idea. While they can appear detached, they are deeply passionate about the subjects that captivate them and are among the most creative original thinkers.',
   2),
  (t_id, 'ENTJ', 'The Commander',
   'Bold, decisive, and natural-born leaders who thrive on challenge.',
   'ENTJs are ambitious strategists who see inefficiency as a personal challenge. They are decisive, outspoken, and comfortable taking charge—sometimes before being asked. Their confidence and long-term thinking make them natural executives, though they must consciously guard against dismissing others'' feelings in pursuit of results.',
   3),
  (t_id, 'ENTP', 'The Debater',
   'Quick-witted and inventive, with a love of intellectual sparring.',
   'ENTPs are endlessly energized by new ideas and enjoy challenging assumptions—their own included. They are excellent at seeing multiple sides of an argument and can find the flaw in any position. While they may appear argumentative, they are genuinely motivated by a love of ideas, not conflict, and they thrive in environments that reward creative thinking.',
   4),
  (t_id, 'INFJ', 'The Advocate',
   'Visionary idealists with deep empathy and a quiet, determined purpose.',
   'INFJs combine a rich inner life with a powerful sense of purpose. They are among the most empathetic types, able to sense others'' emotions with unusual accuracy, and they channel this into work that aligns with their deeply held values. Though rare and private, they leave a lasting impact on everyone they genuinely connect with.',
   5),
  (t_id, 'INFP', 'The Mediator',
   'Idealistic, empathetic, and guided by an unwavering personal value system.',
   'INFPs are quiet yet passionate individuals who believe deeply in the potential for good in the world. They are driven by their values rather than external expectations, and they feel most alive when their work has personal meaning. Highly creative and emotionally perceptive, they form deep bonds with the few people they let into their inner world.',
   6),
  (t_id, 'ENFJ', 'The Protagonist',
   'Charismatic and inspiring, driven to bring out the best in others.',
   'ENFJs are natural teachers and leaders who are deeply invested in the growth of those around them. They have a rare combination of warmth, charisma, and organizational ability, allowing them to inspire and coordinate groups effectively. Their greatest satisfaction comes from seeing others flourish because of their support.',
   7),
  (t_id, 'ENFP', 'The Campaigner',
   'Enthusiastic, creative, and genuinely excited about people and possibilities.',
   'ENFPs are free spirits who see life as a canvas of possibilities. They are energized by ideas, people, and causes—and their enthusiasm is contagious. While they can struggle with follow-through and focus, their creativity and ability to inspire others make them powerful catalysts for change.',
   8),
  (t_id, 'ISTJ', 'The Logistician',
   'Dependable, meticulous, and committed to doing things right.',
   'ISTJs are the backbone of many institutions. They are reliable, thorough, and disciplined—once they commit to something, they follow through. They trust what has been proven and prefer established procedures. Though they may seem reserved, they are deeply loyal to those they care about and derive great satisfaction from a job well done.',
   9),
  (t_id, 'ISFJ', 'The Defender',
   'Warm, reliable, and quietly devoted to the people they love.',
   'ISFJs are selfless caregivers who work behind the scenes to support others. They have excellent memories for details about the people important to them and go to great lengths to meet their needs. Though modest and humble, they are enormously hardworking and derive deep satisfaction from maintaining the comfort and wellbeing of those around them.',
   10),
  (t_id, 'ESTJ', 'The Executive',
   'Organized, direct, and results-focused administrators.',
   'ESTJs are pillars of their communities who value order, structure, and clear expectations. They are natural administrators who enforce rules fairly and are not afraid to take charge when needed. While they can appear rigid, their reliability and commitment to getting things done correctly earns wide respect.',
   11),
  (t_id, 'ESFJ', 'The Consul',
   'Caring, sociable, and deeply committed to the people around them.',
   'ESFJs are warm-hearted people-persons who find purpose in supporting and connecting with others. They are highly attuned to the emotional atmosphere of a group and work actively to create harmony. They thrive when their efforts to care for others are appreciated and when the people around them are happy.',
   12),
  (t_id, 'ISTP', 'The Virtuoso',
   'Pragmatic, observant, and endlessly skilled with tools and systems.',
   'ISTPs are curious experimenters who learn best by doing. They are cool under pressure, highly observant, and possess an almost mechanical sense for how things work. They prefer action to theory and are at their best when solving concrete, immediate problems. Independent and direct, they have little interest in rules that don''t serve a practical purpose.',
   13),
  (t_id, 'ISFP', 'The Adventurer',
   'Gentle, artistic, and quietly open to life''s experiences.',
   'ISFPs live fully in the present moment, guided by a deep personal sense of aesthetics and values. They are warm and caring in a quiet, understated way—often expressing themselves through art, music, or other creative pursuits rather than words. They dislike conflict and prefer to let their actions speak for them.',
   14),
  (t_id, 'ESTP', 'The Entrepreneur',
   'Bold, perceptive, and energized by living on the edge of action.',
   'ESTPs are energetic doers who thrive in fast-moving, high-stakes environments. They are perceptive, pragmatic, and direct—they cut through complexity and get things done. While they can be impatient with theory, their ability to read situations and respond in real time makes them exceptional crisis managers and problem-solvers.',
   15),
  (t_id, 'ESFP', 'The Entertainer',
   'Spontaneous, fun-loving, and drawn to life''s pleasures.',
   'ESFPs are the life of the party—genuinely warm, playful, and deeply in tune with the people around them. They are natural performers who find joy in sharing experiences with others. Practical and resourceful, they shine in situations that call for improvisation and human connection.',
   16);
end $$;

-- ============================================================
-- Enneagram
-- ============================================================
insert into public.tests (
  slug, name, tagline, description,
  question_kind, scoring_strategy, result_template,
  is_published, sort_order, estimated_minutes
) values (
  'enneagram', 'Enneagram',
  'Nine archetypal personality types',
  'The Enneagram maps nine distinct personality types based on core motivations, fears, and coping strategies. Discover your dominant type and what drives your behaviour at a deep level.',
  'likert', 'enneagram_dominant', 'enneagram_type',
  true, 3, 8
);

do $$
declare
  t_id uuid := (select id from public.tests where slug = 'enneagram');
  t1 uuid; t2 uuid; t3 uuid; t4 uuid; t5 uuid;
  t6 uuid; t7 uuid; t8 uuid; t9 uuid;
  n int := 0;
begin
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'type_1', 'The Reformer', 'Principled, purposeful, self-controlled, and perfectionistic.', 1) returning id into t1;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'type_2', 'The Helper', 'Caring, interpersonal, generous, and demonstrative.', 2) returning id into t2;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'type_3', 'The Achiever', 'Success-oriented, pragmatic, driven, and image-conscious.', 3) returning id into t3;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'type_4', 'The Individualist', 'Sensitive, expressive, withdrawn, and dramatic.', 4) returning id into t4;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'type_5', 'The Investigator', 'Intense, cerebral, perceptive, and innovative.', 5) returning id into t5;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'type_6', 'The Loyalist', 'Committed, security-oriented, responsible, and anxious.', 6) returning id into t6;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'type_7', 'The Enthusiast', 'Spontaneous, versatile, acquisitive, and scattered.', 7) returning id into t7;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'type_8', 'The Challenger', 'Powerful, dominating, self-confident, and decisive.', 8) returning id into t8;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'type_9', 'The Peacemaker', 'Receptive, reassuring, agreeable, and complacent.', 9) returning id into t9;

  -- Type 1 questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I hold myself to high standards of correctness and integrity.', t1, 1);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I notice errors and imperfections that others often overlook.', t1, 2);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I feel a strong inner drive to improve myself and do things right.', t1, 3);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I believe there is a right way to do things, and I try to live by it.', t1, 4);

  -- Type 2 questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I often put the needs of others before my own.', t2, 5);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I feel fulfilled when I support and care for the people around me.', t2, 6);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I find it difficult to ask for help, but I freely give it to others.', t2, 7);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I am attuned to what people need and naturally move to meet those needs.', t2, 8);

  -- Type 3 questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I set ambitious goals and work hard to achieve them.', t3, 9);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I care about how others perceive my success and accomplishments.', t3, 10);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I adapt easily to different environments to make the best impression.', t3, 11);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I am motivated by recognition and being seen as successful.', t3, 12);

  -- Type 4 questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I often feel I am fundamentally different from most other people.', t4, 13);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I have a rich inner emotional life that I explore deeply.', t4, 14);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I long for something I feel is missing from my life or identity.', t4, 15);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I need to express my unique identity through creative or personal means.', t4, 16);

  -- Type 5 questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I prefer to observe and understand before engaging.', t5, 17);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'Social interaction drains me, and I need significant alone time to recharge.', t5, 18);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I like to master subjects thoroughly before feeling confident to share my views.', t5, 19);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I protect my time, space, and energy carefully.', t5, 20);

  -- Type 6 questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I think carefully about potential problems and worst-case scenarios.', t6, 21);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I value loyalty and trustworthiness in myself and others above most things.', t6, 22);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I look to trusted authorities or groups for guidance when uncertain.', t6, 23);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I feel anxious when I am uncertain about what to expect.', t6, 24);

  -- Type 7 questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I am enthusiastic and easily excited by new ideas, plans, and experiences.', t7, 25);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I tend to avoid pain and discomfort by staying focused on positive options.', t7, 26);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I have many interests and find it hard to commit to just one thing.', t7, 27);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I prefer to stay on the move rather than sit with difficult feelings.', t7, 28);

  -- Type 8 questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I take charge naturally and am comfortable with conflict.', t8, 29);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I believe the world rewards strength and directness.', t8, 30);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I protect the people I care about and stand up for the vulnerable.', t8, 31);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I dislike feeling controlled or constrained by others.', t8, 32);

  -- Type 9 questions
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I tend to go along with others to avoid conflict and maintain peace.', t9, 33);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I can see merit in many different viewpoints, which makes it hard to take sides.', t9, 34);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I tend to minimize my own needs and preferences to keep the peace.', t9, 35);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I feel settled and comfortable in a calm, predictable environment.', t9, 36);

  -- Enneagram archetypes (9)
  insert into public.archetypes (test_id, code, label, description, long_form, sort_order) values
  (t_id, '1', 'The Reformer',
   'Principled and purpose-driven, guided by a powerful desire to improve the world.',
   'Ones are motivated by a deep need to be good, right, and to improve everything they touch. They have a persistent inner critic that notices imperfection and pushes them toward higher standards. At their best, they bring integrity, discernment, and moral clarity to everything they do. Under stress, this becomes rigidity and resentment.',
   1),
  (t_id, '2', 'The Helper',
   'Warm and generous, with a deep need to be needed and appreciated.',
   'Twos are motivated by a desire to be loved and to express their love for others. They are attuned to the emotional needs of those around them and take great pleasure in supporting people. At their best, they are genuinely altruistic and deeply nurturing. Under stress, they can become manipulative or resentful when their giving goes unrecognised.',
   2),
  (t_id, '3', 'The Achiever',
   'Driven and adaptable, with an intense desire to succeed and be admired.',
   'Threes are motivated by a desire to be valuable and to embody success. They are highly goal-oriented, pragmatic, and skilled at adapting their image to achieve the recognition they seek. At their best, they inspire others with their energy and authentic accomplishments. Under stress, their identity can become fused with achievement, making failure feel existential.',
   3),
  (t_id, '4', 'The Individualist',
   'Sensitive and expressive, with a deep longing to be understood and significant.',
   'Fours are motivated by a desire to be unique and to find their identity. They have a rich emotional life and often feel that something essential is missing that others seem to have. At their best, they transform their experiences into art and authentic self-expression. Under stress, they can become consumed by melancholy and self-absorption.',
   4),
  (t_id, '5', 'The Investigator',
   'Perceptive and analytical, with a deep need to understand the world.',
   'Fives are motivated by a desire to be competent and knowledgeable. They conserve their energy and resources carefully, preferring the rich inner world of thought and analysis to the demands of engagement. At their best, they produce profound insights and pioneering ideas. Under stress, they can become detached and isolated.',
   5),
  (t_id, '6', 'The Loyalist',
   'Responsible and committed, with a deep need for security and support.',
   'Sixes are motivated by a desire for security and guidance. They are loyal, reliable, and excellent at anticipating problems—but this same vigilance can tip into chronic anxiety and self-doubt. At their best, they are courageous, trustworthy, and fiercely protective of those they love. Under stress, they become suspicious and overly reactive.',
   6),
  (t_id, '7', 'The Enthusiast',
   'Spontaneous and versatile, with an insatiable hunger for new experiences.',
   'Sevens are motivated by a desire to be happy and to avoid pain. They are energetic, optimistic, and gifted at generating ideas and possibilities. At their best, they combine depth with joy, bringing genuine creative energy to everything they touch. Under stress, they scatter their focus across too many pursuits and avoid necessary discomfort.',
   7),
  (t_id, '8', 'The Challenger',
   'Powerful and direct, with a deep need for autonomy and control.',
   'Eights are motivated by a desire to be self-reliant and to protect themselves and those they care about. They are confident, decisive, and unafraid of confrontation. At their best, they are heroic champions of the vulnerable and generous leaders. Under stress, they become domineering and confrontational.',
   8),
  (t_id, '9', 'The Peacemaker',
   'Agreeable and calming, with a deep need for inner and outer peace.',
   'Nines are motivated by a desire for peace and to avoid conflict. They have a natural gift for seeing all perspectives and bringing people together. At their best, they are accepting, supportive, and genuinely unifying. Under stress, they become passive, checked out, and resistant to change.',
   9);
end $$;

-- ============================================================
-- Cognitive Functions
-- ============================================================
insert into public.tests (
  slug, name, tagline, description,
  question_kind, scoring_strategy, result_template,
  is_published, sort_order, estimated_minutes
) values (
  'cognitive-functions', 'Cognitive Functions',
  'Your eight-function mental hierarchy',
  'Based on Jungian typology, this assessment measures your relative preference for each of the eight cognitive functions — the building blocks of personality type — and derives your dominant four-function stack.',
  'likert', 'cognitive_stack', 'cognitive_stack',
  true, 4, 8
);

do $$
declare
  t_id uuid := (select id from public.tests where slug = 'cognitive-functions');
  ni_id uuid; ne_id uuid; si_id uuid; se_id uuid;
  ti_id uuid; te_id uuid; fi_id uuid; fe_id uuid;
begin
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'ni', 'Ni — Introverted Intuition', 'Long-range insight, pattern recognition, and symbolic vision directed inward.', 1) returning id into ni_id;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'ne', 'Ne — Extraverted Intuition', 'Generating possibilities, making unexpected connections, and brainstorming outward.', 2) returning id into ne_id;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'si', 'Si — Introverted Sensing', 'Detailed memory, reliability, and comparison to past experience.', 3) returning id into si_id;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'se', 'Se — Extraverted Sensing', 'Present-moment awareness, action, and rich sensory engagement with the world.', 4) returning id into se_id;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'ti', 'Ti — Introverted Thinking', 'Building precise internal logic frameworks and analyzing for consistency.', 5) returning id into ti_id;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'te', 'Te — Extraverted Thinking', 'Organizing, systematizing, and driving toward efficient external results.', 6) returning id into te_id;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'fi', 'Fi — Introverted Feeling', 'Deep personal values, authenticity, and a rich inner emotional identity.', 7) returning id into fi_id;
  insert into public.traits (test_id, slug, label, description, sort_order) values (t_id, 'fe', 'Fe — Extraverted Feeling', 'Social harmony, empathy, and tuning to the emotional needs of others.', 8) returning id into fe_id;

  -- Ni questions (4)
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I often have a sudden, clear sense of how things will unfold long into the future.', ni_id, 1);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I notice deep symbolic patterns connecting seemingly unrelated things.', ni_id, 2);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I tend to develop a single, strong conviction or vision that guides me over time.', ni_id, 3);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'My best insights arrive fully formed after long internal processing, not through step-by-step reasoning.', ni_id, 4);

  -- Ne questions (4)
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I love exploring many different possibilities before settling on a direction.', ne_id, 5);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I often find unexpected connections between unrelated ideas or fields.', ne_id, 6);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I generate new ideas rapidly and find it hard to commit to just one.', ne_id, 7);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I get excited by possibilities and potential—what could be—more than what already is.', ne_id, 8);

  -- Si questions (4) — two reverse-keyed for validity
  insert into public.questions (test_id, kind, text, trait_id, reverse_keyed, sort_order) values (t_id, 'likert', 'I rely heavily on past experiences to guide my decisions in the present.', si_id, false, 9);
  insert into public.questions (test_id, kind, text, trait_id, reverse_keyed, sort_order) values (t_id, 'likert', 'I have a strong memory for specific details and routines.', si_id, false, 10);
  insert into public.questions (test_id, kind, text, trait_id, reverse_keyed, sort_order) values (t_id, 'likert', 'I feel unsettled when established routines or procedures are disrupted without reason.', si_id, false, 11);
  insert into public.questions (test_id, kind, text, trait_id, reverse_keyed, sort_order) values (t_id, 'likert', 'I rarely find comfort in familiar, proven methods—I prefer to try something new.', si_id, true, 12);

  -- Se questions (4)
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I am highly attuned to my physical environment and immediate sensory experience.', se_id, 13);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I thrive in hands-on, action-oriented situations.', se_id, 14);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I respond quickly and decisively to what is happening right now.', se_id, 15);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I enjoy physical activities, sensory pleasures, and being fully present in the moment.', se_id, 16);

  -- Ti questions (4)
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I constantly analyze and refine my internal model of how things work.', ti_id, 17);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I notice logical inconsistencies in arguments and need everything to fit together precisely.', ti_id, 18);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I build my own frameworks and categories to make sense of the world.', ti_id, 19);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I take time to think things through precisely before acting or concluding.', ti_id, 20);

  -- Te questions (4)
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I focus on getting things done efficiently and in an organized, measurable way.', te_id, 21);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I prefer clear structures, deadlines, and measurable outcomes over open-ended exploration.', te_id, 22);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I naturally take charge and direct others toward results.', te_id, 23);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I make decisions based on what will be most effective and productive.', te_id, 24);

  -- Fi questions (4)
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I have a strong inner sense of what I believe is right, regardless of others'' opinions.', fi_id, 25);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I am deeply concerned with being authentic and true to my own values.', fi_id, 26);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I am moved by causes that align closely with my personal values.', fi_id, 27);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I experience emotions deeply and personally, though I may not always show them outwardly.', fi_id, 28);

  -- Fe questions (4)
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I am very sensitive to the emotional atmosphere of a group and instinctively adjust to it.', fe_id, 29);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I naturally adapt my behavior to make others feel comfortable and included.', fe_id, 30);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I find it deeply satisfying to create harmony and positive relationships around me.', fe_id, 31);
  insert into public.questions (test_id, kind, text, trait_id, sort_order) values (t_id, 'likert', 'I am moved by the feelings of others and feel a strong pull to support them emotionally.', fe_id, 32);
end $$;
