/* ============================================================
   ECOSPHERE — GAME ENGINE  (script.js)
   Shared across all pages: state, XP, levels, badges, nav, toast
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────────────────── */
const XP_ACTIONS = {
  correctAnswer : 10,
  quizComplete  : 50,
  challengeDone : 75,
  dailyLogin    : 20,
  bonusStreak   : 30
};

const LEVELS = [
  { min:    0, max:  199, name:'Eco Seedling',   emoji:'🌱', cls:'lvl-seedling' },
  { min:  200, max:  499, name:'Green Explorer', emoji:'🌿', cls:'lvl-explorer' },
  { min:  500, max:  999, name:'Nature Keeper',  emoji:'🌳', cls:'lvl-keeper'   },
  { min: 1000, max: Infinity, name:'Eco Hero',   emoji:'🦅', cls:'lvl-hero'     }
];

const BADGE_DEFS = [
  { id:'first_quiz',    name:'First Step',       emoji:'🎓', desc:'Complete your first quiz',            xpReq:0,   quizReq:1,  chalReq:0  },
  { id:'quiz_master',   name:'Quiz Master',      emoji:'🏆', desc:'Complete 5 quizzes',                 xpReq:0,   quizReq:5,  chalReq:0  },
  { id:'perfect_score', name:'Perfect Score',    emoji:'💯', desc:'Score 100% on a quiz',               xpReq:0,   quizReq:0,  chalReq:0, special:true },
  { id:'tree_saver',    name:'Tree Saver',        emoji:'🌲', desc:'Complete 3 eco challenges',          xpReq:0,   quizReq:0,  chalReq:3  },
  { id:'recycle_master',name:'Recycle Master',   emoji:'♻️', desc:'Earn 200 XP',                        xpReq:200, quizReq:0,  chalReq:0  },
  { id:'ocean_guardian',name:'Ocean Guardian',   emoji:'🌊', desc:'Complete 7 challenges',              xpReq:0,   quizReq:0,  chalReq:7  },
  { id:'eco_warrior',   name:'Eco Warrior',      emoji:'⚔️', desc:'Earn 500 XP',                        xpReq:500, quizReq:0,  chalReq:0  },
  { id:'green_streak',  name:'Green Streak',     emoji:'🔥', desc:'Log in 3 days in a row',             xpReq:0,   quizReq:0,  chalReq:0, special:true },
  { id:'sun_chaser',    name:'Sun Chaser',        emoji:'☀️', desc:'Earn 800 XP',                        xpReq:800, quizReq:0,  chalReq:0  },
  { id:'wind_rider',    name:'Wind Rider',        emoji:'💨', desc:'Complete 10 quizzes',               xpReq:0,   quizReq:10, chalReq:0  },
  { id:'earth_hero',    name:'Earth Hero',        emoji:'🌍', desc:'Reach Eco Hero level',              xpReq:1000,quizReq:0,  chalReq:0  },
  { id:'champion',      name:'Champion',          emoji:'🥇', desc:'Complete 15 challenges',            xpReq:0,   quizReq:0,  chalReq:15 }
];

const AVATARS = ['🌱','🌿','🦋','🦉','🐸','🦜','🌸','🐢'];

const QUIZ_QUESTIONS = [
  // EASY
  { q:'What gas do plants absorb during photosynthesis?', opts:['Oxygen','Carbon Dioxide','Nitrogen','Hydrogen'], ans:1, xp:10, diff:'easy' },
  { q:'Which of these is a renewable energy source?', opts:['Coal','Natural Gas','Solar Power','Oil'], ans:2, xp:10, diff:'easy' },
  { q:'What does "reduce, reuse, recycle" promote?', opts:['Consumption','Waste reduction','Mining','Deforestation'], ans:1, xp:10, diff:'easy' },
  { q:'Which animal is most associated with deforestation impact?', opts:['Penguin','Orangutan','Polar Bear','Dolphin'], ans:1, xp:10, diff:'easy' },
  { q:'What percentage of Earth\'s water is freshwater?', opts:['50%','25%','3%','10%'], ans:2, xp:10, diff:'easy' },
  // MEDIUM
  { q:'Which greenhouse gas has the highest global warming potential per molecule?', opts:['CO₂','Methane','N₂O','Water Vapour'], ans:1, xp:15, diff:'medium' },
  { q:'The Paris Agreement aims to limit warming to how many degrees Celsius?', opts:['1°C','1.5°C','2°C','3°C'], ans:1, xp:15, diff:'medium' },
  { q:'What is the term for species that indicate ecosystem health?', opts:['Keystone','Indicator','Apex','Endemic'], ans:1, xp:15, diff:'medium' },
  { q:'Which country is the largest producer of solar energy?', opts:['USA','Germany','China','India'], ans:2, xp:15, diff:'medium' },
  { q:'Ocean acidification is primarily caused by absorption of:', opts:['SO₂','CO₂','NO₂','CH₄'], ans:1, xp:15, diff:'medium' },
  // HARD
  { q:'What is "albedo" in climate science?', opts:['Heat absorption','Light reflection','Carbon capture','Water cycle'], ans:1, xp:20, diff:'hard' },
  { q:'Which protocol first legally bound nations to GHG reductions?', opts:['Paris Agreement','Kyoto Protocol','Montreal Protocol','Rio Summit'], ans:1, xp:20, diff:'hard' },
  { q:'Phytoplankton produce approximately what % of Earth\'s oxygen?', opts:['10%','30%','50%','70%'], ans:2, xp:20, diff:'hard' },
  { q:'What is the term for CO₂ absorbed by oceans/forests?', opts:['Carbon source','Carbon flux','Carbon sink','Carbon debt'], ans:2, xp:20, diff:'hard' },
  { q:'The "tipping point" concept in climate refers to:', opts:['Policy decisions','Irreversible climate shifts','Economic collapse','Ocean currents only'], ans:1, xp:20, diff:'hard' }
];

/* ──────────────────────────────────────────────────────────
   STATE — localStorage wrapper
────────────────────────────────────────────────────────── */
const STATE_KEY = 'ecosphere_player';

function defaultState() {
  return {
    name: '',
    avatar: '🌱',
    xp: 0,
    quizzesCompleted: 0,
    challengesDone: 0,
    badges: [],
    streak: 1,
    lastLogin: new Date().toDateString(),
    history: [],        // [{date, xp, quizScore}]
    specialBadges: [],
    difficulty: 'easy'  // ai-recommended
  };
}

function getState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
  } catch { return defaultState(); }
}

function saveState(s) {
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
}

function clearState() {
  localStorage.removeItem(STATE_KEY);
}

/* ──────────────────────────────────────────────────────────
   LEVEL HELPERS
────────────────────────────────────────────────────────── */
function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[0];
}

function xpToNextLevel(xp) {
  const lvl = getLevel(xp);
  if (lvl.max === Infinity) return { current: xp - lvl.min, needed: 0, pct: 100 };
  const needed = lvl.max - lvl.min + 1;
  const current = xp - lvl.min;
  return { current, needed, pct: Math.round((current / needed) * 100) };
}

/* ──────────────────────────────────────────────────────────
   XP AWARD
────────────────────────────────────────────────────────── */
function awardXP(amount, reason) {
  const s = getState();
  s.xp += amount;
  saveState(s);
  showToast(`+${amount} XP — ${reason}`, 'success', '⚡');
  checkBadges(s);
  return s.xp;
}

/* ──────────────────────────────────────────────────────────
   BADGE CHECKER
────────────────────────────────────────────────────────── */
function checkBadges(s) {
  let changed = false;
  BADGE_DEFS.forEach(b => {
    if (b.special) return; // handled separately
    if (s.badges.includes(b.id)) return;
    const xpOk   = !b.xpReq   || s.xp               >= b.xpReq;
    const qOk    = !b.quizReq || s.quizzesCompleted   >= b.quizReq;
    const chalOk = !b.chalReq || s.challengesDone      >= b.chalReq;
    if (xpOk && qOk && chalOk) {
      s.badges.push(b.id);
      changed = true;
      setTimeout(() => showToast(`Badge Unlocked: ${b.name} ${b.emoji}`, 'warning', '🏅'), 800);
    }
  });
  if (changed) saveState(s);
}

function unlockSpecialBadge(id) {
  const s = getState();
  if (!s.badges.includes(id)) {
    s.badges.push(id);
    saveState(s);
    const b = BADGE_DEFS.find(x => x.id === id);
    if (b) showToast(`Badge Unlocked: ${b.name} ${b.emoji}`, 'warning', '🏅');
  }
}

/* ──────────────────────────────────────────────────────────
   STREAK
────────────────────────────────────────────────────────── */
function handleStreak() {
  const s = getState();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (s.lastLogin === today) return;
  if (s.lastLogin === yesterday) {
    s.streak = (s.streak || 1) + 1;
    if (s.streak >= 3) {
      s.xp += XP_ACTIONS.bonusStreak;
      unlockSpecialBadge('green_streak');
    }
  } else {
    s.streak = 1;
  }
  s.xp += XP_ACTIONS.dailyLogin;
  s.lastLogin = today;
  saveState(s);
}

/* ──────────────────────────────────────────────────────────
   TOAST SYSTEM
────────────────────────────────────────────────────────── */
let toastContainer;
function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-wrap';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(msg, type = 'success', icon = '✅') {
  const wrap = ensureToastContainer();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span style="font-size:1.3rem">${icon}</span><span style="font-weight:700;font-size:0.9rem">${msg}</span>`;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 4100);
}

/* ──────────────────────────────────────────────────────────
   PARTICLE BACKGROUND
────────────────────────────────────────────────────────── */
const LEAF_EMOJIS = ['🍃','🌿','🍀','🌱','🌾','☘️','🍂','🌸'];
function injectParticles() {
  const bg = document.querySelector('.particle-bg');
  if (!bg) return;
  for (let i = 1; i <= 10; i++) {
    const p = document.createElement('span');
    p.className = `particle p${i}`;
    p.textContent = LEAF_EMOJIS[(i-1) % LEAF_EMOJIS.length];
    bg.appendChild(p);
  }
}

/* ──────────────────────────────────────────────────────────
   NAVBAR INJECTION
────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href:'index.html',       label:'Home',        icon:'🏠' },
  { href:'dashboard.html',   label:'Dashboard',   icon:'📊' },
  { href:'quiz.html',        label:'Quiz Arena',  icon:'⚡' },
  { href:'challenges.html',  label:'Challenges',  icon:'🎯' },
  { href:'leaderboard.html', label:'Leaderboard', icon:'🏆' },
  { href:'rewards.html',     label:'Rewards',     icon:'🎖️' }
];

function injectNavbar(activePage) {
  const s = getState();
  const lvl = getLevel(s.xp);
  const navEl = document.querySelector('.navbar');
  if (!navEl) return;

  const links = NAV_LINKS.map(l =>
    `<li><a href="${l.href}" class="${activePage===l.href?'active':''}">${l.icon} ${l.label}</a></li>`
  ).join('');

  navEl.innerHTML = `
    <a class="nav-logo" href="index.html">
      <span class="logo-icon">🌍</span> ECOSPHERE
    </a>
    <ul class="nav-links">${links}</ul>
    <div class="nav-right">
      <span class="nav-xp-pill" id="nav-xp">⚡ ${s.xp} XP</span>
      <div class="nav-avatar tooltip" data-tooltip="${s.name||'Player'} · ${lvl.name}" onclick="location.href='dashboard.html'">
        ${s.avatar||'🌱'}
      </div>
    </div>
  `;
}

function refreshNavXP() {
  const el = document.getElementById('nav-xp');
  if (el) { const s = getState(); el.textContent = `⚡ ${s.xp} XP`; }
}

/* ──────────────────────────────────────────────────────────
   CONFETTI (canvas-confetti via CDN)
────────────────────────────────────────────────────────── */
function fireConfetti() {
  if (typeof confetti === 'undefined') return;
  confetti({ particleCount:120, spread:80, origin:{y:0.6},
    colors:['#00C897','#FFD700','#00A8FF','#FF4D6D','#00FFB3'] });
}
function fireSideConfetti() {
  if (typeof confetti === 'undefined') return;
  confetti({ particleCount:60, angle:60,  spread:55, origin:{x:0}, colors:['#00C897','#FFD700','#00A8FF'] });
  confetti({ particleCount:60, angle:120, spread:55, origin:{x:1}, colors:['#00C897','#FFD700','#00A8FF'] });
}

/* ──────────────────────────────────────────────────────────
   ML PREDICTION (calls Flask, falls back to local)
────────────────────────────────────────────────────────── */
async function fetchMLPrediction(quizScore, timeSpent, challengesDone) {
  try {
    const res = await fetch('http://localhost:5000/api/predict', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ quiz_score: quizScore, time_spent: timeSpent, challenges_completed: challengesDone })
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return localMLFallback(quizScore, timeSpent, challengesDone);
  }
}

function localMLFallback(score, time, chals) {
  let level = 'Beginner';
  let difficulty = 'easy';
  let recommendation = 'Start with basic eco quizzes to build your foundation!';
  if (score >= 70 && chals >= 5) {
    level = 'Advanced'; difficulty = 'hard';
    recommendation = 'Challenge yourself with hard-level environmental questions!';
  } else if (score >= 40 || chals >= 2) {
    level = 'Intermediate'; difficulty = 'medium';
    recommendation = 'Try medium-difficulty quizzes to level up your eco knowledge!';
  }
  return { level, difficulty, recommendation };
}

/* ──────────────────────────────────────────────────────────
   LEADERBOARD DATA
────────────────────────────────────────────────────────── */
const MOCK_LEADERS = [
  { name:'EcoNova',    avatar:'🦋', xp:2840, badges:11, level:'Eco Hero'      },
  { name:'GreenMira',  avatar:'🌸', xp:2350, badges:9,  level:'Eco Hero'      },
  { name:'TerraKai',   avatar:'🦉', xp:1980, badges:8,  level:'Eco Hero'      },
  { name:'LeafLoki',   avatar:'🌿', xp:1540, badges:6,  level:'Nature Keeper' },
  { name:'SkyRex',     avatar:'🐢', xp:1230, badges:5,  level:'Nature Keeper' },
  { name:'BioSage',    avatar:'🦜', xp:980,  badges:4,  level:'Green Explorer'},
  { name:'WaterWren',  avatar:'🐸', xp:720,  badges:3,  level:'Green Explorer'},
  { name:'SunSprout',  avatar:'☀️', xp:510,  badges:2,  level:'Green Explorer'},
  { name:'AirAsh',     avatar:'💨', xp:310,  badges:1,  level:'Eco Seedling'  },
  { name:'PetalZara',  avatar:'🌱', xp:150,  badges:0,  level:'Eco Seedling'  }
];

function getLeaderboard() {
  const s = getState();
  if (!s.name) return MOCK_LEADERS;
  const board = [...MOCK_LEADERS, { name: s.name, avatar: s.avatar, xp: s.xp, badges: s.badges.length, level: getLevel(s.xp).name, isMe: true }];
  return board.sort((a,b) => b.xp - a.xp).slice(0,10);
}

/* ──────────────────────────────────────────────────────────
   GUARDS — redirect if not logged in
────────────────────────────────────────────────────────── */
function requireLogin() {
  const s = getState();
  if (!s.name) { location.href = 'login.html'; return false; }
  return true;
}

/* ──────────────────────────────────────────────────────────
   ANIMATE NUMBER COUNT-UP
────────────────────────────────────────────────────────── */
function countUp(el, target, duration = 1200) {
  let start = 0;
  const step = target / (duration / 16);
  const tick = () => {
    start = Math.min(start + step, target);
    el.textContent = Math.round(start).toLocaleString();
    if (start < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ──────────────────────────────────────────────────────────
   INIT ON LOAD
────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injectParticles();
  handleStreak();
});