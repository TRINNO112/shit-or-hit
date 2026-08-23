// Authentic 31-Day Narrative Story of Aryan (12th Grade Commerce Student)
// Detailed day-by-day story covering balance sheet mismatches, 3:45 AM Reels doomscrolling,
// morning stomach cramps in class, peer dating insecurities, and a Week 3-4 resilience turnaround.

const rawDiaryEntries = [
  // ════════ WEEK 1: Accounts Disaster & Morning Agony (Days 1–7) ════════
  {
    day: 1,
    rating: 1, // Rough
    note: 'Woke up late today because of the power cut last night and didn\'t even get the chance to shit properly at home. Rushed to school and by second period Accounts, my stomach started cramping like hell. I was literally sweating, clenching my teeth, praying the bell would ring because school washrooms are a biohazard. On top of that, our 25-mark Accounts test was a total bloodbath. My cash flow statement didn\'t tally by ₹14,000 and the teacher publicly mocked my calculation errors in front of the whole class. Felt like shrinking into the floor.'
  },
  {
    day: 2,
    rating: 1, // Rough
    note: 'Came home exhausted with a throbbing headache. Was supposed to finish the Indian Economic Development (IED) chapter on rural credit, but I opened Instagram at 9 PM and literally got trapped in an infinite scrolling loop until 3:45 AM. Staring at gym bros, party vlogs, and meme pages while my eyes burned. Wasted 6 straight hours. I feel completely powerless against this stupid glass rectangle.'
  },
  {
    day: 3,
    rating: 2, // Down
    note: 'Slept only 2.5 hours. Arrived at school with bloodshot eyes and heavy brain fog. During break, sat alone in the canteen watching Kabir and his girlfriend feeding each other pastries while Rohan was loudly bragging to the group about making out with his tuition classmate over the weekend. Meanwhile, I can\'t even get a text back and my biggest achievement this week is surviving a stomach cramp. Felt utterly pathetic and invisible.'
  },
  {
    day: 4,
    rating: 1, // Rough
    note: 'Dad asked to see the Accounts test paper at dinner. When he saw the 9/25 in red ink, the dinner table went dead silent. He didn\'t even yell—he just sighed, shook his head, and said, "If you can\'t even manage 12th commerce, what will you do in college?" Mom looked away. Left half my plate and went to my room. That quiet disappointment hurts 100x worse than any beating.'
  },
  {
    day: 5,
    rating: 2, // Down
    note: 'Tried sitting in the local library after school to prove to myself I can study. Sat with my Business Studies textbook, but picked up my phone every 3 minutes to check empty WhatsApp groups. In 3 hours, I read exactly 4 pages of \'Principles of Management\'. My brain feels fried, dopamine-starved, and unable to hold a single thought.'
  },
  {
    day: 6,
    rating: 3, // Okay
    note: 'Saturday: Had a good morning routine for once. Cleaned off the mountain of messy guides, half-eaten biscuit wrappers, and rough sheets from my study desk. Put my phone on aeroplane mode and put it inside my cupboard. Actually sat down and solved 6 partnership admission questions. The balance sheet actually tallied on the third try. Tiny breath of relief.'
  },
  {
    day: 7,
    rating: 2, // Down
    note: 'Sunday was going fine until 6 PM when the weekend dread hit. Realized I hadn\'t touched Macroeconomics national income numerics. Spent the rest of the evening stressing instead of studying, ending the weekend in that familiar state of nervous paralysis.'
  },

  // ════════ WEEK 2: Insecurity, Rejection & Household Rut (Days 8–15) ════════
  {
    day: 8,
    rating: 1, // Rough
    note: 'BST group project announced. Teacher assigned groups and I got paired with Tanya and Shreya—both top rankers. I felt so insecure about my low test marks that whenever they asked for input on the marketing plan, I just mumbled "yeah, looks good." They probably think I\'m completely brainless dead weight.'
  },
  {
    day: 9,
    rating: 2, // Down
    note: 'Saw Ananya in the corridor near the water cooler. We take the same bus and I\'ve had a crush on her for 6 months. Decided today was the day to talk. Walked up, tried to make a joke about the Accounts teacher, but my voice cracked, she looked confused, said "oh, haha cool," and walked away to her friends. I wanted the ground to swallow me whole. Overanalyzed every millisecond for the rest of the day.'
  },
  {
    day: 10,
    rating: 1, // Rough
    note: 'Friday night: Opened Instagram and saw all my school friends out at a cafe in Hauz Khas having a blast. No one even bothered to drop a message in the group chat. Lay on my bed in the dark feeling completely discarded. Why is everyone else living a movie while I\'m stuck in an endless loop of failure?'
  },
  {
    day: 11,
    rating: 2, // Down
    note: 'To avoid thinking about school, binged GTA roleplay livestreams until 4:30 in the morning. Woke up at 1 PM with a splitting migraine on the right side of my head and missed my weekend Accounts tuition class. Paid fees for nothing.'
  },
  {
    day: 12,
    rating: 1, // Rough
    note: 'Eco teacher walked in and gave a surprise 15-mark test on National Income aggregates (GDPmp, NNPfc). Completely blanked on the conversion formula for Net Indirect Taxes. Handed in a half-empty sheet. The teacher gave me that look again—the "he\'s given up" look.'
  },
  {
    day: 13,
    rating: 1, // Rough
    note: 'Came home hoping for quiet, walked straight into absolute chaos. Gas cylinder ran out mid-cooking, mom was stressed, and my younger brother picked a massive fight over the TV remote that escalated into a shouting match. Had to haul the heavy cylinder up the stairs, do the evening puja while my head was throbbing, and couldn\'t study a single page.'
  },
  {
    day: 14,
    rating: 3, // Okay
    note: 'Left my phone locked in the drawer and went for a 5 km walk around the neighborhood park alone. The cool evening breeze actually did something to my brain. Realized that 90% of my misery is staring at other people\'s curated highlight reels while my own life rots.'
  },
  {
    day: 15,
    rating: 2, // Down
    note: 'Holiday, so I told myself I would finish 4 chapters of BST. Instead, ended up watching random YouTube documentaries on airline crashes for 5 hours. Late-night panic trying to finish IED notes half-asleep.'
  },

  // ════════ WEEK 3: The Catalyst & Breaking the Loop (Days 16–23) ════════
  {
    day: 16,
    rating: 1, // Rough
    note: 'Forgot the English project bibliography deadline. Teacher gave me a zero and marked me absent for internal assessment. Stood on the school terrace during lunch break looking down at the ground. I felt sick of being the joke, sick of being the guy who fails, sick of my own excuses. Something in me snapped: I am done living like this.'
  },
  {
    day: 17,
    rating: 3, // Okay
    note: 'First action of the morning: Uninstalled Instagram, Snapchat, and Reddit. Downloaded a physical Pomodoro timer app on laptop. Set the timer for 25 minutes. Solved 8 goodwill valuation numericals without looking at a screen once. It felt strange, quiet, and uncomfortable—but clean.'
  },
  {
    day: 18,
    rating: 4, // Good
    note: 'Major breakthrough today! Sat down for 3 hours straight and solved 12 complex admission of partner questions from TS Grewal. Revaluation account tallied, Partners Capital tallied, Balance Sheet tallied on the FIRST ATTEMPT! I actually jumped out of my chair. That feeling of competence is 1000x better than any cheap Reel dopamine.'
  },
  {
    day: 19,
    rating: 3, // Okay
    note: 'Moved my seat from the back bench to the second row. Asked the Economics teacher after class how to treat subsidies in National Income. She was surprised I asked and explained it clearly in 5 minutes. No phone cravings today.'
  },
  {
    day: 20,
    rating: 4, // Good
    note: 'Finished my entire BST Consumer Protection assignment 24 hours before the deadline! Ate dinner with family calmly, helped mom clear the table, read 10 pages of an English novel, and went to bed at 11:00 PM. No 3 AM screen glare. Woke up feeling human for the first time in 6 months.'
  },
  {
    day: 21,
    rating: 3, // Okay
    note: 'Saturday at the public library with a serious friend from tuition. We set a 3-hour timer, kept our phones inside our bags, and completed 3 full sample papers for BST case studies. When Kabir texted asking if I wanted to hang out at the mall, I actually said no because I had work to do.'
  },
  {
    day: 22,
    rating: 4, // Good
    note: 'Took a timed 80-mark mock test for Economics: scored 54/80 (68%)! That\'s a 25% jump from my previous test. My macroeconomic numericals were 100% accurate. Still need to work on IED theory retention, but the proof of progress is undeniable.'
  },
  {
    day: 23,
    rating: 3, // Okay
    note: 'Did 2 hours of Accounts revision in the morning, went for a run, helped dad fix the bathroom tap, and watched a movie with my brother without fighting. Kept my baseline completely stable.'
  },

  // ════════ WEEK 4: The Slip, The Reset & The Final Rebound (Days 24–31) ════════
  {
    day: 24,
    rating: 2, // Down
    note: 'Rainy Tuesday afternoon. Got bored and restless. Re-downloaded Instagram "just to check one message" and lost 75 minutes looking at stupid meme pages. The old guilt immediately started creeping back, telling me "see, you\'ll never change."'
  },
  {
    day: 25,
    rating: 3, // Okay
    note: 'Old Aryan would have let that Tuesday slip turn into a 5-day binge. Not this time. Executed the 24-Hour Reset Rule: Deleted the app again on the spot, drank cold water, washed my face, and sat down to solve 10 Debentures redemption questions. Kept the damage contained to one afternoon.'
  },
  {
    day: 26,
    rating: 4, // Good
    note: 'The big Accounts Unit Test Day. Walked into the examination hall without the usual nausea. When the paper was handed out, I saw the 8-mark forfeiture of shares question and knew exactly how to solve it. Wrote calmly for 2 hours. Finished with 10 minutes to spare for formatting lines.'
  },
  {
    day: 27,
    rating: 4, // Good
    note: 'Teacher distributed the corrected papers: 39 out of 50 (78%)! In red ink at the top, she wrote "Remarkable turnaround, Aryan. Very proud of your focus." My hands were shaking holding that paper. From 38% at the start of the month to 78%.'
  },
  {
    day: 28,
    rating: 3, // Okay
    note: 'Put the test paper on the dining table in front of dad. He looked at the marks, looked at the teacher\'s note, and gave me that quiet nod of genuine respect. Mom had tears in her eyes. Nobody mentioned high-package comparisons. For once, the house felt peaceful.'
  },
  {
    day: 29,
    rating: 3, // Okay
    note: 'Saturday review: Condensed all Business Studies principles and financial management ratios into color-coded A5 flashcards. My routine feels automatic now. I don\'t negotiate with my schedule.'
  },
  {
    day: 30,
    rating: 4, // Good
    note: 'Completed the entire 30-day revision syllabus roadmap. I realized something profound today: you don\'t wait to "feel confident" to start studying; doing the hard, boring work creates the confidence.'
  },
  {
    day: 31,
    rating: 5, // Peak
    note: 'August 31, 2026 Reflection: Exactly one month ago, I was failing Accounts, crying from stomach cramps in class, drowning in 3:45 AM Reels doomscrolling, and feeling like the biggest loser in my school. Today, I\'m sitting with a 78% test paper, an unbroken 15-day study streak, clean sleep at 11 PM, and a clear head. I stayed in the fight.'
  }
];

export const mockArchetypes = {
  strugglingStudent: {
    id: 'strugglingStudent',
    name: '🎓 Aryan\'s Chronicles (12th Commerce Student — 31 Days)',
    shortDesc: 'Accounts failure, 3:45 AM Reels doomscrolling, hallway rejections, and a Week 3-4 board exam turnaround.',
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
          note: `Logged Accounts and Business Studies revision notes and maintained consistent study routine for day ${d}.`
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
