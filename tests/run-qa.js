const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SERVER_PORT = 3001;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;
const serverProc = spawn(process.execPath, [path.join(__dirname,'static-server.js'), String(SERVER_PORT)], { stdio: ['ignore','pipe','pipe'] });

serverProc.stdout.on('data', d => process.stdout.write('[server] ' + d.toString()));
serverProc.stderr.on('data', d => process.stderr.write('[server-err] ' + d.toString()));

(async()=>{
  // Wait for server to be ready (simple poll)
  const start = Date.now();
  while(true){
    try{ await new Promise(r => setTimeout(r, 200)); const res = await fetch(SERVER_URL); if(res.ok) break; }catch(e){}
    if(Date.now() - start > 5000) break;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ recordVideo: { dir: path.join('test-results','videos'), size: { width: 1280, height: 720 } } });
  const page = await context.newPage();

  const screenshots = [];

  try{
    // 1) Load homepage
    await page.goto(SERVER_URL + '/index.html', { waitUntil: 'load' });
    await page.waitForSelector('#featuredTrack .carousel-card, #featuredTrack', { timeout: 3000 });
    screenshots.push(await page.screenshot({ fullPage: false }));

    // 2) Quick-add: click first Add button and verify toast & localStorage change
    const addBtn = await page.$('button[data-add]');
    if(addBtn){
      await addBtn.click();
      // small wait for toast
      await page.waitForTimeout(400);
      const toast = await page.$('div.toast');
      const toastShown = !!toast;
      console.log('Quick-add toast shown:', toastShown);
      const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('shop_cart')||'{}'));
      console.log('Cart after quick-add:', cart);
    } else { console.warn('No add button found on homepage'); }
    screenshots.push(await page.screenshot({ fullPage: false }));

    // 3) Keyboard navigation: focus carousel and press ArrowRight
    await page.focus('#featuredCarousel');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    screenshots.push(await page.screenshot({ fullPage: false }));

    // 4) Touch swipe simulation (mouse drag)
    const track = await page.$('#featuredTrack');
    if(track){
      const box = await track.boundingBox();
      if(box){
        // swipe left
        await page.mouse.move(box.x + box.width - 10, box.y + box.height/2);
        await page.mouse.down();
        await page.mouse.move(box.x + 10, box.y + box.height/2, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(400);
        screenshots.push(await page.screenshot({ fullPage: false }));
      }
    }

    // 5) Admin flow: login as admin, go to admin-products and toggle first checkbox
    await page.goto(SERVER_URL + '/admin-login.html');
    // fill and submit form
    await page.fill('input#username', 'admin');
    await page.fill('input#password', 'admin123');
    await page.click('button[type=submit]');
    await page.waitForTimeout(300);
    // open admin-products
    await page.goto(SERVER_URL + '/admin-products.html');
    await page.waitForSelector('#products .card input[type=checkbox]', { timeout: 3000 });
    // intercept network calls to /api/products/:id to observe attempts
    let putAttempted = false;
    await page.route('**/api/products/*', route => { putAttempted = true; route.continue(); });
    const checkbox = await page.$('#products .card input[type=checkbox]');
    if(checkbox){
      const before = await page.evaluate(cb => cb.checked, checkbox);
      await checkbox.click();
      await page.waitForTimeout(350);
      const overrides = await page.evaluate(() => JSON.parse(localStorage.getItem('focusflow_featured_overrides')||'{}'));
      console.log('Local override keys after toggle:', Object.keys(overrides));
    } else { console.warn('No checkbox found in admin-products'); }
    screenshots.push(await page.screenshot({ fullPage: false }));

    // Save a final screenshot and end
    const final = await page.screenshot({ path: path.join('test-results','qa-final.png') });
    screenshots.push(final);

    // Save screenshots to disk for inspection
    if(!fs.existsSync('test-results')) fs.mkdirSync('test-results');
    screenshots.forEach((buf, i)=>{ try{ fs.writeFileSync(path.join('test-results', `qa-step-${i+1}.png`), buf); }catch(e){ } });

    // close
    const video = await page.video().path();
    console.log('Video file:', video);

  }catch(err){ console.error('QA script error', err); }
  finally{
    await context.close();
    await browser.close();
    serverProc.kill('SIGINT');
    process.exit(0);
  }

})();
