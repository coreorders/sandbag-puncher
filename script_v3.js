// --- Audio Context & BGM ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
let isMuted = false;
let bgmOscillators = [];
let bgmInterval = null;
let bgmNoteIndex = 0;

const NOTES = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
};

// Simple Cheerful Melody Loop
const MELODY = [
    { n: 'C5', d: 0.2 }, { n: 'E5', d: 0.2 }, { n: 'G5', d: 0.2 }, { n: 'C6', d: 0.4 },
    { n: 'G5', d: 0.2 }, { n: 'E5', d: 0.2 }, { n: 'C5', d: 0.4 },
    { n: 'D5', d: 0.2 }, { n: 'F5', d: 0.2 }, { n: 'A5', d: 0.2 }, { n: 'D6', d: 0.4 },
    { n: 'A5', d: 0.2 }, { n: 'F5', d: 0.2 }, { n: 'D5', d: 0.4 }
];

const startBGM = () => {
    if (bgmInterval) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Play one note every 400ms approx (adjust logic for rhythm)
    let nextTime = audioCtx.currentTime;

    bgmInterval = setInterval(() => {
        if (isMuted) return;

        const note = MELODY[bgmNoteIndex % MELODY.length];
        bgmNoteIndex++;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        // Simple Sine for pleasant tone
        osc.type = 'triangle';
        // Map note name to freq (simple map or just use C major scale math)
        // Hardcoding helper for C Major scale names above
        let freq = NOTES[note.n] || 440;
        if (note.n === 'C6') freq = 1046.50;
        if (note.n === 'D6') freq = 1174.66;

        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime); // Low volume background
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + note.d);

        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + note.d);
    }, 250); // Speed
};

const stopBGM = () => {
    if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; }
};

const toggleMute = () => {
    isMuted = !isMuted;
    const btn = document.getElementById('btn-mute');
    if (btn) btn.textContent = isMuted ? '🔇' : '🔊';
    if (!isMuted) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }
};

const playSound = (type) => {
    if (isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'hit') {
        osc.type = 'sine'; // Soft thud
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime); // Lower volume
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'drop_rare') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'drop_legendary' || type === 'drop_unique') {
        const now = audioCtx.currentTime;
        [500, 1000].forEach((freq, i) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g);
            g.connect(audioCtx.destination);
            o.type = 'triangle';
            o.frequency.setValueAtTime(freq, now + i * 0.1);
            g.gain.setValueAtTime(0.2, now + i * 0.1);
            g.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.5);
            o.start(now + i * 0.1);
            o.stop(now + i * 0.1 + 0.5);
        });
    } else if (type === 'coin') {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sine'; o.frequency.setValueAtTime(1200, audioCtx.currentTime);
        g.gain.setValueAtTime(0.1, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        o.start(); o.stop(audioCtx.currentTime + 0.1);
    }
};

// ... (Rest of AffixSystem and Item class unchanged, assuming they are before loop starts or not in this replace block) ...
// NOTE: Since I am replacing the top 60 lines, I need to be careful. 
// Actually, I will use a separate block for the bottom logic changes.
// This block handles the Audio overhaul at the top.


// --- Affix Data & Configuration (Localization) ---
const AFFIX_DATA = {
    weapon: {
        prefixes: [
            { id: 'phys_dmg', name: '폭군의', stat: 'incDmg', tiers: [{ t: 5, min: 1, max: 10, w: 5 }, { t: 4, min: 11, max: 20, w: 25 }, { t: 3, min: 21, max: 30, w: 40 }, { t: 2, min: 31, max: 40, w: 25 }, { t: 1, min: 41, max: 50, w: 5 }] },
            { id: 'poison', name: '맹독의', stat: 'poisonDmg', tiers: [{ t: 5, min: 20, max: 25, w: 5 }, { t: 4, min: 26, max: 30, w: 25 }, { t: 3, min: 31, max: 40, w: 40 }, { t: 2, min: 41, max: 45, w: 25 }, { t: 1, min: 46, max: 50, w: 5 }] }
        ],
        suffixes: [
            { id: 'crit_chance', name: '정밀함의', stat: 'critChance', tiers: [{ t: 5, min: 1, max: 5, w: 5 }, { t: 4, min: 6, max: 10, w: 25 }, { t: 3, min: 11, max: 15, w: 40 }, { t: 2, min: 16, max: 20, w: 25 }, { t: 1, min: 21, max: 25, w: 5 }] },
            { id: 'crit_multi', name: '파괴의', stat: 'critMulti', tiers: [{ t: 5, min: 1, max: 10, w: 5 }, { t: 4, min: 11, max: 20, w: 25 }, { t: 3, min: 21, max: 30, w: 40 }, { t: 2, min: 31, max: 40, w: 25 }, { t: 1, min: 41, max: 50, w: 5 }] }
        ]
    },
    ring: {
        prefixes: [
            { id: 'proj_count', name: '일제사격', stat: 'projectiles', weight: 100, tiers: [{ t: 2, min: 1, max: 1, w: 95 }, { t: 1, min: 2, max: 2, w: 5 }] },
            { id: 'weapon_effect', name: '강화의', stat: 'weaponEffectScale', weight: 1000, tiers: [{ t: 5, min: 10, max: 20, w: 5 }, { t: 4, min: 21, max: 30, w: 25 }, { t: 3, min: 31, max: 40, w: 40 }, { t: 2, min: 41, max: 50, w: 25 }, { t: 1, min: 51, max: 60, w: 5 }] },
            { id: 'summon_skel', name: '강령술사의', stat: 'summonSkeleton', weight: 300, tiers: [{ t: 1, min: 1, max: 1, w: 100 }] }
        ],
        suffixes: [
            { id: 'wealth', name: '풍요의', stat: 'skeletonArrow', weight: 100, tiers: [{ t: 2, min: 1, max: 1, w: 80 }, { t: 1, min: 2, max: 2, w: 20 }] },
            { id: 'fortune', name: '행운의', stat: 'minionDmg', weight: 100, tiers: [{ t: 5, min: 20, max: 30, w: 20 }, { t: 1, min: 40, max: 50, w: 20 }] },
            { id: 'toxic', name: '중독의', stat: 'poisonChance', weight: 100, tiers: [{ t: 5, min: 5, max: 10, w: 5 }, { t: 4, min: 11, max: 15, w: 25 }, { t: 3, min: 16, max: 20, w: 40 }, { t: 2, min: 21, max: 25, w: 25 }, { t: 1, min: 26, max: 30, w: 5 }] }
        ]
    }
};

const PROBABILITIES = {
    weapon: [{ c: 1, w: 60 }, { c: 2, w: 35 }, { c: 3, w: 4 }, { c: 4, w: 1 }],
    ring: [{ c: 1, w: 60 }, { c: 2, w: 39 }, { c: 3, w: 0.9 }, { c: 4, w: 0.1 }]
};

function weightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.w, 0);
    let random = Math.random() * totalWeight;
    for (const item of items) {
        if (random < item.w) return item;
        random -= item.w;
    }
    return items[0];
}
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

class AffixSystem {
    static rollItem(type, sandbagLevel) {
        const item = new Item(type);
        item.baseDamage = sandbagLevel * 3;

        // Unique Roll
        const uniqueRoll = Math.random();
        // Base unique chance 0.2% -> Increased slightly to accommodate more items or keep same?
        // User asked for "Awl" to have higher drop rate.
        // Let's say: Normal Unique Chance 0.2%. If hit, pick which unique.
        // Or: 
        // 0.1% Bone Unity
        // 0.1% Hornet
        // 0.3% Awl (Higher)
        // 0.1% Drill
        // 0.05% Absurdity (Rare?) -> User didn't specify rarity, just "Unique".

        // Let's use a flat check for ANY unique first, then weight them.
        // Total Unique Chance = ~0.6%?

        if (type === 'weapon') {
            if (Math.random() < 0.006) { // 0.6% Chance
                const roll = Math.random();
                if (roll < 0.5) { // 50% of Uniques = Awl (High Rate)
                    item.name = "송곳"; // Awl
                    item.rarity = "unique";
                    item.icon = "📍";
                    item.baseDamage = 1; // Fixed 1
                    item.affixes = [{ stat: 'uniqueAwl', value: 1, tier: 0 }];
                } else if (roll < 0.7) {
                    item.name = "전동드릴"; // Electric Drill
                    item.rarity = "unique";
                    item.icon = "🔩";
                    item.baseDamage = 1; // Fixed 1
                    const hits = getRandomInt(5, 10);
                    item.affixes = [{ stat: 'uniqueDrill', value: hits, tier: 0 }];
                } else if (roll < 0.85) {
                    item.name = "골아일체"; // Bone Unity
                    item.rarity = "unique";
                    item.icon = "☠️";
                    item.baseDamage *= 1.5;
                    item.affixes = [{ stat: 'uniqueBoneUnity', value: 1, tier: 0 }];
                } else {
                    item.name = "장수말벌침"; // Giant Hornet Stinger
                    item.rarity = "unique";
                    item.icon = "🐝";
                    item.baseDamage *= 1.2;
                    const extraDuration = getRandomInt(-50, 150);
                    item.affixes = [{ stat: 'uniqueHornet', value: extraDuration, tier: 0 }];
                }

                // item.generateName(); // FIX: Do not overwrite unique name
                return item;
            }
        } else if (type === 'ring') {
            if (Math.random() < 0.003) { // 0.3% Chance
                const roll = Math.random();
                if (roll < 0.5) {
                    item.name = "해골폭풍"; // Skeleton Storm
                    item.rarity = "unique";
                    item.icon = "🌪️";
                    // No base damage valid for ring usually? But let's assume standard stats + unique effect
                    const spd = getRandomInt(30, 80);
                    item.affixes = [{ stat: 'uniqueSkelStorm', value: spd, tier: 0 }];
                } else {
                    item.name = "어처구니"; // Absurdity
                    item.rarity = "unique";
                    item.icon = "🪵"; // Millstone Handle (Wooden stick)
                    item.baseDamage = 50000;
                    item.affixes = []; // Just raw damage
                }
                // item.generateName(); // FIX: Do not overwrite unique name
                return item;
            }
        }

        const config = PROBABILITIES[type];
        const countPool = config.map(c => ({ item: c.c, w: c.w }));
        const count = weightedRandom(countPool).item;

        let prefixes = [], suffixes = [];
        let availableP = [...AFFIX_DATA[type].prefixes];
        let availableS = [...AFFIX_DATA[type].suffixes];

        for (let i = 0; i < count; i++) {
            let canP = prefixes.length < 2 && availableP.length > 0;
            let canS = suffixes.length < 2 && availableS.length > 0;
            let pickP = (canP && canS) ? Math.random() < 0.5 : canP;

            if (pickP) {
                const pool = availableP.map(p => ({ item: p, w: p.weight || 100 }));
                const chosen = weightedRandom(pool).item;
                const tier = weightedRandom(chosen.tiers);
                const val = getRandomInt(tier.min, tier.max);
                prefixes.push({ ...chosen, tier: tier.t, value: val, type: 'prefix' });
                availableP = availableP.filter(p => p.id !== chosen.id);
            } else {
                const pool = availableS.map(p => ({ item: p, w: p.weight || 100 }));
                const chosen = weightedRandom(pool).item;
                const tier = weightedRandom(chosen.tiers);
                const val = getRandomInt(tier.min, tier.max);
                suffixes.push({ ...chosen, tier: tier.t, value: val, type: 'suffix' });
                availableS = availableS.filter(p => p.id !== chosen.id);
            }
        }

        item.affixes = [...prefixes, ...suffixes];
        item.rarity = item.affixes.length >= 4 ? 'legendary' : item.affixes.length === 3 ? 'epic' : item.affixes.length === 2 ? 'rare' : 'magic';
        item.generateName();
        return item;
    }
}

class Item {
    constructor(type) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.affixes = [];
        this.name = '';
        this.icon = '';
        this.rarity = 'normal';
        this.baseDamage = 0;

        if (type === 'weapon') this.icon = '🗡️';
        else if (type === 'ring') this.icon = '💍';
    }

    generateName() {
        const base = this.type === 'weapon' ? '검' : '반지';
        const p = this.affixes.find(a => a.type === 'prefix');
        const s = this.affixes.find(a => a.type === 'suffix');
        this.name = `${p ? p.name : ''} ${base} ${s ? s.name : ''}`.trim();
    }

    getTooltipHTML() {
        let html = `<div class='tooltip-header ${this.rarity}'>${this.name}</div><div class='tooltip-body'>`;
        if (this.rarity === 'unique') {
            if (this.name === "골아일체") {
                html += `<div class='affix-line unique'>고유 효과:<br>소환수 데미지가 플레이어 데미지를 따름<br></div>`;
            } else if (this.name === "장수말벌침") {
                let dur = this.affixes[0].value;
                html += `<div class='affix-line unique'>고유 효과:<br>중독 확률 +100%<br>중독 데미지 +100%<br>중독 지속시간 ${dur > 0 ? '+' : ''}${dur}%</div>`;
            } else if (this.name === "송곳") {
                html += `<div class='affix-line unique'>고유 효과:<br>10% 확률로 적 전체 체력 1% 피해<br>기본공격력 1</div>`;
            } else if (this.name === "전동드릴") {
                let hits = this.affixes[0].value;
                html += `<div class='affix-line unique'>고유 효과:<br>초당 ${hits}회 자동 공격<br>기본공격력 1</div>`;
            } else if (this.name === "해골폭풍") {
                let spd = this.affixes[0].value;
                html += `<div class='affix-line unique'>고유 효과:<br>해골 궁수 데미지 5배<br>해골 궁수 공격속도 +${spd}%</div>`;
            } else if (this.name === "어처구니") {
                html += `<div class='affix-line unique'>고유 효과:<br>깡 공격력 그 자체<br>기본공격력 +50,000</div>`;
            }
        }
        if (this.baseDamage > 0) html += `<div class='affix-line'>기본 공격력: +${Math.floor(this.baseDamage)}</div>`;

        this.affixes.forEach(a => {
            if (a.stat.startsWith('unique')) return;
            let txt = '';
            // Stat Formatting: Integers Only
            if (a.stat === 'incDmg') txt = `물리 피해 +${a.value}%`;
            else if (a.stat === 'poisonDmg') txt = `중독 (3초간 물리 피해의 ${a.value}%)`;
            else if (a.stat === 'poisonChance') txt = `중독 확률 +${a.value}%`;
            else if (a.stat === 'summonSkeleton') txt = `해골 궁수 소환`;
            else if (a.stat === 'skeletonArrow') txt = `해골 화살 수 +${a.value}`;
            else if (a.stat === 'minionDmg') txt = `소환수 피해 +${a.value}%`;
            else if (a.stat === 'proj_count') txt = `투사체 추가 +${a.value}`;
            else if (a.stat === 'weaponEffectScale') txt = `무기 효과 증폭 +${a.value}%`;
            else txt = `${a.stat} +${a.value}`;
            html += `<div class='affix-line'><span class='affix-tier'>(T${a.tier})</span> ${txt}</div>`;
        });
        return html + '</div>';
    }
}

class Character {
    constructor() {
        this.level = 1;
        this.xp = 0;
        this.maxXp = 100;
        this.baseDmg = 1;
    }
    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.maxXp) {
            this.level++;
            this.xp -= this.maxXp;
            this.maxXp = Math.floor(this.maxXp * 1.5);
            this.baseDmg++;
            document.getElementById('char-level').textContent = `Lv.${this.level}`;
        }
        document.getElementById('xp-bar').style.width = `${(this.xp / this.maxXp) * 100}%`;
    }
}

class Game {
    constructor() {
        this.startTime = Date.now();
        this.char = new Character();
        this.sandbagLevel = 1;
        this.sandbagMaxHp = 100;
        this.sandbagHp = 100;

        this.damage = 0;
        this.drops = [];
        this.inventory = [];
        this.equipment = { weapon1: null, weapon2: null, ring1: null, ring2: null };
        this.skeletons = 0;
        this.poisonInstances = [];
        this.deleteMode = false;

        this.gold = 0;
        this.goldMode = false;
        this.goldMode = false;
        this.lastTotalDmg = 10;
        this.damageHistory = [];
        this.storageKey = 'sb_save_v1';

        // Drag State
        this.draggingItemIdx = null;

        // Dom
        this.sandbag = document.getElementById('sandbag');
        this.hpBar = document.getElementById('hp-bar');
        this.hpText = document.getElementById('hp-text');
        this.groundItemsDiv = document.getElementById('ground-items');
        this.inventoryGrid = document.getElementById('inventory-grid');
        this.tooltip = document.querySelector('.tooltip-container') || this.createTooltip();

        this.initDOM();
        this.init();

        // Loops
        this.poisonInterval = setInterval(() => this.tickPoison(), 1000);
        this.skelInterval = setInterval(() => this.skeletonShoot(), 1000);
        this.skelTimer = 0;
        this.gameRunning = true;
    }

    createTooltip() {
        const d = document.createElement('div');
        d.className = 'tooltip-container'; d.style.display = 'none';
        document.body.appendChild(d);
        return d;
    }

    initDOM() {
        document.getElementById('btn-prev-lvl').onclick = () => this.changeSandbagLevel(-1);
        document.getElementById('btn-next-lvl').onclick = () => this.changeSandbagLevel(1);
        document.querySelectorAll('.lvl-btn[data-change]').forEach(btn => {
            btn.onclick = () => this.changeSandbagLevel(parseInt(btn.dataset.change));
        });
        document.getElementById('btn-boss').onclick = () => {
            this.sandbagLevel = 1000;
            this.changeSandbagLevel(0); // Trigger update
        };

        // Shop UI
        const shopModal = document.getElementById('shop-modal');
        document.getElementById('btn-open-shop').onclick = () => shopModal.classList.remove('hidden');
        document.getElementById('btn-close-shop').onclick = () => shopModal.classList.add('hidden');

        // Info UI
        // Settings UI
        const settingsModal = document.getElementById('settings-modal');
        document.getElementById('btn-settings').onclick = () => settingsModal.classList.remove('hidden');
        document.getElementById('btn-close-settings').onclick = () => settingsModal.classList.add('hidden');

        // Info UI (Credits Only now)
        const infoModal = document.getElementById('info-modal');
        if (infoModal) {
            document.getElementById('btn-info-credits').onclick = () => infoModal.classList.remove('hidden');
            document.getElementById('btn-close-info').onclick = () => infoModal.classList.add('hidden');
        }

        // Mobile Panel Toggle Check (Removed logic, just loop)
        const mobileToggle = document.getElementById('mobile-panel-toggle');
        const sidePanel = document.getElementById('side-panel');
        if (mobileToggle && sidePanel) {
            mobileToggle.onclick = () => {
                const isActive = sidePanel.classList.toggle('active');
                mobileToggle.textContent = isActive ? '❌' : '🎒';
            };
        }

        document.querySelectorAll('#loot-filter input').forEach(cb => {
            cb.onchange = () => this.renderDrops();
        });

        // Trash Can: Toggle Delete Mode AND Drop Target
        const trash = document.getElementById('trash-can');
        if (trash) {
            trash.onclick = () => this.toggleDeleteMode();
            // Desktop Drop to Delete
            trash.ondragover = (e) => { e.preventDefault(); trash.classList.add('hover'); };
            trash.ondragleave = () => trash.classList.remove('hover');
            trash.ondrop = (e) => {
                e.preventDefault();
                trash.classList.remove('hover');
                try {
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                    if (data.source === 'inventory') {
                        this.inventory.splice(data.index, 1);
                        this.renderInventory();
                    }
                } catch (err) { console.error('Trash Drop Error', err); }
            };
        }

        const goldToggle = document.getElementById('gold-mode-toggle');
        if (goldToggle) goldToggle.onchange = (e) => this.goldMode = e.target.checked;

        document.getElementById('btn-buy-weapon').onclick = () => this.buyItem('weapon');
        document.getElementById('btn-buy-ring').onclick = () => this.buyItem('ring');

        document.getElementById('btn-mute').onclick = (e) => {
            e.preventDefault(); // Prevent focus issues
            toggleMute();
        };

        // Inventory Grid: Drop Target for Loot AND Unequip
        const invGrid = document.getElementById('inventory-grid');
        if (invGrid) {
            invGrid.ondragover = (e) => e.preventDefault();
            invGrid.ondrop = (e) => {
                e.preventDefault();
                try {
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                    if (data.source === 'drop') {
                        this.lootItem(data.index);
                    } else if (data.source === 'equip') {
                        // Unequip Logic
                        const key = data.key;
                        const item = this.equipment[key];
                        if (item && this.inventory.length < 20) {
                            this.equipment[key] = null;
                            this.inventory.push(item);
                            this.renderEquipment();
                            this.renderInventory();
                        } else if (this.inventory.length >= 20) {
                            alert("인벤토리가 꽉 찼습니다.");
                        }
                    }
                } catch (err) { }
            };
        }

        // Start BGM on first interaction
        document.body.addEventListener('click', () => startBGM(), { once: true });
        document.body.addEventListener('touchstart', () => startBGM(), { once: true });

        // Global User Interaction Handler for Tooltip Close
        document.body.addEventListener('touchstart', (e) => {
            if (!e.target.closest('[data-tooltip-html]')) {
                this.tooltip.style.display = 'none';
            }
        }, { passive: true });
        document.body.addEventListener('click', (e) => {
            if (!e.target.closest('[data-tooltip-html]')) {
                this.tooltip.style.display = 'none';
            }
        });

        // Hover for Desktop
        document.addEventListener('mouseover', e => {
            const t = e.target.closest('[data-tooltip-html]');
            if (t) {
                this.showTooltip(t.getAttribute('data-tooltip-html'), e.clientX, e.clientY);
            }
        });
        document.addEventListener('mousemove', e => {
            if (this.tooltip.style.display === 'block') {
                const w = this.tooltip.offsetWidth;
                const screenW = window.innerWidth;
                let left = e.clientX + 15;
                if (left + w > screenW) left = screenW - w - 10;

                this.tooltip.style.left = left + 'px';
                this.tooltip.style.top = (e.clientY + 15) + 'px';
            }
        });
        document.addEventListener('mouseout', e => { if (e.target.closest('[data-tooltip-html]')) this.tooltip.style.display = 'none'; });

        this.initSlots();

        // New Feature Listeners
        const btnSave = document.getElementById('btn-manual-save');
        if (btnSave) btnSave.onclick = () => this.saveGame();

        const btnLoad = document.getElementById('btn-manual-load');
        if (btnLoad) btnLoad.onclick = () => this.loadGame();

        const btnContinue = document.getElementById('btn-continue');
        if (btnContinue) btnContinue.onclick = () => this.continueGame();

        document.getElementById('btn-info-equip').onclick = (e) => { e.stopPropagation(); this.showDamageInfo(); };
        document.getElementById('btn-info-inv').onclick = (e) => { e.stopPropagation(); this.showInvInfo(); };
        document.getElementById('btn-info-drops').onclick = (e) => { e.stopPropagation(); this.showDropInfo(); };
        document.getElementById('btn-info-intro').onclick = (e) => { e.stopPropagation(); this.showIntroInfo(); };
        document.getElementById('btn-close-generic').onclick = () => document.getElementById('generic-modal').classList.add('hidden');
    }

    initSlots() {
        const slotsDiv = document.getElementById('equipment-slots');
        slotsDiv.innerHTML = '';

        // Explicit Order and Naming
        const config = [
            { key: 'weapon1', label: '무기1' },
            { key: 'weapon2', label: '무기2' },
            { key: 'ring1', label: '반지1' },
            { key: 'ring2', label: '반지2' }
        ];

        config.forEach(cfg => {
            const div = document.createElement('div');
            // Extract type for class (weapon or ring)
            const type = cfg.key.startsWith('weapon') ? 'weapon-slot' : 'ring-slot';
            div.className = `slot equipment-slot ${type}`;
            div.setAttribute('data-key', cfg.key);
            // User requested visual clarity: Silhouettes are primary, labels removed.
            div.innerHTML = `<div class='slot-content'></div>`;

            // Allow Drop (Equip)
            div.ondragover = (e) => e.preventDefault();
            div.ondrop = (e) => {
                e.preventDefault();
                try {
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                    if (data.source === 'inventory') {
                        this.equip(this.inventory[data.index], data.index, cfg.key);
                    } else if (data.source === 'drop') {
                        // FIX: Allow direct equip from ground
                        if (this.inventory.length >= 20) return alert("인벤토리가 가득 찼습니다!");
                        const item = this.drops[data.index];
                        if (!item) return;

                        // Loot it first
                        this.drops.splice(data.index, 1);
                        this.inventory.push(item);
                        const newIdx = this.inventory.length - 1;

                        // Then Equip
                        this.equip(item, newIdx, cfg.key);
                        this.renderDrops();
                        // renderInventory called by equip usually? 
                        // equip() calls renderInventory() and updateStats().
                        // But wait, equip() takes item from inventory.
                        // I just put it in inventory. So it's safe.
                    }
                } catch (err) { }
            };

            // Touch Drop Simulation Helper
            div.setAttribute('data-equippable', cfg.key);
            slotsDiv.appendChild(div);
        });
    }

    lootItem(dropIdx) {
        if (this.inventory.length >= 20) return alert("인벤토리가 가득 찼습니다!");
        const item = this.drops[dropIdx];
        if (!item) return;
        this.drops.splice(dropIdx, 1);
        this.inventory.push(item);
        this.renderDrops();
        this.renderInventory();
    }

    init() {
        this.sandbag.addEventListener('mousedown', (e) => this.punch(e));
        // Touch support for punching to avoid zoom/delay
        this.sandbag.addEventListener('touchstart', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                this.punch(e.changedTouches[i]);
            }
        }, { passive: false });

        this.updateSandbagUI();
        this.updateShopUI();
        this.checkIntro();
    }

    toggleDeleteMode() {
        this.deleteMode = !this.deleteMode;
        const trash = document.getElementById('trash-can');
        if (this.deleteMode) { trash.classList.add('active'); this.inventoryGrid.classList.add('delete-mode'); }
        else { trash.classList.remove('active'); this.inventoryGrid.classList.remove('delete-mode'); }
    }

    changeSandbagLevel(delta) {
        if (!this.gameRunning) return;
        let newLvl = this.sandbagLevel + delta;
        if (newLvl < 1) newLvl = 1;
        if (newLvl !== this.sandbagLevel || delta === 0) {
            this.sandbagLevel = newLvl;
            this.sandbagMaxHp = this.sandbagLevel * 100;
            // Boss HP x1000
            if (this.sandbagLevel === 1000) this.sandbagMaxHp *= 1000;

            this.sandbagHp = this.sandbagMaxHp;
            this.updateSandbagUI();
            this.updateShopUI();
        }
    }

    updateSandbagUI() {
        document.getElementById('sandbag-level-display').textContent = `샌드백 Lv.${this.sandbagLevel}`;
        this.updateHpBar();
        if (this.sandbagLevel === 1000) this.sandbag.classList.add('devil');
        else this.sandbag.classList.remove('devil');
    }

    updateShopUI() { document.getElementById('shop-cost').textContent = this.sandbagLevel * 100; }
    updateHpBar() {
        const pct = Math.max(0, (this.sandbagHp / this.sandbagMaxHp) * 100);
        this.hpBar.style.width = `${pct}%`;
        this.hpText.textContent = `${Math.ceil(this.sandbagHp).toLocaleString()} / ${this.sandbagMaxHp.toLocaleString()}`;
    }
    updateGoldUI() {
        // Update both top display and shop modal display
        const text = `${this.gold.toLocaleString()} G`;
        const top = document.getElementById('gold-display-top');
        const shop = document.getElementById('gold-display'); // In shop modal
        if (top) top.textContent = text;
        if (shop) shop.textContent = text;
    }

    buyItem(type) {
        const cost = this.sandbagLevel * 100;
        if (this.gold < cost) return alert("골드가 부족합니다!");
        if (this.inventory.length >= 20) return alert("인벤토리가 가득 찼습니다!");

        this.gold -= cost;
        this.updateGoldUI();

        const item = AffixSystem.rollItem(type, this.sandbagLevel);
        this.inventory.push(item);
        this.renderInventory();
    }

    // Tooltip Helper: Constrain to screen
    showTooltip(html, x, y) {
        this.tooltip.innerHTML = html;
        this.tooltip.style.display = 'block';

        // Wait for render to get width
        requestAnimationFrame(() => {
            const w = this.tooltip.offsetWidth;
            const h = this.tooltip.offsetHeight;
            const screenW = window.innerWidth;

            let left = x + 15;
            let top = y + 15;

            // Right Collision
            if (left + w > screenW) {
                left = screenW - w - 10;
            }

            // Bottom Collision (Fix: Move above cursor if clipping)
            const screenH = window.innerHeight;
            if (top + h > screenH) {
                top = y - h - 15; // Move above
            }

            this.tooltip.style.left = left + 'px';
            this.tooltip.style.top = top + 'px';
        });
    }

    punch(e) {
        if (!this.gameRunning) return;

        // Hide tooltip on punch only if manual click (e exists)
        if (e && this.tooltip.style.display === 'block') {
            this.tooltip.style.display = 'none';
        }

        const stats = this.calculateStats();

        let weaponBase = 0;
        // FIX: Sum base damage from ALL equipped items (including Absurdity Ring)
        ['weapon1', 'weapon2', 'ring1', 'ring2'].forEach(k => { if (this.equipment[k]) weaponBase += this.equipment[k].baseDamage; });

        let randBase = Math.floor(Math.random() * 11 + 10);
        let baseDmg = randBase + this.char.baseDmg + weaponBase;

        let totalDmg = baseDmg * (1 + stats.incDmg / 100);

        const isCrit = Math.random() * 100 < stats.critChance;
        if (isCrit) totalDmg *= (stats.critMulti / 100);

        this.lastTotalDmg = totalDmg;

        // Awl Effect: 10% chance for 1% Enemy HP
        if (stats.awl && Math.random() < 0.1) {
            const proc = Math.ceil(this.sandbagMaxHp * 0.01);
            totalDmg += proc;
            // Visual feedback for Awl?
            this.showDamageNumber(e ? e.clientX : null, e ? e.clientY : null, "📍" + proc, true, '#ff0000');
        }

        this.dealDamage(totalDmg, isCrit, e ? e.clientX : null, e ? e.clientY : null);

        if (stats.poisonPercent > 0) {
            if (Math.random() * 100 < (10 + stats.poisonChance)) {
                this.applyPoison(totalDmg * (stats.poisonPercent / 100), stats.poisonDurationInfo);
            }
        }

        if (e) {
            this.playPunchAnim();
            if (stats.projectiles > 0) this.showProjectiles(stats.projectiles, e.clientX, e.clientY);
            this.spawnSkeletons(stats.hasSkeleton);
        }
    }

    dealDamage(amount, isCrit = false, x = null, y = null) {
        amount = Math.ceil(amount);
        this.damage += amount;
        this.sandbagHp -= amount;
        this.damageHistory.push({ t: Date.now(), v: amount });

        if (x === null) {
            const rect = this.sandbag.getBoundingClientRect();
            x = rect.left + Math.random() * rect.width;
            y = rect.top + Math.random() * rect.height;
        }
        this.showDamageNumber(x, y, amount, isCrit);

        if (this.sandbagHp <= 0) {
            this.killSandbag();
        }

        this.updateHpBar();
        this.updateUI();
    }


    killSandbag() {
        if (this.sandbagLevel === 1000) { // BOSS KILL
            this.gameRunning = false;
            clearInterval(this.poisonInterval);
            clearInterval(this.skelInterval);
            document.getElementById('victory-overlay').classList.remove('hidden');
            const timeSec = ((Date.now() - this.startTime) / 1000).toFixed(1);
            document.getElementById('victory-time').textContent = timeSec + '초';
            document.getElementById('victory-damage').textContent = this.damage.toLocaleString();
            return;
        }

        this.char.gainXp(this.sandbagMaxHp);
        this.sandbagHp = this.sandbagMaxHp;
        this.sandbag.classList.add('dead');
        setTimeout(() => this.sandbag.classList.remove('dead'), 500);
        this.spawnDrop();
    }

    // --- DoT & Minions ---
    applyPoison(dps, durationMod = 0) {
        let duration = 3000 * (1 + durationMod / 100); // ms
        this.poisonInstances.push({
            dps: dps,
            endTime: Date.now() + duration
        });
    }

    tickPoison() {
        if (!this.gameRunning) return;
        const now = Date.now();
        this.poisonInstances = this.poisonInstances.filter(p => p.endTime > now);

        if (this.poisonInstances.length > 0) {
            const totalDps = this.poisonInstances.reduce((sum, p) => sum + p.dps, 0);
            if (totalDps > 0) {
                this.dealDamage(totalDps);
                const rect = this.sandbag.getBoundingClientRect();
                this.showDamageNumber(rect.left + rect.width / 2, rect.top, Math.ceil(totalDps), false, '#aa00aa');
            }
        }
    }

    spawnSkeletons(active) {
        if (active && this.skeletons < 1) {
            this.skeletons = 1;
            const el = document.createElement('div');
            el.className = 'skeleton';
            // Use Image
            el.innerHTML = `<img src="skeleton_archer.png" alt="Skeleton" style="width:100%; height:100%; object-fit:contain;">`;
            document.getElementById('minion-container').appendChild(el);
        }
        if (!active && this.skeletons > 0) {
            this.skeletons = 0;
            document.getElementById('minion-container').innerHTML = '';
        }
    }

    skeletonShoot() {
        if (!this.gameRunning || !this.skeletons) return;
        const stats = this.calculateStats();
        // Base Tick is 1000ms. If speed +50%, we add 1500ms worth of progress per tick?
        // Or reduce threshold?
        // Let's increment timer by 1000, and check against `1000 / (1 + speed/100)`.
        this.skelTimer += 1000;

        // Attack Speed Logic
        let spdMult = 1;
        if (stats.skelStorm) spdMult += (stats.skelSpeedBonus / 100);
        const threshold = 1000 / spdMult;

        if (this.skelTimer >= threshold) {
            this.skelTimer -= threshold; // Keep remainder

            let dmg = stats.boneUnity ? this.lastTotalDmg : 10 * (1 + stats.minionDmg / 100);
            if (stats.skelStorm) dmg *= 5; // x5 Dmg

            const arrows = stats.boneUnity ? 1 : stats.skelArrows;
            for (let i = 0; i < arrows; i++) {
                setTimeout(() => {
                    const arrow = document.createElement('div');
                    arrow.className = 'arrow';
                    // Use Image for Arrow
                    arrow.innerHTML = `<img src="arrow.png" alt="Arrow" style="width:100%; height:100%; object-fit:contain; transform: rotate(135deg);">`;
                    // Note: Rotate 135deg? Original CSS arrow might have been rotated.
                    // Assuming arrow.png points UP or RIGHT. Usually pixel art arrows point UP-RIGHT.
                    // Let's assume standard orientation. If needed, I'll adjust rotation.
                    // User said "arrow.png". Most likely a standard arrow.

                    const skel = document.querySelector('.skeleton');
                    const sb = document.getElementById('sandbag');
                    if (skel && sb) {
                        const sRect = skel.getBoundingClientRect();
                        const bRect = sb.getBoundingClientRect();
                        arrow.style.left = sRect.left + 20 + 'px';
                        arrow.style.top = sRect.top + 20 + 'px';
                        document.body.appendChild(arrow);
                        requestAnimationFrame(() => {
                            arrow.style.transition = 'all 0.4s linear';
                            arrow.style.left = (bRect.left + bRect.width / 2) + 'px';
                            arrow.style.top = (bRect.top + bRect.height / 2) + 'px';
                        });
                        setTimeout(() => { arrow.remove(); this.dealDamage(dmg); }, 400);
                    } else { this.dealDamage(dmg); }
                }, i * 200);
            }
        }
    }

    calculateStats() {
        let s = {
            incDmg: 0, atkSpd: 0, critChance: 0, critMulti: 200, projectiles: 0,
            weaponEffectScale: 0, poisonPercent: 0, hasSkeleton: false, minionDmg: 0,
            skelArrows: 1, poisonChance: 0, boneUnity: false, poisonDurationInfo: 0,
            drillRate: 0, awl: false, skelStorm: false, skelSpeedBonus: 0
        };
        ['ring1', 'ring2'].forEach(k => { var i = this.equipment[k]; if (i) i.affixes.forEach(a => { if (a.stat === 'weaponEffectScale') s.weaponEffectScale += a.value; }); });
        ['weapon1', 'weapon2', 'ring1', 'ring2'].forEach(k => {
            const i = this.equipment[k]; if (!i) return;
            // Absurdity handles itself via baseDamage
            let scale = (i.type === 'weapon' ? 1 + s.weaponEffectScale / 100 : 1);
            i.affixes.forEach(a => {
                let v = a.value * scale;
                if (a.stat === 'incDmg') s.incDmg += v;
                if (a.stat === 'critChance') s.critChance += v;
                if (a.stat === 'critMulti') s.critMulti += v;
                if (a.stat === 'projectiles') s.projectiles += v;
                if (a.stat === 'poisonDmg') s.poisonPercent += v;
                if (a.stat === 'poisonChance') s.poisonChance += v;
                if (a.stat === 'summonSkeleton') s.hasSkeleton = true;
                if (a.stat === 'minionDmg') s.minionDmg += v;
                if (a.stat === 'skeletonArrow') s.skelArrows += v;
                if (a.stat === 'uniqueBoneUnity') s.boneUnity = true;
                if (a.stat === 'uniqueHornet') {
                    s.poisonChance += 100; s.poisonPercent += 100; s.poisonDurationInfo += a.value;
                }
                if (a.stat === 'uniqueDrill') s.drillRate += a.value;
                if (a.stat === 'uniqueAwl') s.awl = true;
                if (a.stat === 'uniqueSkelStorm') { s.skelStorm = true; s.skelSpeedBonus += a.value; }
            });
        });

        // Handle Electric Drill Loop
        if (s.drillRate > 0) {
            if (!this.drillInterval || this.drillRate !== this.currentDrillRate) {
                if (this.drillInterval) clearInterval(this.drillInterval);
                this.currentDrillRate = s.drillRate;
                // e.g. 5 hits/sec = 200ms
                this.drillInterval = setInterval(() => {
                    if (this.gameRunning) this.punch(null); // Auto punch
                }, 1000 / s.drillRate);
            }
        } else {
            if (this.drillInterval) { clearInterval(this.drillInterval); this.drillInterval = null; this.currentDrillRate = 0; }
        }

        return s;
    }

    spawnDrop() {
        if (this.goldMode) {
            const amount = this.sandbagLevel * getRandomInt(5, 15);
            this.gold += amount; this.updateGoldUI();
            const rect = this.sandbag.getBoundingClientRect();
            const el = document.createElement('div'); el.className = 'gold-text'; el.textContent = `+${amount} G`;
            el.style.left = (rect.left + rect.width / 2) + 'px'; el.style.top = (rect.top) + 'px';
            document.body.appendChild(el); setTimeout(() => el.remove(), 1000); playSound('coin'); return;
        }
        if (this.drops.length >= 100) this.drops.shift();
        const types = ['weapon', 'ring', 'weapon', 'ring'];
        const type = types[Math.floor(Math.random() * types.length)];
        const item = AffixSystem.rollItem(type, this.sandbagLevel);
        this.drops.push(item);
        if (item.rarity === 'unique') playSound('drop_legendary');
        else if (item.rarity === 'legendary') playSound('drop_legendary');
        else if (item.rarity === 'epic' || item.rarity === 'rare') playSound('drop_rare');
        this.renderDrops();
    }

    renderDrops() {
        this.groundItemsDiv.innerHTML = '';
        const filters = Array.from(document.querySelectorAll('#loot-filter input:checked')).map(cb => cb.dataset.filter);
        const visibleDrops = this.drops.filter(i => (filters.includes(i.rarity) || i.rarity === 'unique'));
        const show = visibleDrops.slice(-20).reverse();

        for (let i = 0; i < 20; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot'; // Reuse slot class for sizing

            if (show[i]) {
                const item = show[i];
                const el = document.createElement('div');
                el.className = `ground-item ${item.rarity}`;
                el.textContent = item.icon;
                el.setAttribute('data-tooltip-html', item.getTooltipHTML());

                let clicks = 0;
                let timer = null;
                el.onclick = (e) => {
                    e.preventDefault();
                    clicks++;
                    if (clicks === 1) {
                        timer = setTimeout(() => {
                            clicks = 0;
                            const rect = el.getBoundingClientRect();
                            this.showTooltip(item.getTooltipHTML(), rect.right, rect.top);
                        }, 250);
                    } else {
                        clearTimeout(timer);
                        clicks = 0;
                        this.lootItem(this.drops.indexOf(item)); // Use helper
                    }
                };

                // Desktop Drag (Loot)
                el.setAttribute('draggable', 'true');
                el.style.touchAction = 'none'; // FIX: Force touch drag only
                el.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'drop', index: this.drops.indexOf(item) }));
                };

                // Touch Drag (Loot)
                el.ontouchstart = (e) => {
                    this.draggingDropIdx = this.drops.indexOf(item);
                    this.touchStartTime = Date.now();
                };
                el.ontouchmove = (e) => this.handleTouchMove(e, el);
                el.ontouchend = (e) => {
                    // Remove Ghost
                    this.removeGhost();
                    // Check Drop
                    const touch = e.changedTouches[0];
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);

                    if (target) {
                        const equipSlot = target.closest('.slot[data-equippable]');
                        const invGrid = target.closest('#inventory-grid');

                        if (invGrid) {
                            this.lootItem(this.draggingDropIdx);
                        } else if (equipSlot) {
                            // FIX: Mobile Drop to Equip from Ground
                            if (this.inventory.length >= 20) {
                                alert("인벤토리가 가득 찼습니다!");
                            } else {
                                const item = this.drops[this.draggingDropIdx];
                                if (item) {
                                    const key = equipSlot.getAttribute('data-key');
                                    // Loot first
                                    this.drops.splice(this.draggingDropIdx, 1);
                                    this.inventory.push(item);
                                    const newIdx = this.inventory.length - 1;
                                    // Equip
                                    this.equip(item, newIdx, key);
                                    this.renderDrops();
                                }
                            }
                        }
                    }
                    this.draggingDropIdx = null;
                };

                slot.appendChild(el);
            }
            this.groundItemsDiv.appendChild(slot);
        }
    }

    renderInventory() {
        this.inventoryGrid.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            const slot = document.createElement('div'); slot.className = 'slot';
            // Allow dropping loot here directly? handled by grid parent ondrop

            if (this.inventory[i]) {
                const item = this.inventory[i];
                const el = document.createElement('div');
                el.className = `item ${item.rarity} ${item.type}`;
                el.textContent = item.icon;
                if (item.rarity === 'unique') el.classList.add('unique');
                el.setAttribute('data-tooltip-html', item.getTooltipHTML());
                el.setAttribute('draggable', 'true');
                el.style.touchAction = 'none'; // FIX: Force touch drag only

                // --- DRAG EVENTS (DESKTOP) ---
                el.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'inventory', index: i }));
                    this.draggingItemIdx = i; // fallback
                };

                // --- TOUCH DRAG EVENTS (MOBILE) ---
                el.ontouchstart = (e) => {
                    this.draggingItemIdx = i;
                    this.touchStartTime = Date.now();
                    this.touchStartX = e.touches[0].clientX;
                    this.touchStartY = e.touches[0].clientY;
                    this.dragGhost = null; // Reset ghost
                };
                el.ontouchmove = (e) => this.handleTouchMove(e, el);

                el.ontouchend = (e) => {
                    this.removeGhost();
                    const touch = e.changedTouches[0];
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);

                    // Drag Drop Logic
                    if (this.draggingItemIdx !== null && (Math.abs(touch.clientX - this.touchStartX) > 10 || Math.abs(touch.clientY - this.touchStartY) > 10)) {
                        if (target) {
                            const slot = target.closest('.slot[data-equippable]');
                            if (slot) {
                                const key = slot.getAttribute('data-key');
                                this.equip(item, i, key);
                            } else if (target.closest('#trash-can')) {
                                this.inventory.splice(i, 1);
                                this.renderInventory();
                            }
                        }
                    } else {
                        // It was a Tap
                        const now = Date.now();
                        // FIX: Check delete mode on Tap
                        if (this.deleteMode) {
                            this.inventory.splice(i, 1);
                            this.renderInventory();
                            this.draggingItemIdx = null;
                            return;
                        }

                        if (this.lastTapTime && (now - this.lastTapTime < 300) && this.lastTapItemIdx === i) {
                            // DOUBLE TAP -> Auto Equip
                            this.autoEquip(item, i);
                            this.lastTapTime = 0; // Reset
                        } else {
                            // Single Tap -> Tooltip
                            const rect = el.getBoundingClientRect();
                            this.showTooltip(item.getTooltipHTML(), rect.right, rect.top);
                            this.lastTapTime = now;
                            this.lastTapItemIdx = i;
                        }
                    }
                    this.draggingItemIdx = null;
                };

                // Desktop Click
                el.onclick = (e) => {
                    if (e.pointerType === 'mouse') {
                        if (this.deleteMode) {
                            this.inventory.splice(i, 1);
                            this.renderInventory();
                        } else {
                            const rect = el.getBoundingClientRect();
                            this.showTooltip(item.getTooltipHTML(), rect.right, rect.top);
                        }
                    }
                };

                slot.appendChild(el);
            }
            this.inventoryGrid.appendChild(slot);
        }
        document.getElementById('inv-count').textContent = this.inventory.length;
    }

    // Shared Touch Move Logic
    handleTouchMove(e, el) {
        if (this.draggingItemIdx !== null || this.draggingDropIdx !== null) {
            e.preventDefault();
            const touch = e.touches[0];
            if (!this.dragGhost) {
                this.dragGhost = el.cloneNode(true);
                this.dragGhost.style.position = 'fixed';
                this.dragGhost.style.zIndex = '9999';
                this.dragGhost.style.pointerEvents = 'none';
                this.dragGhost.style.width = '50px';
                this.dragGhost.style.height = '50px';
                this.dragGhost.style.opacity = '0.8';
                this.dragGhost.style.background = '#444';
                this.dragGhost.style.borderRadius = '5px';
                document.body.appendChild(this.dragGhost);
            }
            this.dragGhost.style.left = (touch.clientX - 25) + 'px';
            this.dragGhost.style.top = (touch.clientY - 25) + 'px';
        }
    }
    removeGhost() { if (this.dragGhost) { this.dragGhost.remove(); this.dragGhost = null; } }

    autoEquip(item, idx) {
        // Find best slot
        const type = item.type; // 'weapon' or 'ring'
        let targetKey = null;

        // 1. Check for empty slots
        if (type === 'weapon') {
            if (!this.equipment.weapon1) targetKey = 'weapon1';
            else if (!this.equipment.weapon2) targetKey = 'weapon2';
            else targetKey = 'weapon1'; // Default swap
        } else {
            if (!this.equipment.ring1) targetKey = 'ring1';
            else if (!this.equipment.ring2) targetKey = 'ring2';
            else targetKey = 'ring1'; // Default swap
        }

        if (targetKey) this.equip(item, idx, targetKey);
    }

    equip(item, idx, targetSlotKey) {
        if (targetSlotKey) {
            const keyType = targetSlotKey.startsWith('weapon') ? 'weapon' : 'ring';
            if (item.type !== keyType) return; // Wrong slot type

            this.inventory.splice(idx, 1);
            const oldItem = this.equipment[targetSlotKey];
            if (oldItem) this.inventory.push(oldItem);

            this.equipment[targetSlotKey] = item;
            this.renderEquipment(); this.renderInventory();
        }
    }

    renderEquipment() {
        ['weapon1', 'weapon2', 'ring1', 'ring2'].forEach(k => {
            const div = document.querySelector(`.slot[data-key="${k}"] .slot-content`);
            div.innerHTML = '';
            const i = this.equipment[k];
            if (i) {
                const el = document.createElement('div'); el.className = `item ${i.rarity} ${i.type}`;
                if (i.rarity === 'unique') el.classList.add('unique');
                el.style.width = '100%'; el.style.height = '100%'; el.textContent = i.icon;
                el.setAttribute('data-tooltip-html', i.getTooltipHTML());
                el.setAttribute('data-tooltip-html', i.getTooltipHTML());
                el.style.touchAction = 'none';

                // Click -> Show Tooltip (User Request)
                el.onclick = (e) => {
                    const rect = el.getBoundingClientRect();
                    this.showTooltip(i.getTooltipHTML(), rect.right, rect.top);
                };

                // Drag -> Unequip preparation
                el.setAttribute('draggable', 'true');
                el.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'equip', key: k }));
                };
                el.ontouchstart = (e) => {
                    this.touchStartTime = Date.now();
                    this.touchStartX = e.touches[0].clientX;
                    this.touchStartY = e.touches[0].clientY;
                    this.draggingEquipKey = k;
                };
                el.ontouchmove = (e) => this.handleTouchMove(e, el);
                el.ontouchend = (e) => {
                    this.removeGhost();
                    const touch = e.changedTouches[0];
                    // Tap -> Tooltip (Backup for touch)
                    if (Date.now() - this.touchStartTime < 300 && Math.abs(touch.clientX - this.touchStartX) < 10) {
                        const rect = el.getBoundingClientRect();
                        this.showTooltip(i.getTooltipHTML(), rect.right, rect.top);
                    } else {
                        // Drag Drop (Touch) - Check if dropped on inventory
                        const target = document.elementFromPoint(touch.clientX, touch.clientY);
                        if (target && target.closest('#inventory-grid')) {
                            // Unequip
                            if (this.inventory.length < 20) {
                                this.equipment[k] = null;
                                this.inventory.push(i);
                                this.renderEquipment();
                                this.renderInventory();
                            } else {
                                alert("인벤토리가 꽉 찼습니다.");
                            }
                        }
                    }
                    this.draggingEquipKey = null;
                };

                div.appendChild(el);
            }
        });
    }

    updateUI() {
        document.getElementById('score').textContent = this.damage.toLocaleString();
        this.updateDPS();
    }
    playPunchAnim() { this.sandbag.classList.remove('hit'); void this.sandbag.offsetWidth; this.sandbag.classList.add('hit'); playSound('hit'); }
    showDamageNumber(x, y, v, c, color) {
        const el = document.createElement('div'); el.className = `damage-text ${c ? 'crit' : ''}`; el.textContent = v;
        el.style.left = (x + (Math.random() - 0.5) * 40) + 'px'; el.style.top = (y - 50) + 'px';
        if (color) el.style.color = color;
        document.body.appendChild(el); setTimeout(() => el.remove(), 800);
    }
    showProjectiles(c, x, y) { for (let i = 0; i < c; i++) { const d = document.createElement('div'); d.style.cssText = `position:absolute;width:5px;height:5px;background:#0ff;border-radius:50%;left:${x}px;top:${y}px;transition:0.5s;pointer-events:none;`; document.body.appendChild(d); requestAnimationFrame(() => { d.style.transform = `translate(${Math.cos(Math.random() * 6) * 100}px,${Math.sin(Math.random() * 6) * 100}px)`; d.style.opacity = 0; }); setTimeout(() => d.remove(), 500); } }
    // --- New Features Logic ---

    // 1. Save/Load
    saveGame() {
        const data = {
            char: this.char,
            sandbagLevel: this.sandbagLevel,
            gold: this.gold,
            inventory: this.inventory,
            equipment: this.equipment,
            filters: Array.from(document.querySelectorAll('#loot-filter input')).map(cb => ({ k: cb.dataset.filter, v: cb.checked }))
        };
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            alert("저장되었습니다!");
        } catch (e) { alert("저장 실패 (Local Storage 오류)"); }
    }

    loadGame() {
        const str = localStorage.getItem(this.storageKey);
        if (!str) return alert("저장된 데이터가 없습니다.");
        try {
            const data = JSON.parse(str);
            // Validations
            if (data.char) { Object.assign(this.char, data.char); document.getElementById('char-level').textContent = `Lv.${this.char.level}`; document.getElementById('xp-bar').style.width = this.char.xp / this.char.maxXp * 100 + '%'; }
            if (data.sandbagLevel) { this.sandbagLevel = data.sandbagLevel; this.changeSandbagLevel(0); }
            if (data.gold) { this.gold = data.gold; this.updateGoldUI(); }

            // Rehydrate Items
            const hydrate = (i) => {
                if (!i) return null;
                const item = new Item(i.type);
                Object.assign(item, i);
                return item;
            };

            if (data.inventory) { this.inventory = data.inventory.map(hydrate); this.renderInventory(); }
            if (data.equipment) {
                this.equipment = {
                    weapon1: hydrate(data.equipment.weapon1),
                    weapon2: hydrate(data.equipment.weapon2),
                    ring1: hydrate(data.equipment.ring1),
                    ring2: hydrate(data.equipment.ring2)
                };
                this.renderEquipment();
            }
            if (data.filters) {
                data.filters.forEach(f => {
                    const cb = document.querySelector(`#loot-filter input[data-filter="${f.k}"]`);
                    if (cb) cb.checked = f.v;
                });
            }
            this.renderDrops(); // Refresh filter
            alert("불러오기 완료!");
        } catch (e) {
            console.error(e);
            alert("세이브 파일이 손상되었습니다.");
        }
    }

    // 2. Boss Continue
    continueGame() {
        document.getElementById('victory-overlay').classList.add('hidden');
        this.gameRunning = true;
        // Do not reset sandbag level
        if (this.poisonInterval) clearInterval(this.poisonInterval);
        if (this.skelInterval) clearInterval(this.skelInterval);
        this.poisonInterval = setInterval(() => this.tickPoison(), 1000);
        this.skelInterval = setInterval(() => this.skeletonShoot(), 1000);
        this.sandbagHp = this.sandbagMaxHp;
        this.sandbag.classList.remove('dead');
        this.updateHpBar();
    }

    // 3. Info Popups
    showGenericModal(title, text) {
        const m = document.getElementById('generic-modal');
        m.querySelector('#modal-title').textContent = title;
        m.querySelector('#modal-body').textContent = text;
        m.classList.remove('hidden');
    }

    showDamageInfo() {
        const text = `1. ⚔️ 기본 공격력 (Basic Attack)
최종 데미지는 다음 순서로 계산됩니다:
기본 깡공 합산: (캐릭터 기본공격력) + (착용 장비 기본공격력 합계) + (랜덤 보정 10~20)
예: 레벨업으로 오른 공격력 + 칼/반지 깡공(어처구니 포함) + 10~20 사이 랜덤 값
퍼센트 데미지 적용: 위 값에 (1 + 물리 피해 증가% / 100)을 곱함.
크리티컬 판정: 크리티컬 발생 시 (크리티컬 피해% / 100)을 곱함. (기본 200% = 2배)

2. ☠️ 중독 데미지 (Poison Damage)
중독은 "그 한 방의 최종 데미지"를 기준으로 들어갑니다.
발동 조건: 기본 10% + (중독 확률%)
초당 데미지 (DPS): (그 때 터진 최종 물리 데미지) * (중독 데미지% / 100)
지속 시간: 3초 (기본) * (1 + 시간 증가% / 100)
즉, 깡공이 높고 크리티컬이 터진 한 방에 중독이 묻으면, 중독 데미지도 그만큼 엄청나게 뻥튀기됩니다.`;
        this.showGenericModal("데미지 계산 공식", text);
    }

    showInvInfo() {
        const text = `아이템을 쓰레기통 쪽으로 드레그하면 아이템이 인벤에서 제거됩니다.
G키를 누르면 아이템이 나오는대신 센드백 레벨에 따른 소량의 골드를 얻습니다.
상점에서는 현재 센드백레벨과 같은 아이템을 구매하실수 있습니다.`;
        this.showGenericModal("인벤토리 도움말", text);
    }

    showDropInfo() {
        const text = `M R E L 체크박스를 활성화해 드랍 아이템을 필터링 하세요.
M은 한줄짜리옵션
R은 두줄짜리옵션
E는 세줄짜리옵션
L은 네줄짜리옵션 혹은 유니크아이템만 보이게 합니다.`;
        this.showGenericModal("드랍 및 필터", text);
    }

    showIntroInfo() {
        const text = `센드백 키우기에 오신 것을 환영합니다!

센드백 레벨이 높을수록 드랍되는 템의 데미지와 골드량이 증가합니다.
드랍되는템에는 옵션이 1~4줄로 랜덤하게 붙습니다.
1줄은 파랑, 2줄은 노랑, 3줄은 보라, 4줄은 주황으로 표현됩니다.

즐거운 시간 되세요!`;
        this.showGenericModal("게임 설명", text);
    }

    checkIntro() {
        if (!localStorage.getItem('sb_intro_shown_v1')) {
            this.showIntroInfo();
            localStorage.setItem('sb_intro_shown_v1', 'true');
        }
    }

    // 4. DPS Meter
    updateDPS() {
        const now = Date.now();
        // Remove entries older than 60s
        while (this.damageHistory.length > 0 && this.damageHistory[0].t < now - 60000) {
            this.damageHistory.shift();
        }
        // Sum
        const total = this.damageHistory.reduce((s, x) => s + x.v, 0);
        document.getElementById('dps-meter-value').textContent = total.toLocaleString();
    }
}

window.addEventListener('DOMContentLoaded', () => new Game());
