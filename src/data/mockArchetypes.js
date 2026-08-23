// Authentic 31-Day Narrative Story of Aryan (12th Grade Commerce Student)
// 30 BRUTAL DAYS (Ratings 1 & 2) + 1 SINGLE BREAKTHROUGH DAY (Rating 4/5)

const rawDiaryEntries = [
  // ════════ DAYS 1–10: The Relentless Downward Spiral ════════
  {
    day: 1,
    rating: 1, // Rough
    note: 'Woke up late due to power cut, missed morning toilet time at home. Had catastrophic stomach cramps during double Accounts period. Failed 25-mark cash flow test (9/25) and got publicly roasted by the teacher.'
  },
  {
    day: 2,
    rating: 1, // Rough
    note: 'Came home with migraine. Supposed to study Economics rural credit, opened Instagram at 9 PM and got trapped doomscrolling until 3:45 AM. 6 hours completely down the drain.'
  },
  {
    day: 3,
    rating: 2, // Down
    note: 'Slept 2.5 hours. Sat alone in the canteen watching Kabir feed his girlfriend pastries while Rohan loudly bragged about making out with his tuition crush. Felt completely invisible and unwanted.'
  },
  {
    day: 4,
    rating: 1, // Rough
    note: 'Dad saw the 9/25 in red ink at dinner. The quiet disappointment hurt worse than screaming. Left dinner halfway and lay in the dark feeling like a total failure.'
  },
  {
    day: 5,
    rating: 2, // Down
    note: 'Went to the library to study Business Studies, but checked phone every 3 minutes. Read only 4 pages in 3 hours. Brain feels fried and dopamine-cooked.'
  },
  {
    day: 6,
    rating: 2, // Down
    note: 'Saturday: Tried to study partnership admission. Spent 2 hours trying to tally the balance sheet, missed ₹8,500 difference, threw textbook on the bed in frustration.'
  },
  {
    day: 7,
    rating: 1, // Rough
    note: 'Sunday night dread hit hard at 6 PM. Stared at Macroeconomics formulas for 4 hours without absorbing a single word. Panic attack before sleeping.'
  },
  {
    day: 8,
    rating: 1, // Rough
    note: 'BST group project announced. Paired with class toppers Tanya and Shreya. Felt so dumb and insecure I didn\'t speak a single word. They definitely think I\'m dead weight.'
  },
  {
    day: 9,
    rating: 2, // Down
    note: 'Saw Ananya by the water cooler. Tried to make a joke about the Accounts teacher, voice cracked completely, she looked confused and walked off. Wanted to disappear off the face of the earth.'
  },
  {
    day: 10,
    rating: 1, // Rough
    note: 'Friday night: Opened Instagram and saw all my school friends partying at Hauz Khas cafe without even asking me. Cried in my pillow out of sheer loneliness.'
  },

  // ════════ DAYS 11–20: Household Chaos, Burnout & Rejections ════════
  {
    day: 11,
    rating: 2, // Down
    note: 'Streamed GTA roleplay videos until 4:30 AM to numb out. Woke up with split migraine, skipped 1st period and missed tuition class.'
  },
  {
    day: 12,
    rating: 1, // Rough
    note: 'Surprise Economics pop quiz on National Income aggregates. Handed in a half-empty sheet. Eco teacher gave me that look of pure disappointment.'
  },
  {
    day: 13,
    rating: 1, // Rough
    note: 'Gas cylinder ran out mid-cooking, mom broke down stressed, got into a shouting fight with my brother. Hauled the heavy cylinder upstairs with throbbing headache.'
  },
  {
    day: 14,
    rating: 2, // Down
    note: 'Walked in the park trying to clear my head, but could only ruminate on how far behind I am compared to everyone else in 12th grade.'
  },
  {
    day: 15,
    rating: 2, // Down
    note: 'Holiday: Planned to finish 4 chapters of BST, wasted 5 hours watching plane crash documentaries instead. Heavy self-hatred at night.'
  },
  {
    day: 16,
    rating: 1, // Rough
    note: 'Forgot English project bibliography deadline. Teacher gave zero marks. Stood on the school terrace feeling like an absolute clown.'
  },
  {
    day: 17,
    rating: 2, // Down
    note: 'Tried deleting Instagram, but couldn\'t focus for more than 15 minutes. Stared at the ceiling feeling severe phone withdrawal anxiety.'
  },
  {
    day: 18,
    rating: 2, // Down
    note: 'Attempted TS Grewal partnership questions. Got stuck on revaluation of unrecorded liabilities. Ended up slamming the desk and giving up.'
  },
  {
    day: 19,
    rating: 2, // Down
    note: 'Sat in the front row, but couldn\'t understand what the teacher was deriving on the board. Felt like my brain is moving in slow motion.'
  },
  {
    day: 20,
    rating: 1, // Rough
    note: 'Accidentally spilled chai all over my completed Business Studies project pages. Had to rewrite 15 pages late into the night.'
  },

  // ════════ DAYS 21–30: The Brutal Grind in the Trenches ════════
  {
    day: 21,
    rating: 2, // Down
    note: 'Saturday library session: Sat for 3 hours, but spent most of it stressing about college cutoffs and feeling hopeless about CUET.'
  },
  {
    day: 22,
    rating: 2, // Down
    note: 'Eco mock test score: 34/80. Teacher wrote "Work hard" on paper. Felt numb to bad news at this point.'
  },
  {
    day: 23,
    rating: 2, // Down
    note: 'Sunday: Household chores all day. Cleaned coolers, bought vegetables. Couldn\'t find more than 40 minutes to study.'
  },
  {
    day: 24,
    rating: 1, // Rough
    note: 'Rainy Tuesday: Re-downloaded Instagram and scrolled for 2 hours. Felt like a total hypocrite with zero willpower.'
  },
  {
    day: 25,
    rating: 2, // Down
    note: 'Forced myself to delete the apps again. Drank water, sat at desk for 1 hour, managed to finish 5 debenture numericals with errors.'
  },
  {
    day: 26,
    rating: 2, // Down
    note: 'Severe anxiety the night before the big Accounts unit test. Slept only 3 hours, heart pounding in my chest during morning assembly.'
  },
  {
    day: 27,
    rating: 2, // Down
    note: 'Wrote the Accounts unit test. It was brutal. Attempted all questions but had zero confidence whether the balance sheet tallied.'
  },
  {
    day: 28,
    rating: 2, // Down
    note: 'Waited anxiously for test results. Couldn\'t focus on Business Studies lectures. Dread in the pit of my stomach all day.'
  },
  {
    day: 29,
    rating: 2, // Down
    note: 'Saturday: Made revision flashcards while fighting a bad cold. Sneezing, tired, running on chai.'
  },
  {
    day: 30,
    rating: 2, // Down
    note: 'Exhausted from a whole month of unrelenting struggle. Wondered if any of this grind will ever pay off.'
  },

  // ════════ DAY 31: THE ONE GLORIOUS GOOD DAY (1 OUT OF 31) ════════
  {
    day: 31,
    rating: 5, // Peak (THE ONLY GOOD DAY!)
    note: 'THE ONE WIN: Teacher handed back the 50-mark Accounts Unit Test: Scored 39/50 (78%)! She announced in class: "Aryan showed the biggest turnaround this term." Dad smiled at dinner and said "Good job, son." After 30 days of pure hell, I finally got my breakthrough.'
  }
];

export const mockArchetypes = {
  strugglingStudent: {
    id: 'strugglingStudent',
    name: '🎓 Aryan\'s Chronicles (30 Days in Hell, 1 Glorious Win)',
    shortDesc: '30 days of failed tests, 3:45 AM doomscrolling, canteen FOMO, and exactly 1 breakthrough day.',
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
          rating: 2,
          note: `Struggled through Accounts and BST revision for day ${d}.`
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
