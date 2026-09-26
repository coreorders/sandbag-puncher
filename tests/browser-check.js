async (page) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    await page.goto('http://localhost:4173');
    await page.getByRole('button', { name: '게임 시작', exact: true }).click();
    for (const [width, height] of [[320, 568], [390, 844], [412, 915], [768, 1024], [1365, 768], [1920, 1080]]) {
        await page.setViewportSize({ width, height });
        const layout = await page.evaluate(() => {
            const rect = id => {
                const r = document.getElementById(id).getBoundingClientRect();
                return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
            };
            return { bag: rect('sandbag'), arena: rect('battlefield'), panel: rect('footer-section'), width: document.documentElement.scrollWidth };
        });
        check(layout.width <= width, 'Horizontal overflow: ' + width);
        check(layout.bag.top >= layout.arena.top && layout.bag.bottom <= layout.arena.bottom, 'Clipped bag: ' + width);
        check(width > 900 || layout.arena.bottom <= layout.panel.top, 'Overlapping panels: ' + width);
        check(layout.panel.bottom <= Math.max(height, 580), 'Unreachable panel: ' + width);
        await page.screenshot({ path: 'output/playwright/layout-' + width + '.png' });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { game.damage = 0; game.changeSandbagLevel(0); });
    await page.locator('#sandbag').click();
    check(await page.evaluate(() => game.damage >= 11 && game.damage <= 21), 'A click must cause one hit');
    await page.evaluate(() => {
        game.drops = [AffixSystem.rollItem('weapon', 2), AffixSystem.rollItem('weapon', 2)];
        game.renderDrops();
    });
    await page.locator('.panel-tab[data-panel="drops"]').click();
    await page.locator('#ground-items .item').first().click();
    await page.getByRole('button', { name: '가방에 담기', exact: true }).click();
    await page.locator('.panel-tab[data-panel="inventory"]').click();
    await page.locator('#inventory-grid .item').first().click();
    await page.getByRole('button', { name: '장착하기', exact: true }).click();
    await page.locator('.panel-tab[data-panel="equip"]').click();
    await page.locator('#equipment-slots .item').first().click();
    await page.getByRole('button', { name: '장착 해제', exact: true }).click();
    await page.evaluate(() => {
        game.inventory = [AffixSystem.rollItem('weapon', 3), AffixSystem.rollItem('weapon', 3)];
        game.renderInventory();
    });
    await page.locator('.panel-tab[data-panel="inventory"]').click();
    for (let i = 0; i < 2; i++) {
        await page.locator('#inventory-grid .item').first().click();
        await page.getByRole('button', { name: '제련 재료로 선택', exact: true }).click();
        if (!i) await page.locator('#btn-exit-refinery').click();
    }
    await page.locator('#btn-fuse').click();
    check(await page.evaluate(() => !!game.refineryResult), 'Fusion result missing');
    await page.evaluate(() => game.saveGame(true));
    await page.reload();
    check(await page.evaluate(() => !!JSON.parse(localStorage.getItem('sb_save_v2')).refineryResult), 'Startup overwrote save');
    await page.getByRole('button', { name: '저장 이어하기', exact: true }).click();
    check(await page.evaluate(() => !!game.refineryResult && game.damage > 0 && game.drops.length > 0), 'Save restoration incomplete');
    await page.locator('.panel-tab[data-panel="inventory"]').click();
    await page.locator('#btn-open-refinery').click();
    await page.locator('#refine-slot-result').click();
    check(await page.evaluate(() => game.inventory.length === 1 && !game.refineryResult), 'Fusion claim failed');
    await page.locator('#btn-exit-refinery').click();
    const logic = await page.evaluate(async () => {
        game.autoSaveEnabled = false;
        const ring = new Item('ring');
        ring.affixes = [{ stat: 'summonSkeleton', value: 2 }];
        const mirror = new Item('ring');
        mirror.name = '오목거울 반지';
        game.equipment.ring1 = mirror;
        game.equipment.ring2 = ring;
        const skeletonCount = game.calculateStats().skeletonCount;
        const drill = new Item('weapon');
        drill.affixes = [{ stat: 'uniqueDrill', value: 5 }];
        game.equipment.weapon1 = drill;
        game.calculateStats();
        const timer = game.drillInterval;
        game.calculateStats();
        const stableTimer = timer === game.drillInterval;
        game.equipment.weapon1 = null;
        game.calculateStats();
        game.spawnSkeletons(6);
        game.skeletonShoot();
        game.changeSandbagLevel(1);
        const damage = game.damage;
        await new Promise(resolve => setTimeout(resolve, 600));
        const noStaleArrow = damage === game.damage;
        game.equipment.ring1 = null;
        game.equipment.ring2 = null;
        game.spawnSkeletons(0);
        game.sandbagLevel = 999;
        game.changeSandbagLevel(1);
        const ordinary1000 = !game.isBossBattle && game.sandbagMaxHp === 100000;
        document.getElementById('btn-boss').click();
        game.dealDamage(game.sandbagMaxHp);
        const stopped = !game.gameRunning;
        const total = game.damage;
        game.dealDamage(1);
        const noPostVictoryHit = game.damage === total;
        game.continueGame();
        const char = new Character();
        char.gainXp(1000);
        return { skeletonCount, stableTimer, noStaleArrow, ordinary1000, stopped, noPostVictoryHit, xpNormalized: char.xp < char.maxXp };
    });
    check(logic.skeletonCount === 6, 'Mirror summon count incorrect');
    for (const [key, value] of Object.entries(logic)) check(!!value, 'Logic failure: ' + key);
    check(errors.length === 0, errors.join('\n'));
    return { layouts: 6, itemFlows: 'pass', saveRestore: 'pass', logic, errors };
}
