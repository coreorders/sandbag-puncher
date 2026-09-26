async (page) => {
    const context = await page.context().browser().newContext({
        viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true
    });
    const mobile = await context.newPage();
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    try {
        await mobile.goto('http://localhost:4173');
        await mobile.getByRole('button', { name: '게임 시작', exact: true }).tap();
        await mobile.locator('#sandbag').tap();
        check(await mobile.evaluate(() => game.damage >= 11 && game.damage <= 21), 'Touch double hit');
        await mobile.evaluate(() => {
            game.drops = Array.from({ length: 30 }, () => AffixSystem.rollItem('weapon', 1));
            game.renderDrops();
        });
        await mobile.locator('#inventory-grid .item').first().tap();
        check(await mobile.locator('#modal-body .tooltip-body').isVisible(), 'Options missing on tap');
        await mobile.getByRole('button', { name: '장착하기', exact: true }).tap();
        check(await mobile.evaluate(() => !!game.equipment.weapon1), 'Touch equip failed');
        const scroll = await mobile.evaluate(() => {
            const grid = document.getElementById('inventory-grid');
            grid.scrollTop = 100;
            return grid.scrollTop > 0 && getComputedStyle(grid).touchAction === 'pan-y';
        });
        check(scroll, 'Loot grid cannot scroll');
        await mobile.screenshot({ path: 'output/playwright/touch-loot.png' });
        return { touchAttack: 'pass', touchEquip: 'pass', lootScroll: 'pass' };
    } finally { await context.close(); }
}
