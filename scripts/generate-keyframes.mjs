import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

mkdirSync('src/assets/keyframes', { recursive: true });

const keyframes = [
  {
    name: '01-tunnel',
    title: 'THE PLAYERS TUNNEL',
    desc: 'Match night · Walking out into the floodlights',
    svg: `
      <svg width="2560" height="1440" viewBox="0 0 2560 1440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0B131C"/>
            <stop offset="100%" stop-color="#1B2A3A"/>
          </linearGradient>
          <radialGradient id="portalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#F4F1E6" stop-opacity="0.95"/>
            <stop offset="35%" stop-color="#D9B98A" stop-opacity="0.6"/>
            <stop offset="70%" stop-color="#1B2A3A" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#0E1F17" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="wallL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#0A110D"/>
            <stop offset="100%" stop-color="#1E2A23"/>
          </linearGradient>
          <linearGradient id="wallR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stop-color="#0A110D"/>
            <stop offset="100%" stop-color="#1E2A23"/>
          </linearGradient>
          <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#050806"/>
            <stop offset="100%" stop-color="#141E18"/>
          </linearGradient>
          <linearGradient id="floor" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#050806"/>
            <stop offset="100%" stop-color="#1A2620"/>
          </linearGradient>
        </defs>
        <!-- Background stadium view through portal -->
        <rect width="2560" height="1440" fill="#0E1F17"/>
        <rect x="780" y="240" width="1000" height="760" fill="url(#sky)"/>
        <!-- Floodlight beams through opening -->
        <polygon points="1280,260 820,780 1740,780" fill="url(#portalGlow)"/>
        <!-- Stadium green turf in background -->
        <ellipse cx="1280" cy="880" rx="600" ry="240" fill="#143024"/>
        <ellipse cx="1280" cy="880" rx="350" ry="90" fill="#D9B98A" opacity="0.4"/>

        <!-- Tunnel architecture (perspective) -->
        <!-- Roof -->
        <polygon points="0,0 2560,0 1780,340 780,340" fill="url(#roof)"/>
        <!-- Left wall -->
        <polygon points="0,0 780,340 780,1050 0,1440" fill="url(#wallL)"/>
        <!-- Right wall -->
        <polygon points="2560,0 1780,340 1780,1050 2560,1440" fill="url(#wallR)"/>
        <!-- Floor -->
        <polygon points="0,1440 2560,1440 1780,1050 780,1050" fill="url(#floor)"/>

        <!-- Cherry red stripes on walls -->
        <polygon points="0,820 780,740 780,770 0,860" fill="#B3261E"/>
        <polygon points="2560,820 1780,740 1780,770 2560,860" fill="#B3261E"/>

        <!-- Tunnel concrete rib beams -->
        <line x1="280" y1="120" x2="280" y2="1320" stroke="#16221B" stroke-width="8"/>
        <line x1="560" y1="240" x2="560" y2="1200" stroke="#16221B" stroke-width="6"/>
        <line x1="2280" y1="120" x2="2280" y2="1320" stroke="#16221B" stroke-width="8"/>
        <line x1="2000" y1="240" x2="2000" y2="1200" stroke="#16221B" stroke-width="6"/>

        <!-- Opening portal rim -->
        <rect x="770" y="330" width="1020" height="730" fill="none" stroke="#D9B98A" stroke-width="4" opacity="0.3"/>
      </svg>
    `,
  },
  {
    name: '02-pitch',
    title: 'THE 22 YARDS',
    desc: 'Batting crease · Chalk lines & Willow track',
    svg: `
      <svg width="2560" height="1440" viewBox="0 0 2560 1440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#080F16"/>
            <stop offset="100%" stop-color="#1B2A3A"/>
          </linearGradient>
          <radialGradient id="floodKey" cx="50%" cy="10%" r="70%">
            <stop offset="0%" stop-color="#F4F1E6" stop-opacity="0.35"/>
            <stop offset="60%" stop-color="#0E1F17" stop-opacity="0"/>
          </radialGradient>
          <linearGradient id="pitchStrip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#B08D59"/>
            <stop offset="50%" stop-color="#CBB183"/>
            <stop offset="100%" stop-color="#D9B98A"/>
          </linearGradient>
        </defs>
        <!-- Night sky -->
        <rect width="2560" height="600" fill="url(#sky)"/>
        <!-- Distant stadium stands silhouette -->
        <polygon points="0,520 2560,520 2560,650 0,650" fill="#0A1510"/>
        <rect x="0" y="480" width="2560" height="40" fill="#14241B" opacity="0.6"/>
        <!-- Outfield turf -->
        <rect y="580" width="2560" height="860" fill="#0E1F17"/>
        <ellipse cx="1280" cy="1100" rx="1400" ry="500" fill="#122A1E"/>

        <!-- Floodlight beams from top corners -->
        <polygon points="150,50 600,1200 1280,1440" fill="url(#floodKey)" opacity="0.4"/>
        <polygon points="2410,50 1960,1200 1280,1440" fill="url(#floodKey)" opacity="0.4"/>
        <!-- Floodlight tower glow -->
        <circle cx="200" cy="120" r="16" fill="#F4F1E6"/>
        <circle cx="2360" cy="120" r="16" fill="#F4F1E6"/>

        <!-- The 22-Yard Pitch in perspective -->
        <polygon points="1210,640 1350,640 1620,1440 940,1440" fill="url(#pitchStrip)"/>

        <!-- Popping crease & bowling crease (chalk lines) -->
        <line x1="1020" y1="1300" x2="1540" y2="1300" stroke="#E9E4D4" stroke-width="12"/>
        <line x1="1100" y1="1390" x2="1460" y2="1390" stroke="#E9E4D4" stroke-width="8"/>
        <!-- Far crease -->
        <line x1="1215" y1="660" x2="1345" y2="660" stroke="#E9E4D4" stroke-width="4"/>

        <!-- Near Stumps (Chalk-white) -->
        <rect x="1255" y="1210" width="8" height="90" fill="#E9E4D4"/>
        <rect x="1276" y="1210" width="8" height="90" fill="#E9E4D4"/>
        <rect x="1297" y="1210" width="8" height="90" fill="#E9E4D4"/>
        <!-- Bails -->
        <rect x="1252" y="1206" width="56" height="5" fill="#E9E4D4"/>

        <!-- Far Stumps in centre third -->
        <rect x="1274" y="630" width="3" height="18" fill="#E9E4D4" opacity="0.8"/>
        <rect x="1279" y="630" width="3" height="18" fill="#E9E4D4" opacity="0.8"/>
        <rect x="1284" y="630" width="3" height="18" fill="#E9E4D4" opacity="0.8"/>
      </svg>
    `,
  },
  {
    name: '03-scoreboard',
    title: 'THE SCOREBOARD',
    desc: 'Towering panels glowing amber against the dusk',
    svg: `
      <svg width="2560" height="1440" viewBox="0 0 2560 1440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#050C14"/>
            <stop offset="100%" stop-color="#1B2A3A"/>
          </linearGradient>
          <radialGradient id="amberGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#FFB020" stop-opacity="0.7"/>
            <stop offset="50%" stop-color="#FF8F00" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="2560" height="1440" fill="url(#sky)"/>

        <!-- Tiered stands in silhouette below -->
        <polygon points="0,1100 2560,1100 2560,1440 0,1440" fill="#0E1F17"/>
        <ellipse cx="1280" cy="1380" rx="1400" ry="300" fill="#152B20"/>

        <!-- Giant Scoreboard Structure (centre third, tilted up) -->
        <rect x="780" y="240" width="1000" height="650" rx="12" fill="#0B130E" stroke="#1A2D22" stroke-width="12"/>
        <!-- Amber ambient glow -->
        <rect x="720" y="180" width="1120" height="770" fill="url(#amberGlow)" pointer-events="none"/>

        <!-- Matrix panels (abstract blocks, no readable text) -->
        <rect x="830" y="290" width="420" height="120" rx="6" fill="#1A180E"/>
        <rect x="850" y="310" width="90" height="80" rx="4" fill="#FFB020"/>
        <rect x="960" y="310" width="90" height="80" rx="4" fill="#FFB020" opacity="0.9"/>
        <rect x="1070" y="310" width="90" height="80" rx="4" fill="#FFB020" opacity="0.8"/>

        <rect x="1310" y="290" width="420" height="120" rx="6" fill="#1A180E"/>
        <rect x="1330" y="310" width="120" height="80" rx="4" fill="#FFB020"/>
        <rect x="1470" y="310" width="120" height="80" rx="4" fill="#FFB020" opacity="0.85"/>

        <!-- Middle data grid -->
        <rect x="830" y="450" width="900" height="240" rx="6" fill="#121814"/>
        <!-- Abstract digit matrix lines -->
        <g fill="#FFB020" opacity="0.75">
          <rect x="860" y="480" width="160" height="30" rx="3"/>
          <rect x="1060" y="480" width="160" height="30" rx="3"/>
          <rect x="1260" y="480" width="160" height="30" rx="3"/>
          <rect x="1460" y="480" width="230" height="30" rx="3"/>

          <rect x="860" y="530" width="110" height="30" rx="3" fill="#E9E4D4" opacity="0.9"/>
          <rect x="1060" y="530" width="110" height="30" rx="3" fill="#E9E4D4" opacity="0.9"/>
          <rect x="1260" y="530" width="110" height="30" rx="3" fill="#E9E4D4" opacity="0.9"/>
          <rect x="1460" y="530" width="180" height="30" rx="3" fill="#E9E4D4" opacity="0.9"/>

          <rect x="860" y="580" width="140" height="30" rx="3"/>
          <rect x="1060" y="580" width="140" height="30" rx="3"/>
          <rect x="1260" y="580" width="140" height="30" rx="3"/>
          <rect x="1460" y="580" width="210" height="30" rx="3"/>

          <rect x="860" y="630" width="190" height="30" rx="3"/>
          <rect x="1100" y="630" width="190" height="30" rx="3"/>
          <rect x="1340" y="630" width="190" height="30" rx="3"/>
        </g>

        <!-- Lower status bar -->
        <rect x="830" y="720" width="900" height="120" rx="6" fill="#18130B"/>
        <rect x="860" y="750" width="280" height="60" rx="4" fill="#B3261E"/>
        <rect x="1170" y="750" width="530" height="60" rx="4" fill="#FFB020" opacity="0.9"/>

        <!-- Floodlight beams slicing through haze behind board -->
        <polygon points="300,100 800,500 1300,1200" fill="#F4F1E6" opacity="0.1"/>
        <polygon points="2200,100 1700,500 1200,1200" fill="#F4F1E6" opacity="0.1"/>
      </svg>
    `,
  },
  {
    name: '04-stands',
    title: 'THE EMPTY STANDS',
    desc: 'Tiered sweeps in dark green and willow under the floodlights',
    svg: `
      <svg width="2560" height="1440" viewBox="0 0 2560 1440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#081018"/>
            <stop offset="100%" stop-color="#1B2A3A"/>
          </linearGradient>
          <linearGradient id="tierGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#182A20"/>
            <stop offset="100%" stop-color="#0A140F"/>
          </linearGradient>
        </defs>
        <!-- Sky -->
        <rect width="2560" height="650" fill="url(#sky)"/>

        <!-- Floodlight towers -->
        <circle cx="480" cy="180" r="24" fill="#F4F1E6"/>
        <polygon points="480,180 200,1440 1800,1440" fill="#F4F1E6" opacity="0.12"/>

        <!-- Tiered Stands curving across the frame -->
        <!-- Tier 3 (Upper) -->
        <path d="M0,450 Q1280,380 2560,450 L2560,650 Q1280,590 0,650 Z" fill="#0C1711"/>
        <!-- Tier 3 seats lines -->
        <path d="M0,520 Q1280,460 2560,520" stroke="#1C3024" stroke-width="14" fill="none"/>
        <path d="M0,560 Q1280,500 2560,560" stroke="#16291E" stroke-width="14" fill="none"/>
        <path d="M0,600 Q1280,540 2560,600" stroke="#1C3024" stroke-width="14" fill="none"/>

        <!-- Tier 2 (Middle) -->
        <path d="M0,640 Q1280,580 2560,640 L2560,950 Q1280,900 0,950 Z" fill="#102017"/>
        <path d="M0,710 Q1280,660 2560,710" stroke="#D9B98A" stroke-width="10" stroke-opacity="0.4" fill="none"/>
        <path d="M0,760 Q1280,710 2560,760" stroke="#1C3828" stroke-width="16" fill="none"/>
        <path d="M0,820 Q1280,770 2560,820" stroke="#172E21" stroke-width="16" fill="none"/>
        <path d="M0,880 Q1280,830 2560,880" stroke="#1C3828" stroke-width="16" fill="none"/>

        <!-- Tier 1 (Lower) -->
        <path d="M0,940 Q1280,890 2560,940 L2560,1260 Q1280,1230 0,1260 Z" fill="url(#tierGrad)"/>
        <path d="M0,1010 Q1280,970 2560,1010" stroke="#D9B98A" stroke-width="8" stroke-opacity="0.35" fill="none"/>
        <path d="M0,1070 Q1280,1030 2560,1070" stroke="#1F3E2C" stroke-width="18" fill="none"/>
        <path d="M0,1140 Q1280,1100 2560,1140" stroke="#1A3425" stroke-width="18" fill="none"/>
        <path d="M0,1210 Q1280,1170 2560,1210" stroke="#1F3E2C" stroke-width="18" fill="none"/>

        <!-- Outfield foreground -->
        <rect y="1250" width="2560" height="190" fill="#0E1F17"/>
        <ellipse cx="1280" cy="1440" rx="1500" ry="220" fill="#132B1E"/>
      </svg>
    `,
  },
  {
    name: '05-pavilion',
    title: 'THE MEMBERS PAVILION',
    desc: 'Old timber balcony, warm brass interior light & cherry rope',
    svg: `
      <svg width="2560" height="1440" viewBox="0 0 2560 1440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#080F16"/>
            <stop offset="100%" stop-color="#1B2A3A"/>
          </linearGradient>
          <radialGradient id="interiorWarmth" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stop-color="#D9B98A" stop-opacity="0.9"/>
            <stop offset="60%" stop-color="#B08D59" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#000" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Sky -->
        <rect width="2560" height="480" fill="url(#sky)"/>

        <!-- Pavilion Building (Classic colonial / Victorian cricket clubhouse) -->
        <!-- Roof pediment & clock tower -->
        <polygon points="1280,140 1840,360 720,360" fill="#142118" stroke="#D9B98A" stroke-width="6" stroke-opacity="0.5"/>
        <circle cx="1280" cy="280" r="32" fill="#E9E4D4" stroke="#D9B98A" stroke-width="4"/>
        <line x1="1280" y1="280" x2="1280" y2="260" stroke="#142118" stroke-width="3"/>
        <line x1="1280" y1="280" x2="1295" y2="280" stroke="#142118" stroke-width="3"/>

        <!-- Upper Balcony (Timber architecture) -->
        <rect x="640" y="360" width="1280" height="340" fill="#1C2E22" stroke="#D9B98A" stroke-width="6"/>
        <!-- Warm glowing interior windows behind balcony -->
        <g fill="#D9B98A" opacity="0.7">
          <rect x="720" y="400" width="160" height="240" rx="8"/>
          <rect x="960" y="400" width="160" height="240" rx="8"/>
          <rect x="1200" y="400" width="160" height="240" rx="8"/>
          <rect x="1440" y="400" width="160" height="240" rx="8"/>
          <rect x="1680" y="400" width="160" height="240" rx="8"/>
        </g>
        <!-- Balcony timber railings -->
        <rect x="620" y="620" width="1320" height="24" fill="#D9B98A"/>
        <g stroke="#D9B98A" stroke-width="4" opacity="0.8">
          ${Array.from({ length: 44 }, (_, i) => `<line x1="${640 + i * 30}" y1="644" x2="${640 + i * 30}" y2="700" />`).join('')}
        </g>
        <rect x="620" y="700" width="1320" height="18" fill="#B08D59"/>

        <!-- Ground floor columns & entrance -->
        <rect x="640" y="718" width="1280" height="420" fill="#132219"/>
        <!-- Brick / stone pilasters -->
        <rect x="740" y="718" width="50" height="420" fill="#1F3426"/>
        <rect x="990" y="718" width="50" height="420" fill="#1F3426"/>
        <rect x="1255" y="718" width="50" height="420" fill="#1F3426"/>
        <rect x="1520" y="718" width="50" height="420" fill="#1F3426"/>
        <rect x="1770" y="718" width="50" height="420" fill="#1F3426"/>

        <!-- Double timber doors in centre third -->
        <rect x="1200" y="860" width="160" height="278" rx="8" fill="#0A120D" stroke="#D9B98A" stroke-width="4"/>

        <!-- Outfield turf -->
        <rect y="1138" width="2560" height="302" fill="#0E1F17"/>
        <ellipse cx="1280" cy="1300" rx="1400" ry="240" fill="#143021"/>

        <!-- Foreground Cherry-Red Boundary Rope -->
        <path d="M-100,1360 Q1280,1260 2660,1360" stroke="#B3261E" stroke-width="26" fill="none"/>
        <path d="M-100,1362 Q1280,1262 2660,1362" stroke="#E9E4D4" stroke-width="4" stroke-dasharray="16 28" fill="none" opacity="0.7"/>
      </svg>
    `,
  },
  {
    name: '06-boundary',
    title: 'THE BOUNDARY ROPE',
    desc: 'The ground opened wide · Dusk turned to match night',
    svg: `
      <svg width="2560" height="1440" viewBox="0 0 2560 1440" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#04080D"/>
            <stop offset="70%" stop-color="#142230"/>
            <stop offset="100%" stop-color="#1B2A3A"/>
          </linearGradient>
          <radialGradient id="beamL" cx="15%" cy="15%" r="60%">
            <stop offset="0%" stop-color="#F4F1E6" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#0E1F17" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="beamR" cx="85%" cy="15%" r="60%">
            <stop offset="0%" stop-color="#F4F1E6" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#0E1F17" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Deep night sky -->
        <rect width="2560" height="720" fill="url(#sky)"/>

        <!-- 4 Towering Floodlight Mast Gantry Beams -->
        <circle cx="260" cy="140" r="28" fill="#F4F1E6"/>
        <circle cx="680" cy="180" r="22" fill="#F4F1E6"/>
        <circle cx="1880" cy="180" r="22" fill="#F4F1E6"/>
        <circle cx="2300" cy="140" r="28" fill="#F4F1E6"/>

        <polygon points="260,140 100,1440 1100,1440" fill="#F4F1E6" opacity="0.1"/>
        <polygon points="2300,140 2460,1440 1460,1440" fill="#F4F1E6" opacity="0.1"/>

        <!-- Distant stadium bowl perimeter -->
        <path d="M0,660 Q1280,560 2560,660 L2560,840 Q1280,780 0,840 Z" fill="#0C1811"/>
        <path d="M0,720 Q1280,630 2560,720" stroke="#FFB020" stroke-width="4" stroke-opacity="0.3" fill="none"/>

        <!-- The vast outfield -->
        <rect y="820" width="2560" height="620" fill="#0E1F17"/>
        <ellipse cx="1280" cy="1150" rx="1600" ry="450" fill="#143122"/>

        <!-- Distant pitch in the centre -->
        <polygon points="1255,870 1305,870 1335,970 1225,970" fill="#D9B98A" opacity="0.7"/>

        <!-- Prominent Low-Angle Cherry-Red Boundary Rope in Foreground -->
        <path d="M-100,1260 Q1280,1080 2660,1260" stroke="#7A1813" stroke-width="36" fill="none"/>
        <path d="M-100,1250 Q1280,1070 2660,1250" stroke="#B3261E" stroke-width="32" fill="none"/>
        <path d="M-100,1248 Q1280,1068 2660,1248" stroke="#E9E4D4" stroke-width="6" stroke-dasharray="20 34" fill="none" opacity="0.85"/>
      </svg>
    `,
  },
];

for (const kf of keyframes) {
  const buf = Buffer.from(kf.svg.trim());
  await sharp(buf).jpeg({ quality: 92 }).toFile(`src/assets/keyframes/${kf.name}.jpg`);
  console.log(`Exported src/assets/keyframes/${kf.name}.jpg (2560x1440)`);
}
