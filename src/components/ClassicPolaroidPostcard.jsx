import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Pairs best with a warm display serif loaded at the app level — Fraunces,
// Canela, or similar. Falls back gracefully to system serifs if unavailable.
const serifStack =
  "'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif";

/**
 * ClassicPolaroidPostcard — a keepsake card for a single day's entry.
 *
 * Concept: a hybrid of a travel postcard and a library card-catalog slip.
 * The streak reads as a catalog tab, the rating as a wax seal, the date
 * as a postmark — the card looks like something pulled from an archive,
 * because that's what it is.
 */
export function ClassicPolaroidPostcard({
  artImage,          // URL or imported mascot image (e.g. mascotSanctuaryRain)
  artTitle = "Rainy Veranda Sanctuary",
  rating = 5,        // 1 to 5
  dateStr = "2026-09-22",
  formattedDate = "Tue, Sep 22, 2026",
  streakCount = 14,
  noteText = "Faced friction head-on, stuck to non-negotiable habits, and reclaimed momentum before nightfall."
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative w-full max-w-sm">
      {/* Archive stack — other cards peeking out behind this one */}
      <div
        className="absolute inset-0 translate-x-2.5 translate-y-3.5 -rotate-3 rounded-[10px] bg-[#EDE4D3] border border-[#D8CBB0]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 translate-x-1 translate-y-1.5 rotate-2 rounded-[10px] bg-[#F2EAD9] border border-[#DCD0B8]"
        aria-hidden="true"
      />

      <motion.article
        initial={
          prefersReducedMotion ? false : { opacity: 0, y: 10, rotate: -1.2 }
        }
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-[#FBF6EC] border border-[#D8CBB0] rounded-[10px] shadow-[0_10px_24px_-8px_rgba(60,42,20,0.35)]"
      >
        {/* Catalog tab — the streak, styled as an index-card tab */}
        <div className="absolute -top-3 right-6 z-10">
          <div className="bg-[#FBF6EC] border border-[#D8CBB0] border-b-0 rounded-t-md px-2.5 pt-1.5 pb-1 text-center">
            <div
              className="text-[15px] leading-none text-[#7A2E2E] font-semibold"
              style={{ fontFamily: serifStack }}
            >
              {streakCount}
            </div>
            <div className="text-[6.5px] tracking-[0.16em] text-[#8C8577] leading-none mt-0.5">
              DAY STREAK
            </div>
          </div>
        </div>

        {/* Photographic window, matted like a mounted print */}
        <div className="relative w-full aspect-[4/3] bg-[#20211D] m-3 rounded-[4px] overflow-hidden border border-black/10">
          <img
            src={artImage}
            alt={artTitle}
            className="w-full h-full object-cover"
          />

          {/* Postmark ring */}
          <div
            className="absolute top-2 left-2 w-14 h-14 rounded-full border border-[#F8F3E8]/60 flex items-center justify-center rotate-[-8deg] mix-blend-screen"
            aria-hidden="true"
          >
            <div className="w-[78%] h-[78%] rounded-full border border-[#F8F3E8]/45 flex items-center justify-center">
              <span className="text-[6.5px] tracking-[0.14em] text-[#F8F3E8]/85 font-medium">
                {dateStr}
              </span>
            </div>
          </div>

          {/* Wax-seal rating medallion */}
          <div
            className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#7A2E2E] shadow-[0_2px_6px_rgba(0,0,0,0.35)] flex items-center justify-center"
            role="img"
            aria-label={`Rated ${rating} out of 5`}
          >
            <span
              aria-hidden="true"
              className="text-[#E8C77E] text-[10px] leading-none tracking-[0.06em]"
            >
              {'●'.repeat(rating)}{'○'.repeat(5 - rating)}
            </span>
          </div>
        </div>

        {/* Signature section */}
        <div className="px-4 pt-2.5 pb-4">
          <h3
            className="text-[17px] italic text-[#2A2620] leading-snug"
            style={{ fontFamily: serifStack }}
          >
            {artTitle}
          </h3>

          <div className="h-px bg-[#D8CBB0] my-2.5" />

          <p
            className="text-[13px] text-[#4A443A] leading-relaxed"
            style={{ fontFamily: serifStack }}
          >
            “{noteText}”
          </p>

          <div
            className="mt-3 pt-2 flex items-center justify-between text-[9.5px] text-[#8C8577]"
            style={{ borderTop: '1px dashed #D8CBB0' }}
          >
            <span className="tracking-wide">{formattedDate}</span>
            <span className="inline-block -rotate-1 border border-[#7A2E2E]/30 rounded-sm px-1 py-0.5 tracking-[0.13em] text-[#7A2E2E]">
              SHIT OR HIT ARCHIVE
            </span>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export default ClassicPolaroidPostcard;
