// LifeRPGApp.jsx — React Native (Expo)  v3.0
// deps: npx expo install react-native-svg expo-av
// copy ทั้งไฟล์นี้ไปวางใน App.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";

const { width: SW } = Dimensions.get("window");

// ═══════════════════════════════════════════════════════════════
// CONSTANTS & DATA (inline — no external import needed)
// ═══════════════════════════════════════════════════════════════
const XP_PER_LEVEL = 500;
const calcLevel    = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;
const calcXpInLvl  = (xp) => xp % XP_PER_LEVEL;

const THEMES = {
  DARK: {
    void:"#06060A", surface:"#111118", surface2:"#1A1A24",
    border:"rgba(255,255,255,0.06)", borderBright:"rgba(255,255,255,0.12)",
    gold:"#C9A84C", goldLight:"#E8C87A", goldDim:"rgba(201,168,76,0.15)",
    textPrimary:"#F0EDE8", textSecondary:"rgba(240,237,232,0.5)",
    textDim:"rgba(240,237,232,0.25)", accentTeal:"#2DD4BF", accentRose:"#F43F5E",
    statusBar:"light-content",
  },
  LIGHT: {
    void:"#F5F3EF", surface:"#FFFFFF", surface2:"#EDEDEA",
    border:"rgba(0,0,0,0.08)", borderBright:"rgba(0,0,0,0.15)",
    gold:"#A8782A", goldLight:"#C9943A", goldDim:"rgba(168,120,42,0.12)",
    textPrimary:"#1A1814", textSecondary:"rgba(26,24,20,0.55)",
    textDim:"rgba(26,24,20,0.35)", accentTeal:"#0D9488", accentRose:"#DC2626",
    statusBar:"dark-content",
  },
};

const CATEGORIES = {
  HEALTH:     { label:"สุขภาพ",            icon:"♥", color:"#F43F5E" },
  MIND:       { label:"พัฒนาตนเอง",        icon:"◆", color:"#818CF8" },
  FINANCE:    { label:"การเงิน",            icon:"◇", color:"#34D399" },
  SOCIAL:     { label:"สังคม",              icon:"○", color:"#60A5FA" },
  CREATIVE:   { label:"ความคิดสร้างสรรค์", icon:"△", color:"#F472B6" },
  DISCIPLINE: { label:"วินัย",              icon:"□", color:"#C9A84C" },
  CAREER:     { label:"การงาน",             icon:"▲", color:"#FB923C" },
  HOME:       { label:"บ้าน & ชีวิต",       icon:"⌂", color:"#A78BFA" },
  FAMILY:     { label:"ครอบครัว",           icon:"✦", color:"#F9A8D4" },
  DIGITAL:    { label:"ดิจิทัล",            icon:"⬡", color:"#2DD4BF" },
};
const getCatIcon  = (cat) => CATEGORIES[cat]?.icon  || "◈";
const getCatColor = (cat) => CATEGORIES[cat]?.color || "#C9A84C";
const getCatLabel = (cat) => CATEGORIES[cat]?.label || cat;

const RARITY = {
  COMMON:    { label:"Common",    color:"#9CA3AF", glow:"rgba(156,163,175,0.15)", stars:"★" },
  RARE:      { label:"Rare",      color:"#60A5FA", glow:"rgba(96,165,250,0.15)",  stars:"★★" },
  EPIC:      { label:"Epic",      color:"#A78BFA", glow:"rgba(167,139,250,0.15)", stars:"★★★" },
  LEGENDARY: { label:"Legendary", color:"#F59E0B", glow:"rgba(245,158,11,0.2)",   stars:"★★★★" },
};

const MOODS = [
  { id:"m1", emoji:"😄", label:"ยอดเยี่ยม", value:5, color:"#34D399" },
  { id:"m2", emoji:"🙂", label:"ดี",        value:4, color:"#60A5FA" },
  { id:"m3", emoji:"😐", label:"เฉยๆ",      value:3, color:"#C9A84C" },
  { id:"m4", emoji:"😔", label:"แย่นิด",    value:2, color:"#FB923C" },
  { id:"m5", emoji:"😞", label:"แย่มาก",    value:1, color:"#F43F5E" },
];

const TITLES = [
  { id:"t01", label:"Life Architect",   icon:"◈", unlockLevel:1  },
  { id:"t02", label:"Dawn Warrior",     icon:"☀", unlockLevel:2  },
  { id:"t03", label:"Mind Forge",       icon:"◆", unlockLevel:3  },
  { id:"t04", label:"Iron Discipline",  icon:"□", unlockLevel:4  },
  { id:"t05", label:"Wealth Seeker",    icon:"◇", unlockLevel:5  },
  { id:"t06", label:"Social Catalyst",  icon:"○", unlockLevel:6  },
  { id:"t07", label:"Creative Force",   icon:"△", unlockLevel:7  },
  { id:"t08", label:"Health Guardian",  icon:"♥", unlockLevel:8  },
  { id:"t09", label:"Code of Honor",    icon:"▲", unlockLevel:9  },
  { id:"t10", label:"Night Architect",  icon:"⬡", unlockLevel:10 },
  { id:"t11", label:"Master of Habits", icon:"✦", unlockLevel:12 },
  { id:"t12", label:"Shadow Weaver",    icon:"◈", unlockLevel:14 },
  { id:"t13", label:"Golden Path",      icon:"◇", unlockLevel:16 },
  { id:"t14", label:"Eternal Flame",    icon:"♥", unlockLevel:18 },
  { id:"t15", label:"Legend",           icon:"✦", unlockLevel:20 },
];

const AVATAR_OPTIONS = [
  { emoji:"⚔️", bg:"#1A1220" }, { emoji:"🔥", bg:"#1A1008" }, { emoji:"🌙", bg:"#0D0D2B" },
  { emoji:"⚡", bg:"#1A1500" }, { emoji:"🦁", bg:"#1A1208" }, { emoji:"🌊", bg:"#051A1A" },
  { emoji:"🗡️", bg:"#1A0808" }, { emoji:"🧿", bg:"#051220" }, { emoji:"🌸", bg:"#1A0D14" },
  { emoji:"🐉", bg:"#0A1A0A" }, { emoji:"🎯", bg:"#1A1A08" }, { emoji:"💎", bg:"#0D1520" },
  { emoji:"🌟", bg:"#1A1500" }, { emoji:"🦅", bg:"#0A0A1A" }, { emoji:"🧠", bg:"#1A0A1A" },
  { emoji:"🏔️", bg:"#0A1010" }, { emoji:"🌺", bg:"#1A0810" }, { emoji:"⭐", bg:"#12120A" },
];

// ── SKILL TREE ────────────────────────────────────────────────
const SKILL_TREE = [
  { id:"sk01", name:"Quick Learner",   icon:"◆", desc:"+10% XP เควส MIND",          effect:"xp_mind",     cost:3, row:0, col:1, requires:[]              },
  { id:"sk02", name:"Iron Body",       icon:"♥", desc:"+10% XP เควส HEALTH",         effect:"xp_health",   cost:3, row:0, col:3, requires:[]              },
  { id:"sk03", name:"Gold Saver",      icon:"◇", desc:"+10% XP เควส FINANCE",        effect:"xp_finance",  cost:3, row:0, col:5, requires:[]              },
  { id:"sk04", name:"Streak Shield",   icon:"□", desc:"Streak ไม่ขาดถ้าพลาด 1 วัน", effect:"streak_shield",cost:5,row:1, col:0, requires:["sk01"]        },
  { id:"sk05", name:"XP Surge",        icon:"⚡", desc:"+20% XP ทุกประเภท",          effect:"xp_all",      cost:6, row:1, col:2, requires:["sk01","sk02"] },
  { id:"sk06", name:"Double Streak",   icon:"✦", desc:"Streak นับ x2",               effect:"dbl_streak",  cost:6, row:1, col:4, requires:["sk02","sk03"] },
  { id:"sk07", name:"Boss Hunter",     icon:"⚔", desc:"XP Boss Quest +25%",           effect:"xp_boss",     cost:5, row:1, col:6, requires:["sk03"]        },
  { id:"sk08", name:"Legend Aura",     icon:"★", desc:"+35% XP ทุกประเภท",          effect:"xp_legend",   cost:10,row:2, col:1, requires:["sk05","sk04"] },
  { id:"sk09", name:"Time Warp",       icon:"◈", desc:"Daily Challenge สุ่ม 2 อัน",  effect:"dbl_daily",   cost:8, row:2, col:3, requires:["sk05","sk06"] },
  { id:"sk10", name:"Godlike Streak",  icon:"⬡", desc:"Streak Bonus +50 XP/วัน",    effect:"streak_bonus",cost:10,row:2, col:5, requires:["sk06","sk07"] },
];
const SKILL_POINTS_PER_LEVEL = 1;

// ── QUEST CHAINS ──────────────────────────────────────────────
const QUEST_CHAINS = [
  { id:"qc01", title:"เส้นทางนักรบ",  icon:"⚔️", category:"HEALTH",
    desc:"เดินทางสู่ร่างกายที่แข็งแกร่ง",
    quests:[
      { id:"qc01_1", title:"วิ่ง 1 กม. ครั้งแรก",          xpReward:150,  rarity:"COMMON"    },
      { id:"qc01_2", title:"วิ่ง 5 กม. ติดกัน 3 วัน",       xpReward:300,  rarity:"RARE"      },
      { id:"qc01_3", title:"เข้าฟิตเนสครบ 7 วัน",           xpReward:500,  rarity:"EPIC"      },
      { id:"qc01_4", title:"พิชิต Half Marathon",            xpReward:1000, rarity:"LEGENDARY" },
    ],
  },
  { id:"qc02", title:"จิตปราชญ์",     icon:"🧠", category:"MIND",
    desc:"ฝึกฝนจิตใจให้แกร่งและเฉียบคม",
    quests:[
      { id:"qc02_1", title:"อ่านหนังสือ 1 เล่มจบ",           xpReward:200,  rarity:"COMMON"    },
      { id:"qc02_2", title:"เรียน Course ออนไลน์จบ",         xpReward:400,  rarity:"RARE"      },
      { id:"qc02_3", title:"เขียน Journal 14 วันติดกัน",      xpReward:600,  rarity:"EPIC"      },
      { id:"qc02_4", title:"สอนผู้อื่นในสิ่งที่เรียนรู้",     xpReward:1200, rarity:"LEGENDARY" },
    ],
  },
  { id:"qc03", title:"ราชาการเงิน",   icon:"💰", category:"FINANCE",
    desc:"สร้างฐานะและวินัยทางการเงิน",
    quests:[
      { id:"qc03_1", title:"บันทึกรายจ่าย 7 วันติดกัน",      xpReward:150,  rarity:"COMMON"    },
      { id:"qc03_2", title:"ออมเงิน 10% ของรายได้",           xpReward:350,  rarity:"RARE"      },
      { id:"qc03_3", title:"ลงทุนครั้งแรก",                   xpReward:500,  rarity:"EPIC"      },
      { id:"qc03_4", title:"สร้าง Passive Income แรก",         xpReward:1500, rarity:"LEGENDARY" },
    ],
  },
];

// ── DAILY CHALLENGE POOL ──────────────────────────────────────
const DAILY_POOL = [
  { id:"dc01", title:"No Sugar Day",           desc:"งดน้ำตาลทั้งวัน",                  xp:250, icon:"🍭", category:"HEALTH"     },
  { id:"dc02", title:"Digital Sabbath",        desc:"ปิดโซเชียล 6 ชั่วโมง",             xp:300, icon:"📵", category:"DIGITAL"    },
  { id:"dc03", title:"5AM Challenge",          desc:"ตื่น 5 โมงเช้า 1 วัน",             xp:280, icon:"🌅", category:"DISCIPLINE" },
  { id:"dc04", title:"Random Act of Kindness", desc:"ช่วยคนแปลกหน้า 1 คน",              xp:200, icon:"🤝", category:"SOCIAL"     },
  { id:"dc05", title:"10,000 Steps",           desc:"เดิน 10,000 ก้าว",                  xp:220, icon:"👟", category:"HEALTH"     },
  { id:"dc06", title:"Cold Shower",            desc:"อาบน้ำเย็น 1 ครั้ง",               xp:180, icon:"🚿", category:"DISCIPLINE" },
  { id:"dc07", title:"Gratitude Journal",      desc:"เขียนขอบคุณ 3 สิ่ง",               xp:150, icon:"🙏", category:"MIND"       },
  { id:"dc08", title:"Learn New Skill",        desc:"ลองทำอะไรใหม่ 1 อย่าง",            xp:260, icon:"🎯", category:"CREATIVE"   },
  { id:"dc09", title:"Family Dinner",          desc:"ทานข้าวพร้อมหน้าครอบครัว",          xp:200, icon:"🍽️", category:"FAMILY"     },
  { id:"dc10", title:"Declutter",              desc:"ทิ้งของที่ไม่ใช้ 10 ชิ้น",          xp:230, icon:"🗑️", category:"HOME"       },
  { id:"dc11", title:"Meditation Sprint",      desc:"นั่งสมาธิ 20 นาทีไม่หยุด",         xp:240, icon:"🧘", category:"DISCIPLINE" },
  { id:"dc12", title:"Cook From Scratch",      desc:"ทำอาหารเองไม่ซื้อสำเร็จรูป",       xp:210, icon:"👨‍🍳", category:"HOME"      },
  { id:"dc13", title:"Budget Blitz",           desc:"ใช้จ่ายน้อยกว่าปกติ 50%",           xp:270, icon:"💸", category:"FINANCE"    },
  { id:"dc14", title:"Deep Focus 3h",          desc:"ทำงานไม่ดูโทรศัพท์ 3 ชั่วโมง",     xp:350, icon:"🔥", category:"CAREER"     },
];

// ── BOSS QUESTS ───────────────────────────────────────────────
const BOSS_POOL = [
  { id:"b01", title:"7 วันแห่งวินัย",    desc:"เควส DISCIPLINE ครบ 7 วันติด",    category:"DISCIPLINE", xpReward:2000, target:7  },
  { id:"b02", title:"สัปดาห์สุขภาพเหล็ก",desc:"ออกกำลังและดื่มน้ำครบทุกวัน",    category:"HEALTH",     xpReward:1800, target:7  },
  { id:"b03", title:"นักปราชญ์สัปดาห์",  desc:"เรียนรู้สิ่งใหม่ 5 อย่างใน 7 วัน",category:"MIND",      xpReward:1600, target:5  },
  { id:"b04", title:"เจ้าแห่งสัมพันธ์",  desc:"เควส SOCIAL และ FAMILY ครบ 5 อัน",category:"SOCIAL",    xpReward:1500, target:5  },
  { id:"b05", title:"ผู้พิชิตทุกหมวด",   desc:"เควสครบทุก 10 หมวดใน 7 วัน",     category:"CAREER",     xpReward:2500, target:10 },
];

// ── ACHIEVEMENTS ─────────────────────────────────────────────
const ACHIEVEMENTS_DEF = [
  { id:"a01", title:"ก้าวแรก",          desc:"เสร็จเควสแรก",               icon:"◈", xp:100,  cond:(s)=>s.done>=1 },
  { id:"a02", title:"นักผจญภัยมือใหม่", desc:"เสร็จเควส 5 อัน",           icon:"◆", xp:200,  cond:(s)=>s.done>=5 },
  { id:"a03", title:"เริ่มต้นที่ดี",    desc:"เสร็จเควส 10 อัน",          icon:"◇", xp:300,  cond:(s)=>s.done>=10 },
  { id:"a04", title:"ฮีโร่ประจำวัน",   desc:"เสร็จเควส 25 อัน",          icon:"△", xp:500,  cond:(s)=>s.done>=25 },
  { id:"a05", title:"นักรบแห่งชีวิต",  desc:"เสร็จเควส 50 อัน",          icon:"□", xp:1000, cond:(s)=>s.done>=50 },
  { id:"a06", title:"เลเวลอัพ!",       desc:"ขึ้นเลเวลครั้งแรก",         icon:"▲", xp:150,  cond:(s)=>s.level>=2 },
  { id:"a07", title:"นักรบระดับ 5",    desc:"ถึงเลเวล 5",                 icon:"⬡", xp:500,  cond:(s)=>s.level>=5 },
  { id:"a08", title:"ผู้เชี่ยวชาญ",    desc:"ถึงเลเวล 10",                icon:"♥", xp:1000, cond:(s)=>s.level>=10 },
  { id:"a09", title:"มีวินัย",         desc:"Streak 3 วันติด",            icon:"□", xp:150,  cond:(s)=>s.streak>=3 },
  { id:"a10", title:"เหล็กกล้า",       desc:"Streak 7 วันติด",            icon:"□", xp:350,  cond:(s)=>s.streak>=7 },
  { id:"a11", title:"รอบด้าน",         desc:"เควสครบทุก 10 หมวด",         icon:"◈", xp:1000, cond:(s)=>Object.keys(CATEGORIES).every(k=>(s.cat[k]||0)>=1) },
  { id:"a12", title:"สะสม XP 5,000",  desc:"XP รวม 5,000",               icon:"◈", xp:500,  cond:(s)=>s.xpEarned>=5000 },
  { id:"a13", title:"เช้าตรู่",        desc:"เสร็จ HIGH priority 5 อัน", icon:"□", xp:300,  cond:(s)=>s.high>=5 },
  { id:"a14", title:"ตำนานแห่งชีวิต",  desc:"ปลดล็อค Achievement 10 อัน",icon:"✦", xp:2000, cond:(s)=>s.unlocked>=10 },
  { id:"a15", title:"Skill Master",   desc:"ปลดล็อค Skill 5 อัน",        icon:"⚡", xp:800,  cond:(s)=>(s.skills||0)>=5 },
];

const mkQ = (d) => ({ completed:false, streak:0, priority:"MEDIUM", rarity:"COMMON", reminderTime:null, ...d });
const INITIAL_QUESTS = [
  mkQ({ id:1,  title:"ออกกำลังกาย 30 นาที",         category:"HEALTH",     xpReward:180, difficulty:"MEDIUM", streak:21, priority:"HIGH",   rarity:"RARE"      }),
  mkQ({ id:2,  title:"ดื่มน้ำ 8 แก้วต่อวัน",         category:"HEALTH",     xpReward:60,  difficulty:"EASY",   streak:5,  priority:"HIGH",   rarity:"COMMON"    }),
  mkQ({ id:3,  title:"นอนหลับก่อน 23:00 น.",         category:"HEALTH",     xpReward:100, difficulty:"MEDIUM", streak:3,  priority:"HIGH",   rarity:"COMMON"    }),
  mkQ({ id:4,  title:"กินผักผลไม้ทุกมื้อ",            category:"HEALTH",     xpReward:80,  difficulty:"EASY",   streak:7,  priority:"MEDIUM", rarity:"COMMON"    }),
  mkQ({ id:5,  title:"อ่านหนังสือ 30 หน้า",           category:"MIND",       xpReward:90,  difficulty:"EASY",   streak:5,  priority:"MEDIUM", rarity:"COMMON"    }),
  mkQ({ id:6,  title:"เรียน Online Course 1 ชั่วโมง", category:"MIND",       xpReward:200, difficulty:"MEDIUM", streak:2,  priority:"HIGH",   rarity:"EPIC"      }),
  mkQ({ id:7,  title:"เขียน Journal ประจำวัน",        category:"MIND",       xpReward:70,  difficulty:"EASY",   streak:12, priority:"MEDIUM", rarity:"COMMON"    }),
  mkQ({ id:8,  title:"ฝึกภาษาใหม่ 15 นาที",          category:"MIND",       xpReward:80,  difficulty:"EASY",   streak:8,  priority:"LOW",    rarity:"RARE"      }),
  mkQ({ id:9,  title:"บันทึกรายรับ-รายจ่ายวันนี้",    category:"FINANCE",    xpReward:60,  difficulty:"EASY",   streak:3,  priority:"MEDIUM", rarity:"COMMON"    }),
  mkQ({ id:10, title:"ทบทวนแผนการออมเงิน",            category:"FINANCE",    xpReward:150, difficulty:"MEDIUM", streak:0,  priority:"MEDIUM", rarity:"RARE"      }),
  mkQ({ id:11, title:"ลดค่าใช้จ่ายฟุ่มเฟือยวันนี้",   category:"FINANCE",    xpReward:100, difficulty:"HARD",   streak:1,  priority:"LOW",    rarity:"COMMON"    }),
  mkQ({ id:12, title:"โทรหาครอบครัวหรือเพื่อน",       category:"SOCIAL",     xpReward:120, difficulty:"EASY",   streak:0,  priority:"MEDIUM", rarity:"COMMON"    }),
  mkQ({ id:13, title:"ช่วยเหลือคนรอบข้าง",            category:"SOCIAL",     xpReward:150, difficulty:"EASY",   streak:4,  priority:"LOW",    rarity:"RARE"      }),
  mkQ({ id:14, title:"เข้าร่วมกิจกรรมชุมชน",          category:"SOCIAL",     xpReward:200, difficulty:"MEDIUM", streak:0,  priority:"LOW",    rarity:"EPIC"      }),
  mkQ({ id:15, title:"วาดรูปหรือระบายสี 20 นาที",     category:"CREATIVE",   xpReward:100, difficulty:"EASY",   streak:2,  priority:"LOW",    rarity:"COMMON"    }),
  mkQ({ id:16, title:"เขียน Blog ที่มีคุณค่า",         category:"CREATIVE",   xpReward:180, difficulty:"MEDIUM", streak:0,  priority:"MEDIUM", rarity:"RARE"      }),
  mkQ({ id:17, title:"ทำอาหารเมนูใหม่",               category:"CREATIVE",   xpReward:120, difficulty:"MEDIUM", streak:1,  priority:"LOW",    rarity:"COMMON"    }),
  mkQ({ id:18, title:"ตื่นนอนตรงเวลา",                category:"DISCIPLINE", xpReward:120, difficulty:"MEDIUM", streak:14, priority:"HIGH",   rarity:"RARE"      }),
  mkQ({ id:19, title:"เลิกใช้โทรศัพท์ก่อนนอน 1 ชม.",  category:"DISCIPLINE", xpReward:100, difficulty:"HARD",   streak:0,  priority:"HIGH",   rarity:"EPIC"      }),
  mkQ({ id:20, title:"ทำสมาธิ 10 นาที",               category:"DISCIPLINE", xpReward:80,  difficulty:"EASY",   streak:6,  priority:"MEDIUM", rarity:"COMMON"    }),
  mkQ({ id:21, title:"วางแผนงานวันถัดไปล่วงหน้า",     category:"CAREER",     xpReward:90,  difficulty:"EASY",   streak:9,  priority:"HIGH",   rarity:"COMMON"    }),
  mkQ({ id:22, title:"Deep Work Session 2 ชั่วโมง",    category:"CAREER",     xpReward:300, difficulty:"HARD",   streak:7,  priority:"HIGH",   rarity:"LEGENDARY" }),
  mkQ({ id:23, title:"อัปเดต Portfolio หรือ CV",       category:"CAREER",     xpReward:200, difficulty:"MEDIUM", streak:0,  priority:"LOW",    rarity:"EPIC"      }),
  mkQ({ id:24, title:"จัดระเบียบโต๊ะทำงาน",            category:"HOME",       xpReward:70,  difficulty:"EASY",   streak:2,  priority:"MEDIUM", rarity:"COMMON"    }),
  mkQ({ id:25, title:"ทำความสะอาดบ้าน 30 นาที",        category:"HOME",       xpReward:100, difficulty:"MEDIUM", streak:0,  priority:"LOW",    rarity:"COMMON"    }),
  mkQ({ id:26, title:"ทานข้าวพร้อมหน้าครอบครัว",       category:"FAMILY",     xpReward:150, difficulty:"EASY",   streak:5,  priority:"HIGH",   rarity:"RARE"      }),
  mkQ({ id:27, title:"ทำกิจกรรมร่วมกับครอบครัว",       category:"FAMILY",     xpReward:200, difficulty:"MEDIUM", streak:0,  priority:"MEDIUM", rarity:"EPIC"      }),
  mkQ({ id:28, title:"Detox Social Media 2 ชั่วโมง",   category:"DIGITAL",    xpReward:120, difficulty:"HARD",   streak:1,  priority:"MEDIUM", rarity:"RARE"      }),
  mkQ({ id:29, title:"เรียนรู้ทักษะดิจิทัลใหม่",       category:"DIGITAL",    xpReward:160, difficulty:"MEDIUM", streak:0,  priority:"LOW",    rarity:"COMMON"    }),
];

const CHAR_STATS = { vitality:78, intellect:91, discipline:65, wealth:82, social:70, creativity:88 };
// ── TOKEN SYSTEM ──────────────────────────────────────────────
// Tokens (🪙) earned per quest by difficulty
const TOKEN_BY_DIFFICULTY = { EASY:1, MEDIUM:3, HARD:6, LEGENDARY:15 };
// Bonus tokens for rarity
const TOKEN_BY_RARITY     = { COMMON:0, RARE:1, EPIC:3, LEGENDARY:8 };

const SHOP_ITEMS = [
  // ── Consumables ──────────────────────────────────────────
  {
    id:"s01", name:"Streak Freeze",       icon:"🧊",
    desc:"ปกป้อง streak ไม่ให้ขาดหาก missed 1 วัน",
    flavor:"\"ความเย็นชาที่ปกป้องไฟในใจ\"",
    cost:15, category:"CONSUMABLE", maxStack:5,
    effect:"streak_freeze",
  },
  {
    id:"s02", name:"XP Booster (1 วัน)", icon:"⚡",
    desc:"XP จากทุกเควส x1.5 เป็นเวลา 24 ชม.",
    flavor:"\"พลังงานที่อัดแน่นในชั่วขณะ\"",
    cost:25, category:"CONSUMABLE", maxStack:3,
    effect:"xp_boost_1d",
  },
  {
    id:"s03", name:"Quest Revive",        icon:"💊",
    desc:"รีเซ็ตเควสที่เสร็จแล้ว 1 อัน กลับมาทำใหม่ได้",
    flavor:"\"โอกาสที่สองไม่มีวันสายเกินไป\"",
    cost:20, category:"CONSUMABLE", maxStack:3,
    effect:"quest_revive",
  },
  {
    id:"s04", name:"Daily Reroll",        icon:"🎲",
    desc:"สุ่ม Daily Challenge ใหม่ 1 ครั้ง",
    flavor:"\"โชคชะตาเปลี่ยนได้ตามใจ\"",
    cost:10, category:"CONSUMABLE", maxStack:5,
    effect:"daily_reroll",
  },
  {
    id:"s05", name:"Boss Time Extend",   icon:"⏳",
    desc:"เพิ่มเวลา Boss Quest อีก 2 วัน",
    flavor:"\"เวลาคือสมบัติล้ำค่าที่สุด\"",
    cost:30, category:"CONSUMABLE", maxStack:2,
    effect:"boss_extend",
  },
  // ── Permanent Upgrades ────────────────────────────────────
  {
    id:"s06", name:"Token Magnet",        icon:"🧲",
    desc:"ได้ Token +1 จากทุกเควสตลอดไป",
    flavor:"\"ดึงดูดสิ่งดีๆ เข้าหาตัว\"",
    cost:80, category:"UPGRADE", maxStack:1,
    effect:"token_plus1",
  },
  {
    id:"s07", name:"XP Amplifier",       icon:"🔮",
    desc:"XP จาก Epic/Legendary เควส +15% ตลอดไป",
    flavor:"\"อำนาจที่ขยายตัวออกไปไม่สิ้นสุด\"",
    cost:100, category:"UPGRADE", maxStack:1,
    effect:"xp_epic_amp",
  },
  {
    id:"s08", name:"Token Vault",         icon:"🏦",
    desc:"เพิ่มระดับ Token ที่เก็บได้สูงสุด +500",
    flavor:"\"คลังสมบัติแห่งความอดทน\"",
    cost:60, category:"UPGRADE", maxStack:3,
    effect:"token_cap",
  },
  // ── Cosmetic ─────────────────────────────────────────────
  {
    id:"s09", name:"Golden Frame",        icon:"🖼️",
    desc:"กรอบทองรอบ Avatar ในหน้า Profile",
    flavor:"\"เกียรติยศที่มองเห็นได้\"",
    cost:50, category:"COSMETIC", maxStack:1,
    effect:"frame_gold",
  },
  {
    id:"s10", name:"Legendary Title",    icon:"👑",
    desc:"ปลดล็อค Title พิเศษ: The Token Master",
    flavor:"\"ผู้ที่ครอบครองทุกสิ่งด้วยความพยายาม\"",
    cost:120, category:"COSMETIC", maxStack:1,
    effect:"title_token_master",
  },
  {
    id:"s11", name:"XP Lottery Ticket",  icon:"🎰",
    desc:"สุ่มรับ XP ระหว่าง 50–500 (random)",
    flavor:"\"โชคที่สร้างได้ด้วยมือตัวเอง\"",
    cost:18, category:"CONSUMABLE", maxStack:10,
    effect:"xp_lottery",
  },
  {
    id:"s12", name:"Quest EXP Transfer", icon:"🔄",
    desc:"XP เควสถัดไปที่ทำ x2 (ครั้งเดียว)",
    flavor:"\"ส่งต่อพลังงานให้กับจุดหมาย\"",
    cost:35, category:"CONSUMABLE", maxStack:3,
    effect:"next_quest_x2",
  },
];

const SHOP_CATEGORIES = ["ทั้งหมด","CONSUMABLE","UPGRADE","COSMETIC"];
const SHOP_CAT_LABELS = { CONSUMABLE:"🧪 Consumable", UPGRADE:"⚙️ Upgrade", COSMETIC:"✨ Cosmetic" };

const NOTIF_SCHEDULES = [
  { id:"n01", label:"เช้า",    time:"08:00", desc:"เริ่มต้นวันด้วยเควส", enabled:true  },
  { id:"n02", label:"กลางวัน", time:"12:00", desc:"ช่วงพักเที่ยง",       enabled:false },
  { id:"n03", label:"เย็น",    time:"18:00", desc:"ก่อนกลับบ้าน",        enabled:true  },
  { id:"n04", label:"ดึก",     time:"21:00", desc:"สรุปงานวันนี้",        enabled:false },
];

// ── XP BONUS CALC (from skill effects) ───────────────────────
const calcXpBonus = (baseXp, quest, unlockedSkills) => {
  let mult = 1;
  const fx = unlockedSkills.map(id => SKILL_TREE.find(s=>s.id===id)?.effect).filter(Boolean);
  if (fx.includes("xp_legend"))  mult += 0.35;
  else if (fx.includes("xp_all")) mult += 0.20;
  if (quest.category==="MIND"    && fx.includes("xp_mind"))    mult += 0.10;
  if (quest.category==="HEALTH"  && fx.includes("xp_health"))  mult += 0.10;
  if (quest.category==="FINANCE" && fx.includes("xp_finance")) mult += 0.10;
  return Math.round(baseXp * mult);
};

// ═══════════════════════════════════════════════════════════════
// VIEWMODEL
// ═══════════════════════════════════════════════════════════════
const useViewModel = () => {
  // ── Persisted state (loaded from AsyncStorage on mount) ──────
  const [loaded, setLoaded]   = useState(false); // true after hydration
  const [theme, setTheme]     = useState("DARK");
  const [totalXp, setTotalXp] = useState(0);
  const [quests, setQuests]   = useState(INITIAL_QUESTS);
  const [activeTab, setActiveTab] = useState("DASHBOARD");
  const [achList, setAchList] = useState(ACHIEVEMENTS_DEF.map(a=>({...a,unlocked:false})));
  const [levelUpModal, setLevelUpModal] = useState(null);
  const [achToast, setAchToast] = useState(null);
  const [gameStats, setGameStats] = useState({ done:0, xpEarned:0, cat:{}, streak:0, high:0, unlocked:0, level:1, skills:0 });
  const [profile, setProfile] = useState({ name:"Commander", title:"Life Architect", avatarEmoji:"⚔️", avatarBg:"#1A1A24" });
  const [unlockedSkills, setUnlockedSkills] = useState([]);
  const [skillPoints, setSkillPoints] = useState(0);
  const [tokens, setTokens]           = useState(0);
  const [inventory, setInventory]     = useState([]);
  const [activeEffects, setActiveEffects] = useState([]);
  const [nextQuestX2, setNextQuestX2] = useState(false);
  const [chainProgress, setChainProgress] = useState({});
  const [dailyChallenge, setDailyChallenge] = useState(()=>{
    const idx = Math.floor(Math.random()*DAILY_POOL.length);
    return { ...DAILY_POOL[idx], completed:false };
  });
  const [notifSettings, setNotifSettings] = useState(NOTIF_SCHEDULES);
  const [notifBanner, setNotifBanner] = useState(null);
  const [dailyHistory, setDailyHistory] = useState([]);
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());
  const [bossQuest, setBossQuest] = useState({ ...BOSS_POOL[0], progress:0, completed:false, daysLeft:5 });
  const [moodLog, setMoodLog] = useState([]);
  const [goals, setGoals] = useState([
    { id:"g1", title:"อ่านหนังสือ 12 เล่มในปีนี้",  target:12,  current:2,  category:"MIND",    deadline:"2025-12-31" },
    { id:"g2", title:"ออกกำลังกาย 200 ครั้ง",      target:200, current:21, category:"HEALTH",  deadline:"2025-12-31" },
    { id:"g3", title:"ออมเงิน 100,000 บาท",        target:100, current:35, category:"FINANCE", deadline:"2025-12-31" },
  ]);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [questEditor, setQuestEditor] = useState(null);

  // ── STORAGE KEY ──────────────────────────────────────────────
  const SAVE_KEY = "liferpg_save_v1";

  // ── LOAD on mount ────────────────────────────────────────────
  useEffect(()=>{
    (async ()=>{
      try {
        const raw = await AsyncStorage.getItem(SAVE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          if (s.theme)          setTheme(s.theme);
          if (s.totalXp!=null)  setTotalXp(s.totalXp);
          if (s.quests)         setQuests(s.quests);
          if (s.achList)        setAchList(s.achList);
          if (s.gameStats)      setGameStats(s.gameStats);
          if (s.profile)        setProfile(s.profile);
          if (s.unlockedSkills) setUnlockedSkills(s.unlockedSkills);
          if (s.skillPoints!=null) setSkillPoints(s.skillPoints);
          if (s.tokens!=null)   setTokens(s.tokens);
          if (s.inventory)      setInventory(s.inventory);
          if (s.activeEffects)  setActiveEffects(s.activeEffects.filter(e=>Date.now()<e.expiresAt));
          if (s.nextQuestX2!=null) setNextQuestX2(s.nextQuestX2);
          if (s.chainProgress)  setChainProgress(s.chainProgress);
          if (s.dailyChallenge) setDailyChallenge(s.dailyChallenge);
          if (s.notifSettings)  setNotifSettings(s.notifSettings);
          if (s.dailyHistory)   setDailyHistory(s.dailyHistory);
          if (s.lastResetDate)  setLastResetDate(s.lastResetDate);
          if (s.bossQuest)      setBossQuest(s.bossQuest);
          if (s.moodLog)        setMoodLog(s.moodLog);
          if (s.goals)          setGoals(s.goals);
          if (s.onboardingDone!=null) setOnboardingDone(s.onboardingDone);
        }
      } catch(e) { console.warn("Load error:", e); }
      finally { setLoaded(true); }
    })();
  }, []);

  // ── SAVE whenever key state changes (debounced 800ms) ────────
  const saveTimer = useRef(null);
  const saveState = useCallback((patch={}) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async ()=>{
      try {
        // We read latest values via functional approach — use refs instead
        await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(patch));
      } catch(e) { console.warn("Save error:", e); }
    }, 800);
  },[]);

  // Build snapshot and save whenever any major state changes
  useEffect(()=>{
    if (!loaded) return; // don't save before hydration
    const snap = {
      theme, totalXp, quests, achList, gameStats, profile,
      unlockedSkills, skillPoints, tokens, inventory, activeEffects,
      nextQuestX2, chainProgress, dailyChallenge, notifSettings,
      dailyHistory, lastResetDate, bossQuest, moodLog, goals, onboardingDone,
    };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async ()=>{
      try { await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(snap)); }
      catch(e) { console.warn("Save error:", e); }
    }, 800);
  },[
    loaded, theme, totalXp, quests, achList, gameStats, profile,
    unlockedSkills, skillPoints, tokens, inventory, activeEffects,
    nextQuestX2, chainProgress, dailyChallenge, notifSettings,
    dailyHistory, lastResetDate, bossQuest, moodLog, goals, onboardingDone,
  ]);

  const T = THEMES[theme];
  const toggleTheme = () => setTheme(t => t==="DARK" ? "LIGHT" : "DARK");
  const updateProfile = (patch) => setProfile(p=>({...p,...patch}));
  const level    = calcLevel(totalXp);
  const xpInLvl  = calcXpInLvl(totalXp);
  const progress = Math.min((xpInLvl / XP_PER_LEVEL) * 100, 100);

  const showBanner = (msg) => {
    setNotifBanner({ message:msg });
    setTimeout(()=>setNotifBanner(null), 3500);
  };

  // Daily reset
  useEffect(()=>{
    const today = new Date().toDateString();
    if (today !== lastResetDate) {
      const done = quests.filter(q=>q.completed).length;
      const xpDay = quests.filter(q=>q.completed).reduce((a,q)=>a+q.xpReward,0);
      setDailyHistory(h=>[...h.slice(-29), { date:lastResetDate, completedCount:done, xpEarned:xpDay }]);
      setQuests(INITIAL_QUESTS);
      setLastResetDate(today);
      const next = BOSS_POOL[Math.floor(Math.random()*BOSS_POOL.length)];
      setBossQuest({...next, progress:0, completed:false, daysLeft:5});
      const newDC = DAILY_POOL[Math.floor(Math.random()*DAILY_POOL.length)];
      setDailyChallenge({...newDC, completed:false});
      showBanner("🌅 วันใหม่มาแล้ว! เควสรีเซ็ตแล้ว");
    }
  },[]);

  useEffect(()=>{
    if (notifSettings.some(n=>n.enabled)) {
      setTimeout(()=>showBanner("⚔️ วันนี้มีเควสรอคุณอยู่! มาลุยกัน"), 1500);
    }
  },[]);

  const manualReset = () => {
    const done = quests.filter(q=>q.completed).length;
    const xpDay = quests.filter(q=>q.completed).reduce((a,q)=>a+q.xpReward,0);
    setDailyHistory(h=>[...h.slice(-29), { date:new Date().toDateString(), completedCount:done, xpEarned:xpDay }]);
    setQuests(INITIAL_QUESTS);
    showBanner("🔄 รีเซ็ตเควสแล้ว!");
  };

  const calcTokenReward = (quest) => {
    const base = TOKEN_BY_DIFFICULTY[quest.difficulty] || 1;
    const rarBonus = TOKEN_BY_RARITY[quest.rarity] || 0;
    const permPlus = inventory.find(i=>i.itemId==="s06") ? 1 : 0;
    return base + rarBonus + permPlus;
  };

  const isXpBoosted = () => activeEffects.some(e=>e.effect==="xp_boost_1d" && Date.now()<e.expiresAt);
  const isEpicAmpOwned = () => inventory.some(i=>i.itemId==="s07");

  const completeQuest = useCallback((questId) => {
    setQuests(prev => {
      const q = prev.find(x => x.id===questId && !x.completed);
      if (!q) return prev;

      // XP calc with skill bonuses
      let earned = calcXpBonus(q.xpReward, q, unlockedSkills);
      // XP Booster effect
      if (isXpBoosted()) earned = Math.round(earned * 1.5);
      // XP Amplifier perm upgrade (Epic/Legendary)
      if (isEpicAmpOwned() && (q.rarity==="EPIC"||q.rarity==="LEGENDARY")) earned = Math.round(earned * 1.15);
      // next quest x2 (one-time)
      if (nextQuestX2) { earned = earned * 2; setNextQuestX2(false); }

      // Token reward
      const tokensEarned = calcTokenReward(q);
      setTokens(t => t + tokensEarned);

      setTotalXp(cur => {
        const oldLv=calcLevel(cur), newXp=cur+earned, newLv=calcLevel(newXp);
        if (newLv>oldLv) {
          setSkillPoints(sp=>sp+SKILL_POINTS_PER_LEVEL);
          setTimeout(()=>setLevelUpModal({newLevel:newLv}),250);
        }
        return newXp;
      });
      setGameStats(s => {
        const newCat  = {...s.cat,[q.category]:(s.cat[q.category]||0)+1};
        const newDone = s.done+1, newXpE=s.xpEarned+earned;
        const newHigh = s.high+(q.priority==="HIGH"?1:0);
        const newStreak=Math.max(s.streak, q.streak+1);
        const newLv=calcLevel(newXpE);
        const newS={ done:newDone,xpEarned:newXpE,cat:newCat,streak:newStreak,high:newHigh,level:newLv,unlocked:s.unlocked,skills:s.skills };
        setBossQuest(b=>{ if(b.completed) return b; const np=Math.min(b.progress+1,b.target); return {...b,progress:np}; });
        setTimeout(()=>{
          setAchList(cur=>{
            const unlockedSoFar=cur.filter(a=>a.unlocked).length;
            const sw={...newS,unlocked:unlockedSoFar};
            let firstNew=null;
            const updated=cur.map(a=>{ if(!a.unlocked&&a.cond(sw)){if(!firstNew)firstNew=a; return{...a,unlocked:true};} return a;});
            if(firstNew){ setTimeout(()=>setAchToast({...firstNew,unlocked:true}),100); return updated; }
            return cur;
          });
        },300);
        return newS;
      });

      // show token banner
      showBanner(`✅ +${earned} XP · +${tokensEarned} 🪙`);
      return prev.map(x=>x.id===questId?{...x,completed:true,streak:x.streak+1}:x);
    });
  },[unlockedSkills, activeEffects, nextQuestX2, inventory]);

  const completeDailyChallenge = () => {
    if (dailyChallenge.completed) return;
    const earned = dailyChallenge.xp;
    setDailyChallenge(d=>({...d,completed:true}));
    setTotalXp(cur=>{
      const oldLv=calcLevel(cur),newXp=cur+earned,newLv=calcLevel(newXp);
      if(newLv>oldLv){setSkillPoints(sp=>sp+SKILL_POINTS_PER_LEVEL); setTimeout(()=>setLevelUpModal({newLevel:newLv}),250);}
      return newXp;
    });
    showBanner(`⚡ Daily Challenge สำเร็จ! +${earned} XP`);
  };

  const completeBossQuest = () => {
    if (bossQuest.completed) return;
    const fx = unlockedSkills.map(id=>SKILL_TREE.find(s=>s.id===id)?.effect).filter(Boolean);
    const mult = fx.includes("xp_boss") ? 1.25 : 1;
    const earned = Math.round(bossQuest.xpReward * mult);
    setBossQuest(b=>({...b,completed:true,progress:b.target}));
    setTotalXp(cur=>{
      const oldLv=calcLevel(cur),newXp=cur+earned,newLv=calcLevel(newXp);
      if(newLv>oldLv){setSkillPoints(sp=>sp+SKILL_POINTS_PER_LEVEL); setTimeout(()=>setLevelUpModal({newLevel:newLv}),250);}
      return newXp;
    });
    showBanner(`🏆 Boss Quest สำเร็จ! +${earned.toLocaleString()} XP`);
  };

  const unlockSkill = (skillId) => {
    const sk = SKILL_TREE.find(s=>s.id===skillId);
    if (!sk || unlockedSkills.includes(skillId)) return;
    if (skillPoints < sk.cost) { showBanner("❌ Skill Points ไม่พอ"); return; }
    const prereqs = sk.requires.every(r=>unlockedSkills.includes(r));
    if (!prereqs) { showBanner("❌ ต้องปลดล็อค Skill ก่อนหน้าก่อน"); return; }
    setUnlockedSkills(prev=>[...prev, skillId]);
    setSkillPoints(sp=>sp-sk.cost);
    setGameStats(s=>({...s, skills:(s.skills||0)+1}));
    showBanner(`✨ ปลดล็อค ${sk.name}!`);
  };

  const buyItem = (itemId) => {
    const item = SHOP_ITEMS.find(i=>i.id===itemId);
    if (!item) return;
    if (tokens < item.cost) { showBanner("❌ Token ไม่พอ"); return; }
    // check maxStack
    const owned = inventory.find(i=>i.itemId===itemId);
    if (item.maxStack===1 && owned) { showBanner("✅ มีแล้ว! ใช้ได้เลย"); return; }
    if (owned && owned.qty >= item.maxStack) { showBanner(`❌ เก็บได้สูงสุด ${item.maxStack} ชิ้น`); return; }
    setTokens(t=>t-item.cost);
    setInventory(prev=>{
      const ex = prev.find(i=>i.itemId===itemId);
      if (ex) return prev.map(i=>i.itemId===itemId?{...i,qty:i.qty+1}:i);
      return [...prev, { itemId, qty:1, acquiredAt:Date.now() }];
    });
    showBanner(`🛒 ซื้อ ${item.name} สำเร็จ! 🪙-${item.cost}`);
  };

  const useItem = (itemId) => {
    const item = SHOP_ITEMS.find(i=>i.id===itemId);
    const owned = inventory.find(i=>i.itemId===itemId);
    if (!item || !owned || owned.qty<1) return;

    // Apply effect
    switch(item.effect){
      case "xp_boost_1d":
        setActiveEffects(prev=>[...prev.filter(e=>e.effect!=="xp_boost_1d"), { effect:"xp_boost_1d", expiresAt:Date.now()+86400000 }]);
        showBanner("⚡ XP Booster เปิดใช้แล้ว! x1.5 XP 24 ชม.");
        break;
      case "streak_freeze":
        setActiveEffects(prev=>[...prev, { effect:"streak_freeze", expiresAt:Date.now()+86400000*2 }]);
        showBanner("🧊 Streak Freeze เปิดใช้แล้ว! ปกป้อง 2 วัน");
        break;
      case "quest_revive": {
        const doneQ = quests.filter(q=>q.completed);
        if (doneQ.length===0){ showBanner("ไม่มีเควสที่เสร็จแล้ว"); return; }
        const pick = doneQ[Math.floor(Math.random()*doneQ.length)];
        setQuests(prev=>prev.map(q=>q.id===pick.id?{...q,completed:false}:q));
        showBanner(`💊 รีไวฟ์ "${pick.title}" แล้ว!`);
        break;
      }
      case "daily_reroll": {
        const newDC = DAILY_POOL[Math.floor(Math.random()*DAILY_POOL.length)];
        setDailyChallenge({...newDC,completed:false});
        showBanner("🎲 Daily Challenge ใหม่มาแล้ว!");
        break;
      }
      case "boss_extend":
        setBossQuest(b=>({...b,daysLeft:b.daysLeft+2}));
        showBanner("⏳ Boss Quest ขยายเวลา +2 วันแล้ว!");
        break;
      case "xp_lottery": {
        const loot = Math.floor(Math.random()*451)+50; // 50–500
        setTotalXp(cur=>cur+loot);
        showBanner(`🎰 Lucky! ได้ +${loot} XP!`);
        break;
      }
      case "next_quest_x2":
        setNextQuestX2(true);
        showBanner("🔄 เควสถัดไปได้ XP x2!");
        break;
      case "title_token_master":
        // add special title
        showBanner("👑 ปลดล็อค Title: The Token Master!");
        break;
      default:
        showBanner(`✅ ${item.name} ใช้แล้ว`);
    }

    // Consume if consumable (not perm/cosmetic)
    if (item.category==="CONSUMABLE"){
      setInventory(prev=>prev.map(i=>i.itemId===itemId?{...i,qty:i.qty-1}:i).filter(i=>i.qty>0));
    }
  };

  const completeChainQuest = (chainId) => {
    const chain = QUEST_CHAINS.find(c=>c.id===chainId);
    if (!chain) return;
    const currentStep = chainProgress[chainId] || 0;
    if (currentStep >= chain.quests.length) return;
    const q = chain.quests[currentStep];
    const earned = q.xpReward;
    setChainProgress(p=>({...p,[chainId]:currentStep+1}));
    setTotalXp(cur=>{
      const oldLv=calcLevel(cur),newXp=cur+earned,newLv=calcLevel(newXp);
      if(newLv>oldLv){setSkillPoints(sp=>sp+SKILL_POINTS_PER_LEVEL); setTimeout(()=>setLevelUpModal({newLevel:newLv}),250);}
      return newXp;
    });
    showBanner(`⚔️ ${q.title} สำเร็จ! +${earned} XP`);
  };

  const logMood = (mood, note="") => {
    setMoodLog(prev=>{
      const today = new Date().toDateString();
      const filtered = prev.filter(m=>m.date!==today);
      return [...filtered, { date:today, mood, note }].slice(-30);
    });
  };

  const saveGoal = (goal) => {
    if (goal.id) {
      setGoals(prev=>prev.map(g=>g.id===goal.id ? goal : g));
    } else {
      setGoals(prev=>[...prev, { ...goal, id:`g${Date.now()}`, current:0 }]);
    }
  };

  const deleteGoal = (goalId) => setGoals(prev=>prev.filter(g=>g.id!==goalId));

  const saveQuest = (quest) => {
    if (quest.id && quests.find(q=>q.id===quest.id)) {
      setQuests(prev=>prev.map(q=>q.id===quest.id ? quest : q));
    } else {
      setQuests(prev=>[...prev, { ...quest, id:Date.now(), completed:false, streak:0 }]);
    }
    setQuestEditor(null);
  };

  const deleteQuest = (questId) => {
    setQuests(prev=>prev.filter(q=>q.id!==questId));
  };

  const toggleNotif = (id) => setNotifSettings(prev=>prev.map(n=>n.id===id?{...n,enabled:!n.enabled}:n));

  const clearSaveData = async () => {
    try {
      await AsyncStorage.removeItem("liferpg_save_v1");
      // Reset all state to defaults
      setTheme("DARK"); setTotalXp(0); setQuests(INITIAL_QUESTS);
      setAchList(ACHIEVEMENTS_DEF.map(a=>({...a,unlocked:false})));
      setGameStats({ done:0, xpEarned:0, cat:{}, streak:0, high:0, unlocked:0, level:1, skills:0 });
      setProfile({ name:"Commander", title:"Life Architect", avatarEmoji:"⚔️", avatarBg:"#1A1A24" });
      setUnlockedSkills([]); setSkillPoints(0);
      setTokens(0); setInventory([]); setActiveEffects([]); setNextQuestX2(false);
      setChainProgress({}); setDailyHistory([]); setMoodLog([]);
      setGoals([
        { id:"g1", title:"อ่านหนังสือ 12 เล่มในปีนี้", target:12,  current:2,  category:"MIND",    deadline:"2025-12-31" },
        { id:"g2", title:"ออกกำลังกาย 200 ครั้ง",     target:200, current:21, category:"HEALTH",  deadline:"2025-12-31" },
        { id:"g3", title:"ออมเงิน 100,000 บาท",       target:100, current:35, category:"FINANCE", deadline:"2025-12-31" },
      ]);
      setOnboardingDone(false);
      showBanner("🗑️ ลบข้อมูลทั้งหมดแล้ว");
    } catch(e) { console.warn("Clear error:", e); }
  };

  const weeklyReport = (() => {
    const last7 = dailyHistory.slice(-7);
    const totalDone = last7.reduce((a,h)=>a+h.completedCount, 0);
    const totalXpWeek = last7.reduce((a,h)=>a+h.xpEarned, 0);
    const bestDay = last7.reduce((best,h)=>h.completedCount>best.completedCount?h:best, last7[0]||{completedCount:0,xpEarned:0,date:"-"});
    const avgMood = moodLog.slice(-7).reduce((a,m)=>a+m.mood.value,0) / (moodLog.slice(-7).length||1);
    return { totalDone, totalXpWeek, bestDay, avgMood: avgMood.toFixed(1), days: last7.length };
  })();

  return {
    theme, T, toggleTheme,
    totalXp, level, xpInLvl, progress,
    quests, activeTab, setActiveTab, completeQuest, saveQuest, deleteQuest,
    achList, levelUpModal, setLevelUpModal, achToast, setAchToast,
    gameStats, profile, updateProfile,
    unlockedSkills, skillPoints, unlockSkill,
    tokens, inventory, buyItem, useItem, activeEffects,
    chainProgress, completeChainQuest,
    dailyChallenge, completeDailyChallenge,
    bossQuest, completeBossQuest,
    notifSettings, toggleNotif, notifBanner,
    dailyHistory, manualReset,
    moodLog, logMood,
    goals, saveGoal, deleteGoal,
    onboardingDone, setOnboardingDone,
    questEditor, setQuestEditor,
    weeklyReport,
    loaded, clearSaveData,
  };
};

// ═══════════════════════════════════════════════════════════════
// SVG COMPONENTS
// ═══════════════════════════════════════════════════════════════
const HexRadar = ({ stats, T }) => {
  const keys=Object.keys(stats), vals=Object.values(stats);
  const cx=100,cy=100,r=70,n=keys.length;
  const toXY=(angle,rad)=>({x:cx+rad*Math.cos(angle-Math.PI/2),y:cy+rad*Math.sin(angle-Math.PI/2)});
  const pts=vals.map((v,i)=>toXY((2*Math.PI*i)/n,(v/100)*r));
  const path=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ")+"Z";
  const gridColor = T?.theme==="LIGHT" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
  return (
    <Svg viewBox="0 0 200 200" width={180} height={180}>
      {[.25,.5,.75,1].map(lv=>{
        const gp=keys.map((_,i)=>toXY((2*Math.PI*i)/n,r*lv));
        return <Path key={lv} d={gp.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ")+"Z"} fill="none" stroke={gridColor} strokeWidth="1"/>;
      })}
      {keys.map((_,i)=>{const pt=toXY((2*Math.PI*i)/n,r);return <Line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke={gridColor} strokeWidth="1"/>;} )}
      <Path d={path} fill="rgba(201,168,76,0.12)" stroke="#C9A84C" strokeWidth="1.5"/>
      {pts.map((p,i)=><Circle key={i} cx={p.x} cy={p.y} r="3" fill="#C9A84C"/>)}
      {keys.map((k,i)=>{const lp=toXY((2*Math.PI*i)/n,r+14);return <SvgText key={i} x={lp.x} y={lp.y} textAnchor="middle" fontSize="6" fill="rgba(201,168,76,0.6)" fontFamily="monospace">{k.slice(0,3).toUpperCase()}</SvgText>;})}
    </Svg>
  );
};

const RingProgress = ({ value, size=64, stroke=3, color="#C9A84C" }) => {
  const rr=(size-stroke*2)/2, circ=2*Math.PI*rr, dash=(value/100)*circ;
  return (
    <Svg width={size} height={size} style={{transform:[{rotate:"-90deg"}]}}>
      <Circle cx={size/2} cy={size/2} r={rr} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
      <Circle cx={size/2} cy={size/2} r={rr} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="butt"/>
    </Svg>
  );
};

// Habit Calendar (GitHub-style)
const HabitCalendar = ({ history, T }) => {
  const weeks = 10, days = 7;
  const today = new Date();
  const cells = [];
  for (let w=weeks-1;w>=0;w--) {
    for (let d=days-1;d>=0;d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w*7+d));
      const ds = date.toDateString();
      const entry = history.find(h=>h.date===ds);
      const intensity = entry ? Math.min(entry.completedCount/5,1) : 0;
      cells.push({ date:ds, intensity });
    }
  }
  const cw=9, ch=9, gap=2;
  return (
    <Svg width={(cw+gap)*weeks} height={(ch+gap)*days+10}>
      {cells.map((c,i)=>{
        const wx=Math.floor(i/days), dy=i%days;
        const alpha = c.intensity;
        const fill = alpha===0 ? (T?.void||"#06060A") : `rgba(201,168,76,${0.15+alpha*0.85})`;
        return <Rect key={i} x={wx*(cw+gap)} y={dy*(ch+gap)} width={cw} height={ch} fill={fill} rx="1"/>;
      })}
    </Svg>
  );
};

// ═══════════════════════════════════════════════════════════════
// MICRO COMPONENTS
// ═══════════════════════════════════════════════════════════════

// Notification Banner
const NotifBanner = ({ message, T }) => {
  const ty=useRef(new Animated.Value(-80)).current;
  useEffect(()=>{ Animated.spring(ty,{toValue:0,useNativeDriver:true,tension:80,friction:10}).start(); },[]);
  return (
    <Animated.View style={[css.banner,{backgroundColor:T.surface2,borderBottomColor:T.border,transform:[{translateY:ty}]}]}>
      <Text style={[css.bannerTxt,{color:T.textPrimary}]}>{message}</Text>
    </Animated.View>
  );
};

// Level Up Modal
const LevelUpModal = ({ level:lv, onClose, T }) => {
  const scale=useRef(new Animated.Value(0.4)).current;
  const glow =useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    Animated.spring(scale,{toValue:1,useNativeDriver:true,tension:55,friction:7}).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow,{toValue:1,duration:700,useNativeDriver:true}),
      Animated.timing(glow,{toValue:0,duration:700,useNativeDriver:true}),
    ])).start();
    const t=setTimeout(onClose,4000); return ()=>clearTimeout(t);
  },[]);
  const glowOp=glow.interpolate({inputRange:[0,1],outputRange:[0.25,1]});
  return (
    <Modal transparent animationType="none" visible>
      <View style={css.modalOverlay}>
        <Animated.View style={[css.lvBox,{backgroundColor:T.surface2,borderColor:T.gold,transform:[{scale}]}]}>
          <Animated.Text style={[css.lvGlow,{color:T.gold,opacity:glowOp}]}>✦</Animated.Text>
          <Text style={[css.lvLabel,{color:T.textDim}]}>LEVEL  UP</Text>
          <Text style={[css.lvNum,{color:T.goldLight}]}>{lv}</Text>
          <Text style={[css.lvSub,{color:T.textSecondary}]}>ยินดีด้วย! คุณขึ้นเลเวล {lv} แล้ว</Text>
          <Text style={[css.lvSub,{color:T.gold,fontSize:11}]}>+1 Skill Point รับไปด้วย! 🎯</Text>
          <TouchableOpacity style={[css.lvBtn,{borderColor:T.gold}]} onPress={onClose}>
            <Text style={[css.lvBtnTxt,{color:T.gold}]}>ดำเนินต่อ  ▶</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Achievement Toast
const AchToast = ({ ach, onClose, T }) => {
  const ty=useRef(new Animated.Value(-120)).current;
  useEffect(()=>{
    Animated.spring(ty,{toValue:0,useNativeDriver:true,tension:80,friction:10}).start();
    const t=setTimeout(()=>Animated.timing(ty,{toValue:-120,duration:280,useNativeDriver:true}).start(onClose),3200);
    return ()=>clearTimeout(t);
  },[]);
  return (
    <Animated.View style={[css.achToast,{backgroundColor:T.surface2,borderColor:T.gold,transform:[{translateY:ty}]}]}>
      <Text style={css.achToastIcon}>{ach.icon}</Text>
      <View style={{flex:1}}>
        <Text style={[css.achToastMeta,{color:T.textDim}]}>Achievement Unlocked!</Text>
        <Text style={[css.achToastTitle,{color:T.goldLight}]}>{ach.title}</Text>
        <Text style={[css.achToastDesc,{color:T.textSecondary}]}>{ach.desc}</Text>
      </View>
      <Text style={[css.achToastXp,{color:T.gold}]}>+{ach.xp}</Text>
    </Animated.View>
  );
};

// Quest Item
const QuestItem = ({ quest:q, onPress, onLongPress, T }) => {
  const scale=useRef(new Animated.Value(1)).current;
  const flash=useRef(new Animated.Value(0)).current;
  const catColor=getCatColor(q.category);
  const rar=RARITY[q.rarity]||RARITY.COMMON;

  const handlePress = () => {
    if(q.completed) return;
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale,{toValue:0.93,useNativeDriver:true,speed:80}),
        Animated.timing(flash,{toValue:0.18,duration:60,useNativeDriver:true}),
      ]),
      Animated.parallel([
        Animated.spring(scale,{toValue:1.02,useNativeDriver:true,speed:30,bounciness:14}),
        Animated.timing(flash,{toValue:0,duration:250,useNativeDriver:true}),
      ]),
      Animated.spring(scale,{toValue:1,useNativeDriver:true,speed:30}),
    ]).start();
    setTimeout(onPress,100);
  };

  const priorityColor={HIGH:"#F43F5E",MEDIUM:"#C9A84C",LOW:"rgba(240,237,232,0.2)"}[q.priority];
  return (
    <Animated.View style={{transform:[{scale}]}}>
      <TouchableOpacity
        style={[css.questItem,{backgroundColor:T.surface,borderColor:q.completed?T.border:rar.glow||T.border},q.completed&&{opacity:0.4}]}
        onPress={handlePress} onLongPress={onLongPress} activeOpacity={1}>
        <Animated.View style={[css.questFlash,{opacity:flash,backgroundColor:catColor}]}/>
        <View style={[css.priorityBar,{backgroundColor:priorityColor}]}/>
        <View style={[css.questCheck,{borderColor:q.completed?"#C9A84C55":catColor+"55"},q.completed&&{backgroundColor:"rgba(201,168,76,0.15)"}]}>
          <Text style={{fontSize:10,color:q.completed?"#C9A84C":catColor}}>{q.completed?"✓":"○"}</Text>
        </View>
        <View style={{flex:1}}>
          <Text style={[css.questTitle,{color:T.textPrimary}]}>{q.title}</Text>
          <View style={{flexDirection:"row",gap:6,marginTop:3,flexWrap:"wrap",alignItems:"center"}}>
            <View style={[css.catBadge,{borderColor:catColor+"40"}]}>
              <Text style={{fontSize:7,color:catColor,letterSpacing:1}}>{getCatIcon(q.category)} {getCatLabel(q.category)}</Text>
            </View>
            <Text style={[css.rarityTag,{color:rar.color}]}>{rar.stars} {rar.label}</Text>
            {q.streak>0&&<Text style={{fontSize:7,color:"#2DD4BF"}}>🔥{q.streak}</Text>}
            {q.reminderTime&&<Text style={{fontSize:7,color:"#A78BFA"}}>⏰{q.reminderTime}</Text>}
          </View>
        </View>
        <Text style={[css.questXP,{color:T.gold}]}>+{q.xpReward}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════════════════════════
const OnboardingScreen = ({ onDone, T }) => {
  const [step, setStep] = useState(0);
  const slideX = useRef(new Animated.Value(0)).current;

  const slides = [
    { icon:"⚔️", title:"ยินดีต้อนรับสู่ LifeRPG", desc:"เปลี่ยนชีวิตประจำวันของคุณให้เป็นเกม RPG ที่น่าตื่นเต้น ทำเควสรับ XP และเลเวลอัพตัวเอง!" },
    { icon:"◆",  title:"ระบบเควส & Rarity",        desc:"เควสแต่ละอันมีความหายาก Common → Rare → Epic → Legendary ยิ่งยาก XP ยิ่งเยอะ!" },
    { icon:"⚡",  title:"Skill Tree",               desc:"ปลดล็อค Skill เพื่อรับโบนัส XP และพลังพิเศษ ทุกครั้งที่เลเวลอัพได้ 1 Skill Point!" },
    { icon:"🏆",  title:"Boss Quest & Daily",       desc:"ทำ Daily Challenge รับ XP พิเศษ และต่อสู้กับ Boss Quest ประจำสัปดาห์!" },
    { icon:"📊",  title:"ติดตามความก้าวหน้า",        desc:"ดู Mood Log, Habit Calendar, Weekly Report และ Goal Tracker เพื่อพัฒนาตัวเองอย่างต่อเนื่อง" },
  ];

  const goNext = () => {
    if (step<slides.length-1) {
      Animated.spring(slideX,{toValue:-(step+1)*SW,useNativeDriver:true,tension:60,friction:10}).start();
      setStep(s=>s+1);
    } else { onDone(); }
  };

  return (
    <View style={[css.onboardWrap,{backgroundColor:T.void}]}>
      <Animated.View style={{flexDirection:"row",width:SW*slides.length,transform:[{translateX:slideX}]}}>
        {slides.map((sl,i)=>(
          <View key={i} style={[css.onboardSlide,{width:SW}]}>
            <Text style={css.onboardIcon}>{sl.icon}</Text>
            <Text style={[css.onboardTitle,{color:T.textPrimary}]}>{sl.title}</Text>
            <Text style={[css.onboardDesc,{color:T.textSecondary}]}>{sl.desc}</Text>
          </View>
        ))}
      </Animated.View>

      <View style={css.onboardDots}>
        {slides.map((_,i)=>(
          <View key={i} style={[css.dot,{backgroundColor:i===step?T.gold:T.border}]}/>
        ))}
      </View>

      <TouchableOpacity style={[css.onboardBtn,{borderColor:T.gold,backgroundColor:T.goldDim}]} onPress={goNext}>
        <Text style={[css.onboardBtnTxt,{color:T.gold}]}>
          {step<slides.length-1 ? "ถัดไป →" : "เริ่มเลย! ⚔️"}
        </Text>
      </TouchableOpacity>

      {step<slides.length-1&&(
        <TouchableOpacity onPress={onDone} style={{marginTop:12}}>
          <Text style={{color:T.textDim,fontSize:10,letterSpacing:2}}>ข้ามไปเลย</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// QUEST EDITOR MODAL
// ═══════════════════════════════════════════════════════════════
const QuestEditorModal = ({ quest, onSave, onClose, T }) => {
  const [title, setTitle]     = useState(quest?.title||"");
  const [category,setCategory]= useState(quest?.category||"HEALTH");
  const [priority,setPriority]= useState(quest?.priority||"MEDIUM");
  const [rarity, setRarity]   = useState(quest?.rarity||"COMMON");
  const [xp, setXp]           = useState(String(quest?.xpReward||100));
  const [reminder,setReminder]= useState(quest?.reminderTime||"");
  const slideY=useRef(new Animated.Value(600)).current;
  useEffect(()=>{ Animated.spring(slideY,{toValue:0,useNativeDriver:true,tension:60,friction:10}).start(); },[]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...(quest||{}), title:title.trim(), category, priority, rarity, xpReward:parseInt(xp)||100, reminderTime:reminder||null, difficulty:"MEDIUM" });
  };

  const PickRow = ({ label, options, value, onSelect, colorMap }) => (
    <View style={{marginBottom:14}}>
      <Text style={[css.fieldLabel,{color:T.textDim}]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map(o=>{
          const active=value===o;
          const col=colorMap?.[o]||T.gold;
          return (
            <TouchableOpacity key={o} onPress={()=>onSelect(o)}
              style={[css.pickChip,{borderColor:active?col:T.border,backgroundColor:active?col+"22":T.surface}]}>
              <Text style={{fontSize:9,color:active?col:T.textDim,letterSpacing:1}}>{o}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <Modal transparent animationType="none" visible>
      <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={{flex:1}}>
        <View style={css.psOverlay}>
          <TouchableOpacity style={css.psOverlayBg} onPress={onClose}/>
          <Animated.View style={[css.psSheet,{backgroundColor:T.surface2,borderTopColor:T.border,transform:[{translateY:slideY}]}]}>
            <View style={[css.psSheetHeader,{borderBottomColor:T.border}]}>
              <Text style={[css.psSheetTitle,{color:T.textPrimary}]}>{quest?.id?"แก้ไขเควส":"เพิ่มเควสใหม่"}</Text>
              <TouchableOpacity onPress={onClose}><Text style={{color:T.textDim,fontSize:16}}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={{padding:20}} showsVerticalScrollIndicator={false}>
              <Text style={[css.fieldLabel,{color:T.textDim}]}>ชื่อเควส</Text>
              <TextInput
                value={title} onChangeText={setTitle} placeholder="เช่น ออกกำลังกาย 30 นาที"
                placeholderTextColor={T.textDim}
                style={[css.textInput,{color:T.textPrimary,borderColor:T.border,backgroundColor:T.surface}]}
              />
              <PickRow label="หมวดหมู่" options={Object.keys(CATEGORIES)} value={category} onSelect={setCategory}
                colorMap={Object.fromEntries(Object.entries(CATEGORIES).map(([k,v])=>[k,v.color]))}/>
              <PickRow label="Priority" options={["HIGH","MEDIUM","LOW"]} value={priority} onSelect={setPriority}
                colorMap={{HIGH:"#F43F5E",MEDIUM:"#C9A84C",LOW:"#9CA3AF"}}/>
              <PickRow label="Rarity" options={["COMMON","RARE","EPIC","LEGENDARY"]} value={rarity} onSelect={setRarity}
                colorMap={Object.fromEntries(Object.entries(RARITY).map(([k,v])=>[k,v.color]))}/>
              <Text style={[css.fieldLabel,{color:T.textDim}]}>XP Reward</Text>
              <TextInput value={xp} onChangeText={setXp} keyboardType="numeric"
                style={[css.textInput,{color:T.textPrimary,borderColor:T.border,backgroundColor:T.surface}]}/>
              <Text style={[css.fieldLabel,{color:T.textDim}]}>Reminder Time (เช่น 08:00)</Text>
              <TextInput value={reminder} onChangeText={setReminder} placeholder="08:00"
                placeholderTextColor={T.textDim}
                style={[css.textInput,{color:T.textPrimary,borderColor:T.border,backgroundColor:T.surface}]}/>
              <View style={{height:20}}/>
            </ScrollView>
            <TouchableOpacity style={[css.psSaveBtn,{borderColor:T.gold,backgroundColor:T.goldDim}]} onPress={handleSave}>
              <Text style={[css.psSaveBtnTxt,{color:T.gold}]}>💾  บันทึกเควส</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════════════

// ── POMODORO TIMER ────────────────────────────────────────────
const PomodoroTimer = ({ T }) => {
  const WORK = 25*60, BREAK = 5*60;
  const [secs,   setSecs]   = useState(WORK);
  const [running,setRunning]= useState(false);
  const [mode,   setMode]   = useState("WORK"); // WORK | BREAK
  const [rounds, setRounds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(()=>{
    if (running) {
      intervalRef.current = setInterval(()=>{
        setSecs(s=>{
          if (s<=1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode==="WORK") { setRounds(r=>r+1); setMode("BREAK"); setSecs(BREAK); }
            else               { setMode("WORK");   setSecs(WORK);  }
            return 0;
          }
          return s-1;
        });
      },1000);
    } else { clearInterval(intervalRef.current); }
    return ()=>clearInterval(intervalRef.current);
  },[running, mode]);

  const reset = ()=>{ setRunning(false); setSecs(WORK); setMode("WORK"); };
  const mm = String(Math.floor(secs/60)).padStart(2,"0");
  const ss = String(secs%60).padStart(2,"0");
  const pct = mode==="WORK" ? ((WORK-secs)/WORK)*100 : ((BREAK-secs)/BREAK)*100;
  const col = mode==="WORK" ? "#F43F5E" : "#34D399";

  return (
    <>
      <Text style={[css.secLabel,{color:T.textDim}]}>⏱ POMODORO</Text>
      <View style={[css.card,{backgroundColor:T.surface,borderColor:T.border,flexDirection:"row",alignItems:"center",gap:16,padding:14}]}>
        {/* Ring */}
        <View style={{position:"relative",width:64,height:64,alignItems:"center",justifyContent:"center"}}>
          <RingProgress value={pct} size={64} stroke={4} color={col}/>
          <View style={{position:"absolute",alignItems:"center"}}>
            <Text style={{fontSize:14,fontWeight:"700",color:col,letterSpacing:1}}>{mm}:{ss}</Text>
          </View>
        </View>
        <View style={{flex:1}}>
          <Text style={{fontSize:10,color:mode==="WORK"?"#F43F5E":"#34D399",letterSpacing:2,fontWeight:"700"}}>{mode==="WORK"?"FOCUS":"BREAK"}</Text>
          <Text style={{fontSize:9,color:T.textDim,marginTop:2}}>🍅 {rounds} rounds today</Text>
        </View>
        <View style={{gap:8}}>
          <TouchableOpacity onPress={()=>setRunning(r=>!r)}
            style={{borderWidth:1,borderColor:col,paddingHorizontal:12,paddingVertical:6,alignItems:"center"}}>
            <Text style={{fontSize:10,color:col,letterSpacing:2}}>{running?"⏸ PAUSE":"▶ START"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={reset}
            style={{borderWidth:1,borderColor:T.border,paddingHorizontal:12,paddingVertical:4,alignItems:"center"}}>
            <Text style={{fontSize:9,color:T.textDim,letterSpacing:1}}>↺ RESET</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

// ── DASHBOARD ────────────────────────────────────────────────
const DashboardScreen = ({ quests, completeQuest, bossQuest, completeBossQuest, dailyChallenge, completeDailyChallenge, gameStats, T }) => {
  // Compute radar stats from actual quest completions per category
  // Map 6 CATEGORIES → 6 radar axes, normalize to 0–100
  const CAT_TO_AXIS = {
    HEALTH:"Vitality", MIND:"Intellect", DISCIPLINE:"Discipline",
    FINANCE:"Wealth",  SOCIAL:"Social",  CREATIVE:"Creative",
    CAREER:"Wealth",   HOME:"Vitality",  FAMILY:"Social", DIGITAL:"Intellect",
  };
  const axisRaw = { Vitality:0, Intellect:0, Discipline:0, Wealth:0, Social:0, Creative:0 };
  Object.entries(gameStats.cat||{}).forEach(([cat,count])=>{
    const axis = CAT_TO_AXIS[cat];
    if (axis) axisRaw[axis] = (axisRaw[axis]||0) + count;
  });
  const maxVal = Math.max(...Object.values(axisRaw), 1);
  const radarStats = Object.fromEntries(
    Object.entries(axisRaw).map(([k,v])=>[k, Math.round((v/Math.max(maxVal,5))*100)])
  );
  // Minimum 5 quests = 100%, so early game still shows nice shape
  const totalDone = quests.filter(q=>q.completed).length;

  return (
  <ScrollView showsVerticalScrollIndicator={false}>
    {/* Daily Challenge */}
    <Text style={[css.secLabel,{color:T.textDim}]}>⚡ DAILY CHALLENGE</Text>
    <TouchableOpacity
      style={[css.dailyCard,{backgroundColor:dailyChallenge.completed?"rgba(201,168,76,0.06)":"rgba(45,212,191,0.06)",borderColor:dailyChallenge.completed?T.gold:"#2DD4BF55"}]}
      onPress={completeDailyChallenge}>
      <Text style={{fontSize:28}}>{dailyChallenge.icon}</Text>
      <View style={{flex:1,marginLeft:12}}>
        <Text style={[{fontSize:12,fontWeight:"600",letterSpacing:0.5},dailyChallenge.completed?{color:T.gold}:{color:T.textPrimary}]}>{dailyChallenge.title}</Text>
        <Text style={{fontSize:9,color:T.textDim,marginTop:2}}>{dailyChallenge.desc}</Text>
      </View>
      <View style={{alignItems:"flex-end"}}>
        <Text style={{fontSize:12,color:T.gold,fontWeight:"700"}}>+{dailyChallenge.xp}</Text>
        <Text style={{fontSize:10,color:dailyChallenge.completed?"#34D399":"#2DD4BF",marginTop:2}}>{dailyChallenge.completed?"✓ Done":"กดทำ"}</Text>
      </View>
    </TouchableOpacity>

    {/* Boss Quest */}
    <Text style={[css.secLabel,{color:T.textDim}]}>🔥 BOSS QUEST</Text>
    <BossQuestCard bossQuest={bossQuest} onComplete={completeBossQuest} T={T}/>

    {/* Pomodoro */}
    <PomodoroTimer T={T}/>

    {/* Stats Radar */}
    <Text style={[css.secLabel,{color:T.textDim}]}>ATTRIBUTE MATRIX</Text>
    <View style={{alignItems:"center",paddingVertical:4}}>
      <HexRadar stats={radarStats} T={T}/>
      {totalDone===0&&(
        <Text style={{fontSize:9,color:T.textDim,marginTop:4,letterSpacing:1,textAlign:"center"}}>
          ทำเควสเพื่อเพิ่ม attribute ของตัวเอง!
        </Text>
      )}
    </View>

    {/* Today HIGH priority */}
    <Text style={[css.secLabel,{color:T.textDim}]}>{"TODAY'S PRIORITY"}</Text>
    {quests.filter(q=>q.priority==="HIGH").slice(0,4).map(q=>(
      <QuestItem key={q.id} quest={q} onPress={()=>completeQuest(q.id)} T={T}/>
    ))}
    <View style={{height:100}}/>
  </ScrollView>
  );
};

// BossQuestCard
const BossQuestCard = ({ bossQuest:b, onComplete, T }) => {
  const scale=useRef(new Animated.Value(1)).current;
  const pct=Math.min((b.progress/b.target)*100,100);
  const handle=()=>{
    if(b.completed) return;
    Animated.sequence([
      Animated.spring(scale,{toValue:0.96,useNativeDriver:true,speed:80}),
      Animated.spring(scale,{toValue:1,useNativeDriver:true,speed:20,bounciness:12}),
    ]).start();
    onComplete();
  };
  return (
    <Animated.View style={{transform:[{scale}]}}>
      <TouchableOpacity
        style={[css.bossCard,{borderColor:b.completed?"#C9A84C":"#F43F5E44",backgroundColor:b.completed?"rgba(201,168,76,0.06)":"rgba(244,63,94,0.06)"}]}
        onPress={handle} activeOpacity={1}>
        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <View style={css.bossBadge}><Text style={css.bossBadgeTxt}>⚡ BOSS QUEST</Text></View>
          <Text style={{fontSize:9,color:b.completed?"#C9A84C":"#F43F5E",fontWeight:"600"}}>{b.completed?"✓ สำเร็จ!":(`${b.daysLeft} วันเหลือ`)}</Text>
        </View>
        <Text style={{fontSize:14,fontWeight:"600",color:T.textPrimary,marginBottom:3}}>{b.title}</Text>
        <Text style={{fontSize:9,color:T.textDim,marginBottom:10}}>{b.desc}</Text>
        <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
          <View style={{flex:1,height:3,backgroundColor:T.border}}>
            <View style={{height:3,width:`${pct}%`,backgroundColor:b.completed?"#C9A84C":"#F43F5E"}}/>
          </View>
          <Text style={{fontSize:9,color:b.completed?"#C9A84C":"#F43F5E",fontWeight:"700"}}>{b.progress}/{b.target}</Text>
        </View>
        <Text style={{fontSize:12,color:"#C9A84C",fontWeight:"700",marginTop:8}}>+{b.xpReward.toLocaleString()} XP</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── QUESTS SCREEN ────────────────────────────────────────────
const QuestsScreen = ({ quests, completeQuest, setQuestEditor, deleteQuest, T }) => {
  const [sel, setSel] = useState(null);
  const [rarSel, setRarSel] = useState(null);
  const filtered = quests
    .filter(q => !sel || q.category===sel)
    .filter(q => !rarSel || q.rarity===rarSel);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingTop:16}}>
        <Text style={[css.secLabel,{paddingTop:0,color:T.textDim}]}>ACTIVE MISSIONS ({filtered.length})</Text>
        <TouchableOpacity onPress={()=>setQuestEditor("new")}
          style={[css.addBtn,{borderColor:T.gold,backgroundColor:T.goldDim}]}>
          <Text style={{fontSize:10,color:T.gold,letterSpacing:1}}>+ เพิ่มเควส</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:6}}>
        <TouchableOpacity style={[css.chip,{borderColor:T.border,backgroundColor:T.surface},!sel&&{backgroundColor:T.goldDim,borderColor:T.gold}]} onPress={()=>setSel(null)}>
          <Text style={[{fontSize:9,letterSpacing:1},sel?{color:T.textDim}:{color:T.gold}]}>ทั้งหมด</Text>
        </TouchableOpacity>
        {Object.keys(CATEGORIES).map(cat=>{
          const active=sel===cat, color=CATEGORIES[cat].color;
          return (
            <TouchableOpacity key={cat} style={[css.chip,{borderColor:T.border,backgroundColor:T.surface},active&&{backgroundColor:color+"22",borderColor:color}]} onPress={()=>setSel(active?null:cat)}>
              <Text style={{fontSize:10,marginRight:4}}>{CATEGORIES[cat].icon}</Text>
              <Text style={[{fontSize:9,letterSpacing:1},active?{color}:{color:T.textDim}]}>{CATEGORIES[cat].label}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{width:16}}/>
      </ScrollView>

      {/* Rarity filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10}}>
        {["ALL",...Object.keys(RARITY)].map(r=>{
          const active = r==="ALL"?!rarSel:rarSel===r;
          const col = r==="ALL"?T.gold:RARITY[r]?.color||T.gold;
          return (
            <TouchableOpacity key={r} onPress={()=>setRarSel(r==="ALL"?null:r)}
              style={[css.chip,{borderColor:T.border,backgroundColor:T.surface,marginRight:4},active&&{backgroundColor:col+"22",borderColor:col}]}>
              <Text style={[{fontSize:9,letterSpacing:1},active?{color:col}:{color:T.textDim}]}>{r==="ALL"?"All Rarity":RARITY[r]?.label}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{width:16}}/>
      </ScrollView>

      {filtered.map(q=>(
        <QuestItem key={q.id} quest={q} onPress={()=>completeQuest(q.id)}
          onLongPress={()=>setQuestEditor(q)} T={T}/>
      ))}
      <TouchableOpacity style={[css.deleteHint,{borderColor:T.border}]}>
        <Text style={{fontSize:9,color:T.textDim,letterSpacing:1}}>💡 กดค้างที่เควสเพื่อแก้ไข/ลบ</Text>
      </TouchableOpacity>
      <View style={{height:100}}/>
    </ScrollView>
  );
};

// ── SKILL TREE SCREEN ────────────────────────────────────────
// Layout: 3 rows, each row = flex-wrap row of skill cards with spacers for gaps
const SKILL_GRID = [
  // Row 0: 3 skills at cols 1,3,5 — pad with 2 spacers between & sides
  [ null, "sk01", null, "sk02", null, "sk03", null ],
  // Row 1: 4 skills at cols 0,2,4,6
  [ "sk04", null, "sk05", null, "sk06", null, "sk07" ],
  // Row 2: 3 skills at cols 1,3,5
  [ null, "sk08", null, "sk09", null, "sk10", null ],
];

const SkillTreeScreen = ({ unlockedSkills, skillPoints, unlockSkill, T }) => {
  // connector lines between rows (visual hint)
  const CELL_W = Math.floor((SW - 40) / 7);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingTop:16,marginBottom:4}}>
        <Text style={[css.secLabel,{paddingTop:0,paddingBottom:0,color:T.textDim}]}>SKILL TREE</Text>
        <View style={[css.spBadge,{borderColor:T.gold,backgroundColor:T.goldDim}]}>
          <Text style={{fontSize:10,color:T.gold,letterSpacing:1}}>⚡ {skillPoints} SP</Text>
        </View>
      </View>
      <Text style={{fontSize:9,color:T.textDim,marginBottom:14,letterSpacing:0.5}}>
        กดเพื่อปลดล็อค • ต้องการ SP จากการเลเวลอัพ
      </Text>

      {/* Grid rows */}
      {SKILL_GRID.map((row, rowIdx)=>(
        <View key={rowIdx} style={{flexDirection:"row",marginBottom:6,gap:0}}>
          {row.map((skillId, colIdx)=>{
            if (!skillId) {
              // spacer — same width as skill cell
              return <View key={colIdx} style={{width:CELL_W,height:72}}/>;
            }
            const sk = SKILL_TREE.find(s=>s.id===skillId);
            if (!sk) return <View key={colIdx} style={{width:CELL_W}}/>;
            const unlocked  = unlockedSkills.includes(sk.id);
            const canUnlock = sk.requires.every(r=>unlockedSkills.includes(r)) && skillPoints>=sk.cost && !unlocked;
            const isLocked  = !unlocked && !canUnlock;
            const borderCol = unlocked ? T.gold : canUnlock ? "#2DD4BF" : T.border;
            const bgCol     = unlocked ? "rgba(201,168,76,0.15)" : canUnlock ? "rgba(45,212,191,0.08)" : T.surface;
            const txtCol    = unlocked ? T.gold : canUnlock ? "#2DD4BF" : T.textDim;
            return (
              <TouchableOpacity
                key={colIdx}
                onPress={()=>unlockSkill(sk.id)}
                activeOpacity={isLocked?1:0.7}
                style={{
                  width:CELL_W, height:72,
                  borderWidth:1, borderColor:borderCol,
                  backgroundColor:bgCol,
                  alignItems:"center", justifyContent:"center",
                  padding:4,
                  opacity: isLocked ? 0.4 : 1,
                }}>
                <Text style={{fontSize:20,lineHeight:26}}>{sk.icon}</Text>
                <Text style={{fontSize:6.5,color:txtCol,textAlign:"center",marginTop:1,letterSpacing:0.3,lineHeight:9}} numberOfLines={2}>{sk.name}</Text>
                <Text style={{fontSize:8,color:unlocked?"#34D399":T.gold,marginTop:2,fontWeight:"700"}}>
                  {unlocked ? "✓" : `⚡${sk.cost}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Connector legend */}
      <View style={{flexDirection:"row",gap:12,marginVertical:10,alignItems:"center"}}>
        <View style={{width:16,height:1,backgroundColor:T.gold}}/>
        <Text style={{fontSize:8,color:T.textDim,letterSpacing:1}}>ต้องปลดล็อค Skill ก่อนหน้าก่อน</Text>
      </View>

      {/* Skill list detail */}
      <Text style={[css.secLabel,{color:T.textDim}]}>รายละเอียด Skills</Text>
      {SKILL_TREE.map(sk=>{
        const unlocked  = unlockedSkills.includes(sk.id);
        const canUnlock = sk.requires.every(r=>unlockedSkills.includes(r)) && skillPoints>=sk.cost && !unlocked;
        const prereqNames = sk.requires.map(r=>SKILL_TREE.find(s=>s.id===r)?.name||r).join(", ");
        return (
          <TouchableOpacity key={sk.id} onPress={()=>unlockSkill(sk.id)}
            style={[css.skillDesc,{
              backgroundColor:T.surface,
              borderColor:unlocked?T.gold:canUnlock?"#2DD4BF33":T.border,
              opacity: (!unlocked&&!canUnlock)?0.5:1,
            }]}>
            <Text style={{fontSize:20,width:30,textAlign:"center"}}>{sk.icon}</Text>
            <View style={{flex:1}}>
              <Text style={{fontSize:11,color:unlocked?T.gold:canUnlock?"#2DD4BF":T.textPrimary,fontWeight:"600"}}>{sk.name}</Text>
              <Text style={{fontSize:9,color:T.textDim,marginTop:2}}>{sk.desc}</Text>
              {sk.requires.length>0&&!unlocked&&(
                <Text style={{fontSize:8,color:T.textDim,marginTop:2,letterSpacing:0.5}}>🔗 ต้องการ: {prereqNames}</Text>
              )}
            </View>
            <Text style={{fontSize:9,color:unlocked?"#34D399":canUnlock?T.gold:T.textDim,fontWeight:"700"}}>
              {unlocked?"✓ DONE":`⚡${sk.cost} SP`}
            </Text>
          </TouchableOpacity>
        );
      })}
      <View style={{height:100}}/>
    </ScrollView>
  );
};

// ── QUEST CHAINS SCREEN ──────────────────────────────────────
const ChainsScreen = ({ chainProgress, completeChainQuest, T }) => (
  <ScrollView showsVerticalScrollIndicator={false}>
    <Text style={[css.secLabel,{color:T.textDim}]}>STORY ARCS</Text>
    {QUEST_CHAINS.map(chain=>{
      const step = chainProgress[chain.id]||0;
      const done = step>=chain.quests.length;
      const pct = (step/chain.quests.length)*100;
      return (
        <View key={chain.id} style={[css.chainCard,{backgroundColor:T.surface,borderColor:done?T.gold:T.border}]}>
          <View style={{flexDirection:"row",alignItems:"center",gap:10,marginBottom:10}}>
            <Text style={{fontSize:24}}>{chain.icon}</Text>
            <View style={{flex:1}}>
              <Text style={{fontSize:13,fontWeight:"600",color:T.textPrimary}}>{chain.title}</Text>
              <Text style={{fontSize:9,color:T.textDim,marginTop:2}}>{chain.desc}</Text>
            </View>
            {done&&<Text style={{color:"#34D399",fontSize:16}}>✓</Text>}
          </View>

          {/* progress bar */}
          <View style={{height:3,backgroundColor:T.border,marginBottom:10}}>
            <View style={{height:3,width:`${pct}%`,backgroundColor:T.gold}}/>
          </View>
          <Text style={{fontSize:8,color:T.textDim,marginBottom:10,letterSpacing:1}}>{step}/{chain.quests.length} QUESTS COMPLETE</Text>

          {chain.quests.map((q,i)=>{
            const completed = i<step;
            const active    = i===step;
            const rar = RARITY[q.rarity]||RARITY.COMMON;
            return (
              <TouchableOpacity key={q.id}
                style={[css.chainQuest,{borderColor:completed?T.gold:active?rar.color:T.border,backgroundColor:completed?"rgba(201,168,76,0.08)":T.surface2,opacity:(!completed&&!active)?0.45:1}]}
                onPress={()=>active&&completeChainQuest(chain.id)}>
                <Text style={{fontSize:16,width:26}}>{completed?"✦":active?"◈":"◇"}</Text>
                <View style={{flex:1}}>
                  <Text style={{fontSize:11,color:completed?T.gold:active?T.textPrimary:T.textSecondary,fontWeight:active?"600":"400"}}>{q.title}</Text>
                  <Text style={{fontSize:8,color:rar.color,marginTop:2,letterSpacing:1}}>{rar.stars} {rar.label}</Text>
                </View>
                <Text style={{fontSize:10,color:T.gold,fontWeight:"700"}}>+{q.xpReward}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    })}
    <View style={{height:100}}/>
  </ScrollView>
);

// ── MOOD + GOALS SCREEN ──────────────────────────────────────
const TrackerScreen = ({ moodLog, logMood, goals, saveGoal, deleteGoal, dailyHistory, T }) => {
  const [moodNote, setMoodNote] = useState("");
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("10");
  const [goalCat, setGoalCat] = useState("MIND");
  const [goalDeadline, setGoalDeadline] = useState("2025-12-31");

  const today = new Date().toDateString();
  const todayMood = moodLog.find(m=>m.date===today);

  const last7Moods = moodLog.slice(-7);
  const moodAvg = last7Moods.length ? (last7Moods.reduce((a,m)=>a+m.mood.value,0)/last7Moods.length).toFixed(1) : "-";

  const openGoalEditor = (g=null) => {
    setEditGoal(g);
    setGoalTitle(g?.title||"");
    setGoalTarget(String(g?.target||10));
    setGoalCat(g?.category||"MIND");
    setGoalDeadline(g?.deadline||"2025-12-31");
    setShowGoalEditor(true);
  };

  const handleSaveGoal = () => {
    if (!goalTitle.trim()) return;
    saveGoal({ id:editGoal?.id, title:goalTitle.trim(), target:parseInt(goalTarget)||10, current:editGoal?.current||0, category:goalCat, deadline:goalDeadline });
    setShowGoalEditor(false);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Mood today */}
      <Text style={[css.secLabel,{color:T.textDim}]}>MOOD LOG — วันนี้</Text>
      <View style={[css.card,{backgroundColor:T.surface,borderColor:T.border}]}>
        <View style={{flexDirection:"row",justifyContent:"space-around",marginBottom:14}}>
          {MOODS.map(m=>{
            const sel = todayMood?.mood?.id===m.id;
            return (
              <TouchableOpacity key={m.id} onPress={()=>logMood(m,moodNote)}
                style={[css.moodBtn,{borderColor:sel?m.color:T.border,backgroundColor:sel?m.color+"22":T.surface2}]}>
                <Text style={{fontSize:22}}>{m.emoji}</Text>
                <Text style={{fontSize:7,color:sel?m.color:T.textDim,marginTop:2,letterSpacing:0.5}}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {todayMood && (
          <Text style={{fontSize:10,color:T.textSecondary,textAlign:"center"}}>
            บันทึกแล้ว: {todayMood.mood.emoji} {todayMood.mood.label}
          </Text>
        )}
      </View>

      {/* Mood graph last 7 days */}
      {last7Moods.length>0&&(
        <>
          <Text style={[css.secLabel,{color:T.textDim}]}>MOOD TREND  (avg: {moodAvg})</Text>
          <View style={[css.card,{backgroundColor:T.surface,borderColor:T.border}]}>
            <View style={{flexDirection:"row",alignItems:"flex-end",height:50,gap:4}}>
              {last7Moods.map((m,i)=>{
                const h=(m.mood.value/5)*50;
                return (
                  <View key={i} style={{flex:1,alignItems:"center",justifyContent:"flex-end"}}>
                    <View style={{height:h,width:"80%",backgroundColor:m.mood.color,borderRadius:2}}/>
                    <Text style={{fontSize:7,color:T.textDim,marginTop:2}}>{m.mood.emoji}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </>
      )}

      {/* Habit Calendar */}
      <Text style={[css.secLabel,{color:T.textDim}]}>HABIT CALENDAR</Text>
      <View style={[css.card,{backgroundColor:T.surface,borderColor:T.border,alignItems:"center"}]}>
        <HabitCalendar history={dailyHistory} T={T}/>
        <Text style={{fontSize:8,color:T.textDim,marginTop:8,letterSpacing:1}}>สี = จำนวนเควสที่ทำในวันนั้น</Text>
      </View>

      {/* Goals */}
      <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
        <Text style={[css.secLabel,{color:T.textDim}]}>LONG-TERM GOALS</Text>
        <TouchableOpacity onPress={()=>openGoalEditor()}
          style={[css.addBtn,{borderColor:T.gold,backgroundColor:T.goldDim}]}>
          <Text style={{fontSize:10,color:T.gold,letterSpacing:1}}>+ เพิ่มเป้าหมาย</Text>
        </TouchableOpacity>
      </View>

      {goals.map(g=>{
        const pct=Math.min((g.current/g.target)*100,100);
        const col=getCatColor(g.category);
        return (
          <View key={g.id} style={[css.goalCard,{backgroundColor:T.surface,borderColor:T.border}]}>
            <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <View style={{flex:1}}>
                <Text style={{fontSize:12,color:T.textPrimary,fontWeight:"600"}}>{g.title}</Text>
                <Text style={{fontSize:8,color:col,marginTop:2,letterSpacing:1}}>{getCatIcon(g.category)} {getCatLabel(g.category)} · {g.deadline}</Text>
              </View>
              <View style={{flexDirection:"row",gap:8}}>
                <TouchableOpacity onPress={()=>openGoalEditor(g)}><Text style={{color:T.gold,fontSize:12}}>✎</Text></TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteGoal(g.id)}><Text style={{color:"#F43F5E",fontSize:12}}>✕</Text></TouchableOpacity>
              </View>
            </View>
            <View style={{height:4,backgroundColor:T.border,borderRadius:2,marginBottom:4}}>
              <View style={{height:4,width:`${pct}%`,backgroundColor:col,borderRadius:2}}/>
            </View>
            <Text style={{fontSize:9,color:T.textDim,letterSpacing:1}}>{g.current}/{g.target}  ·  {pct.toFixed(0)}%</Text>
          </View>
        );
      })}

      {/* Goal Editor inline */}
      {showGoalEditor&&(
        <View style={[css.card,{backgroundColor:T.surface2,borderColor:T.gold}]}>
          <Text style={{fontSize:11,color:T.gold,letterSpacing:2,marginBottom:12}}>{editGoal?"แก้ไขเป้าหมาย":"เพิ่มเป้าหมาย"}</Text>
          <TextInput value={goalTitle} onChangeText={setGoalTitle} placeholder="ชื่อเป้าหมาย"
            placeholderTextColor={T.textDim}
            style={[css.textInput,{color:T.textPrimary,borderColor:T.border,backgroundColor:T.surface,marginBottom:10}]}/>
          <TextInput value={goalTarget} onChangeText={setGoalTarget} placeholder="เป้าหมาย (ตัวเลข)"
            keyboardType="numeric" placeholderTextColor={T.textDim}
            style={[css.textInput,{color:T.textPrimary,borderColor:T.border,backgroundColor:T.surface,marginBottom:10}]}/>
          <TextInput value={goalDeadline} onChangeText={setGoalDeadline} placeholder="Deadline (YYYY-MM-DD)"
            placeholderTextColor={T.textDim}
            style={[css.textInput,{color:T.textPrimary,borderColor:T.border,backgroundColor:T.surface,marginBottom:14}]}/>
          <View style={{flexDirection:"row",gap:8}}>
            <TouchableOpacity style={[css.psSaveBtn,{flex:1,borderColor:T.gold,backgroundColor:T.goldDim}]} onPress={handleSaveGoal}>
              <Text style={{fontSize:10,color:T.gold,letterSpacing:2}}>บันทึก</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[css.psSaveBtn,{flex:1,borderColor:T.border}]} onPress={()=>setShowGoalEditor(false)}>
              <Text style={{fontSize:10,color:T.textDim,letterSpacing:2}}>ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{height:100}}/>
    </ScrollView>
  );
};

// ── WEEKLY REPORT SCREEN ─────────────────────────────────────
const WeeklyReportScreen = ({ weeklyReport:wr, dailyHistory, gameStats, T }) => {
  const days = ["จ","อ","พ","พฤ","ศ","ส","อา"];
  const last7 = dailyHistory.slice(-7);
  const maxXP = Math.max(...last7.map(h=>h.xpEarned),1);

  const avgXP = last7.length ? Math.round(last7.reduce((a,h)=>a+h.xpEarned,0)/last7.length) : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[css.secLabel,{color:T.textDim}]}>WEEKLY REPORT</Text>

      {/* Headline stats */}
      <View style={{flexDirection:"row",gap:8,marginBottom:8}}>
        <View style={[css.mCard,{backgroundColor:T.surface,borderColor:T.border}]}>
          <Text style={{fontSize:28,fontWeight:"300",color:T.textPrimary}}>{wr.totalDone}</Text>
          <Text style={{fontSize:7,letterSpacing:2,color:T.textDim,marginTop:4}}>QUESTS DONE</Text>
          <Text style={{fontSize:8,color:"#2DD4BF",marginTop:4}}>7 วันที่ผ่านมา</Text>
        </View>
        <View style={[css.mCard,{backgroundColor:T.surface,borderColor:T.border}]}>
          <Text style={{fontSize:28,fontWeight:"300",color:T.textPrimary}}>{wr.totalXpWeek.toLocaleString()}</Text>
          <Text style={{fontSize:7,letterSpacing:2,color:T.textDim,marginTop:4}}>XP EARNED</Text>
          <Text style={{fontSize:8,color:T.gold,marginTop:4}}>avg {avgXP}/วัน</Text>
        </View>
      </View>
      <View style={{flexDirection:"row",gap:8,marginBottom:8}}>
        <View style={[css.mCard,{backgroundColor:T.surface,borderColor:T.border}]}>
          <Text style={{fontSize:28,fontWeight:"300",color:T.textPrimary}}>{wr.avgMood}</Text>
          <Text style={{fontSize:7,letterSpacing:2,color:T.textDim,marginTop:4}}>MOOD AVG</Text>
          <Text style={{fontSize:8,color:"#F472B6",marginTop:4}}>จาก 5.0</Text>
        </View>
        <View style={[css.mCard,{backgroundColor:T.surface,borderColor:T.border}]}>
          <Text style={{fontSize:28,fontWeight:"300",color:T.textPrimary}}>{gameStats.streak}</Text>
          <Text style={{fontSize:7,letterSpacing:2,color:T.textDim,marginTop:4}}>BEST STREAK</Text>
          <Text style={{fontSize:8,color:"#2DD4BF",marginTop:4}}>วัน</Text>
        </View>
      </View>

      {/* XP Bar Chart */}
      <View style={[css.chartCard,{backgroundColor:T.surface,borderColor:T.border}]}>
        <Text style={{fontSize:8,letterSpacing:3,color:T.textDim,marginBottom:14}}>XP HISTORY (7 วัน)</Text>
        {last7.length===0 ? (
          <Text style={{color:T.textDim,fontSize:10,textAlign:"center"}}>ยังไม่มีข้อมูล — ทำเควสและ reset เพื่อบันทึก</Text>
        ) : (
          <View style={{flexDirection:"row",alignItems:"flex-end",height:60,gap:6}}>
            {last7.map((h,i)=>(
              <View key={i} style={{flex:1,alignItems:"center",gap:4,justifyContent:"flex-end"}}>
                <View style={{width:"100%",backgroundColor:"rgba(201,168,76,0.2)",borderTopWidth:1,borderTopColor:T.gold,height:maxXP>0?(h.xpEarned/maxXP)*56:2}}/>
                <Text style={{fontSize:7,color:T.textDim}}>{days[i]}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Category breakdown */}
      <Text style={[css.secLabel,{color:T.textDim}]}>XP BY CATEGORY</Text>
      {Object.entries(gameStats.cat||{}).sort((a,b)=>b[1]-a[1]).map(([cat,count])=>{
        const col=getCatColor(cat);
        const maxC=Math.max(...Object.values(gameStats.cat||{}),1);
        return (
          <View key={cat} style={{marginBottom:10}}>
            <View style={{flexDirection:"row",justifyContent:"space-between",marginBottom:3}}>
              <Text style={{fontSize:9,color:T.textSecondary}}>{getCatIcon(cat)} {getCatLabel(cat)}</Text>
              <Text style={{fontSize:9,color:col}}>{count} เควส</Text>
            </View>
            <View style={{height:2,backgroundColor:T.border}}>
              <View style={{height:2,width:`${(count/maxC)*100}%`,backgroundColor:col}}/>
            </View>
          </View>
        );
      })}

      <View style={{height:100}}/>
    </ScrollView>
  );
};

// ── ACHIEVEMENTS SCREEN ──────────────────────────────────────
const AchievementsScreen = ({ achList, T }) => {
  const unlocked=achList.filter(a=>a.unlocked), locked=achList.filter(a=>!a.unlocked);
  const pct=Math.round((unlocked.length/achList.length)*100);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[css.secLabel,{color:T.textDim}]}>{`ACHIEVEMENTS  ${unlocked.length} / ${achList.length}`}</Text>
      <View style={{height:3,backgroundColor:T.border,borderRadius:2,marginBottom:4}}>
        <View style={{height:3,width:`${pct}%`,backgroundColor:T.gold,borderRadius:2}}/>
      </View>
      <Text style={[css.secLabel,{paddingTop:4,color:T.gold}]}>{pct}% COMPLETE</Text>
      {unlocked.length>0&&(<>
        <Text style={[css.secLabel,{paddingTop:16,color:T.textDim}]}>ปลดล็อคแล้ว ✦</Text>
        {unlocked.map(a=>(
          <View key={a.id} style={[css.achCard,{backgroundColor:T.surface,borderColor:T.border}]}>
            <View style={[css.achIcon,{backgroundColor:"rgba(201,168,76,0.12)",borderColor:"rgba(201,168,76,0.3)"}]}>
              <Text style={{fontSize:16,color:T.gold}}>{a.icon}</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={{fontSize:11,color:T.textPrimary,fontWeight:"600"}}>{a.title}</Text>
              <Text style={{fontSize:9,color:T.textDim,marginTop:2}}>{a.desc}</Text>
            </View>
            <Text style={{fontSize:10,color:T.gold,fontWeight:"700"}}>+{a.xp}</Text>
          </View>
        ))}
      </>)}
      <Text style={[css.secLabel,{paddingTop:16,color:T.textDim}]}>ยังไม่ได้ปลดล็อค</Text>
      {locked.map(a=>(
        <View key={a.id} style={[css.achCard,{opacity:0.4,backgroundColor:T.surface,borderColor:T.border}]}>
          <View style={[css.achIcon,{borderColor:T.border}]}><Text style={{fontSize:16,color:T.textDim}}>?</Text></View>
          <View style={{flex:1}}>
            <Text style={{fontSize:11,color:T.textDim,fontWeight:"600"}}>{a.title}</Text>
            <Text style={{fontSize:9,color:T.textDim,marginTop:2}}>{a.desc}</Text>
          </View>
          <Text style={{fontSize:10,color:T.textDim}}>+{a.xp}</Text>
        </View>
      ))}
      <View style={{height:100}}/>
    </ScrollView>
  );
};

// ── SETTINGS SCREEN ──────────────────────────────────────────
const SettingsScreen = ({ theme, T, toggleTheme, notifSettings, toggleNotif, dailyHistory, manualReset, clearSaveData }) => {
  const [showHist, setShowHist] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={[css.secLabel,{color:T.textDim}]}>APPEARANCE</Text>
      <TouchableOpacity style={[css.settRow,{backgroundColor:T.surface,borderColor:T.border}]} onPress={toggleTheme}>
        <View style={{flexDirection:"row",alignItems:"center",gap:12}}>
          <Text style={{fontSize:20}}>{theme==="DARK"?"🌙":"☀️"}</Text>
          <View>
            <Text style={{fontSize:12,color:T.textPrimary,fontWeight:"600"}}>{theme==="DARK"?"Dark Mode":"Light Mode"}</Text>
            <Text style={{fontSize:9,color:T.textDim,marginTop:2}}>กดเพื่อสลับธีม</Text>
          </View>
        </View>
        <View style={[css.toggle,{backgroundColor:theme==="DARK"?T.goldDim:T.border}]}>
          <View style={[css.toggleDot,{alignSelf:theme==="DARK"?"flex-end":"flex-start",backgroundColor:theme==="DARK"?T.gold:T.textDim}]}/>
        </View>
      </TouchableOpacity>

      <Text style={[css.secLabel,{color:T.textDim}]}>NOTIFICATIONS</Text>
      <View style={[css.card,{backgroundColor:T.surface,borderColor:T.border}]}>
        <Text style={{fontSize:9,color:T.textDim,marginBottom:12,letterSpacing:0.5}}>* ต้องติดตั้ง expo-notifications สำหรับการแจ้งเตือนจริง</Text>
        {notifSettings.map((n,i)=>(
          <TouchableOpacity key={n.id}
            style={[{paddingVertical:12,flexDirection:"row",alignItems:"center",gap:12},i<notifSettings.length-1&&{borderBottomWidth:1,borderBottomColor:T.border}]}
            onPress={()=>toggleNotif(n.id)}>
            <View style={{flex:1}}>
              <Text style={{fontSize:13,fontWeight:"600",color:T.textPrimary,letterSpacing:1}}>{n.time}  <Text style={{fontSize:11,color:T.textSecondary,fontWeight:"400"}}>{n.label}</Text></Text>
              <Text style={{fontSize:9,color:T.textDim,marginTop:2}}>{n.desc}</Text>
            </View>
            <View style={[css.toggle,{backgroundColor:n.enabled?T.goldDim:T.border}]}>
              <View style={[css.toggleDot,{alignSelf:n.enabled?"flex-end":"flex-start",backgroundColor:n.enabled?T.gold:T.textDim}]}/>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[css.secLabel,{color:T.textDim}]}>DAILY RESET</Text>
      <View style={[css.card,{backgroundColor:T.surface,borderColor:T.border}]}>
        <Text style={{fontSize:9,color:T.textDim,marginBottom:12}}>เควสรีเซ็ตอัตโนมัติทุกเที่ยงคืน</Text>
        <TouchableOpacity style={[css.resetBtn,{borderColor:T.gold}]} onPress={manualReset}>
          <Text style={{fontSize:11,color:T.gold,letterSpacing:3,fontWeight:"700"}}>🔄  รีเซ็ตเควสตอนนี้</Text>
        </TouchableOpacity>
      </View>

      <Text style={[css.secLabel,{color:T.textDim}]}>SAVE DATA</Text>
      <View style={[css.card,{backgroundColor:T.surface,borderColor:T.border}]}>
        <Text style={{fontSize:9,color:T.textDim,marginBottom:12}}>💾 ข้อมูลถูกบันทึกอัตโนมัติทุกครั้งที่มีการเปลี่ยนแปลง</Text>
        {!confirmClear ? (
          <TouchableOpacity style={[css.resetBtn,{borderColor:"#F43F5E"}]} onPress={()=>setConfirmClear(true)}>
            <Text style={{fontSize:11,color:"#F43F5E",letterSpacing:2,fontWeight:"700"}}>🗑️  ลบข้อมูลทั้งหมด</Text>
          </TouchableOpacity>
        ) : (
          <View style={{gap:8}}>
            <Text style={{fontSize:10,color:"#F43F5E",textAlign:"center",letterSpacing:0.5}}>⚠️ ข้อมูลทั้งหมดจะหายถาวร ยืนยัน?</Text>
            <View style={{flexDirection:"row",gap:8}}>
              <TouchableOpacity style={{flex:1,borderWidth:1,borderColor:T.border,padding:10,alignItems:"center"}} onPress={()=>setConfirmClear(false)}>
                <Text style={{fontSize:10,color:T.textDim}}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flex:1,borderWidth:1,borderColor:"#F43F5E",backgroundColor:"rgba(244,63,94,0.1)",padding:10,alignItems:"center"}} onPress={()=>{clearSaveData();setConfirmClear(false);}}>
                <Text style={{fontSize:10,color:"#F43F5E",fontWeight:"700"}}>ลบเลย</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Text style={[css.secLabel,{color:T.textDim}]}>HISTORY</Text>
      {dailyHistory.length===0 ? (
        <View style={[css.card,{backgroundColor:T.surface,borderColor:T.border,alignItems:"center",paddingVertical:20}]}>
          <Text style={{color:T.textDim,fontSize:10,textAlign:"center"}}>ยังไม่มีประวัติ</Text>
        </View>
      ) : (
        <View style={[css.card,{backgroundColor:T.surface,borderColor:T.border}]}>
          {[...dailyHistory].reverse().slice(0,showHist?30:5).map((h,i)=>(
            <View key={i} style={[{paddingVertical:10},i>0&&{borderTopWidth:1,borderTopColor:T.border}]}>
              <Text style={{fontSize:9,color:T.textDim,letterSpacing:1}}>{h.date}</Text>
              <View style={{flexDirection:"row",gap:16,marginTop:4}}>
                <Text style={{fontSize:12,color:T.textPrimary,fontWeight:"600"}}>✓ {h.completedCount} เควส</Text>
                <Text style={{fontSize:12,color:T.gold,fontWeight:"600"}}>+{h.xpEarned} XP</Text>
              </View>
            </View>
          ))}
          {dailyHistory.length>5&&(
            <TouchableOpacity onPress={()=>setShowHist(v=>!v)} style={{alignItems:"center",paddingTop:10}}>
              <Text style={{fontSize:9,color:T.gold,letterSpacing:2}}>{showHist?"▲ ย่อลง":"▼ ดูทั้งหมด"}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={{height:100}}/>
    </ScrollView>
  );
};

// ── PROFILE SCREEN ───────────────────────────────────────────
const ProfileScreen = ({ profile, level, xpInLvl, progress, gameStats, achList, onEdit, T }) => {
  const unlockedAch=achList.filter(a=>a.unlocked).length;
  const rank=level>=20?"LEGEND":level>=15?"DIAMOND":level>=10?"PLATINUM":level>=5?"GOLD":level>=3?"SILVER":"BRONZE";
  const rankColor={LEGEND:"#FF6B6B",DIAMOND:"#B9F2FF",PLATINUM:"#E5E4E2",GOLD:"#FFD700",SILVER:"#C0C0C0",BRONZE:"#CD7F32"}[rank];
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{alignItems:"center",paddingTop:20,paddingBottom:12}}>
        <TouchableOpacity style={[css.heroAvatar,{backgroundColor:profile.avatarBg}]} onPress={onEdit}>
          <Text style={{fontSize:50}}>{profile.avatarEmoji}</Text>
          <View style={css.editBadge}><Text style={{fontSize:12,color:"#06060A"}}>✎</Text></View>
        </TouchableOpacity>
        <Text style={{fontSize:28,fontWeight:"300",color:T.textPrimary,letterSpacing:1,marginBottom:6}}>{profile.name}</Text>
        <View style={{borderWidth:1,borderColor:T.goldDim,backgroundColor:T.goldDim,paddingHorizontal:14,paddingVertical:4,marginBottom:8}}>
          <Text style={{fontSize:9,letterSpacing:3,color:T.gold}}>{profile.title}</Text>
        </View>
        <View style={{borderWidth:1,borderColor:rankColor+"55",backgroundColor:rankColor+"15",paddingHorizontal:14,paddingVertical:4,marginBottom:16}}>
          <Text style={{fontSize:8,letterSpacing:2,color:rankColor}}>{rank} RANK · LVL {level}</Text>
        </View>
        <View style={{width:"80%"}}>
          <View style={{flexDirection:"row",justifyContent:"space-between",marginBottom:4}}>
            <Text style={{fontSize:8,color:T.textDim,letterSpacing:1}}>XP {xpInLvl} / {XP_PER_LEVEL}</Text>
            <Text style={{fontSize:8,color:T.textDim}}>{progress.toFixed(1)}%</Text>
          </View>
          <View style={{height:2,backgroundColor:T.border}}>
            <View style={{height:2,width:`${progress}%`,backgroundColor:T.gold}}/>
          </View>
        </View>
      </View>

      <View style={{flexDirection:"row",gap:8,marginBottom:8}}>
        {[{v:gameStats.done,l:"เควสที่ทำ"},{v:gameStats.streak,l:"STREAK"},{v:unlockedAch,l:"ACHIEVE"}].map(({v,l})=>(
          <View key={l} style={[css.mCard,{backgroundColor:T.surface,borderColor:T.border}]}>
            <Text style={{fontSize:24,fontWeight:"300",color:T.textPrimary}}>{v}</Text>
            <Text style={{fontSize:7,letterSpacing:2,color:T.textDim,marginTop:4}}>{l}</Text>
          </View>
        ))}
      </View>

      <Text style={[css.secLabel,{color:T.textDim}]}>TITLES ที่ปลดล็อค</Text>
      {TITLES.filter(t=>level>=t.unlockLevel).map(t=>(
        <TouchableOpacity key={t.id} onPress={onEdit}
          style={[css.titleRow,{backgroundColor:T.surface,borderColor:profile.title===t.label?T.gold:T.border,backgroundColor:profile.title===t.label?T.goldDim:T.surface}]}>
          <Text style={{fontSize:14,width:20,textAlign:"center",color:profile.title===t.label?T.gold:T.textDim}}>{t.icon}</Text>
          <Text style={{flex:1,fontSize:11,color:profile.title===t.label?T.gold:T.textPrimary,letterSpacing:0.5}}>{t.label}</Text>
          {profile.title===t.label&&<Text style={{color:T.gold,fontSize:10}}>● ใช้อยู่</Text>}
        </TouchableOpacity>
      ))}
      <View style={{height:100}}/>
    </ScrollView>
  );
};

// ── EDIT PROFILE MODAL ───────────────────────────────────────
const EditProfileModal = ({ profile, level, onSave, onClose, T }) => {
  const [name,  setName]  = useState(profile.name);
  const [title, setTitle] = useState(profile.title);
  const [avatar,setAvatar]= useState({ emoji:profile.avatarEmoji, bg:profile.avatarBg });
  const [tab,   setTab]   = useState("AVATAR");
  const slideY=useRef(new Animated.Value(600)).current;
  useEffect(()=>{ Animated.spring(slideY,{toValue:0,useNativeDriver:true,tension:60,friction:10}).start(); },[]);

  const unlockedTitles = TITLES.filter(t=>level>=t.unlockLevel);
  const lockedTitles   = TITLES.filter(t=>level< t.unlockLevel);

  return (
    <Modal transparent animationType="none" visible>
      <View style={css.psOverlay}>
        <TouchableOpacity style={css.psOverlayBg} onPress={onClose}/>
        <Animated.View style={[css.psSheet,{backgroundColor:T.surface2,borderTopColor:T.border,transform:[{translateY:slideY}]}]}>
          <View style={[css.psSheetHeader,{borderBottomColor:T.border}]}>
            <Text style={[css.psSheetTitle,{color:T.textPrimary}]}>แก้ไขโปรไฟล์</Text>
            <TouchableOpacity onPress={onClose}><Text style={{color:T.textDim,fontSize:16}}>✕</Text></TouchableOpacity>
          </View>
          <View style={{flexDirection:"row",borderBottomWidth:1,borderBottomColor:T.border}}>
            {[["AVATAR","รูปภาพ"],["INFO","ชื่อ"],["TITLE","Title"]].map(([id,lbl])=>(
              <TouchableOpacity key={id} style={{flex:1,paddingVertical:12,alignItems:"center",borderBottomWidth:tab===id?1:0,borderBottomColor:T.gold}} onPress={()=>setTab(id)}>
                <Text style={{fontSize:9,letterSpacing:2,color:tab===id?T.gold:T.textDim}}>{lbl}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
            {tab==="AVATAR"&&(
              <View style={{padding:20}}>
                <View style={{alignItems:"center",marginBottom:20}}>
                  <View style={[css.heroAvatar,{width:72,height:72,borderRadius:36,backgroundColor:avatar.bg}]}>
                    <Text style={{fontSize:36}}>{avatar.emoji}</Text>
                  </View>
                </View>
                <View style={{flexDirection:"row",flexWrap:"wrap",gap:10}}>
                  {AVATAR_OPTIONS.map((opt,i)=>{
                    const sel=avatar.emoji===opt.emoji;
                    return (
                      <TouchableOpacity key={i} onPress={()=>setAvatar(opt)}
                        style={{width:(SW-80)/6,aspectRatio:1,borderRadius:8,alignItems:"center",justifyContent:"center",borderWidth:sel?2:1,borderColor:sel?T.gold:T.border,backgroundColor:opt.bg}}>
                        <Text style={{fontSize:22}}>{opt.emoji}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
            {tab==="INFO"&&(
              <View style={{padding:20}}>
                <Text style={[css.fieldLabel,{color:T.textDim}]}>เลือกชื่อ</Text>
                {["Commander","Architect","Shadow","Phantom","Champion","Guardian","Wanderer","Sovereign"].map(n=>(
                  <TouchableOpacity key={n}
                    style={{backgroundColor:name===n?T.goldDim:T.surface,borderWidth:1,borderColor:name===n?T.gold:T.border,padding:14,marginBottom:6,flexDirection:"row",justifyContent:"space-between"}}
                    onPress={()=>setName(n)}>
                    <Text style={{fontSize:12,color:name===n?T.gold:T.textPrimary,letterSpacing:1}}>{n}</Text>
                    {name===n&&<Text style={{color:T.gold}}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {tab==="TITLE"&&(
              <View style={{padding:20}}>
                {unlockedTitles.map(t=>(
                  <TouchableOpacity key={t.id}
                    style={{backgroundColor:title===t.label?T.goldDim:T.surface,borderWidth:1,borderColor:title===t.label?T.gold:T.border,padding:14,marginBottom:6,flexDirection:"row",alignItems:"center",gap:12}}
                    onPress={()=>setTitle(t.label)}>
                    <Text style={{fontSize:16,color:title===t.label?T.gold:T.textDim}}>{t.icon}</Text>
                    <View style={{flex:1}}>
                      <Text style={{fontSize:12,color:title===t.label?T.gold:T.textPrimary}}>{t.label}</Text>
                      <Text style={{fontSize:8,color:T.textDim,marginTop:2,letterSpacing:1}}>LVL {t.unlockLevel}+</Text>
                    </View>
                    {title===t.label&&<Text style={{color:T.gold}}>✓</Text>}
                  </TouchableOpacity>
                ))}
                {lockedTitles.map(t=>(
                  <View key={t.id} style={{opacity:0.3,backgroundColor:T.surface,borderWidth:1,borderColor:T.border,padding:14,marginBottom:6,flexDirection:"row",alignItems:"center",gap:12}}>
                    <Text style={{fontSize:16,color:T.textDim}}>{t.icon}</Text>
                    <View style={{flex:1}}>
                      <Text style={{fontSize:12,color:T.textDim}}>{t.label}</Text>
                      <Text style={{fontSize:8,color:T.textDim,marginTop:2}}>ต้อง LVL {t.unlockLevel}</Text>
                    </View>
                    <Text style={{color:T.textDim,fontSize:10}}>🔒</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          <TouchableOpacity style={[css.psSaveBtn,{borderColor:T.gold,backgroundColor:T.goldDim}]}
            onPress={()=>{ onSave({name,title,avatarEmoji:avatar.emoji,avatarBg:avatar.bg}); onClose(); }}>
            <Text style={[css.psSaveBtnTxt,{color:T.gold}]}>บันทึก</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};


// ── SHOP SCREEN ──────────────────────────────────────────────
const ShopScreen = ({ tokens, inventory, buyItem, useItem, activeEffects, T }) => {
  const [catFilter, setCatFilter] = useState("ทั้งหมด");
  const [tab, setTab] = useState("SHOP"); // SHOP | BAG

  const filtered = catFilter==="ทั้งหมด"
    ? SHOP_ITEMS
    : SHOP_ITEMS.filter(i=>i.category===catFilter);

  const xpBoostActive    = activeEffects.some(e=>e.effect==="xp_boost_1d"   && Date.now()<e.expiresAt);
  const streakFrzActive  = activeEffects.some(e=>e.effect==="streak_freeze"  && Date.now()<e.expiresAt);
  const nextX2Active     = activeEffects.some(e=>e.effect==="next_quest_x2");
  const getOwnedQty      = (id) => inventory.find(i=>i.itemId===id)?.qty || 0;
  const isPerm           = (item) => item.category==="UPGRADE"||item.category==="COSMETIC";
  const tokenColor       = tokens>=100?"#F59E0B":tokens>=40?"#34D399":tokens>=15?"#60A5FA":"#9CA3AF";
  const CAT_COLORS       = { CONSUMABLE:"#60A5FA", UPGRADE:"#A78BFA", COSMETIC:"#F472B6" };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingTop:16,marginBottom:8}}>
        <Text style={[css.secLabel,{paddingTop:0,paddingBottom:0,color:T.textDim}]}>ITEM SHOP</Text>
        <View style={{flexDirection:"row",alignItems:"center",gap:6,borderWidth:1,borderColor:tokenColor+"88",backgroundColor:tokenColor+"18",paddingHorizontal:12,paddingVertical:5}}>
          <Text style={{fontSize:16}}>🪙</Text>
          <Text style={{fontSize:15,fontWeight:"700",color:tokenColor}}>{tokens}</Text>
          <Text style={{fontSize:8,color:T.textDim,letterSpacing:1}}>TOKENS</Text>
        </View>
      </View>

      {/* Token earn guide */}
      <View style={{borderWidth:1,borderColor:T.border,backgroundColor:T.surface,padding:12,marginBottom:10}}>
        <Text style={{fontSize:8,color:T.textDim,letterSpacing:2,marginBottom:8}}>🪙 EARN TOKENS</Text>
        <View style={{flexDirection:"row",flexWrap:"wrap",gap:6,marginBottom:8}}>
          {Object.entries(TOKEN_BY_DIFFICULTY).map(([diff,amt])=>{
            const dc={EASY:"#34D399",MEDIUM:"#F59E0B",HARD:"#FB923C",LEGENDARY:"#F43F5E"}[diff];
            return (
              <View key={diff} style={{borderWidth:1,borderColor:dc+"44",backgroundColor:dc+"0E",paddingHorizontal:8,paddingVertical:4,borderRadius:2}}>
                <Text style={{fontSize:9,color:dc,fontWeight:"600"}}>{diff}  🪙×{amt}</Text>
              </View>
            );
          })}
        </View>
        <View style={{height:1,backgroundColor:T.border,marginBottom:8}}/>
        <Text style={{fontSize:8,color:T.textDim,letterSpacing:2,marginBottom:6}}>RARITY BONUS</Text>
        <View style={{flexDirection:"row",gap:6}}>
          {Object.entries(TOKEN_BY_RARITY).filter(([,v])=>v>0).map(([rar,bonus])=>(
            <View key={rar} style={{borderWidth:1,borderColor:RARITY[rar].color+"44",backgroundColor:RARITY[rar].color+"0E",paddingHorizontal:8,paddingVertical:4,borderRadius:2}}>
              <Text style={{fontSize:9,color:RARITY[rar].color}}>{RARITY[rar].label}  +🪙{bonus}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Active effects pill row */}
      {(xpBoostActive||streakFrzActive||nextX2Active)&&(
        <View style={{borderWidth:1,borderColor:"#34D399"+"44",backgroundColor:"#34D399"+"08",padding:12,marginBottom:10}}>
          <Text style={{fontSize:8,color:"#34D399",letterSpacing:2,marginBottom:6}}>✨ ACTIVE EFFECTS</Text>
          {xpBoostActive   &&<Text style={{fontSize:10,color:T.textPrimary,marginBottom:3}}>⚡ XP Booster ×1.5  —  กำลังทำงาน</Text>}
          {streakFrzActive &&<Text style={{fontSize:10,color:T.textPrimary,marginBottom:3}}>🧊 Streak Freeze  —  ปกป้องอยู่</Text>}
          {nextX2Active    &&<Text style={{fontSize:10,color:T.textPrimary}}>🔄 เควสถัดไป ×2  —  พร้อมใช้</Text>}
        </View>
      )}

      {/* Tab row */}
      <View style={{flexDirection:"row",borderBottomWidth:1,borderBottomColor:T.border,marginBottom:12}}>
        {[["SHOP","🛒 ร้านค้า"],["BAG","🎒 กระเป๋า"]].map(([id,lbl])=>(
          <TouchableOpacity key={id} onPress={()=>setTab(id)}
            style={{flex:1,paddingVertical:11,alignItems:"center",
              borderBottomWidth:tab===id?1:0,borderBottomColor:T.gold}}>
            <Text style={{fontSize:10,color:tab===id?T.gold:T.textDim,letterSpacing:1,fontWeight:tab===id?"700":"400"}}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── SHOP TAB ── */}
      {tab==="SHOP"&&(
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:12}}>
            {SHOP_CATEGORIES.map(cat=>{
              const active = catFilter===cat;
              return (
                <TouchableOpacity key={cat} onPress={()=>setCatFilter(cat)}
                  style={[css.chip,{marginRight:6,borderColor:active?T.gold:T.border,backgroundColor:active?T.goldDim:T.surface}]}>
                  <Text style={{fontSize:9,color:active?T.gold:T.textDim}}>
                    {cat==="ทั้งหมด"?"ทั้งหมด":SHOP_CAT_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <View style={{width:12}}/>
          </ScrollView>

          {filtered.map(item=>{
            const owned   = getOwnedQty(item.id);
            const canBuy  = tokens>=item.cost;
            const maxed   = owned>=item.maxStack;
            const isOwned = isPerm(item)&&owned>0;
            const catCol  = CAT_COLORS[item.category]||T.gold;
            return (
              <View key={item.id} style={[css.shopCard,{backgroundColor:T.surface,borderColor:isOwned?T.gold+"55":T.border}]}>
                <View style={{flexDirection:"row",gap:12,alignItems:"flex-start"}}>
                  {/* icon box */}
                  <View style={{width:54,height:54,borderWidth:1,borderColor:catCol+"44",backgroundColor:catCol+"10",
                    alignItems:"center",justifyContent:"center",borderRadius:4,flexShrink:0}}>
                    <Text style={{fontSize:28}}>{item.icon}</Text>
                  </View>
                  {/* info */}
                  <View style={{flex:1,minWidth:0}}>
                    <View style={{flexDirection:"row",alignItems:"center",gap:8,marginBottom:2,flexWrap:"wrap"}}>
                      <Text style={{fontSize:12,fontWeight:"600",color:isOwned?T.gold:T.textPrimary}}>{item.name}</Text>
                      {isOwned&&<Text style={{fontSize:8,color:"#34D399",letterSpacing:1}}>✓ OWNED</Text>}
                    </View>
                    <View style={{alignSelf:"flex-start",borderWidth:1,borderColor:catCol+"33",
                      backgroundColor:catCol+"0E",paddingHorizontal:6,paddingVertical:2,borderRadius:2,marginBottom:5}}>
                      <Text style={{fontSize:7,color:catCol,letterSpacing:1.5}}>{SHOP_CAT_LABELS[item.category]}</Text>
                    </View>
                    <Text style={{fontSize:9,color:T.textSecondary,lineHeight:14}}>{item.desc}</Text>
                    <Text style={{fontSize:8,color:T.textDim,marginTop:3,fontStyle:"italic"}}>{item.flavor}</Text>
                  </View>
                </View>

                {/* buy row */}
                <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",
                  marginTop:12,paddingTop:10,borderTopWidth:1,borderTopColor:T.border}}>
                  <Text style={{fontSize:9,color:T.textDim}}>
                    Stack {owned}/{item.maxStack}
                  </Text>
                  <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
                    <View style={{flexDirection:"row",alignItems:"center",gap:3}}>
                      <Text style={{fontSize:14}}>🪙</Text>
                      <Text style={{fontSize:13,fontWeight:"700",color:canBuy?T.gold:"#F43F5E"}}>{item.cost}</Text>
                    </View>
                    <TouchableOpacity onPress={()=>buyItem(item.id)} disabled={maxed||(!canBuy)}
                      style={{borderWidth:1,paddingHorizontal:16,paddingVertical:8,
                        borderColor:isOwned?"#34D399"+"66":maxed?T.border:canBuy?T.gold:"#F43F5E"+"44",
                        backgroundColor:isOwned?"#34D399"+"12":canBuy&&!maxed?T.goldDim:"transparent",
                        opacity:(maxed||(!canBuy&&!isOwned))?0.45:1}}>
                      <Text style={{fontSize:9,letterSpacing:1.5,fontWeight:"700",
                        color:isOwned?"#34D399":maxed?T.textDim:canBuy?T.gold:"#F43F5E"}}>
                        {isOwned?"OWNED":maxed?"MAX":"ซื้อ"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* ── BAG TAB ── */}
      {tab==="BAG"&&(
        <>
          {inventory.length===0?(
            <View style={[css.card,{backgroundColor:T.surface,borderColor:T.border,alignItems:"center",paddingVertical:40}]}>
              <Text style={{fontSize:36,marginBottom:12}}>🎒</Text>
              <Text style={{color:T.textDim,fontSize:10,textAlign:"center",letterSpacing:0.5,lineHeight:18}}>
                {"กระเป๋าว่างเปล่า\nซื้อ Item จากร้านก่อนเลย!"}
              </Text>
            </View>
          ):(
            inventory.map(inv=>{
              const item = SHOP_ITEMS.find(i=>i.id===inv.itemId);
              if (!item) return null;
              const catCol = CAT_COLORS[item.category]||T.gold;
              const isUsable = item.category==="CONSUMABLE";
              return (
                <View key={inv.itemId} style={[css.shopCard,{backgroundColor:T.surface,borderColor:catCol+"33"}]}>
                  <View style={{flexDirection:"row",alignItems:"center",gap:12}}>
                    <View style={{width:50,height:50,borderWidth:1,borderColor:catCol+"44",backgroundColor:catCol+"10",
                      alignItems:"center",justifyContent:"center",borderRadius:4,flexShrink:0}}>
                      <Text style={{fontSize:26}}>{item.icon}</Text>
                    </View>
                    <View style={{flex:1,minWidth:0}}>
                      <Text style={{fontSize:12,fontWeight:"600",color:T.textPrimary}}>{item.name}</Text>
                      <Text style={{fontSize:9,color:T.textDim,marginTop:2}}>{item.desc}</Text>
                    </View>
                    <View style={{alignItems:"flex-end",gap:8,flexShrink:0}}>
                      <View style={{borderWidth:1,borderColor:catCol+"55",backgroundColor:catCol+"15",
                        paddingHorizontal:10,paddingVertical:4,borderRadius:2}}>
                        <Text style={{fontSize:12,fontWeight:"700",color:catCol}}>×{inv.qty}</Text>
                      </View>
                      {isUsable?(
                        <TouchableOpacity onPress={()=>useItem(inv.itemId)}
                          style={{borderWidth:1,borderColor:"#34D399",backgroundColor:"#34D399"+"15",
                            paddingHorizontal:14,paddingVertical:6,borderRadius:2}}>
                          <Text style={{fontSize:9,color:"#34D399",letterSpacing:1.5,fontWeight:"700"}}>ใช้ ▶</Text>
                        </TouchableOpacity>
                      ):(
                        <View style={{borderWidth:1,borderColor:T.gold+"44",paddingHorizontal:10,paddingVertical:5}}>
                          <Text style={{fontSize:8,color:T.gold,letterSpacing:1}}>PERM</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </>
      )}
      <View style={{height:100}}/>
    </ScrollView>
  );
};

// ═══════════════════════════════════════════════════════════════
// AI COACH SCREEN
// ═══════════════════════════════════════════════════════════════
const COACH_MODES = [
  { id:"analyze",  icon:"📊", label:"วิเคราะห์ตอนนี้",   desc:"ดูจุดแข็ง-จุดอ่อนจากข้อมูลจริง"   },
  { id:"plan",     icon:"🗺", label:"แผน 7 วัน",          desc:"สร้าง Weekly Quest Plan ให้เลย"     },
  { id:"suggest",  icon:"⚔", label:"แนะนำเควส",          desc:"เควสที่เหมาะกับระดับและสไตล์คุณ"   },
  { id:"motivate", icon:"🔥", label:"ปลุกใจ",             desc:"โค้ชพูดให้กำลังใจแบบ RPG"          },
];

const AICoachScreen = ({ gameStats, quests, profile, level, totalXp, unlockedSkills, moodLog, goals, tokens, T }) => {
  const playerName = profile?.name || "Commander";
  const [messages, setMessages] = useState(() => [
    { role:"assistant", text:`สวัสดี ${playerName}! ข้าคือ AI Coach ผู้ช่วยด้าน Life RPG ของเจ้า\n\nข้าสามารถวิเคราะห์ข้อมูลจริงของเจ้าและให้คำแนะนำที่ตรงจุด เลือกโหมดด้านล่างหรือถามอะไรก็ได้เลย ⚔️`, ts:Date.now() }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [dotFrame, setDotFrame] = useState(0);
  useEffect(()=>{
    if (!loading) return;
    const iv = setInterval(()=>setDotFrame(f=>(f+1)%4), 400);
    return ()=>clearInterval(iv);
  },[loading]);

  // Build context snapshot from real player data
  const buildContext = () => {
    const safeGameStats = gameStats || {};
    const safeQuests    = quests    || [];
    const safeMoodLog   = moodLog   || [];
    const safeGoals     = goals     || [];
    const safeSkills    = unlockedSkills || [];

    const topCats = Object.entries(safeGameStats.cat||{})
      .sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c,n])=>`${getCatLabel(c)}(${n})`).join(", ") || "ยังไม่มี";
    const weakCats = Object.keys(CATEGORIES)
      .filter(c=>!(safeGameStats.cat||{})[c]).slice(0,3).map(getCatLabel).join(", ") || "ครบทุกหมวด";
    const pendingQ  = safeQuests.filter(q=>!q.completed).length;
    const doneToday = safeQuests.filter(q=>q.completed).length;
    const recentMood = safeMoodLog.slice(-3).map(m=>m?.mood?.label||"?").join(", ") || "ยังไม่บันทึก";
    const goalsSummary = safeGoals.map(g=>{
      const pct = g.target > 0 ? Math.round(((g.current||0)/g.target)*100) : 0;
      return `${g.title||"?"}(${pct}%)`;
    }).join(", ") || "ไม่มี";
    const skillsOwned = safeSkills.map(id=>SKILL_TREE.find(s=>s.id===id)?.name||id).join(", ") || "ยังไม่มี";

    return `=== ข้อมูลผู้เล่น ===
ชื่อ: ${profile?.name||"?"} | Title: ${profile?.title||"?"}
Level: ${level||1} | XP รวม: ${(totalXp||0).toLocaleString()} | 🪙 Tokens: ${tokens||0}
Streak สูงสุด: ${safeGameStats.streak||0} วัน | เควสที่ทำทั้งหมด: ${safeGameStats.done||0}
เควสที่ทำวันนี้: ${doneToday} | เควสที่ยังค้างอยู่: ${pendingQ}

หมวดที่ถนัด: ${topCats}
หมวดที่ยังขาด: ${weakCats}
Skills ที่ปลดล็อค: ${skillsOwned}

Mood 3 วันล่าสุด: ${recentMood}
เป้าหมายระยะยาว: ${goalsSummary}
===================`;
  };

  const sendToCoach = async (userMsg) => {
    if (loading) return;
    const trimmed = userMsg.trim();
    if (!trimmed) return;

    const userEntry = { role:"user", text:trimmed, ts:Date.now() };
    const history = [...messages, userEntry];
    setMessages(history);
    setInput("");
    setLoading(true);
    setTimeout(()=>scrollRef.current?.scrollToEnd({animated:true}), 100);

    try {
      const systemPrompt = `คุณคือ AI Life Coach สำหรับแอป Life RPG ภาษาไทย
สไตล์การพูด: เป็นกันเอง กระชับ มีพลัง ใช้คำ RPG บ้าง (เควส, เลเวล, XP, ปลดล็อค)
ห้ามใช้ภาษาอังกฤษมากเกินไป ตอบเป็นภาษาไทยเป็นหลัก
ตอบสั้น-กระชับ ไม่เกิน 200 คำ แต่ให้ action ที่ทำได้จริงเสมอ

${buildContext()}`;

      // Build message history for API (last 10 turns)
      const apiMessages = history.slice(-10).map(m=>({
        role: m.role==="assistant" ? "assistant" : "user",
        content: m.text,
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b=>b.text||"").join("") || "ขอโทษ เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";
      setMessages(prev=>[...prev, { role:"assistant", text:reply, ts:Date.now() }]);
    } catch(e) {
      setMessages(prev=>[...prev, { role:"assistant", text:"⚠️ เชื่อมต่อ AI ไม่ได้ ตรวจสอบ internet แล้วลองใหม่", ts:Date.now() }]);
    } finally {
      setLoading(false);
      setTimeout(()=>scrollRef.current?.scrollToEnd({animated:true}), 150);
    }
  };

  const quickPrompt = (mode) => {
    const prompts = {
      analyze:  "วิเคราะห์จุดแข็งและจุดอ่อนของข้าจากข้อมูลทั้งหมด บอกสิ่งที่ต้องปรับปรุงเร่งด่วน",
      plan:     "สร้างแผน Quest 7 วันที่เหมาะกับระดับและหมวดที่ข้าขาด ระบุชื่อเควสจริงจากแอปด้วย",
      suggest:  "แนะนำเควส 5 อันที่ข้าควรทำวันนี้ เรียงตามความสำคัญ พร้อมเหตุผล",
      motivate: "ปลุกใจข้าในแบบ RPG Hero ดูจาก streak และความก้าวหน้าของข้าแล้วพูดให้กำลังใจ",
    };
    sendToCoach(prompts[mode]);
  };

  const dots = ["   ","•  ","•• ","•••"][dotFrame];
  const safeStats = gameStats || {};

  return (
    <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={{flex:1}}>
      <View style={{flex:1,paddingTop:4}}>

        {/* ── HEADER: avatar + stats bar ─────────────────────── */}
        <View style={{
          flexDirection:"row", alignItems:"center", gap:12,
          backgroundColor:T.surface2, borderRadius:16,
          borderWidth:1, borderColor:T.borderBright,
          paddingHorizontal:14, paddingVertical:10, marginBottom:14,
        }}>
          {/* Avatar circle */}
          <View style={{
            width:44,height:44,borderRadius:22,
            backgroundColor:T.goldDim,
            borderWidth:1.5,borderColor:T.gold,
            alignItems:"center",justifyContent:"center",
          }}>
            <Text style={{fontSize:22}}>🤖</Text>
          </View>
          {/* Name + subtitle */}
          <View style={{flex:1}}>
            <Text style={{fontSize:13,fontWeight:"700",color:T.textPrimary,letterSpacing:0.5}}>AI LIFE COACH</Text>
            <Text style={{fontSize:10,color:T.gold,marginTop:1}}>พร้อมช่วย {playerName} เสมอ ✦</Text>
          </View>
          {/* Stat pills */}
          <View style={{flexDirection:"row",gap:6}}>
            {[
              {icon:"⚡",v:level,   label:"LV"},
              {icon:"🔥",v:safeStats.streak||0, label:"DAY"},
              {icon:"🪙",v:tokens||0, label:""},
            ].map(({icon,v,label})=>(
              <View key={icon} style={{
                alignItems:"center",
                backgroundColor:T.goldDim,
                borderRadius:8,borderWidth:1,borderColor:T.gold,
                paddingHorizontal:7,paddingVertical:4,
              }}>
                <Text style={{fontSize:11,color:T.gold,fontWeight:"700"}}>{v}</Text>
                <Text style={{fontSize:7,color:T.textDim,letterSpacing:0.5}}>{icon}{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── QUICK ACTION CHIPS ──────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingRight:8,gap:8,flexDirection:"row"}}
          style={{flexShrink:0,marginBottom:14}}>
          {COACH_MODES.map(m=>(
            <TouchableOpacity key={m.id} onPress={()=>quickPrompt(m.id)} disabled={loading}
              activeOpacity={0.7}
              style={{
                borderRadius:20, borderWidth:1, borderColor:T.gold,
                backgroundColor:T.goldDim,
                paddingHorizontal:14, paddingVertical:8,
                flexDirection:"row", alignItems:"center", gap:6,
                opacity:loading?0.4:1,
              }}>
              <Text style={{fontSize:14}}>{m.icon}</Text>
              <View>
                <Text style={{fontSize:11,color:T.gold,fontWeight:"700"}}>{m.label}</Text>
                <Text style={{fontSize:9,color:T.textDim,marginTop:1}}>{m.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── CHAT MESSAGES ───────────────────────────────────── */}
        <ScrollView ref={scrollRef} style={{flex:1}} showsVerticalScrollIndicator={false}
          onContentSizeChange={()=>scrollRef.current?.scrollToEnd({animated:true})}>

          {messages.map((m,i)=>{
            const isAI = m.role==="assistant";
            return (
              <View key={i} style={{
                marginBottom:16,
                alignItems:isAI?"flex-start":"flex-end",
              }}>
                {isAI ? (
                  <View style={{maxWidth:"88%"}}>
                    {/* AI label row */}
                    <View style={{flexDirection:"row",alignItems:"center",gap:6,marginBottom:6}}>
                      <View style={{
                        width:24,height:24,borderRadius:12,
                        backgroundColor:T.goldDim,borderWidth:1,borderColor:T.gold,
                        alignItems:"center",justifyContent:"center",
                      }}>
                        <Text style={{fontSize:12}}>✦</Text>
                      </View>
                      <Text style={{fontSize:9,color:T.gold,letterSpacing:1.5,fontWeight:"700"}}>COACH</Text>
                    </View>
                    {/* Bubble */}
                    <View style={{
                      borderRadius:4,borderTopLeftRadius:0,
                      borderWidth:1,borderColor:T.borderBright,
                      backgroundColor:T.surface2,
                      paddingHorizontal:14,paddingVertical:12,
                      borderLeftWidth:2,borderLeftColor:T.gold,
                    }}>
                      <Text style={{fontSize:13,color:T.textPrimary,lineHeight:22}}>{m.text}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={{maxWidth:"82%"}}>
                    {/* User label */}
                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"flex-end",gap:6,marginBottom:6}}>
                      <Text style={{fontSize:9,color:T.textDim,letterSpacing:1.5}}>{playerName.toUpperCase()}</Text>
                      <View style={{
                        width:24,height:24,borderRadius:12,
                        backgroundColor:T.surface2,borderWidth:1,borderColor:T.borderBright,
                        alignItems:"center",justifyContent:"center",
                      }}>
                        <Text style={{fontSize:11,color:T.textSecondary}}>◈</Text>
                      </View>
                    </View>
                    {/* Bubble */}
                    <View style={{
                      borderRadius:4,borderTopRightRadius:0,
                      borderWidth:1,borderColor:T.borderBright,
                      backgroundColor:T.surface,
                      paddingHorizontal:14,paddingVertical:12,
                      borderRightWidth:2,borderRightColor:T.borderBright,
                    }}>
                      <Text style={{fontSize:13,color:T.textPrimary,lineHeight:22}}>{m.text}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          {/* Typing indicator */}
          {loading&&(
            <View style={{marginBottom:16}}>
              <View style={{flexDirection:"row",alignItems:"center",gap:6,marginBottom:6}}>
                <View style={{
                  width:24,height:24,borderRadius:12,
                  backgroundColor:T.goldDim,borderWidth:1,borderColor:T.gold,
                  alignItems:"center",justifyContent:"center",
                }}>
                  <Text style={{fontSize:12}}>✦</Text>
                </View>
                <Text style={{fontSize:9,color:T.gold,letterSpacing:1.5,fontWeight:"700"}}>COACH</Text>
              </View>
              <View style={{
                alignSelf:"flex-start",
                borderRadius:4,borderTopLeftRadius:0,
                borderWidth:1,borderColor:T.borderBright,
                backgroundColor:T.surface2,
                paddingHorizontal:18,paddingVertical:14,
                borderLeftWidth:2,borderLeftColor:T.gold,
              }}>
                <Text style={{fontSize:18,color:T.gold,letterSpacing:4,fontFamily:"monospace"}}>{dots}</Text>
              </View>
            </View>
          )}
          <View style={{height:8}}/>
        </ScrollView>

        {/* ── INPUT BAR ───────────────────────────────────────── */}
        <View style={{
          flexDirection:"row", gap:8,
          paddingTop:10, paddingBottom:6, flexShrink:0,
          borderTopWidth:1, borderTopColor:T.border,
          marginTop:4,
        }}>
          <TextInput
            value={input} onChangeText={setInput}
            placeholder="พิมพ์คำถามหรือขอคำแนะนำ..."
            placeholderTextColor={T.textDim}
            onSubmitEditing={()=>sendToCoach(input)}
            returnKeyType="send"
            multiline={false}
            style={{
              flex:1,
              borderWidth:1,borderColor:loading?T.border:T.borderBright,
              borderRadius:24,
              backgroundColor:T.surface2,
              color:T.textPrimary,
              paddingHorizontal:16,paddingVertical:10,
              fontSize:13,
            }}
          />
          <TouchableOpacity
            onPress={()=>sendToCoach(input)}
            disabled={loading||!input.trim()}
            activeOpacity={0.75}
            style={{
              width:44,height:44,borderRadius:22,
              borderWidth:1,borderColor:T.gold,
              backgroundColor:input.trim()&&!loading ? T.gold : T.goldDim,
              alignItems:"center",justifyContent:"center",
              opacity:(loading||!input.trim())?0.5:1,
            }}>
            <Text style={{fontSize:16,color:input.trim()&&!loading ? T.void : T.gold}}>▶</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function LifeRPGApp() {
  const vm = useViewModel();
  const { theme, T, toggleTheme, totalXp, level, xpInLvl, progress, quests, activeTab, setActiveTab,
    completeQuest, saveQuest, deleteQuest, achList, levelUpModal, setLevelUpModal, achToast, setAchToast,
    gameStats, profile, updateProfile, unlockedSkills, skillPoints, unlockSkill,
    tokens, inventory, buyItem, useItem, activeEffects,
    chainProgress, completeChainQuest, dailyChallenge, completeDailyChallenge,
    bossQuest, completeBossQuest, notifSettings, toggleNotif, notifBanner,
    dailyHistory, manualReset, moodLog, logMood, goals, saveGoal, deleteGoal,
    onboardingDone, setOnboardingDone, questEditor, setQuestEditor, weeklyReport,
    loaded, clearSaveData,
  } = vm;

  // ⚠️ ALL useState MUST be before any early return (Rules of Hooks)
  const [showEdit, setShowEdit] = useState(false);

  // Loading splash
  if (!loaded) {
    return (
      <SafeAreaView style={{flex:1,backgroundColor:"#06060A",alignItems:"center",justifyContent:"center"}}>
        <Text style={{fontSize:40,marginBottom:16}}>⚔️</Text>
        <Text style={{fontSize:18,color:"#C9A84C",letterSpacing:4,fontWeight:"300"}}>LIFE RPG</Text>
        <Text style={{fontSize:10,color:"rgba(240,237,232,0.3)",letterSpacing:2,marginTop:8}}>LOADING SAVE DATA...</Text>
        <View style={{marginTop:24,width:120,height:2,backgroundColor:"rgba(255,255,255,0.06)"}}>
          <Animated.View style={{height:2,width:"60%",backgroundColor:"#C9A84C",opacity:0.8}}/>
        </View>
      </SafeAreaView>
    );
  }

  if (!onboardingDone) {
    return <OnboardingScreen onDone={()=>setOnboardingDone(true)} T={T}/>;
  }

  return (
    <SafeAreaView style={[css.safe,{backgroundColor:T.void}]}>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.void}/>
      <View style={[css.app,{backgroundColor:T.void}]}>

        {levelUpModal&&<LevelUpModal level={levelUpModal.newLevel} onClose={()=>setLevelUpModal(null)} T={T}/>}
        {achToast    &&<AchToast ach={achToast} onClose={()=>setAchToast(null)} T={T}/>}
        {notifBanner &&<NotifBanner message={notifBanner.message} T={T}/>}
        {showEdit    &&<EditProfileModal profile={profile} level={level} onSave={updateProfile} onClose={()=>setShowEdit(false)} T={T}/>}
        {questEditor &&(
          <QuestEditorModal
            quest={questEditor==="new"?null:questEditor}
            onSave={saveQuest} onClose={()=>setQuestEditor(null)} T={T}/>
        )}

        {/* HEADER */}
        <View style={[css.header,{borderBottomColor:T.border}]}>
          {/* Row 1: badges left, buttons right */}
          <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
            <View style={{flexDirection:"row",gap:6,alignItems:"center",flex:1,flexWrap:"wrap"}}>
              <View style={{borderWidth:1,borderColor:T.goldDim,backgroundColor:T.goldDim,paddingHorizontal:8,paddingVertical:3}}>
                <Text style={{fontSize:8,letterSpacing:1.5,color:T.gold}}>⬡ LVL {level} · ⚡{skillPoints} · 🪙{tokens}</Text>
              </View>
              <Text style={{fontSize:10,letterSpacing:3,color:T.textDim}}>{profile.title}</Text>
            </View>
            <View style={{flexDirection:"row",alignItems:"center",gap:6}}>
              <TouchableOpacity onPress={toggleTheme} style={{width:28,height:28,borderRadius:14,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:T.border}}>
                <Text style={{fontSize:12}}>{theme==="DARK"?"☀️":"🌙"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setShowEdit(true)}>
                <View style={{width:28,height:28,borderRadius:14,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:T.goldDim,backgroundColor:profile.avatarBg}}>
                  <Text style={{fontSize:16}}>{profile.avatarEmoji}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          {/* Row 2: name + XP bar inline */}
          <View style={{flexDirection:"row",alignItems:"center",gap:12,marginTop:8}}>
            <Text style={{fontSize:22,fontWeight:"300",color:T.textPrimary,letterSpacing:0.5}}>{profile.name}</Text>
            <View style={{flex:1}}>
              <View style={{flexDirection:"row",justifyContent:"space-between",marginBottom:3}}>
                <Text style={{fontSize:7,letterSpacing:2,color:T.textDim}}>LVL {level}  —  {progress.toFixed(0)}%</Text>
                <Text style={{fontSize:7,color:T.gold}}>{xpInLvl}/{XP_PER_LEVEL}</Text>
              </View>
              <View style={{height:2,backgroundColor:T.border}}>
                <View style={{height:2,width:`${progress}%`,backgroundColor:T.gold}}/>
              </View>
            </View>
          </View>
        </View>

        {/* CONTENT */}
        <View style={css.content}>
          {activeTab==="DASHBOARD"&&<DashboardScreen quests={quests} completeQuest={completeQuest} bossQuest={bossQuest} completeBossQuest={completeBossQuest} dailyChallenge={dailyChallenge} completeDailyChallenge={completeDailyChallenge} gameStats={gameStats} T={T}/>}
          {activeTab==="QUESTS"   &&<QuestsScreen quests={quests} completeQuest={completeQuest} setQuestEditor={setQuestEditor} deleteQuest={deleteQuest} T={T}/>}
          {activeTab==="CHAINS"   &&<ChainsScreen chainProgress={chainProgress} completeChainQuest={completeChainQuest} T={T}/>}
          {activeTab==="SKILLS"   &&<SkillTreeScreen unlockedSkills={unlockedSkills} skillPoints={skillPoints} unlockSkill={unlockSkill} T={T}/>}
          {activeTab==="SHOP"     &&<ShopScreen tokens={tokens} inventory={inventory} buyItem={buyItem} useItem={useItem} activeEffects={activeEffects} T={T}/>}
          {activeTab==="TRACKER"  &&<TrackerScreen moodLog={moodLog} logMood={logMood} goals={goals} saveGoal={saveGoal} deleteGoal={deleteGoal} dailyHistory={dailyHistory} T={T}/>}
          {activeTab==="REPORT"   &&<WeeklyReportScreen weeklyReport={weeklyReport} dailyHistory={dailyHistory} gameStats={gameStats} T={T}/>}
          {activeTab==="ACHIEVE"  &&<AchievementsScreen achList={achList} T={T}/>}
          {activeTab==="COACH"    &&<AICoachScreen gameStats={gameStats} quests={quests} profile={profile} level={level} totalXp={totalXp} unlockedSkills={unlockedSkills} moodLog={moodLog} goals={goals} tokens={tokens} T={T}/>}
          {activeTab==="SETTINGS" &&<SettingsScreen theme={theme} T={T} toggleTheme={toggleTheme} notifSettings={notifSettings} toggleNotif={toggleNotif} dailyHistory={dailyHistory} manualReset={manualReset} clearSaveData={clearSaveData}/>}
        </View>

        {/* BOTTOM NAV — scrollable, all tabs */}
        <View style={[css.bnav,{borderTopColor:T.border,backgroundColor:T.void}]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{alignItems:"center",paddingHorizontal:8,gap:0}}>
            {[
              { id:"DASHBOARD", icon:"◈",  label:"HOME"    },
              { id:"QUESTS",    icon:"◆",  label:"QUESTS"  },
              { id:"CHAINS",    icon:"⚔",  label:"ARCS"    },
              { id:"SKILLS",    icon:"⚡",  label:"SKILLS"  },
              { id:"SHOP",      icon:"🛒", label:"SHOP"    },
              { id:"TRACKER",   icon:"📊", label:"TRACK"   },
              { id:"REPORT",    icon:"◇",  label:"REPORT"  },
              { id:"ACHIEVE",   icon:"✦",  label:"ACH"     },
              { id:"COACH",     icon:"🤖", label:"COACH"   },
              { id:"SETTINGS",  icon:"⚙",  label:"CONFIG"  },
            ].map(t=>(
              <TouchableOpacity key={t.id}
                style={{alignItems:"center",gap:3,paddingHorizontal:14,paddingVertical:6}}
                onPress={()=>setActiveTab(t.id)}>
                <Text style={[{fontSize:16},activeTab===t.id?{color:T.gold}:{color:T.textDim}]}>{t.icon}</Text>
                <Text style={[{fontSize:7,letterSpacing:1},activeTab===t.id?{color:T.gold,fontWeight:"700"}:{color:T.textDim}]}>{t.label}</Text>
                {activeTab===t.id&&<View style={{position:"absolute",top:0,left:"20%",right:"20%",height:1.5,backgroundColor:T.gold}}/>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const css = StyleSheet.create({
  safe:   { flex:1 },
  app:    { flex:1, flexDirection:"column", maxWidth:420, alignSelf:"center", width:"100%" },

  // Header
  header: { paddingHorizontal:20, paddingTop:10, paddingBottom:10, borderBottomWidth:1, flexShrink:0 },

  // Nav
  content: { flex:1, paddingHorizontal:20, minHeight:0 },

  // Section
  secLabel: { fontSize:8, letterSpacing:3.5, textTransform:"uppercase", paddingTop:18, paddingBottom:8 },

  // Quest
  questItem:   { borderWidth:1, padding:14, marginBottom:6, flexDirection:"row", alignItems:"center", gap:10, position:"relative", overflow:"hidden" },
  questFlash:  { position:"absolute", top:0, left:0, right:0, bottom:0 },
  priorityBar: { position:"absolute", left:0, top:0, bottom:0, width:2 },
  questCheck:  { width:28, height:28, borderWidth:1, alignItems:"center", justifyContent:"center" },
  questTitle:  { fontSize:11, lineHeight:16 },
  catBadge:    { borderWidth:1, paddingHorizontal:5, paddingVertical:2, borderRadius:2 },
  rarityTag:   { fontSize:7, letterSpacing:1 },
  questXP:     { fontSize:9, fontWeight:"700" },

  // Chip
  chip: { flexDirection:"row", alignItems:"center", borderWidth:1, paddingHorizontal:10, paddingVertical:5, marginRight:6, borderRadius:2 },

  // Card
  card:      { borderWidth:1, padding:16, marginBottom:8 },
  mCard:     { flex:1, borderWidth:1, padding:14 },
  chartCard: { borderWidth:1, padding:18, marginBottom:8 },

  // Modals
  modalOverlay: { flex:1, backgroundColor:"rgba(0,0,0,0.88)", alignItems:"center", justifyContent:"center" },
  lvBox:    { borderWidth:1, padding:40, alignItems:"center", width:280 },
  lvGlow:   { fontSize:52, marginBottom:8 },
  lvLabel:  { fontSize:9, letterSpacing:6, marginBottom:8 },
  lvNum:    { fontSize:80, fontWeight:"100", lineHeight:88 },
  lvSub:    { fontSize:11, marginTop:8, marginBottom:8, textAlign:"center" },
  lvBtn:    { borderWidth:1, paddingHorizontal:32, paddingVertical:10, marginTop:12 },
  lvBtnTxt: { fontSize:10, letterSpacing:3 },

  // Toast
  achToast:     { position:"absolute", top:60, left:16, right:16, zIndex:999, borderWidth:1, padding:14, flexDirection:"row", alignItems:"center", gap:12 },
  achToastIcon: { fontSize:24 },
  achToastMeta: { fontSize:7, letterSpacing:2 },
  achToastTitle:{ fontSize:12, fontWeight:"600" },
  achToastDesc: { fontSize:9, marginTop:1 },
  achToastXp:   { fontSize:12, fontWeight:"700" },

  // Banner
  banner:    { position:"absolute", top:0, left:0, right:0, zIndex:9999, borderBottomWidth:1, paddingHorizontal:20, paddingVertical:11 },
  bannerTxt: { fontSize:11, letterSpacing:0.5, textAlign:"center" },

  // Boss Quest
  bossCard:   { borderWidth:1, padding:16, marginBottom:6 },
  bossBadge:  { backgroundColor:"rgba(244,63,94,0.12)", borderWidth:1, borderColor:"rgba(244,63,94,0.3)", paddingHorizontal:8, paddingVertical:3 },
  bossBadgeTxt:{ fontSize:8, letterSpacing:2, color:"#F43F5E", fontWeight:"700" },

  // Daily card
  dailyCard: { borderWidth:1, padding:14, marginBottom:6, flexDirection:"row", alignItems:"center" },

  // Profile sheet
  psOverlay:    { flex:1, justifyContent:"flex-end" },
  psOverlayBg:  { ...StyleSheet.absoluteFillObject, backgroundColor:"rgba(0,0,0,0.7)" },
  psSheet:      { borderTopWidth:1, borderTopLeftRadius:16, borderTopRightRadius:16, height:"90%", paddingBottom:32 },
  psSheetHeader:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:20, borderBottomWidth:1 },
  psSheetTitle: { fontSize:14, fontWeight:"600", letterSpacing:1 },
  psSaveBtn:    { marginHorizontal:20, marginTop:12, borderWidth:1, padding:16, alignItems:"center" },
  psSaveBtnTxt: { fontSize:11, letterSpacing:4, fontWeight:"700" },

  // Achievements
  achCard:  { borderWidth:1, padding:14, marginBottom:6, flexDirection:"row", alignItems:"center", gap:12 },
  achIcon:  { width:40, height:40, borderWidth:1, alignItems:"center", justifyContent:"center", borderRadius:4 },

  // Profile
  heroAvatar: { width:96, height:96, borderRadius:48, alignItems:"center", justifyContent:"center", borderWidth:2, borderColor:"rgba(201,168,76,0.3)", marginBottom:12, position:"relative" },
  editBadge:  { position:"absolute", bottom:0, right:0, width:24, height:24, borderRadius:12, backgroundColor:"#C9A84C", alignItems:"center", justifyContent:"center" },
  titleRow:   { flexDirection:"row", alignItems:"center", gap:12, borderWidth:1, padding:14, marginBottom:6 },

  // Settings
  settRow:  { flexDirection:"row", alignItems:"center", justifyContent:"space-between", borderWidth:1, padding:16, marginBottom:6 },
  toggle:   { width:40, height:22, borderRadius:11, padding:2, justifyContent:"center" },
  toggleDot:{ width:18, height:18, borderRadius:9 },
  resetBtn: { borderWidth:1, padding:14, alignItems:"center", marginTop:4 },

  // Skill
  skillNode: { position:"absolute", height:72, alignItems:"center", justifyContent:"center", padding:4, borderWidth:1, borderRadius:4 },
  skillDesc: { borderWidth:1, padding:12, marginBottom:6, flexDirection:"row", alignItems:"center", gap:12 },
  spBadge:   { borderWidth:1, paddingHorizontal:10, paddingVertical:4 },

  // Chain
  chainCard:  { borderWidth:1, padding:16, marginBottom:10 },
  chainQuest: { borderWidth:1, padding:12, marginBottom:6, flexDirection:"row", alignItems:"center", gap:10 },

  // Tracker
  moodBtn: { alignItems:"center", width:52, padding:8, borderWidth:1, borderRadius:8 },
  goalCard: { borderWidth:1, padding:14, marginBottom:6 },

  // Inputs
  textInput:  { borderWidth:1, padding:12, marginBottom:14, fontSize:13, borderRadius:2 },
  fieldLabel: { fontSize:8, letterSpacing:3, textTransform:"uppercase", marginBottom:8, marginTop:4 },
  pickChip:   { borderWidth:1, paddingHorizontal:10, paddingVertical:6, marginRight:6, borderRadius:2 },
  addBtn:     { borderWidth:1, paddingHorizontal:10, paddingVertical:5 },
  deleteHint: { borderWidth:1, borderStyle:"dashed", padding:10, alignItems:"center", marginTop:4, marginBottom:6 },

  // Onboarding
  onboardWrap:  { flex:1, justifyContent:"flex-end", paddingBottom:60 },
  onboardSlide: { alignItems:"center", justifyContent:"center", padding:40 },
  onboardIcon:  { fontSize:72, marginBottom:24 },
  onboardTitle: { fontSize:22, fontWeight:"300", letterSpacing:1, marginBottom:16, textAlign:"center" },
  onboardDesc:  { fontSize:12, lineHeight:20, textAlign:"center", letterSpacing:0.5 },
  onboardDots:  { flexDirection:"row", justifyContent:"center", gap:8, marginBottom:24 },
  dot:          { width:6, height:6, borderRadius:3 },
  onboardBtn:   { marginHorizontal:40, borderWidth:1, padding:16, alignItems:"center", borderRadius:4 },
  onboardBtnTxt:{ fontSize:14, letterSpacing:2, fontWeight:"600" },

  // Shop
  shopCard: { borderWidth:1, padding:14, marginBottom:8, borderRadius:2 },

  // Bottom nav
  bnav: { borderTopWidth:1, flexShrink:0, paddingBottom:Platform.OS==="ios"?20:8, paddingTop:4 },
});