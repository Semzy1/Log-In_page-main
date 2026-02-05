const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async ()=>{
  const base = process.env.SITE_URL || 'http://localhost:3000/index.html';
  const outDir = path.join(__dirname, '..', 'test-videos');
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: outDir, size: { width: 1280, height: 720 } } });
  const page = await context.newPage();

  try{
    console.log('Navigating to', base);
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForSelector('#featuredCarousel', { timeout: 5000 });

    // Focus carousel and press ArrowRight
    await page.focus('#featuredCarousel');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(250);

    // Click first Add button
    const addBtn = await page.$('button[data-add]');
    if(addBtn){
      await addBtn.click();
      // allow toast to appear
      await page.waitForTimeout(300);
    }

    // Check localStorage cart value
    const cart = await page.evaluate(()=>{ try{ return JSON.parse(localStorage.getItem('shop_cart')||'{}'); }catch(e){ return {}; } });
    console.log('Cart contents after quick-add:', cart);

    // Wait for toast
    const toast = await page.$('.toast');
    if(toast){
      console.log('Toast found');
    } else {
      console.warn('Toast not found');
    }

    // Simulate swipe left on mobile viewport
    await page.setViewportSize({ width: 375, height: 800 });
    const carousel = await page.$('#featuredCarousel');
    if(carousel){
      const box = await carousel.boundingBox();
      if(box){
        await page.mouse.move(box.x + box.width - 10, box.y + box.height/2);
        await page.mouse.down();
        await page.mouse.move(box.x + 10, box.y + box.height/2, { steps: 8 });
        await page.mouse.up();
        console.log('Performed swipe gesture');
      }
    }

    // Attempt admin toggle test if backend available
    const apiOk = await (async ()=>{ try{ const r = await page.evaluate(()=> fetch('/api/health').then(res=>res.ok).catch(()=>false)); return r; }catch(e){ return false; }})();
    if(apiOk){
      console.log('Backend health ok — will try admin toggle test');
      // simulate admin login
      await page.goto(base.replace('/index.html','/admin-login.html'));
      await page.fill('#username', 'admin');
      await page.fill('#password','admin123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(400);
      // go to admin products
      await page.goto(base.replace('/index.html','/admin-products.html'));
      await page.waitForSelector('#products', { timeout: 5000 });
      const checkbox = await page.$('input[type="checkbox"][data-id]');
      if(checkbox){
        const id = await checkbox.getAttribute('data-id');
        const before = await checkbox.isChecked();
        await checkbox.click();
        await page.waitForTimeout(400);
        const after = await checkbox.isChecked();
        console.log('Admin toggle for', id, 'changed', before, '->', after);
      }
    } else {
      console.warn('Backend not detected — skipping admin toggle test');
    }

    // wait a little to ensure video captures interactions
    await page.waitForTimeout(1200);
  }catch(err){
    console.error('Error during QA script:', err);
  } finally{
    // close, saving the video
    await context.close();
    await browser.close();
    // report saved file
    const files = fs.readdirSync(outDir).filter(f => f.endsWith('.webm'));
    if(files.length) console.log('Recorded video(s):', files.map(f => path.join(outDir,f)).join(', '));
    else console.log('No videos recorded');
  }
})();
