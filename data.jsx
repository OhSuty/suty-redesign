// ─── Mock data ─────────────────────────────────────────────────────────

const SCRIPTS = [
  {
    id: "queue",
    name: "Queue System",
    displayName: "Queue System",
    category: "Systems",
    price: 19.99,
    image: "https://picsum.photos/seed/sutyqueue/720/450",
    frameworks: ["qbx", "qbcore", "esx"],
    description: "Priority-aware queue with live position, ETA, and Discord-role boosts. Stress-tested past 1,500 concurrent.",
    isNew: true,
    type: "single",
    long: "A drop-in replacement for the default FiveM queue with Discord-role priority, live position display, predicted ETA, AFK kick, and admin overrides."
  },
  {
    id: "drugsell",
    name: "Drug Sell System",
    displayName: "Drug Sell System",
    category: "Roleplay",
    price: 14.99,
    image: "https://picsum.photos/seed/sutydrug/720/450",
    frameworks: ["qbx", "qbcore", "esx"],
    description: "Zone-aware dealing with NPC routines, heat decay, undercover cops, and randomized refusal lines.",
    isNew: false,
    type: "single"
  },
  {
    id: "carry",
    name: "Player Carry",
    displayName: "Player Carry",
    category: "Roleplay",
    price: 7.99,
    image: "https://picsum.photos/seed/sutycarry/720/450",
    frameworks: ["qbx", "qbcore", "esx"],
    description: "Carry, drag, and piggy-back synced animations with stamina drain and break-free struggle.",
    isNew: false,
    type: "single"
  },
  {
    id: "commserv",
    name: "Community Service",
    displayName: "Community Service",
    category: "Systems",
    price: 9.99,
    image: "https://picsum.photos/seed/sutycomm/720/450",
    frameworks: ["qbx", "qbcore"],
    description: "Jail alternative — sweep, paint, and clean for points. Fully configurable tasks and locations.",
    isNew: true,
    type: "single"
  },
  {
    id: "report",
    name: "Report System",
    displayName: "Report System",
    category: "UI",
    price: 12.99,
    image: "https://picsum.photos/seed/sutyreport/720/450",
    frameworks: ["qbx", "qbcore", "esx"],
    description: "Staff-side ticketing with claim/transfer, internal notes, and a player-facing status panel.",
    isNew: false,
    type: "single"
  },
  {
    id: "drag",
    name: "Drag System",
    displayName: "Drag System",
    category: "Roleplay",
    price: 6.99,
    image: "https://picsum.photos/seed/sutydrag/720/450",
    frameworks: ["qbx", "qbcore", "esx"],
    description: "Cuff-aware drag with proper third-person anims and smooth break/recapture transitions.",
    isNew: false,
    type: "single"
  },
  {
    id: "money",
    name: "Money Throwing",
    displayName: "Money Throwing",
    category: "Roleplay",
    price: 4.99,
    image: "https://picsum.photos/seed/sutymoney/720/450",
    frameworks: ["qbx", "qbcore", "esx"],
    description: "Toss cash, props persist with physics, pickup-cooldown, and an optional ‘make it rain’ animation.",
    isNew: false,
    type: "single"
  },
  {
    id: "safezone",
    name: "Safe Zone Creator",
    displayName: "Safe Zone Creator",
    category: "Utility",
    price: 17.99,
    image: "https://picsum.photos/seed/sutysafezone/720/450",
    frameworks: ["qbx", "qbcore", "esx"],
    description: "In-game polygon zone painter — disable weapons, healing, persistence on restart. No SQL config.",
    isNew: true,
    type: "single"
  },
  {
    id: "tappay",
    name: "Tap Pay (for lb-phone)",
    displayName: "Tap Pay",
    category: "UI",
    price: 11.99,
    image: "https://picsum.photos/seed/sutytappay/720/450",
    frameworks: ["qbx", "qbcore"],
    description: "Apple-Pay-style tap-to-pay for lb-phone with merchant terminals, animated receipt, and dispute flow.",
    isNew: false,
    type: "single"
  },
  {
    id: "scale",
    name: "Character Scale Menu",
    displayName: "Character Scale Menu",
    category: "UI",
    price: 8.99,
    image: "https://picsum.photos/seed/sutyscale/720/450",
    frameworks: ["qbx", "qbcore", "esx"],
    description: "Per-bone height & limb scaling with admin-only access, saved to character on disconnect.",
    isNew: false,
    type: "single"
  },
  {
    id: "slap",
    name: "Slap & Groin Kick",
    displayName: "Slap & Groin Kick",
    category: "Roleplay",
    price: 5.99,
    image: "https://picsum.photos/seed/sutyslap/720/450",
    frameworks: ["qbx", "qbcore", "esx"],
    description: "Two perfectly-timed melee gags with hit-reg synced anims and a built-in cooldown.",
    isNew: false,
    type: "single"
  },
  {
    id: "announce",
    name: "Job Announcements",
    displayName: "Job Announcements",
    category: "Utility",
    price: 9.99,
    image: "https://picsum.photos/seed/sutyannounce/720/450",
    frameworks: ["qbx", "qbcore", "esx"],
    description: "Broadcast role-restricted announcements with priority levels, sound cues, and a discord webhook.",
    isNew: false,
    type: "single"
  }
];

const SUBSCRIPTIONS = [
  {
    id: "sub-all",
    name: "All Access",
    cadence: "monthly",
    price: 19.99,
    headline: "Every Suty script. One price.",
    description: "Unlock the entire catalogue, every future drop, and priority Discord support. Cancel any time.",
    includes: SCRIPTS.length,
    featured: true
  },
  {
    id: "sub-rp",
    name: "Roleplay Bundle",
    cadence: "monthly",
    price: 9.99,
    description: "Just the roleplay-tier scripts — carry, drag, slap, drugs, money.",
    includes: 5
  },
  {
    id: "sub-sys",
    name: "Systems Bundle",
    cadence: "monthly",
    price: 12.99,
    description: "Queue, Community Service, Safe Zone Creator, Report System.",
    includes: 4
  }
];

const BUYERS = [
  { name: "TheRealMike",  script: "Queue System",        time: "2m" },
  { name: "Foxxy_RP",     script: "Drug Sell System",    time: "14m" },
  { name: "DimitriOG",    script: "Tap Pay",             time: "1h" },
  { name: "lucax_99",     script: "Safe Zone Creator",   time: "3h" },
  { name: "kennyB",       script: "Player Carry",        time: "8h" },
  { name: "VortexRP",     script: "Report System",       time: "1d" },
  { name: "Mira.eth",     script: "Job Announcements",   time: "2d" },
  { name: "soto_v2",      script: "Community Service",   time: "4d" }
];

const CATEGORIES = ["All", "Systems", "UI", "Roleplay", "Utility"];

const FRAMEWORK_LABEL = {
  qbx: "QBX",
  qbcore: "QBCore",
  esx: "ESX"
};

// Match suty.dev exactly — same R2 image URLs, same accent colors, same links.
const FRAMEWORK_META = {
  esx: {
    label: "ESX",
    image: "https://r2.fivemanage.com/CZREz3HGpG2hkho5t3Mth/esx.png",
    href:  "https://esx-framework.org/",
    color: "#fecaca"
  },
  qbcore: {
    label: "QBCore",
    image: "https://r2.fivemanage.com/CZREz3HGpG2hkho5t3Mth/qbcore1.png",
    href:  "https://docs.qbcore.org/",
    color: "#bfdbfe"
  },
  qbx: {
    label: "QBX",
    image: "https://r2.fivemanage.com/CZREz3HGpG2hkho5t3Mth/qbox-logo2.png",
    href:  "https://www.qbox.re/",
    color: "#a5f3fc"
  }
};

const FAQS = [
  {
    q: "Are your scripts encrypted?",
    a: "Server-side logic ships open-source so you can audit and extend it. Client-side is partially escrowed with Tebex — the parts that matter for anti-leak. You won’t hit a wall."
  },
  {
    q: "What about updates?",
    a: "Lifetime updates on every purchase. Patches usually land within 24h of a FiveM artifact bump, and we post changelogs in the Discord."
  },
  {
    q: "Refund policy?",
    a: "If a script genuinely doesn’t do what the listing says, we’ll refund within 14 days. We won’t refund ‘changed my mind’ — but we’ll happily help you get it working."
  },
  {
    q: "Can I use these on a paid server?",
    a: "Yes. One license = one community. Re-selling, re-distributing, or shipping inside paid frameworks is not allowed."
  },
  {
    q: "Do you take custom work?",
    a: "Sometimes — through the Discord, scoped per quarter. Subscribers get priority on the slots."
  }
];

// Hash → hue pair for deterministic gradient avatars
function nameHues(name){
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const a = h % 360;
  const b = (a + 60 + (h >>> 8) % 80) % 360;
  return [a, b];
}

function avatarStyle(name){
  const [a,b] = nameHues(name);
  return {
    "--avatar-grad": `linear-gradient(135deg, oklch(0.55 0.18 ${a}), oklch(0.32 0.14 ${b}))`
  };
}

Object.assign(window, {
  SCRIPTS, SUBSCRIPTIONS, BUYERS, CATEGORIES, FRAMEWORK_LABEL, FRAMEWORK_META, FAQS,
  avatarStyle, nameHues
});
