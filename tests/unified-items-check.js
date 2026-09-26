async (page) => {
    const context = await page.context().browser().newContext();
    const p = await context.newPage();
    const check = (ok, message) => { if (!ok) throw new Error(message); };
    try {
        await p.goto('http://localhost:4173');
        await p.getByRole('button', { name: '게임 시작', exact: true }).click();
        await p.evaluate(() => {
            game.inventory = Array.from({ length: 20 }, () => AffixSystem.rollItem('weapon', 1));
            game.drops = Array.from({ length: 100 }, () => AffixSystem.rollItem('ring', 1));
            game.saveGame(true);
        });
        await p.reload();
        await p.getByRole('button', { name: '저장 이어하기', exact: true }).click();
        check(await p.evaluate(() => game.inventory.length === 120 && game.drops.length === 0), 'Legacy items lost');
        await p.evaluate(() => { game.saveGame(true); game.loadGame(true); });
        check(await p.evaluate(() => game.inventory.length === 120), 'Migration duplicated items');
        await p.locator('#inventory-grid .item').first().hover();
        check(await p.locator('.tooltip-container').isVisible(), 'Desktop hover missing');
        check((await p.locator('.tooltip-container .tooltip-body').innerText()).length > 0, 'Empty options');
        await p.screenshot({ path: 'output/playwright/item-hover.png' });
        for (const [width, height] of [[320, 568], [390, 844], [1365, 768]]) {
            await p.setViewportSize({ width, height });
            const visible = await p.evaluate(() => {
                const equip = document.getElementById('equipment-slots').getBoundingClientRect();
                const items = document.getElementById('inventory-grid').getBoundingClientRect();
                return equip.height >= 44 && items.height >= 44 && equip.bottom <= items.top && items.bottom <= innerHeight + 2;
            });
            check(visible, 'Equipment and items not visible together: ' + width);
        }
        return { hoverOptions: 'pass', simultaneousPanels: 'pass', migratedItems: 120, duplicatedItems: 0 };
    } finally { await context.close(); }
}
