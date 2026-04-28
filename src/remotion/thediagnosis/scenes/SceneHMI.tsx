import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { interFont } from "../constants";

export const SCENE_HMI_DURATION = 180;

// ─── Timeline ────────────────────────────────────────────────────────────────
const T_HEADER      = 3;
const T_MACHINE     = 8;
const T_LABEL_START = 22;
const T_LABEL_STAG  = 4;
const T_PANEL_START = 46;
const T_PANEL_STAG  = 5;
const T_VALUES      = T_PANEL_START + 3 * T_PANEL_STAG + 10;
const T_ALARM_START = 72;
const T_ALARM_STAG  = 3;
const T_BTNS        = 86;

// ─── Colors (matched to new reference) ───────────────────────────────────────
const BG           = "#0f1a27";       // deep navy base
const BG_MACHINE   = "#111d2d";       // machine area
const BG_PANEL     = "#111d2d";       // bottom panels
const BORDER       = "#25394e";       // panel borders (subtle)
const BORDER_LT    = "#34506b";       // light accent border
const INPUT_BG     = "#0a1420";       // input field bg
const INPUT_BORDER = "#2d4660";       // input field border
const GREEN_VAL    = "#3fcc4f";
const GREEN_BTN    = "#3bbf43";
const RED_ERR      = "#e05532";
const RED_DOT      = "#ff5a28";
const GRAY_BTN     = "#45586d";
const WHITE        = "#ffffff";
const TEXT_GRAY    = "#b8c5d2";
const TEXT_DIM     = "#7a8a9a";
const TEXT_FAINT   = "#536474";

// ─── Machine labels (new reference positions) ────────────────────────────────
const LABELS = [
  { id: "F8",  left: "12%",  top: "23%", ok: true  },
  { id: "E9",  left: "4%",   top: "62%", ok: true  },
  { id: "E6",  left: "30%",  top: "56%", ok: true  },
  { id: "CFN", left: "40%",  top: "17%", ok: true  },
  { id: "C3",  left: "45%",  top: "17%", ok: false },
  { id: "C0",  left: "57%",  top: "12%", ok: true  },
  { id: "A5",  left: "83%",  top: "22%", ok: true  },
];

const ALARMS = [
  "ALARM130C6905 - 00C9000S86",
  "ALARM10008S4 - 0000SI0589",
  "ALARME2 SC81 - 00131009",
  "ALARM1600S92 - 001S00528",
  "ALARME3 SOR1 - 000S9C039",
  "ALARMEI200S6212 - 000S805812",
  "ALARME3 SOR1 - 0009300S81",
  "ALARM1900S01 - 0008S0031",
];

// ─── Machine SVG (detailed extruder) ─────────────────────────────────────────
const MachineSVG: React.FC = () => {
  return (
    <svg
      viewBox="0 0 1920 530"
      style={{ width: "100%", height: "100%", display: "block" }}
      fill="none"
    >
      <defs>
        <linearGradient id="steel2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d0dce5" />
          <stop offset="0.45" stopColor="#90a6b7" />
          <stop offset="1" stopColor="#4d6676" />
        </linearGradient>
        <linearGradient id="steelDark2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#667c8c" />
          <stop offset="1" stopColor="#29384a" />
        </linearGradient>
        <linearGradient id="hopper2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b0c0cc" />
          <stop offset="1" stopColor="#5a7080" />
        </linearGradient>
        <linearGradient id="barrel2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8296a6" />
          <stop offset="0.3" stopColor="#c5d0da" />
          <stop offset="0.55" stopColor="#7a8e9d" />
          <stop offset="1" stopColor="#3f5363" />
        </linearGradient>
        <linearGradient id="cabinet2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5f72" />
          <stop offset="0.5" stopColor="#2b3c4e" />
          <stop offset="1" stopColor="#15222e" />
        </linearGradient>
        <linearGradient id="gear2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#525c6a" />
          <stop offset="0.5" stopColor="#6d7e8a" />
          <stop offset="1" stopColor="#2c3642" />
        </linearGradient>
        <radialGradient id="drum2" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#adbdcb" />
          <stop offset="0.7" stopColor="#667a88" />
          <stop offset="1" stopColor="#2f3f4c" />
        </radialGradient>
      </defs>

      {/* bg */}
      <rect width={1920} height={530} fill="#111d2d" />

      {/* horizontal pipe (crossing top) */}
      <rect x={700} y={18}  width={1200} height={20} rx={10} fill="url(#steelDark2)" />
      <rect x={700} y={22}  width={1200} height={4}  rx={2}  fill="#b0c0cc" opacity={0.55} />
      <rect x={700} y={34}  width={1200} height={3}  fill="rgba(0,0,0,0.35)" />

      {/* ───── LEFT: UPPER HOPPER + INCLINED CONVEYOR ───── */}
      <polygon points="58,30 212,30 198,144 74,144" fill="url(#hopper2)" />
      <polygon points="58,30 212,30 205,42 65,42"   fill="#c5d0da" />
      <line    x1={58} y1={30} x2={212} y2={30}     stroke="#d0dce5" strokeWidth={2.5}/>
      <polygon points="58,30 96,30 78,144 74,144"   fill="rgba(0,0,0,0.15)" />
      {[70,90,110,130,150,170,190].map((x,i)=>(
        <circle key={i} cx={x} cy={34} r={1.5} fill="#2b3c4e" />
      ))}
      <rect x={116} y={140} width={42} height={56}  fill="url(#steelDark2)" />
      <rect x={122} y={140} width={30} height={8}   fill="#b0c0cc" />

      <g transform="rotate(-30 145 380)">
        <rect x={120} y={30}  width={26} height={360} rx={5} fill="#4d6676" />
        {[60, 110, 160, 210, 260, 310].map((y,i)=>(
          <line key={i} x1={120} y1={y} x2={146} y2={y+40}
                stroke="#2b3c4e" strokeWidth={2} opacity={0.6} />
        ))}
        <rect x={124} y={30}  width={18} height={360} rx={3} fill="#3a5063" />
        <rect x={126} y={34}  width={14} height={356} rx={2} fill="#1a2938" />
        <rect x={129} y={34}  width={8}  height={356} fill="#2a3a4a" />
        <ellipse cx={133} cy={36}  rx={22} ry={14} fill="url(#drum2)" />
        <ellipse cx={133} cy={388} rx={22} ry={14} fill="url(#drum2)" />
        <ellipse cx={133} cy={36}  rx={12} ry={8}  fill="#2b3c4e" />
        <ellipse cx={133} cy={388} rx={12} ry={8}  fill="#2b3c4e" />
      </g>
      <rect x={44}  y={270} width={16} height={220} rx={3} fill="#4d6676" />
      <rect x={46}  y={270} width={5}  height={220} fill="#2b3c4e" />
      <rect x={104} y={240} width={16} height={250} rx={3} fill="#4d6676" />
      <rect x={106} y={240} width={5}  height={250} fill="#2b3c4e" />
      <rect x={40}  y={488} width={28} height={6} fill="#3a4c5e" />
      <rect x={100} y={488} width={28} height={6} fill="#3a4c5e" />

      {/* ───── GROUND WEIGHING BIN ───── */}
      <rect x={24}  y={302} width={156} height={148} rx={4} fill="url(#cabinet2)" />
      <polygon points="24,302 180,302 166,276 38,276" fill="#485b6d" />
      <rect x={32}  y={310} width={140} height={10} fill="#90a6b7" />
      <rect x={32}  y={326} width={140} height={5}  fill="#c5d0da" opacity={0.35} />
      <rect x={38}  y={342} width={128} height={90} rx={3} fill="rgba(0,0,0,0.2)" />
      <rect x={44}  y={350} width={42}  height={22} rx={2} fill="#1e3048" />
      <rect x={90}  y={350} width={42}  height={22} rx={2} fill="#1e3048" />
      <circle cx={150} cy={362} r={4} fill="#3fcc4f" />
      <rect x={28}  y={448} width={14} height={50}  fill="#4d6676" />
      <rect x={162} y={448} width={14} height={50}  fill="#4d6676" />
      <rect x={10}  y={450} width={176} height={26} rx={6} fill="#3a5063" />
      <ellipse cx={18}  cy={463} rx={16} ry={16} fill="url(#drum2)" />
      <ellipse cx={178} cy={463} rx={16} ry={16} fill="url(#drum2)" />
      <rect x={18}  y={452} width={160} height={10} fill="#1a2938" />
      <rect x={18}  y={466} width={160} height={7}  fill="#2b3c4e" />

      {/* ───── SECOND DOSING HOPPER ───── */}
      <polygon points="294,90 402,90 384,206 312,206" fill="url(#hopper2)" />
      <polygon points="294,90 402,90 396,102 302,102" fill="#c5d0da" />
      <line    x1={294} y1={90} x2={402} y2={90}    stroke="#d0dce5" strokeWidth={2}/>
      <polygon points="294,90 322,90 310,206 312,206" fill="rgba(0,0,0,0.2)" />
      <rect x={325} y={204} width={36} height={60}   fill="url(#steelDark2)" />
      <rect x={330} y={204} width={26} height={7}    fill="#b0c0cc" />
      <rect x={298} y={262} width={10} height={230}  fill="#4d6676" />
      <rect x={378} y={262} width={10} height={230}  fill="#4d6676" />

      {/* ───── MAIN FEED HOPPER ───── */}
      <polygon points="640,26 824,26 804,188 660,188" fill="url(#hopper2)" />
      <polygon points="640,26 824,26 816,40  648,40"  fill="#c5d0da" />
      <line    x1={640} y1={26} x2={824} y2={26}    stroke="#d0dce5" strokeWidth={3} />
      <polygon points="640,26 688,26 668,188 660,188" fill="rgba(0,0,0,0.2)" />
      {[652,676,700,724,748,772,796,820].map((x,i)=>(
        <circle key={i} cx={x} cy={32} r={2} fill="#2b3c4e" />
      ))}
      <rect x={668} y={186} width={96} height={72} fill="url(#steelDark2)" />
      <rect x={672} y={186} width={88} height={12} fill="#c5d0da" />
      <rect x={672} y={252} width={88} height={6}  fill="#2b3c4e" />

      {/* ───── MAIN EXTRUDER BARREL ───── */}
      <rect x={388} y={252} width={796} height={116} rx={18} fill="url(#barrel2)" />
      <rect x={394} y={258} width={784} height={18}  rx={6}  fill="#d8e2ea" opacity={0.75} />
      <rect x={394} y={346} width={784} height={16}  rx={6}  fill="#1e2c38" opacity={0.8} />

      {[436,506,576,646,716,786,856,926,996,1066,1136].map((x, i) => (
        <g key={i}>
          <rect x={x}    y={250} width={16} height={120} rx={3} fill="#4d6676" />
          <rect x={x+2}  y={254} width={12} height={3}   rx={1} fill={i % 4 === 1 ? "#cc4a15" : "#90a6b7"} />
          <rect x={x+2}  y={362} width={12} height={3}   rx={1} fill="#1a2938" />
          <rect x={x+1}  y={260} width={2}  height={100} fill="#b0c0cc" opacity={0.6} />
        </g>
      ))}

      <rect x={378} y={248} width={16} height={124} rx={3} fill="url(#steelDark2)" />
      <rect x={380} y={250} width={3}  height={120} fill="#1a2938" />

      <polygon points="1184,260 1252,290 1184,358" fill="url(#steel2)" />
      <polygon points="1184,270 1220,290 1184,348" fill="#3a5060" />
      <rect    x={1184} y={276} width={4}  height={70} fill="#1a2938" />

      <rect x={388} y={370} width={796} height={30} rx={4} fill="#4d6676" />
      <rect x={388} y={400} width={796} height={10} rx={2} fill="#2b3c4e" />
      {[400,540,700,860,1020,1160].map((x,i)=>(
        <g key={i}>
          <rect x={x}    y={410} width={18} height={80} rx={3} fill="#4d6676" />
          <rect x={x+2}  y={410} width={6}  height={80} fill="#2b3c4e" />
          <rect x={x-4}  y={488} width={26} height={6}  fill="#3a4c5e" />
        </g>
      ))}

      {/* ───── DRIVE UNIT ───── */}
      <rect x={1118} y={218} width={178} height={160} rx={12} fill="url(#cabinet2)" />
      <rect x={1126} y={226} width={162} height={60}  rx={7}  fill="#1e3246" />
      <rect x={1130} y={232} width={154} height={16}  rx={3}  fill="#3a5063" />
      {[1140,1170,1200,1230,1260,1290].map((x,i)=>(
        <circle key={i} cx={x} cy={230} r={3} fill="#1a2938" />
      ))}

      <circle cx={1174} cy={332} r={42} fill="url(#gear2)" stroke="#2b3c4e" strokeWidth={3} />
      <circle cx={1174} cy={332} r={30} fill="#3a5063" stroke="#667c8c" strokeWidth={2.5} />
      <circle cx={1174} cy={332} r={10} fill="#90a6b7" />
      <circle cx={1174} cy={332} r={4}  fill="#2b3c4e" />
      {Array.from({length:18},(_,i)=>(
        <rect key={i} x={1174 - 3} y={332 - 46} width={6} height={10} fill="#4d6676"
          transform={`rotate(${i * 20} 1174 332)`} />
      ))}

      <circle cx={1234} cy={318} r={30} fill="url(#gear2)" stroke="#2b3c4e" strokeWidth={3} />
      <circle cx={1234} cy={318} r={20} fill="#3a5063" stroke="#667c8c" strokeWidth={2} />
      <circle cx={1234} cy={318} r={6}  fill="#90a6b7" />
      {Array.from({length:14},(_,i)=>(
        <rect key={i} x={1234 - 2.5} y={318 - 34} width={5} height={8} fill="#4d6676"
          transform={`rotate(${i * 25.7} 1234 318)`} />
      ))}

      <circle cx={1198} cy={400} r={20} fill="url(#gear2)" stroke="#2b3c4e" strokeWidth={2.5} />
      <circle cx={1198} cy={400} r={12} fill="#3a5063" stroke="#667c8c" strokeWidth={1.5} />
      <circle cx={1198} cy={400} r={4}  fill="#90a6b7" />

      <path d="M 1170 290 L 1180 210 L 1260 205 L 1250 295 Z"
            fill="none" stroke="#1a2938" strokeWidth={6} />
      <path d="M 1174 290 L 1184 215 L 1256 210 L 1246 293 Z"
            fill="none" stroke="#3a4c5e" strokeWidth={2} />

      <ellipse cx={1224} cy={192} rx={58} ry={22} fill="url(#steelDark2)" stroke="#1a2938" strokeWidth={2}/>
      <ellipse cx={1224} cy={192} rx={42} ry={14} fill="#4d6676" />
      <ellipse cx={1224} cy={188} rx={42} ry={3}  fill="#b0c0cc" opacity={0.6} />
      <circle  cx={1224} cy={192} r={7}  fill="#1a2938" />

      <rect x={1252} y={350} width={98} height={68} rx={6} fill="url(#cabinet2)" />
      <rect x={1258} y={356} width={86} height={24} rx={4} fill="#4d6676" />
      <rect x={1258} y={384} width={86} height={4}  fill="#1a2938" />
      <rect x={1258} y={390} width={86} height={4}  fill="#1a2938" />
      <rect x={1258} y={396} width={86} height={4}  fill="#1a2938" />
      <circle cx={1342} cy={380} r={22} fill="url(#gear2)" stroke="#2b3c4e" strokeWidth={2.5} />
      <circle cx={1342} cy={380} r={14} fill="#3a5063" />
      <circle cx={1342} cy={380} r={5}  fill="#90a6b7" />
      {Array.from({length:6},(_,i)=>(
        <line key={i} x1={1342} y1={380}
          x2={1342 + 18*Math.cos(i*60*Math.PI/180)}
          y2={380 + 18*Math.sin(i*60*Math.PI/180)}
          stroke="#2b3c4e" strokeWidth={2} />
      ))}

      {/* ───── CONTROL PANEL / CABINET ───── */}
      <rect x={1356} y={158} width={158} height={338} rx={8}  fill="url(#cabinet2)" stroke="#667c8c" strokeWidth={1.5}/>
      <rect x={1365} y={167} width={140} height={320} rx={5}  fill="#15222e" />

      {/* MACCO screen panel */}
      <rect x={1372} y={178} width={126} height={74} rx={3} fill="#0a1828" stroke="#3a5063" strokeWidth={1}/>
      <rect x={1376} y={182} width={118} height={52} rx={2} fill="#1a3a5a" />
      <text x={1435} y={215} fill="#8aafd0" fontSize="18" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">MACCO</text>

      {/* LED row */}
      {[1382, 1398, 1414, 1430, 1446, 1462, 1478, 1494].map((x,i)=>(
        <circle key={i} cx={x} cy={243} r={3.5} fill={i===2?"#e05532":i===5?"#ffaa00":"#3fcc4f"} />
      ))}

      {/* Circuit breakers grid */}
      <rect x={1372} y={258} width={126} height={76}  rx={3}  fill="#0d1a26" stroke="#3a5063" strokeWidth={1}/>
      {[0,1,2].map(row=>(
        [0,1,2,3,4,5].map(col=>(
          <rect key={`${row}-${col}`} x={1378+col*18} y={266+row*22} width={14} height={16} rx={1}
                fill={(row+col)%3 === 0 ? "#667c8c" : "#3a5063"} />
        ))
      ))}

      {/* Control buttons row */}
      <rect x={1372} y={342} width={126} height={34} rx={3} fill="#0d1a26" stroke="#3a5063" strokeWidth={1}/>
      <circle cx={1384} cy={359} r={8} fill="#e05532" stroke="#90a6b7" strokeWidth={1.5}/>
      <circle cx={1384} cy={359} r={4} fill="#ff8a5f" />
      <circle cx={1406} cy={359} r={8} fill="#e05532" stroke="#90a6b7" strokeWidth={1.5}/>
      <circle cx={1406} cy={359} r={4} fill="#ff8a5f" />
      <circle cx={1428} cy={359} r={8} fill="#3fcc4f" stroke="#90a6b7" strokeWidth={1.5}/>
      <circle cx={1428} cy={359} r={4} fill="#8ae695" />
      <rect x={1442} y={353} width={16} height={12} rx={1} fill="#90a6b7" />
      <rect x={1464} y={353} width={16} height={12} rx={1} fill="#3a5063" />

      {/* Wire bundle */}
      <rect x={1372} y={384} width={126} height={92} rx={3} fill="rgba(0,0,0,0.5)" />
      {Array.from({length:9},(_,i)=>(
        <line key={i}
          x1={1378 + i*14} y1={384} x2={1378 + i*14} y2={476}
          stroke={i%3===0 ? "#3060a0" : i%3===1 ? "#a05020" : "#3fcc4f"}
          strokeWidth={2} opacity={0.75}/>
      ))}

      {/* Light tower */}
      <rect x={1420} y={108} width={20} height={52}  rx={3} fill="#4d6676" />
      <rect x={1422} y={110} width={6}  height={48}  fill="#1a2938" />
      <circle cx={1430} cy={116} r={9} fill="#e02020" />
      <circle cx={1430} cy={116} r={4} fill="#ff6060" opacity={0.85} />
      <circle cx={1430} cy={134} r={9} fill="#ffaa00" />
      <circle cx={1430} cy={134} r={4} fill="#ffd060" opacity={0.85} />
      <circle cx={1430} cy={152} r={9} fill="#3fcc4f" />
      <circle cx={1430} cy={152} r={4} fill="#8ae695" opacity={0.85} />

      {/* Red safety button */}
      <circle cx={1530} cy={290} r={12} fill="#3a5063" stroke="#90a6b7" strokeWidth={2}/>
      <circle cx={1530} cy={290} r={8}  fill="#e02020" />
      <circle cx={1530} cy={290} r={4}  fill="#ff6060" opacity={0.7} />

      {/* ───── OUTPUT INCLINED CONVEYOR ───── */}
      <g transform="rotate(28 1660 385)">
        <rect x={1642} y={30}  width={26} height={365} rx={5} fill="#4d6676" />
        {[70, 120, 170, 220, 270, 320, 370].map((y,i)=>(
          <line key={i} x1={1642} y1={y} x2={1668} y2={y+40}
                stroke="#2b3c4e" strokeWidth={2} opacity={0.6} />
        ))}
        <rect x={1646} y={30}  width={18} height={365} rx={3} fill="#3a5063" />
        <rect x={1648} y={34}  width={14} height={361} rx={2} fill="#1a2938" />
        <rect x={1651} y={34}  width={8}  height={361} fill="#2a3a4a" />
        <ellipse cx={1655} cy={36}  rx={22} ry={14} fill="url(#drum2)" />
        <ellipse cx={1655} cy={392} rx={22} ry={14} fill="url(#drum2)" />
        <ellipse cx={1655} cy={36}  rx={12} ry={8}  fill="#2b3c4e" />
        <ellipse cx={1655} cy={392} rx={12} ry={8}  fill="#2b3c4e" />
      </g>
      <rect x={1686} y={268} width={16} height={220} rx={3} fill="#4d6676" />
      <rect x={1688} y={268} width={5}  height={220} fill="#2b3c4e" />
      <rect x={1680} y={488} width={30} height={6} fill="#3a4c5e" />

      {/* ───── RIGHT COLLECTION HOPPER ───── */}
      <polygon points="1620,30 1902,30 1884,164 1644,164" fill="url(#hopper2)" />
      <polygon points="1620,30 1902,30 1894,42  1628,42"  fill="#c5d0da" />
      <line    x1={1620} y1={30} x2={1902} y2={30}         stroke="#d0dce5" strokeWidth={3}/>
      <polygon points="1620,30 1666,30 1648,164 1644,164"  fill="rgba(0,0,0,0.2)" />
      {[1630,1660,1690,1720,1750,1780,1810,1840,1870].map((x,i)=>(
        <circle key={i} cx={x} cy={36} r={2} fill="#2b3c4e" />
      ))}
      <rect x={1684} y={162} width={100} height={60} fill="url(#steelDark2)" />
      <rect x={1690} y={162} width={88}  height={12} fill="#c5d0da" />
      <rect x={1690} y={218} width={88}  height={5}  fill="#2b3c4e" />

      {/* ───── GROUND SHADOW ───── */}
      <rect x={0} y={494} width={1920} height={36} fill="rgba(0,0,0,0.5)" />
      <line x1={0} y1={494} x2={1920} y2={494} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
    </svg>
  );
};

// ─── RPM Gauge ────────────────────────────────────────────────────────────────
const RPMGauge: React.FC<{
  target: number; max: number;
  frame: number; startF: number; fps: number;
}> = ({ target, max, frame, startF, fps }) => {
  const prog = spring({ frame: frame - startF, fps,
    config: { damping: 100, stiffness: 50, mass: 1.3 } });
  const cur = target * prog;
  const angle = interpolate(cur, [0, max], [-135, 135]);
  const toRad = (d: number) => (d * Math.PI) / 180;
  const cx = 65, cy = 68, r = 50;
  const sx = cx + r * Math.sin(toRad(-135));
  const sy = cy - r * Math.cos(toRad(-135));
  const ex = cx + r * Math.sin(toRad(135));
  const ey = cy - r * Math.cos(toRad(135));
  const nx = cx + (r - 6) * Math.sin(toRad(angle));
  const ny = cy - (r - 6) * Math.cos(toRad(angle));
  const valEndX = cx + r * Math.sin(toRad(angle));
  const valEndY = cy - r * Math.cos(toRad(angle));

  return (
    <svg width={130} height={110} viewBox="0 0 130 110">
      <circle cx={cx} cy={cy} r={r + 6} fill="#0a1420" stroke={BORDER_LT} strokeWidth={1.5} />
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey}`}
            stroke="rgba(255,255,255,0.10)" strokeWidth={8} fill="none" strokeLinecap="round"/>
      {Array.from({length:11},(_,i)=>{
        const tA = -135 + i * 27;
        const tRad = toRad(tA);
        const isMajor = i % 2 === 0;
        const r1 = isMajor ? r - 10 : r - 6;
        const r2 = r - 2;
        return (
          <line key={i}
            x1={cx + r1*Math.sin(tRad)} y1={cy - r1*Math.cos(tRad)}
            x2={cx + r2*Math.sin(tRad)} y2={cy - r2*Math.cos(tRad)}
            stroke={isMajor ? WHITE : TEXT_DIM} strokeWidth={isMajor ? 2 : 1} />
        );
      })}
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 ${angle > -45 ? 1 : 0} 1 ${valEndX} ${valEndY}`}
            stroke={GREEN_VAL} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.9}/>
      <line x1={cx} y1={cy} x2={nx} y2={ny}
            stroke={WHITE} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={7} fill="#1a3350" stroke={BORDER_LT} strokeWidth={1.5}/>
      <circle cx={cx} cy={cy} r={3} fill={WHITE}/>
    </svg>
  );
};

// ─── Bar Chart ────────────────────────────────────────────────────────────────
const BarChart: React.FC<{
  pct: number; maxLabel: string; color: string;
  frame: number; startF: number; fps: number;
}> = ({ pct, maxLabel, color, frame, startF, fps }) => {
  const s = spring({ frame: frame - startF, fps,
    config: { damping: 120, stiffness: 60, mass: 1.0 } });
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end",
        justifyContent: "space-between", height: 120, fontSize: 14, color: TEXT_GRAY, paddingRight: 3 }}>
        <span>{maxLabel}</span>
        <span>{parseInt(maxLabel) / 2}</span>
        <span>0</span>
      </div>
      <div style={{ width: 44, height: 120, background: "#0a1420",
        border: `1px solid ${BORDER}`, borderRadius: 2, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1,
          background: "rgba(255,255,255,0.08)" }}/>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
          height: `${pct * s}%`, background: color }}/>
      </div>
    </div>
  );
};

// ─── Input field (clean minimal style) ───────────────────────────────────────
const InputField: React.FC<{
  value: string;
  color?: string;
  size?: number;
  suffix?: string;
  align?: "left" | "center" | "right";
}> = ({ value, color = GREEN_VAL, size = 28, suffix, align = "right" }) => (
  <div style={{ background: INPUT_BG, border: `1px solid ${INPUT_BORDER}`,
    borderRadius: 4, padding: "6px 14px",
    display: "flex", alignItems: "center",
    justifyContent: align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start",
    fontFamily: "monospace", fontWeight: 700, fontSize: size, color,
    letterSpacing: 0.5, minHeight: size + 12, gap: 6 }}>
    {value}
    {suffix && <span style={{ fontSize: size * 0.55, color: TEXT_GRAY, fontWeight: 500 }}>{suffix}</span>}
  </div>
);

// ─── Icon button (clean) ─────────────────────────────────────────────────────
const IconButton: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <div style={{ background: "#182a3c", border: `1px solid ${INPUT_BORDER}`,
    borderRadius: 4, padding: "8px 0", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 18, color: TEXT_GRAY, flex: 1, minHeight: 36 }}>
    {icon}
  </div>
);

// ─── Panel (clean style, no blue bar) ────────────────────────────────────────
const DataPanel: React.FC<{
  title: string;
  children: React.ReactNode;
  s: number;
  flex?: number | string;
}> = ({ title, children, s, flex = 1 }) => (
  <div style={{ flex, background: BG_PANEL, border: `1px solid ${BORDER}`,
    borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column",
    opacity: s, transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)` }}>
    <div style={{
      padding: "14px 0 10px",
      fontSize: 22, fontWeight: 700, color: WHITE,
      letterSpacing: 2.5, textAlign: "center",
      borderBottom: `1px solid ${BORDER}`,
    }}>
      {title}
    </div>
    <div style={{ flex: 1, padding: "16px 18px" }}>{children}</div>
  </div>
);

// ─── Main scene ──────────────────────────────────────────────────────────────
export const SceneHMI: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = (startF: number) =>
    spring({ frame: frame - startF, fps,
      config: { damping: 180, stiffness: 120, mass: 0.7 } });

  const hS = sp(T_HEADER);
  const mS = sp(T_MACHINE);
  const lS = LABELS.map((_, i) => sp(T_LABEL_START + i * T_LABEL_STAG));
  const pS = [0, 1, 2, 3, 4].map((i) => sp(T_PANEL_START + i * T_PANEL_STAG));
  const vS = sp(T_VALUES);
  const aS = ALARMS.map((_, i) => sp(T_ALARM_START + i * T_ALARM_STAG));
  const bS = sp(T_BTNS);

  return (
    <AbsoluteFill style={{
      background: BG,
      fontFamily: interFont,
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ══════════ HEADER BAR (clean, no blue title bar) ══════════ */}
      <div style={{ height: 54, flexShrink: 0, display: "flex", alignItems: "center",
        padding: "0 22px", gap: 18,
        background: BG_MACHINE,
        borderBottom: `1px solid ${BORDER}`,
        opacity: hS,
        transform: `translateY(${interpolate(hS, [0, 1], [-12, 0])}px)`,
      }}>
        {/* Left: logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
          <div style={{ width: 34, height: 34, borderRadius: 6,
            background: "#25394e",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${BORDER_LT}` }}>
            <svg width={22} height={22} viewBox="0 0 24 24">
              <path d="M 18 5 Q 14 2 10 2 Q 4 2 4 7 Q 4 10 8 11 L 14 13 Q 20 14 20 17 Q 20 22 14 22 Q 10 22 6 19"
                    fill="none" stroke="#8aafd0" strokeWidth={3} strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: WHITE, letterSpacing: 1.5 }}>
            CATALANI MACCO
          </span>
        </div>

        {/* Center: title */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: WHITE, letterSpacing: 5 }}>
            EXTRUDER
          </span>
        </div>

        {/* Right: status + icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
          <div style={{ background: GREEN_BTN, color: "#0a1a0a", fontSize: 18, fontWeight: 800,
            padding: "6px 22px", borderRadius: 3, letterSpacing: 1 }}>RUNNING</div>
          <div style={{ background: RED_ERR, color: WHITE, fontSize: 18, fontWeight: 800,
            padding: "6px 24px", borderRadius: 3, letterSpacing: 1 }}>FAULT</div>

          {/* Person icon */}
          <div style={{ width: 30, height: 30, display: "flex",
            alignItems: "center", justifyContent: "center", color: WHITE }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
              <circle cx={12} cy={8} r={4} />
              <path d="M 4 20 Q 4 14 12 14 Q 20 14 20 20 L 20 22 L 4 22 Z" />
            </svg>
          </div>
          {/* Hamburger */}
          <div style={{ width: 30, height: 30, display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: WHITE }}>
            <div style={{ width: 20, height: 2.5, background: WHITE, borderRadius: 1 }}/>
            <div style={{ width: 20, height: 2.5, background: WHITE, borderRadius: 1 }}/>
            <div style={{ width: 20, height: 2.5, background: WHITE, borderRadius: 1 }}/>
          </div>
          {/* Fullscreen */}
          <div style={{ width: 30, height: 30, display: "flex",
            alignItems: "center", justifyContent: "center", color: WHITE }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <path d="M 4 8 L 4 4 L 8 4" />
              <path d="M 20 8 L 20 4 L 16 4" />
              <path d="M 4 16 L 4 20 L 8 20" />
              <path d="M 20 16 L 20 20 L 16 20" />
            </svg>
          </div>
        </div>
      </div>

      {/* ══════════ MACHINE AREA ══════════ */}
      <div style={{ flexShrink: 0, position: "relative", overflow: "hidden",
        background: BG_MACHINE,
        height: 540,
        opacity: mS,
        transform: `scale(${interpolate(mS, [0, 1], [0.985, 1])})`,
        transformOrigin: "center center" }}>
        <MachineSVG />
        {LABELS.map((lbl, i) => (
          <div key={lbl.id} style={{
            position: "absolute", left: lbl.left, top: lbl.top,
            background: lbl.ok ? "#2db940" : "#e05532",
            color: WHITE, fontSize: 17, fontWeight: 800,
            padding: "3px 11px", borderRadius: 2, letterSpacing: 0.3,
            border: "1px solid rgba(0,0,0,0.25)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
            opacity: lS[i],
            transform: `scale(${interpolate(lS[i], [0, 1], [0.55, 1])})`,
            transformOrigin: "bottom center",
          }}>{lbl.id}</div>
        ))}
      </div>

      {/* ══════════ BOTTOM SECTION: PANELS + BUTTONS ══════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "10px", gap: 8,
        background: BG }}>

        {/* Panel row */}
        <div style={{ flex: 1, display: "flex", gap: 8 }}>

          {/* ══ EXTRUDER ══ */}
          <DataPanel title="EXTRUDER" s={pS[0]} flex="0 0 280px">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 15, color: TEXT_GRAY, fontWeight: 600 }}>RPM</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <RPMGauge target={2000} max={3000} frame={frame} startF={T_PANEL_START + 8} fps={fps}/>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ opacity: vS }}>
                    <InputField value="2000" color={GREEN_VAL} size={22}/>
                  </div>
                  <div style={{ fontSize: 13, color: TEXT_DIM, marginTop: 2 }}>°C</div>
                  <div style={{ opacity: vS }}>
                    <InputField value="-70" color={RED_ERR} size={22}/>
                  </div>
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>
                <div style={{ fontSize: 14, color: TEXT_GRAY, textAlign: "center",
                  fontWeight: 600, letterSpacing: 2, marginBottom: 6 }}>TEMPERATURE</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: TEXT_DIM, marginBottom: 3 }}>RPM</div>
                    <div style={{ opacity: vS }}>
                      <InputField value="700" color={GREEN_VAL} size={20}/>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: TEXT_DIM, marginBottom: 3 }}>Temp.</div>
                    <div style={{ opacity: vS }}>
                      <InputField value="-7°C" color={RED_ERR} size={20}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DataPanel>

          {/* ══ CONVEYORS ══ */}
          <DataPanel title="CONVEYORS" s={pS[1]} flex="0 0 280px">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: TEXT_GRAY, marginBottom: 5 }}>Speed</div>
                  <InputField value="120" color={WHITE} size={20} suffix="m/min" align="center"/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: TEXT_GRAY, marginBottom: 5 }}>Reverse</div>
                  <InputField value="120" color={WHITE} size={20} suffix="m/min" align="center"/>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <IconButton icon={
                  <svg width={20} height={14} viewBox="0 0 22 14" fill="none">
                    <path d="M 2 7 L 14 7 M 14 7 L 9 3 M 14 7 L 9 11" stroke={TEXT_GRAY}
                      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 16 4 L 20 4 M 16 10 L 20 10" stroke={TEXT_GRAY} strokeWidth={1.5} strokeLinecap="round"/>
                  </svg>
                }/>
                <IconButton icon={
                  <svg width={20} height={14} viewBox="0 0 22 14" fill="none">
                    <rect x={2} y={4} width={12} height={6} fill="none" stroke={TEXT_GRAY} strokeWidth={1.5} rx={1}/>
                    <path d="M 16 7 L 20 7 M 20 7 L 18 5 M 20 7 L 18 9" stroke={TEXT_GRAY}
                      strokeWidth={1.5} fill="none" strokeLinecap="round" />
                  </svg>
                }/>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1, fontSize: 14, color: TEXT_GRAY, textAlign: "center" }}>Min.</div>
                <div style={{ flex: 1, fontSize: 14, color: TEXT_GRAY, textAlign: "center" }}>Pos.</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}><InputField value="−" color={WHITE} size={22} align="center"/></div>
                <div style={{ flex: 1 }}><InputField value="+" color={WHITE} size={22} align="center"/></div>
              </div>
            </div>
          </DataPanel>

          {/* ══ HOPPERS ══ */}
          <DataPanel title="HOPPERS" s={pS[2]} flex="0 0 220px">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ background: GREEN_BTN,
                  borderRadius: 3, padding: "4px 16px", fontSize: 18, fontWeight: 800,
                  color: "#0a1a0a", letterSpacing: 0.5 }}>NC</div>
                <div style={{ background: GREEN_BTN,
                  borderRadius: 3, padding: "4px 20px", fontSize: 18, fontWeight: 800,
                  color: "#0a1a0a", letterSpacing: 0.5 }}>H</div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <BarChart pct={45} maxLabel="150" color={GREEN_VAL}
                  frame={frame} startF={T_PANEL_START + 2*T_PANEL_STAG + 8} fps={fps}/>
                <BarChart pct={75} maxLabel="100" color={GREEN_VAL}
                  frame={frame} startF={T_PANEL_START + 2*T_PANEL_STAG + 12} fps={fps}/>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 4, width: "100%" }}>
                <IconButton icon={
                  <svg width={20} height={14} viewBox="0 0 20 14" fill="none">
                    <path d="M 4 3 L 16 3 M 4 7 L 16 7 M 4 11 L 16 11" stroke={TEXT_GRAY} strokeWidth={1.5} strokeLinecap="round"/>
                  </svg>
                }/>
                <IconButton icon={
                  <svg width={20} height={14} viewBox="0 0 20 14" fill="none">
                    <circle cx={10} cy={7} r={5} stroke={TEXT_GRAY} strokeWidth={1.5}/>
                    <line x1={10} y1={7} x2={13} y2={4} stroke={TEXT_GRAY} strokeWidth={1.5} strokeLinecap="round"/>
                  </svg>
                }/>
              </div>
            </div>
          </DataPanel>

          {/* ══ PRODUCTION ══ */}
          <DataPanel title="PRODUCTION" s={pS[3]} flex={1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <div style={{ fontSize: 16, color: TEXT_GRAY, marginBottom: 6 }}>
                  Line Speed
                </div>
                <div style={{ opacity: vS }}>
                  <InputField value="102.00" color={GREEN_VAL} size={28} suffix="mm/s"/>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 16, color: TEXT_GRAY, marginBottom: 6 }}>
                  Output Flow
                </div>
                <div style={{ opacity: vS }}>
                  <InputField value="0.00" color={GREEN_VAL} size={28} suffix="r/klh/s"/>
                </div>
              </div>
            </div>
          </DataPanel>

          {/* ══ ALARMS ══ */}
          <DataPanel title="ALARMS" s={pS[4]} flex="0 0 400px">
            <div style={{ position: "relative", height: "100%", paddingRight: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ALARMS.map((alarm, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "1px 4px",
                    opacity: aS[i],
                    transform: `translateX(${interpolate(aS[i], [0, 1], [-12, 0])}px)`,
                  }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%",
                      background: RED_DOT, flexShrink: 0,
                      boxShadow: `0 0 4px ${RED_DOT}80` }}/>
                    <div style={{ fontSize: 15, color: WHITE, fontWeight: 500,
                      fontFamily: "monospace", letterSpacing: 0.2 }}>{alarm}</div>
                  </div>
                ))}
              </div>
              {/* Scrollbar */}
              <div style={{ position: "absolute", right: -2, top: 0, bottom: 0, width: 10,
                background: "#0a1420", border: `1px solid ${BORDER}`, borderRadius: 2 }}>
                <div style={{ height: 12, borderBottom: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, color: TEXT_GRAY }}>▲</div>
                <div style={{ position: "absolute", top: 16, left: 1, right: 1, height: 60,
                  background: "#253c54", borderRadius: 1 }}/>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 12,
                  borderTop: `1px solid ${BORDER}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, color: TEXT_GRAY }}>▼</div>
              </div>
            </div>
          </DataPanel>
        </div>

        {/* Bottom button row */}
        <div style={{ height: 72, flexShrink: 0, display: "flex", gap: 6,
          justifyContent: "flex-end",
          opacity: bS,
          transform: `translateY(${interpolate(bS, [0, 1], [18, 0])}px)` }}>
          <div style={{ width: 170, background: GREEN_BTN,
            color: "#0a1a0a", fontSize: 28, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 3, letterSpacing: 2 }}>
            START
          </div>
          <div style={{ width: 170, background: RED_ERR,
            color: WHITE, fontSize: 28, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 3, letterSpacing: 2 }}>
            STOP
          </div>
          <div style={{ width: 170, background: GRAY_BTN,
            color: WHITE, fontSize: 28, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 3, letterSpacing: 2 }}>
            PAUSE
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
