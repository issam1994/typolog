insert into public.traits (id, label, description, sort_order) values
  ('openness',          'Openness',           'Curiosity, creativity, and appreciation for new ideas and experiences.', 1),
  ('conscientiousness', 'Conscientiousness',  'Organization, discipline, and a strong sense of duty and reliability.',   2),
  ('extraversion',      'Extraversion',       'Sociability, assertiveness, and energy drawn from being around others.',  3),
  ('agreeableness',     'Agreeableness',      'Empathy, cooperativeness, and a genuine concern for others.',             4),
  ('neuroticism',       'Neuroticism',        'Tendency toward anxiety, emotional reactivity, and mood instability under stress.', 5);

insert into public.questions (text, trait_id, sort_order) values
  ('I enjoy exploring new ideas and unconventional ways of thinking.',    'openness',          1),
  ('I am drawn to creative experiences like art, music, or literature.', 'openness',          2),
  ('I love imagining possibilities that have never existed before.',      'openness',          3),
  ('I plan my tasks in advance and stick to my schedule.',                'conscientiousness', 4),
  ('I am thorough and detail-oriented in everything I do.',               'conscientiousness', 5),
  ('I complete tasks fully before allowing myself to move on.',           'conscientiousness', 6),
  ('I feel energized after spending time with a large group of people.',  'extraversion',      7),
  ('I find it easy to start conversations with people I have never met.', 'extraversion',      8),
  ('I enjoy being at the center of attention in social settings.',        'extraversion',      9),
  ('I genuinely care about the feelings and well-being of others.',       'agreeableness',     10),
  ('I find it easy to forgive people who have wronged me.',               'agreeableness',     11),
  ('I enjoy helping others even when there is nothing in it for me.',     'agreeableness',     12),
  ('I often feel anxious or on edge under pressure or stress.',           'neuroticism',       13),
  ('Setbacks and disappointments weigh on me for a long time.',           'neuroticism',       14),
  ('I frequently experience sudden or intense mood swings.',              'neuroticism',       15);
