// 3 Complete 30-Day Realistic Test Datasets with Daily Diary Snippets

export const mockArchetypes = {
  highPerformer: {
    id: 'highPerformer',
    name: '👑 High-Performer (Apex Momentum)',
    description: '85% Peak/Good days, deep flow states, high output, zero rough days.',
    generateEntries: (year = 2026, month = 8) => {
      const entries = {};
      const totalDays = new Date(year, month, 0).getDate();

      const notesCatalog = [
        "Crushed the core architecture refactoring in a 4-hour uninterrupted flow state. All unit tests green.",
        "Delivered the client demo ahead of schedule. Feedback was overwhelmingly positive. Energy is electric.",
        "Woke up at 6 AM, hit a 5km personal record, and shipped 3 major features before lunch.",
        "High focus session with the team. Unblocked critical bottlenecks and planned next sprint flawlessly.",
        "Optimized database query latency by 60%. Everything feels fast, crisp, and dialed in.",
        "Solid momentum day. Wrapped up documentation and closed all open pull requests.",
        "Maintained intense discipline during review cycles. Clear mind, zero distractions.",
        "Great execution. Solved an edge-case memory leak that was pending for weeks.",
        "Full velocity. Deployed staging environment seamlessly without downtime.",
        "Deep strategic planning for Q4. High alignment with stakeholders and clear roadmap."
      ];

      for (let d = 1; d <= totalDays; d++) {
        const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        // 5 (55%), 4 (35%), 3 (10%)
        const roll = (d * 7) % 100;
        let rating = 5;
        let verdict = 'Peak';
        if (roll < 55) {
          rating = 5;
          verdict = 'Peak';
        } else if (roll < 90) {
          rating = 4;
          verdict = 'Good';
        } else {
          rating = 3;
          verdict = 'Okay';
        }

        entries[dStr] = {
          date: dStr,
          rating,
          verdict,
          notes: notesCatalog[d % notesCatalog.length]
        };
      }
      return entries;
    }
  },

  steadyBaseline: {
    id: 'steadyBaseline',
    name: '🔘 Steady Baseline (Equilibrium)',
    description: '70% Okay/Baseline days, normal routine, consistent maintenance pace.',
    generateEntries: (year = 2026, month = 8) => {
      const entries = {};
      const totalDays = new Date(year, month, 0).getDate();

      const notesCatalog = [
        "Normal working day. Attended 3 routine standups and answered backlog support tickets.",
        "Steady progress on maintenance tasks. Nothing extraordinary, but held the line.",
        "Felt a bit sluggish after lunch, but managed to finish the weekly report on time.",
        "Standard Thursday routine. Completed code reviews and planned tomorrow's schedule.",
        "A few unexpected meeting interruptions, but maintained composure and finished tasks.",
        "Productive morning followed by an average afternoon. Met all basic deliverables.",
        "Weekend rest and light chores. Recovered energy for the upcoming work week.",
        "Routine deployment checks. Everything remained stable without surprises.",
        "Balanced workday. Fixed two minor UI styling tickets and logged off on time."
      ];

      for (let d = 1; d <= totalDays; d++) {
        const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        // 3 (70%), 4 (15%), 2 (15%)
        const roll = (d * 11) % 100;
        let rating = 3;
        let verdict = 'Okay';
        if (roll < 70) {
          rating = 3;
          verdict = 'Okay';
        } else if (roll < 85) {
          rating = 4;
          verdict = 'Good';
        } else {
          rating = 2;
          verdict = 'Down';
        }

        entries[dStr] = {
          date: dStr,
          rating,
          verdict,
          notes: notesCatalog[d % notesCatalog.length]
        };
      }
      return entries;
    }
  },

  fightingUnderdog: {
    id: 'fightingUnderdog',
    name: '🔥 Fighting Underdog (Red Struggle)',
    description: '75% Rough/Down days, heavy friction, production blockers, burnout battles.',
    generateEntries: (year = 2026, month = 8) => {
      const entries = {};
      const totalDays = new Date(year, month, 0).getDate();

      const notesCatalog = [
        "Critical production outage at 2 AM. Spent 8 hours fighting broken database migrations. Pure chaos and exhaustion.",
        "Severe mental fatigue today. Context switched between 6 conflicting priorities and got virtually nothing done.",
        "Stuck on an elusive concurrency deadlock bug all day. Frustration levels were at an all-time high.",
        "Sleep deprivation caught up with me. Couldn't focus for more than 15 minutes without zoning out.",
        "Rough day. Missed a crucial milestone due to third-party API outage and server crashes.",
        "Heavy burnout symptoms. Struggled to write basic code. Pushed through by sheer stubborn willpower.",
        "Overwhelming backlog and team miscommunication. Spent the day putting out fires instead of building.",
        "Managed a slight recovery. Fixed one critical bug and got 4 hours of focused work done.",
        "Tough setbacks again. Requirements got changed last minute, forcing me to discard 3 days of work."
      ];

      for (let d = 1; d <= totalDays; d++) {
        const dStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        // 1 (45%), 2 (30%), 3 (20%), 4 (5%)
        const roll = (d * 13) % 100;
        let rating = 1;
        let verdict = 'Rough';
        if (roll < 45) {
          rating = 1;
          verdict = 'Rough';
        } else if (roll < 75) {
          rating = 2;
          verdict = 'Down';
        } else if (roll < 95) {
          rating = 3;
          verdict = 'Okay';
        } else {
          rating = 4;
          verdict = 'Good';
        }

        entries[dStr] = {
          date: dStr,
          rating,
          verdict,
          notes: notesCatalog[d % notesCatalog.length]
        };
      }
      return entries;
    }
  }
};
