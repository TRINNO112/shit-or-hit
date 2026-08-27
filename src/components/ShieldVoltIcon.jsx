import React from 'react';

export default function ShieldVoltIcon({ className = "w-8 h-8", color = "#FDC800" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 1. Neobrutalist 3D Solid Drop Shadow Base */}
      <polygon
        points="50,6 94,26 94,74 50,98 6,74 6,26"
        fill="#000000"
        transform="translate(4, 4)"
      />

      {/* 2. Outer Hexagonal Armor Shield Frame */}
      <polygon
        points="50,4 94,24 94,74 50,98 6,74 6,24"
        fill="#111622"
        stroke="#000000"
        strokeWidth="4"
        strokeLinejoin="bevel"
      />

      {/* 3. Inner Armor Bevel Layer (Cream & Streetwear Contrast) */}
      <polygon
        points="50,11 87,28 87,69 50,90 13,69 13,28"
        fill="#FFFDF5"
        stroke="#000000"
        strokeWidth="2.5"
        strokeLinejoin="bevel"
      />

      {/* 4. Deep Tech Matrix Chamber */}
      <polygon
        points="50,17 80,32 80,64 50,82 20,64 20,32"
        fill="#1E2638"
        stroke="#000000"
        strokeWidth="2"
      />

      {/* 5. Cyber Matrix Grid Lines & Chevron Warning Stripes */}
      <line x1="50" y1="17" x2="50" y2="82" stroke="rgba(253, 200, 0, 0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="20" y1="48" x2="80" y2="48" stroke="rgba(253, 200, 0, 0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
      
      {/* Top Armor Warning Chevrons */}
      <path d="M44 24L50 20L56 24" stroke="#FDC800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 28L50 24L56 28" stroke="#FDC800" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />

      {/* Corner Mechanical Rivets */}
      <circle cx="50" cy="9" r="2" fill="#000000" />
      <circle cx="90" cy="27" r="2" fill="#000000" />
      <circle cx="90" cy="71" r="2" fill="#000000" />
      <circle cx="50" cy="93" r="2" fill="#000000" />
      <circle cx="10" cy="71" r="2" fill="#000000" />
      <circle cx="10" cy="27" r="2" fill="#000000" />

      {/* 6. Kinetic Electric Sparks (Breaking Out of Frame) */}
      <path d="M84 16L87 20L91 17L88 23L93 25L87 26L88 31L83 27L80 32L81 26L76 24L82 22Z" fill="#FDC800" stroke="#000000" strokeWidth="1" />
      <path d="M12 70L15 73L18 69L16 75L21 77L15 78L16 83L12 79L8 83L10 77L5 76L11 74Z" fill="#00E599" stroke="#000000" strokeWidth="1" />

      {/* 7. Bursting Overdrive Mecha Thunderbolt (Breaking Boundary) */}
      {/* Bolt 3D Shadow Base */}
      <path
        d="M60 2L22 48H44L30 96L82 42H56L72 2H60Z"
        fill="#000000"
        transform="translate(3, 3)"
      />

      {/* Main Lightning Body */}
      <path
        d="M58 0L20 46H42L28 94L80 40H54L70 0H58Z"
        fill={color}
        stroke="#000000"
        strokeWidth="3.5"
        strokeLinejoin="bevel"
      />

      {/* High-Voltage Dynamic Core Bevel (Dual Tone) */}
      <path
        d="M58 0L36 44H50L28 94L52 46H38L58 0Z"
        fill="rgba(255, 255, 255, 0.6)"
      />

      {/* Cyber Mechanical Etchings on Bolt */}
      <line x1="48" y1="20" x2="58" y2="20" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="32" x2="52" y2="32" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="62" x2="48" y2="62" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
