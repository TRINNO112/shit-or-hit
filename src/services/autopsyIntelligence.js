/**
 * 🩺 Autopsy Intelligence Engine — shit-or-hit
 * 
 * Provides dual-engine Behavioral Forensic Analysis:
 * 1. Cloud Gemini AI Detective (for whitelisted users with active server connection)
 * 2. On-Device Heuristic Forensic Engine (100% private, offline, rule-based, zero-API)
 * 
 * Ensures that guest and non-whitelisted users receive immediate, sharp,
 * uncompromising CIA forensic inquest dossiers without any paywalls or external dependencies.
 */

/**
 * Deterministic On-Device Forensic Inquest Generator
 */
export function generateLocalAutopsy({ notes = '', rating = 1, spheres = {}, anchors = {}, date = '' }) {
  const textLower = (notes || '').toLowerCase();
  
  const isDigital = textLower.includes('phone') || textLower.includes('scroll') || 
                    textLower.includes('screen') || textLower.includes('instagram') || 
                    textLower.includes('reel') || textLower.includes('youtube') || 
                    textLower.includes('game') || textLower.includes('binge') || 
                    textLower.includes('twitter') || textLower.includes('tiktok') || 
                    textLower.includes('reddit') || textLower.includes('netflix');

  const isSleep = textLower.includes('sleep') || textLower.includes('tired') || 
                  textLower.includes('exhaust') || textLower.includes('insomnia') || 
                  textLower.includes('late') || textLower.includes('bed') || 
                  textLower.includes('alarm') || textLower.includes('wake') || 
                  textLower.includes('groggy') || textLower.includes('drowsy');

  const isAvoidance = textLower.includes('procrastinat') || textLower.includes('delay') || 
                      textLower.includes('avoid') || textLower.includes('lazy') || 
                      textLower.includes('stuck') || textLower.includes('overwhelm') || 
                      textLower.includes('hard') || textLower.includes('distract');

  const isBiological = textLower.includes('sick') || textLower.includes('headache') || 
                       textLower.includes('pain') || textLower.includes('fever') || 
                       textLower.includes('junk') || textLower.includes('ate') || 
                       textLower.includes('unhealthy') || textLower.includes('hangover');

  // Check if any daily non-negotiable habit anchors were explicitly failed
  const failedAnchors = anchors ? Object.keys(anchors).filter(k => anchors[k] === false) : [];
  const primaryMissedAnchor = failedAnchors.length > 0 ? failedAnchors[0].replace(/_/g, ' ') : null;

  let causeOfDeath = '';
  let questions = [];
  let recoveryAntidote = '';

  if (isDigital) {
    causeOfDeath = 'Acute Digital Dopamine Sepsis: Frictionless screen loops breached focus perimeters, draining executive will and starving task initiation.';
    questions = [
      {
        id: 'q1',
        question: 'At what point did the digital friction barrier fail today?',
        options: [
          'Immediate phone grab within 15 minutes of waking',
          'Afternoon micro-break that spiraled into an endless scroll loop',
          'Late-night bedtime binge past designated curfew'
        ]
      },
      {
        id: 'q2',
        question: 'Did you expose cognitive attention to algorithms before finishing your first anchor?',
        options: [
          'Yes, opened social/video feeds before doing anything productive',
          'Checked notifications, which hijacked my mental priorities',
          'Resisted morning screens, but collapsed during afternoon fatigue'
        ]
      },
      {
        id: 'q3',
        question: 'What physical barrier will you install tomorrow morning?',
        options: [
          'Charge phone in another room overnight with zero bed access',
          'Enforce strict 60-minute zero-screen moratorium upon waking',
          'App blocker activated until daily primary anchor is checked'
        ]
      }
    ];
    recoveryAntidote = 'Execute a strict 60-minute digital curfew before sleep tonight, charge your device outside arm reach, hydrate with cold water immediately upon waking, and complete your primary anchor before unlocking any screen.';
  } else if (isSleep) {
    causeOfDeath = 'Circadian Collapse & Neurochemical Debt: Severe sleep timing deficit delayed restorative neurochemical recovery, triggering morning brain fog and execution paralysis.';
    questions = [
      {
        id: 'q1',
        question: 'What compromised your sleep boundary last night?',
        options: [
          'Screens and blue light stimulation past midnight',
          'Overthinking, unresolved anxiety, or irregular schedule',
          'Delayed bedtime due to revenge bedtime procrastination'
        ]
      },
      {
        id: 'q2',
        question: 'How severely did the fatigue degrade daytime execution?',
        options: [
          'Severe resistance to starting even trivial non-negotiables',
          'Mind wandering, brain fog, and zero deep work velocity',
          'Compensated with caffeine/sugar, leading to an afternoon crash'
        ]
      },
      {
        id: 'q3',
        question: 'What is your non-negotiable sleep reset target for tonight?',
        options: [
          'Lights out strictly by 11:00 PM with room blacked out',
          'Hot shower and zero screens 45 minutes before bed',
          'Magnesium / herbal wind-down with journaling'
        ]
      }
    ];
    recoveryAntidote = 'Set a firm lights-out cutoff tonight, consume 750ml cold water with a pinch of salt upon waking, step into morning daylight for 5 minutes, and refuse to negotiate on sleep discipline.';
  } else if (isAvoidance || primaryMissedAnchor) {
    causeOfDeath = primaryMissedAnchor 
      ? `Anchor Breach & Task Avoidance: Skipping "${primaryMissedAnchor}" dismantled early cognitive momentum, allowing passive avoidance to dominate the remainder of the day.`
      : 'Executive Friction Fracture: High perceived task friction triggered avoidance loops, diverting mental energy toward low-stakes comfort.';
    questions = [
      {
        id: 'q1',
        question: 'What made the high-leverage task feel overwhelming?',
        options: [
          'Vague requirements and not knowing the immediate next 2-minute step',
          'Fear of failure, perfectionism, or intimidation by project scope',
          'Competing minor fires and fake-work chores taking priority'
        ]
      },
      {
        id: 'q2',
        question: 'What mental rationalization justified walking away?',
        options: [
          '"I will start tomorrow when I have more energy"',
          '"Let me clean my desk / organize first"',
          '"The day is already ruined, might as well relax"'
        ]
      },
      {
        id: 'q3',
        question: 'How will you break the friction barrier tomorrow morning?',
        options: [
          '2-Minute Rule: Commit only to opening the file and writing one sentence',
          'Timebox 20 minutes of ugly, imperfect progress with timer ticking',
          'Execute the hardest milestone before checking emails or feeds'
        ]
      }
    ];
    recoveryAntidote = 'Tomorrow morning, shrink your primary roadblock to an embarrassingly small 120-second step, execute it without judging the quality, and secure your first anchor before noon.';
  } else if (isBiological) {
    causeOfDeath = 'Somatic Depletion & Biological Debt: Physical fatigue, nutritional compromise, or dehydration drained nervous system bandwidth, starving willpower.';
    questions = [
      {
        id: 'q1',
        question: 'Which biological baseline was neglected most today?',
        options: [
          'Dehydration and zero intentional physical movement',
          'High sugar / processed food spike causing dopamine crash',
          'Underlying illness or physical burnout needing acute rest'
        ]
      },
      {
        id: 'q2',
        question: 'Did you force work while physically depleted?',
        options: [
          'Yes, guilt-worked at 10% efficiency without true rest',
          'Shut down completely and spiraled into frustration',
          'Ignored somatic warning signals until total exhaustion'
        ]
      },
      {
        id: 'q3',
        question: 'What physical repair action will you take right now?',
        options: [
          'Drink 500ml water and take a 15-minute recovery walk',
          'Enter early sleep recovery without digital stimulation',
          'Activate Sanctuary Mode for 24 hours to reboot baseline'
        ]
      }
    ];
    recoveryAntidote = 'Honor your biological hardware: consume 1L of water, eat a clean nourishing meal, step outside for fresh air, and sleep early. A depleted body cannot execute high-discipline protocols.';
  } else {
    // Default sharp behavioral audit
    causeOfDeath = 'Tactical Discipline Fracture: Morning friction loops compromised discipline, allowing passive distractions and avoidance behavior to dominate the day.';
    questions = [
      {
        id: 'q1',
        question: 'What was the exact zero-hour trigger that derailed your day?',
        options: [
          'Late night doomscrolling / phone in bed',
          'Procrastinated on primary work milestone',
          'Emotional friction / mental overwhelm'
        ]
      },
      {
        id: 'q2',
        question: 'Did you execute your morning non-negotiables before screens?',
        options: [
          'Skipped completely',
          'Partial / delayed effort',
          'Completed morning anchor, collapsed later'
        ]
      },
      {
        id: 'q3',
        question: 'What is your primary defensive measure for tomorrow morning?',
        options: [
          'Strict 45-min phone quarantine upon waking',
          'Immediate 100% focus on single hardest task',
          'Early sleep reset: zero screens after 11:30 PM'
        ]
      }
    ];
    recoveryAntidote = 'Protocol Reset: Drink 1L cold water upon waking, keep phone in another room for 60 minutes, and complete your first non-negotiable anchor before opening any browser.';
  }

  return {
    causeOfDeath,
    questions,
    recoveryAntidote,
    isLocal: true,
    engine: 'ON-DEVICE FORENSIC DETECTIVE (100% PRIVATE)',
    evaluatedAt: new Date().toISOString(),
    entryDate: date
  };
}

/**
 * Unified Autopsy Fetcher with Offline Fallback
 * 
 * Attempts cloud AI for whitelisted accounts, but seamlessly falls back
 * to the on-device forensic engine for guests, offline users, or API limits.
 */
export async function getAutopsyAnalysis({
  date,
  rating,
  notes = '',
  spheres = {},
  anchors = {},
  isWhitelisted = false
}) {
  // If definitely not whitelisted or explicitly in guest offline mode, generate local immediately
  if (!isWhitelisted && typeof window !== 'undefined' && !window.__ENABLE_CLOUD_AI__) {
    // Give a slight delay for dramatic forensics scanner effect in UI
    await new Promise(r => setTimeout(r, 600));
    return {
      success: true,
      autopsy: generateLocalAutopsy({ notes, rating, spheres, anchors, date }),
      source: 'local'
    };
  }

  try {
    const res = await fetch('/api/ai/autopsy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        rating: Number(rating) || 1,
        notes: notes || '',
        spheres: spheres || {},
        anchors: anchors || {}
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.success && data?.autopsy && data.autopsy.questions?.length > 0) {
        return {
          success: true,
          autopsy: {
            ...data.autopsy,
            isLocal: false,
            engine: 'GEMINI AI CLOUD CORONER'
          },
          source: 'cloud'
        };
      }
    }
  } catch (err) {
    console.info('Cloud Autopsy API unavailable or offline, engaging on-device forensic engine:', err.message);
  }

  // Guaranteed resilient fallback with 100% rich questions
  return {
    success: true,
    autopsy: generateLocalAutopsy({ notes, rating, spheres, anchors, date }),
    source: 'local'
  };
}
