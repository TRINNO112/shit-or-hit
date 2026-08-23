// Authentic 31-Day Narrative Story of Aryan (The Struggling Student)
// Detailed day-by-day story covering exam setbacks, 3 AM doomscrolling, social anxiety, 
// a turning point catalyst, and a gradual 4-week resilience turnaround.

const rawDiaryEntries = [
  // ════════ WEEK 1: Academic Setbacks & Escapism (Days 1–7) ════════
  {
    day: 1,
    rating: 1, // Rough
    note: 'Got back Math mid-term paper: scored 38/100. Teacher gave a harsh public warning in class. Felt sick with embarrassment and couldn\'t muster the courage to tell mom and dad.'
  },
  {
    day: 2,
    rating: 1, // Rough
    note: 'Drowning in anxiety about the marks. Instead of studying, escaped into 5 straight hours of Instagram Reels and YouTube Shorts until 3:45 AM. Feel completely stuck in a loop.'
  },
  {
    day: 3,
    rating: 2, // Down
    note: 'Slept through morning alarm. Arrived 20 mins late to Physics lecture. Terrible brain fog all day; couldn\'t process a single concept written on the blackboard.'
  },
  {
    day: 4,
    rating: 1, // Rough
    note: 'Parents found out about the Math marks during dinner. Dad was furious, mom looked heartbroken. Heavy arguments. Went to bed feeling completely useless and inadequate.'
  },
  {
    day: 5,
    rating: 2, // Down
    note: 'Tried sitting at the library desk after school, but kept picking up my phone every 4 minutes. Read only 2 pages in 3 hours. Attention span feels completely shattered.'
  },
  {
    day: 6,
    rating: 3, // Okay
    note: 'Saturday: Cleaned up my chaotic study desk. Turned off phone WiFi for 2 hours and actually solved 5 Chemistry practice questions. A tiny breather.'
  },
  {
    day: 7,
    rating: 2, // Down
    note: 'Sunday night dread kicked in hard. Stared at the ceiling thinking about upcoming pop quizzes. Felt lonely and disconnected from everyone.'
  },

  // ════════ WEEK 2: Social Anxiety & Distraction Trap (Days 8–15) ════════
  {
    day: 8,
    rating: 1, // Rough
    note: 'Group project announced for Biology. Got paired with the class toppers and felt so insecure that I didn\'t speak up once. Feared they think I\'m dead weight.'
  },
  {
    day: 9,
    rating: 2, // Down
    note: 'Gathered courage to talk to chemistry lab crush after class; froze up, stammered, said something awkward, and walked away mortified. Overanalyzed it for 6 hours.'
  },
  {
    day: 10,
    rating: 1, // Rough
    note: 'Saw everyone posting weekend party stories on Instagram with their friend groups and dates. Intense wave of FOMO, loneliness, and self-doubt.'
  },
  {
    day: 11,
    rating: 2, // Down
    note: 'Mindless gaming stream binge until 4:15 AM to numb out the loneliness. Woke up with a pounding headache and skipped first period English.'
  },
  {
    day: 12,
    rating: 1, // Rough
    note: 'Unannounced Physics pop quiz: couldn\'t remember basic rotational motion formulas. Left half the answer sheet blank. Felt like I\'m sinking deeper into a hole.'
  },
  {
    day: 13,
    rating: 2, // Down
    note: 'Friday evening exhaustion. Sat on the couch doing infinite scrolling on TikTok for 4 hours without even noticing where the evening went.'
  },
  {
    day: 14,
    rating: 3, // Okay
    note: 'Went for a 45-minute evening walk outside leaving phone in my drawer. Breezy air helped clear the heavy fog in my head.'
  },
  {
    day: 15,
    rating: 2, // Down
    note: 'Procrastinated on Monday\'s submission all afternoon. Late-night panic sprint trying to write lab notes half-asleep.'
  },

  // ════════ WEEK 3: The Catalyst & Breaking the Loop (Days 16–23) ════════
  {
    day: 16,
    rating: 1, // Rough
    note: 'Breaking point: Forgot the English assignment deadline and received a zero. Stood outside school staring at the sky and realized: I cannot keep living like this.'
  },
  {
    day: 17,
    rating: 3, // Okay
    note: 'Catalyst Day: Deleted Instagram and TikTok apps from phone. Set up a 25-min Pomodoro timer and completed 2 full hours of focused math problem-solving without distractions.'
  },
  {
    day: 18,
    rating: 4, // Good
    note: 'First major win in weeks! Solved 15 calculus derivative problems correctly without checking the solution manual. Felt a forgotten spark of self-confidence.'
  },
  {
    day: 19,
    rating: 3, // Okay
    note: 'Maintained the social media detox. Attended all classes, sat in the front row, and asked the Physics teacher one clarifying question after class. He was encouraging.'
  },
  {
    day: 20,
    rating: 4, // Good
    note: 'Finished my Biology lab report 24 hours before the deadline! Went to bed at 11:00 PM for the first time this entire month. Woke up without brain fog.'
  },
  {
    day: 21,
    rating: 3, // Okay
    note: 'Saturday group study at the public library with a classmate. Stayed on task for 3 solid hours. Didn\'t feel behind anymore.'
  },
  {
    day: 22,
    rating: 4, // Good
    note: 'Attempted a timed practice mock test for Chemistry: scored 68%! Still have weak areas to polish, but seeing tangible proof of recovery was huge.'
  },
  {
    day: 23,
    rating: 3, // Okay
    note: 'Balanced Sunday: Did 2 hours of revision, went for a run, helped mom with groceries. Kept my baseline stable.'
  },

  // ════════ WEEK 4: Relapse, Reset & Rebuilding Baseline (Days 24–31) ════════
  {
    day: 24,
    rating: 2, // Down
    note: 'Rainy Tuesday setback: Got bored and re-downloaded Instagram for 90 minutes. Felt guilt creeping in, but reminded myself not to let one slip spiral into a ruined week.'
  },
  {
    day: 25,
    rating: 3, // Okay
    note: 'Applied the 24-Hour Reset Rule: Immediately uninstalled the app again, drank a glass of water, and completed the Chemistry numericals set.'
  },
  {
    day: 26,
    rating: 4, // Good
    note: 'Mathematics Unit Test Day: Wrote with clear calm focus. Finished all questions with 5 minutes to spare for checking errors. No panic attacks.'
  },
  {
    day: 27,
    rating: 4, // Good
    note: 'Got Math Unit Test results back: 74/100! From 38 to 74 in three weeks! The teacher wrote "Tremendous improvement, keep this momentum" on the paper.'
  },
  {
    day: 28,
    rating: 3, // Okay
    note: 'Showed the test paper to parents at dinner. Dad gave me a quiet nod of respect and mom smiled. Felt a heavy weight lift off my shoulders.'
  },
  {
    day: 29,
    rating: 3, // Okay
    note: 'Weekend preparation: Made clean formula flashcards for upcoming finals. Routine feels predictable and manageable now.'
  },
  {
    day: 30,
    rating: 4, // Good
    note: 'Completed the entire monthly study checklist. Realized that feeling confident doesn\'t come before action; action creates confidence.'
  },
  {
    day: 31,
    rating: 5, // Peak
    note: 'End of Month Reflection: Survived one of the hardest academic and emotional months of my life. From 3 AM doomscrolling and failing to a 14-day study streak and 74% test score. I stayed in the fight.'
  }
];

export const mockArchetypes = {
  strugglingStudent: {
    id: 'strugglingStudent',
    name: '🎓 Aryan\'s Chronicles (The Struggling Student — 31 Days)',
    shortDesc: 'Exam anxiety, 3 AM Reels doomscrolling, parent pressure, and a Week 3 resilience rebound.',
    color: '#FF8A00',
    getEntries: (year = 2026, month = 8) => {
      const daysInMonth = new Date(year, month, 0).getDate();
      const entriesMap = {};
      const mStr = String(month).padStart(2, '0');
      
      for (let d = 1; d <= daysInMonth; d++) {
        const dStr = String(d).padStart(2, '0');
        const dateKey = `${year}-${mStr}-${dStr}`;
        const raw = rawDiaryEntries.find(e => e.day === d) || {
          day: d,
          rating: d % 2 === 0 ? 3 : 4,
          note: `Logged revision notes and maintained consistent study routine for day ${d}.`
        };
        entriesMap[dateKey] = {
          date: dateKey,
          rating: raw.rating,
          notes: raw.note
        };
      }
      return entriesMap;
    }
  }
};
