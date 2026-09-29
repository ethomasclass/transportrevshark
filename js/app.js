// The Tank: game flow, teacher tools and the "Where Are They Now" reveal.
// Routes: #/            lobby
//         #/play/class  projector run (students write on their worksheets)
//         #/play/solo   catch-up run for an absent student (invests on screen)
//         #/teacher     teacher tools (password)
//         #/reveal/class, #/reveal/solo   Where Are They Now (password)
import { makeActor, flap, playPitch } from './stage.js';
import { store } from './store.js';
import { unlock, unlocked, lock } from './vault.js';

const app = document.getElementById('app');
const START = 1000;
let C = null;          // public content
let stopCurrent = null;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const money = (n) => '$' + (Math.abs(n - Math.round(n)) < 0.005 ? Math.round(n).toLocaleString('en-US')
  : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- settings and runs ----------
const DEFAULTS = { period: '1', orders: {}, qLimit: 2, timer: 60 };
const settings = () => ({ ...DEFAULTS, ...store.local.get('tank.settings', {}) });
const saveSettings = (s) => store.local.set('tank.settings', s);
const periodOrder = (s = settings()) => s.orders[s.period] || C.defaultOrder;
const getRun = (mode) => store.local.get(`tank.run.${mode}`);
const saveRun = (run) => store.local.set(`tank.run.${run.mode}`, run);

function newRun(mode) {
  const s = settings();
  return { mode, order: mode === 'class' ? periodOrder(s) : shuffle(C.defaultOrder),
    period: s.period, i: 0, step: 'intro', asked: {}, invest: {} };
}
const spent = (run) => Object.values(run.invest).reduce((a, b) => a + b, 0);

// ---------- layout helpers ----------
function setScene(inner, { spot = '25%', sign = true } = {}) {
  if (stopCurrent) { stopCurrent(); stopCurrent = null; }
  app.innerHTML = `<div class="set"><div class="wall"></div><div class="floor"></div><div class="lamp l"></div><div class="lamp r"></div>${sign ? '<div class="sign">THE TANK</div>' : ''}</div>
    <div class="spot" style="--spot-x:${spot}"></div><div class="layer" style="position:absolute;inset:0">${inner}</div>`;
  return app.querySelector('.layer');
}
function topbar(left = '', right = '') {
  return `<div class="topbar"><div style="display:flex;gap:.8cqw;align-items:center"><button class="homebtn" data-go="#/">&larr; Lobby</button>${left}</div><div style="display:flex;gap:.8cqw">${right}</div></div>`;
}
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; app.append(t);
  setTimeout(() => t.remove(), 2200);
}
app.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]');
  if (g) { e.preventDefault(); location.hash = g.dataset.go; }
});

// ---------- lobby ----------
function lobby() {
  const s = settings();
  const cls = getRun('class'), solo = getRun('solo');
  const L = setScene(`
    <div class="lobby"><div>
      <div class="marquee"><div class="bulbs"></div><h1>THE TANK</h1><div class="years">1792 &nbsp;·&nbsp; 1837</div></div>
      <p class="sub">Five promoters. Five ventures that could build a nation, or sink your fortune. You have <b>$1,000</b>. Invest after each pitch. No take-backs.</p>
      <div class="choices">
        <button class="btn primary big" data-act="class">${cls && cls.step !== 'done' ? 'Resume class game' : 'Start class game'}</button>
        <button class="btn big" data-act="solo">${solo ? 'Resume catch-up' : 'Catch-up (play on your own)'}</button>
        <button class="btn ghost big" data-go="#/teacher">Teacher</button>
      </div>
      <div class="meta">Class setup: Period ${esc(s.period)} · 90-second pitches · ${s.qLimit} question${s.qLimit === 1 ? '' : 's'} per pitch${cls ? ` · <button class="homebtn" data-act="restart-class" style="text-decoration:underline">start class game over</button>` : ''}</div>
    </div></div>
    <div class="fin"></div>`, { spot: '50%', sign: false });
  L.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'class') { if (!cls) saveRun(newRun('class')); location.hash = '#/play/class'; }
    if (a === 'solo') { if (!solo) saveRun(newRun('solo')); location.hash = '#/play/solo'; }
    if (a === 'restart-class' && confirm('Start the class game over from the first pitch?')) { saveRun(newRun('class')); location.hash = '#/play/class'; }
  });
}

// ---------- the run ----------
function play(mode) {
  let run = getRun(mode);
  if (!run) { run = newRun(mode); saveRun(run); }
  if (run.step === 'done') return closed(run);
  const pid = run.order[run.i];
  const pitch = C.pitches[pid];
  const go = (step) => { run.step = step; saveRun(run); play(mode); };
  const chips = `<span class="chip">Pitch <b>${run.i + 1}</b> of ${run.order.length}</span>${mode === 'solo' ? `<span class="chip">Balance <b>${money(START - spent(run))}</b></span>` : ''}`;
  ({ intro, pitch: pitchStep, questions, decide })[run.step === 'pitch' ? 'pitch' : run.step](run, pid, pitch, chips, go);
}

async function intro(run, pid, p, chips, go) {
  const L = setScene(`${topbar(chips)}
    <div class="intro">
      <div class="door"></div>
      <div class="card panel">
        <div class="kicker">Entering the Tank</div>
        <div class="year stamp-year">${p.year}</div>
        <div class="place">${esc(p.place)}</div>
        <h2 class="who">${esc(p.speaker)}</h2>
        <div class="role">${esc(p.role)}</div>
        <div class="tagline">&ldquo;${esc(p.tagline)}&rdquo;</div>
        <div class="seeking">Seeking: <b>${esc(p.seeking)}</b></div>
        <div class="go"><button class="btn primary big" data-act="go">Hear the pitch &#9654;</button></div>
      </div>
    </div>`, { spot: '22%' });
  const actor = await makeActor(pid);
  actor.classList.add('offstage');
  actor.style.left = '6%';
  L.querySelector('.intro').append(actor);
  requestAnimationFrame(() => requestAnimationFrame(() => actor.classList.remove('offstage')));
  stopCurrent = () => actor.stop();
  L.querySelector('[data-act=go]').addEventListener('click', () => go('pitch'));
}

async function pitchStep(run, pid, p, chips, go) {
  const L = setScene(`${topbar(`${chips}<span class="chip"><b>${p.year}</b> · ${esc(p.title)}</span>`)}<div class="stage" style="position:absolute;inset:0"></div>`, { spot: '22%', sign: false });
  const player = await playPitch(L.querySelector('.stage'), {
    pid, pitch: p, paras: C.scripts[pid].scripts.short, cut: 'short', onDone: () => go('questions'),
  });
  stopCurrent = player.stop;
}

async function questions(run, pid, p, chips, go) {
  const limit = settings().qLimit;
  const qs = C.faq[pid] || [];
  const asked = run.asked[pid] || [];
  const L = setScene(`${topbar(chips, `<button class="btn small ghost" data-act="replay">&#8634; Hear the pitch again</button>`)}
    <div class="qa">
      <div class="head"><div><div class="kicker">The sharks' questions</div><h2>${run.mode === 'class' ? `Choose ${limit === 1 ? 'one question' : `${limit} questions`} for ${esc(p.speaker.split(' ').slice(-1)[0])}` : `Ask ${esc(p.speaker)} ${limit === 1 ? 'one question' : `${limit} questions`}`}</h2></div>
        <div class="count"></div></div>
      <div class="qlist"></div>
      <div class="foot"><button class="btn primary big" data-act="next">Decision time &rarr;</button></div>
    </div>`, { spot: '14%', sign: false });
  const actor = await makeActor(pid);
  L.querySelector('.qa').prepend(actor);
  const list = L.querySelector('.qlist');
  let stopFlap = null, typing = null;
  const draw = () => {
    const used = (run.asked[pid] || []).length;
    L.querySelector('.count').textContent = `Asked: ${used} of ${limit}`;
    list.innerHTML = qs.map((q, i) => {
      const was = (run.asked[pid] || []).includes(i);
      return `<button class="qbtn ${was ? 'asked' : ''} ${!was && used >= limit ? 'spent' : ''}" data-q="${i}" ${!was && used >= limit ? 'disabled' : ''}><span class="n">${i + 1}</span><span>${esc(q.q)}</span></button>`;
    }).join('');
  };
  const closeBubble = () => { clearInterval(typing); stopFlap?.(); stopFlap = null; L.querySelector('.bubble')?.remove(); list.style.visibility = ''; };
  const answer = (i) => {
    closeBubble();
    const q = qs[i];
    const b = document.createElement('div');
    b.className = 'bubble';
    b.innerHTML = `<div class="asked-q">&ldquo;${esc(q.q)}&rdquo;</div><div class="txt"></div><div class="back"><button class="btn small" data-act="back">Back to the questions</button></div>`;
    L.querySelector('.qa').append(b);
    list.style.visibility = 'hidden';
    const txt = b.querySelector('.txt');
    let n = 0;
    stopFlap = flap(actor);
    const finish = () => { clearInterval(typing); txt.textContent = q.a; stopFlap?.(); stopFlap = null; };
    typing = setInterval(() => {
      n += 2;
      txt.innerHTML = esc(q.a.slice(0, n)) + '<span class="caret">&nbsp;</span>';
      if (n >= q.a.length) finish();
    }, 45);
    b.addEventListener('click', (e) => { if (!e.target.closest('[data-act]')) finish(); });
  };
  draw();
  L.addEventListener('click', (e) => {
    const qb = e.target.closest('[data-q]');
    if (qb && !qb.disabled) {
      const i = +qb.dataset.q;
      run.asked[pid] = run.asked[pid] || [];
      if (!run.asked[pid].includes(i)) { run.asked[pid].push(i); saveRun(run); }
      draw();
      answer(i);
      return;
    }
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'back') closeBubble();
    if (a === 'replay') go('pitch');
    if (a === 'next') go('decide');
  });
  stopCurrent = () => { closeBubble(); actor.stop(); };
  if (!asked.length) actor.setMouth('closed');
}

function decide(run, pid, p, chips, go) {
  const last = run.i === run.order.length - 1;
  const next = () => {
    if (last) { run.step = 'done'; saveRun(run); play(run.mode); return; }
    run.i += 1; go('intro');
  };
  if (run.mode === 'class') {
    const secs = settings().timer;
    const L = setScene(`${topbar(chips)}
      <div class="decide"><div class="panel">
        ${last ? '<div class="final-banner">Final pitch</div>' : '<div class="kicker">Decision time</div>'}
        <h2>${last ? 'Everything you have left goes to ' + esc(p.speaker) : 'Sharks, make your offer to ' + esc(p.speaker)}</h2>
        <ul class="rules">
          ${last ? '<li>Unspent money is worth nothing, so your whole remaining balance goes into this pitch.</li><li>Write it on your worksheet. Your five investments must add up to <b>$1,000</b>.</li>'
                 : `<li>Write your investment in <b>${esc(p.title)}</b> on your worksheet, from $0 up to everything you have left.</li><li>Subtract it from your balance. This choice is <b>final</b>.</li><li>You won't hear the next pitch first. Is this one good enough, or is something better coming?</li>`}
        </ul>
        ${secs ? `<div class="timer" aria-live="off">${secs}</div><div style="display:flex;gap:1cqw;justify-content:center"><button class="btn" data-act="timer">Start the clock</button><button class="btn primary" data-act="next">${last ? 'Close the Tank' : 'Next entrepreneur &rarr;'}</button></div>`
               : `<button class="btn primary big" data-act="next">${last ? 'Close the Tank' : 'Next entrepreneur &rarr;'}</button>`}
      </div></div>`, { spot: '50%' });
    let left = secs, id = null;
    const timer = L.querySelector('.timer');
    L.addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]')?.dataset.act;
      if (a === 'next') next();
      if (a === 'timer') {
        if (id) { clearInterval(id); id = null; e.target.textContent = 'Resume the clock'; return; }
        e.target.textContent = 'Pause the clock';
        id = setInterval(() => {
          left -= 1; timer.textContent = Math.max(0, left);
          if (left <= 0) { clearInterval(id); id = null; timer.classList.add('done'); timer.textContent = "Time's up"; }
        }, 1000);
      }
    });
    stopCurrent = () => clearInterval(id);
    return;
  }
  // solo: invest on screen
  const bal = START - spent(run);
  const L = setScene(`${topbar(chips)}
    <div class="decide"><div class="panel">
      ${last ? '<div class="final-banner">Final pitch</div>' : '<div class="kicker">Decision time</div>'}
      <h2>${last ? 'Your remaining money goes to ' + esc(p.speaker) : 'How much will you invest in ' + esc(p.title) + '?'}</h2>
      <div class="ledger">
        <div class="cell"><div class="k">You have</div><div class="v">${money(bal)}</div></div>
        <div class="cell"><div class="k">Pitches left after this</div><div class="v">${run.order.length - run.i - 1}</div></div>
      </div>
      ${last ? `<p>Money you don't spend is worth nothing, so all <b>${money(bal)}</b> goes into ${esc(p.title)}. Write it on your worksheet too.</p>
                <button class="btn primary big" data-act="confirm">I'm in for ${money(bal)}</button>`
             : `<div class="offer"><label for="amt">I'm in for</label><span class="money">$<input id="amt" type="number" inputmode="numeric" min="0" max="${bal}" step="1" value="0"></span></div>
                <input class="slider" type="range" min="0" max="${bal}" step="10" value="0" aria-label="Investment amount">
                <div class="err"></div>
                <div style="display:flex;gap:1cqw;justify-content:center;margin-top:.6cqw"><button class="btn" data-act="out">I'm out ($0)</button><button class="btn primary big" data-act="confirm">Make the offer</button></div>
                <p style="font-size:1.2cqw;color:var(--muted)">Whole dollars. Once you confirm, it's final. Write it on your worksheet.</p>`}
    </div></div>`, { spot: '50%' });
  const inp = L.querySelector('#amt'), sl = L.querySelector('.slider'), err = L.querySelector('.err');
  inp?.addEventListener('input', () => { sl.value = inp.value; err.textContent = ''; });
  sl?.addEventListener('input', () => { inp.value = sl.value; err.textContent = ''; });
  const commit = (amt) => {
    if (!confirm(`Invest ${money(amt)} in ${p.title}? This is final.`)) return;
    run.invest[pid] = amt; saveRun(run); next();
  };
  L.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a === 'out') commit(0);
    if (a === 'confirm') {
      if (last) return commit(bal);
      const v = Number(inp.value);
      if (!Number.isInteger(v) || v < 0) { err.textContent = 'Enter a whole number of dollars.'; return; }
      if (v > bal) { err.textContent = `You only have ${money(bal)} left.`; return; }
      commit(v);
    }
  });
  inp?.focus();
}

function closed(run) {
  if (run.mode === 'class') {
    setScene(`${topbar()}
      <div class="closed"><div class="panel">
        <div class="kicker">The Tank is closed</div>
        <h2>Check your worksheet</h2>
        <p>You heard all five pitches. Your five investments should add up to exactly <b>$1,000</b>.</p>
        <p>Years pass. Roads are paved, canals dug, rivers fought over. Where did your money end up?</p>
        <div style="margin-top:1.6cqw;display:flex;gap:1cqw;justify-content:center"><button class="btn primary big" data-go="#/reveal/class">Where are they now? &#128274;</button></div>
      </div></div>`, { spot: '50%' });
    return;
  }
  const rows = run.order.map((id) => `<tr><td>${esc(C.pitches[id].title)} <span style="color:var(--muted)">(${C.pitches[id].year})</span></td><td class="num">${money(run.invest[id] || 0)}</td></tr>`).join('');
  setScene(`${topbar()}
    <div class="closed"><div class="panel">
      <div class="kicker">The Tank is closed</div>
      <h2>Your investments</h2>
      <table class="summary"><tbody>${rows}</tbody><tfoot><tr><td>Total</td><td class="num">${money(spent(run))}</td></tr></tfoot></table>
      <p>Copy these onto your worksheet if you haven't. Then ask your teacher to unlock <b>Where Are They Now</b>.</p>
      <div style="display:flex;gap:1cqw;justify-content:center"><button class="btn primary big" data-go="#/reveal/solo">Where are they now? &#128274;</button>
      <button class="btn ghost" data-act="again">Start catch-up over</button></div>
    </div></div>`, { spot: '50%' }).addEventListener('click', (e) => {
    if (e.target.closest('[data-act=again]') && confirm('Erase these investments and start over?')) { store.local.del('tank.run.solo'); location.hash = '#/'; }
  });
}

// ---------- password gate ----------
async function gate(title, then) {
  const T = await unlocked();
  if (T) return then(T);
  const L = setScene(`${topbar()}
    <div class="lock"><form class="panel">
      <div class="kicker">Teacher only</div><h2 style="font-family:var(--serif);font-size:2.6cqw;margin:.4cqw 0">${esc(title)}</h2>
      <input type="password" autocomplete="current-password" placeholder="Teacher password" aria-label="Teacher password">
      <div class="err"></div>
      <button class="btn primary big" type="submit">Unlock</button>
    </form></div>`, { spot: '50%' });
  const f = L.querySelector('form'), inp = f.querySelector('input'), err = f.querySelector('.err');
  inp.focus();
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = 'Checking...';
    const B = await unlock(inp.value);
    if (!B) { err.textContent = 'That password did not work.'; inp.select(); return; }
    then(B);
  });
}

// ---------- Where Are They Now ----------
function reveal(mode, T) {
  const run = getRun(mode);
  if (mode === 'solo' && (!run || run.step !== 'done')) {
    setScene(`${topbar()}<div class="closed"><div class="panel"><h2>No finished catch-up game on this device</h2><p>Play all five pitches in catch-up mode first.</p></div></div>`);
    return;
  }
  const order = run?.order || periodOrder();
  let k = store.session.get(`tank.reveal.${mode}`, 0);
  const total = (upto) => order.slice(0, upto).reduce((a, id) => a + ((run?.invest[id] || 0) * T.pitches[id].payout) / 1000, 0);

  const draw = () => {
    store.session.set(`tank.reveal.${mode}`, k);
    const nav = `<div class="nav">${k > 0 ? '<button class="btn ghost" data-act="prev">&larr; Back</button>' : ''}${k <= order.length ? `<button class="btn primary big" data-act="next">${k === 0 ? 'Open the first paper' : k === order.length ? 'The final tally' : 'Next paper &rarr;'}</button>` : ''}</div>`;
    const running = mode === 'solo' ? `<span class="chip">Your money so far <b>${money(total(Math.min(k, order.length)))}</b></span>` : '';
    let body;
    if (k === 0) {
      body = `<div class="curtain"><div class="panel"><div class="kicker">Years later...</div><h2 style="font-size:4.4cqw">Where Are They Now?</h2>
        <p style="font-size:1.8cqw">Five ventures. Five newspapers from the years that followed. ${mode === 'class' ? 'For each one, multiply what <b>you</b> invested by the payout, and keep a running total on your worksheet.' : "Let's see what your money became."}</p></div></div>`;
    } else if (k <= order.length) {
      const id = order[k - 1], c = T.pitches[id], p = C.pitches[id];
      const inv = run?.invest[id];
      const you = mode === 'solo' ? `<div class="you">You put in ${money(inv || 0)} &rarr; <b>${money(((inv || 0) * c.payout) / 1000)}</b></div>` : '';
      body = `<div class="paper">
        <div class="mast"><div class="name">${esc(c.paper)}</div><div class="dateline"><span>${esc(p.place)}</span><span>${esc(c.date)}</span><span>Price one cent</span></div></div>
        <h3>${esc(c.headline)}</h3><div class="subhead">${esc(c.subhead)}</div>
        <div class="cols">${c.outcome.map((o) => `<p>${esc(o)}</p>`).join('')}<p class="impact">${esc(c.impact)}</p></div>
      </div>
      <div class="payout-stamp ${c.payout >= 1000 ? 'win' : ''}"><div class="k">${esc(p.title)}<br>every $1,000 became</div><div class="v">${money(c.payout)}</div>${you}</div>`;
    } else {
      const rows = order.map((id) => {
        const c = T.pitches[id], inv = run?.invest[id] || 0;
        return `<tr><td>${esc(C.pitches[id].title)}</td><td class="num">${money(c.payout)}</td>${mode === 'solo' ? `<td class="num">${money(inv)}</td><td class="num">${money((inv * c.payout) / 1000)}</td>` : ''}</tr>`;
      }).join('');
      body = `<div class="curtain"><div class="panel" style="width:66%">
        <div class="kicker">The final tally</div><h2>${mode === 'solo' ? `You finished with ${money(total(order.length))}` : 'Add up your five returns'}</h2>
        <table class="summary"><thead><tr><th>Venture</th><th class="num">Every $1,000 became</th>${mode === 'solo' ? '<th class="num">You invested</th><th class="num">Now worth</th>' : ''}</tr></thead><tbody>${rows}</tbody>
        ${mode === 'solo' ? `<tfoot><tr><td>Total</td><td></td><td class="num">${money(spent(run))}</td><td class="num">${money(total(order.length))}</td></tr></tfoot>` : ''}</table>
        <p style="font-size:1.4cqw">Return on a venture = what you invested &times; the payout &divide; 1,000.${mode === 'class' ? ' Example: $300 in a venture that paid $1,500 is worth $450.' : ''}</p>
      </div></div>`;
    }
    const L = setScene(`${topbar(running, mode === 'class' ? '<button class="btn small ghost" data-go="#/teacher">Teacher tools</button>' : '')}<div class="reveal">${body}${nav}</div>`, { spot: '50%' });
    L.addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]')?.dataset.act;
      if (a === 'next') { k += 1; draw(); }
      if (a === 'prev') { k -= 1; draw(); }
    });
  };
  draw();
}

// ---------- teacher tools ----------
function teacher(T, tab = store.session.get('tank.ttab', 'setup')) {
  const s = settings();
  const tabs = [['setup', 'Game setup'], ['reveal', 'Where Are They Now'], ['calc', 'Calculator'], ['board', 'Leaderboard'], ['debrief', 'Debrief notes']];
  const L = setScene(`${topbar('', '<button class="btn small ghost" data-act="lock">Lock</button>')}
    <div class="teacher"><h2>Teacher tools</h2>
      <div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" data-tab="${k}" aria-selected="${k === tab}">${n}</button>`).join('')}</div>
      <div class="tpane"></div></div>`, { spot: '50%', sign: false });
  const pane = L.querySelector('.tpane');
  L.querySelector('.tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (b) { store.session.set('tank.ttab', b.dataset.tab); teacher(T, b.dataset.tab); }
  });
  L.querySelector('[data-act=lock]').addEventListener('click', () => { lock(); location.hash = '#/'; });
  const title = (id) => `${esc(C.pitches[id].title)} <span style="color:var(--muted)">(${C.pitches[id].year})</span>`;

  if (tab === 'setup') {
    const order = periodOrder(s);
    pane.innerHTML = `
      <div class="row"><label>Class period <select data-k="period">${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<option ${String(n) === s.period ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label>Questions per pitch <select data-k="qLimit">${[1, 2, 3, 6].map((n) => `<option ${n === s.qLimit ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label>Decision clock <select data-k="timer">${[0, 30, 45, 60, 90, 120].map((n) => `<option value="${n}" ${n === s.timer ? 'selected' : ''}>${n ? n + ' seconds' : 'off'}</option>`).join('')}</select></label></div>
      <h3>Pitch order for period ${esc(s.period)}</h3>
      <ol class="order">${order.map((id, i) => `<li><span class="n">${i + 1}</span><span class="t">${title(id)}</span>
        <button class="btn small ghost" data-mv="${i},-1" ${i === 0 ? 'disabled' : ''} aria-label="Move up">&uarr;</button>
        <button class="btn small ghost" data-mv="${i},1" ${i === order.length - 1 ? 'disabled' : ''} aria-label="Move down">&darr;</button></li>`).join('')}</ol>
      <div class="row"><button class="btn small" data-act="shuffle">Shuffle</button><button class="btn small ghost" data-act="date">Date order</button></div>
      <h3>Class game</h3>
      <div class="row"><span>${getRun('class') ? `In progress: pitch ${getRun('class').i + 1} of 5 (${esc(getRun('class').step)})` : 'Not started'}.</span>
        <button class="btn small" data-act="newclass">Start a fresh class game with these settings</button></div>
      <p style="color:var(--muted)">Settings are saved in this browser, so set them up on the projector computer. The class game picks up the order when it starts. Catch-up mode shuffles its own order.</p>`;
    pane.querySelectorAll('select').forEach((sel) => sel.addEventListener('change', () => {
      const n = settings();
      n[sel.dataset.k] = ['qLimit', 'timer'].includes(sel.dataset.k) ? Number(sel.value) : sel.value;
      saveSettings(n); teacher(T, 'setup');
    }));
    pane.addEventListener('click', (e) => {
      const n = settings();
      const mv = e.target.closest('[data-mv]')?.dataset.mv;
      const a = e.target.closest('[data-act]')?.dataset.act;
      if (mv) {
        const [i, d] = mv.split(',').map(Number);
        const o = [...periodOrder(n)];
        [o[i], o[i + d]] = [o[i + d], o[i]];
        n.orders[n.period] = o; saveSettings(n); teacher(T, 'setup');
      }
      if (a === 'shuffle') { n.orders[n.period] = shuffle(C.defaultOrder); saveSettings(n); teacher(T, 'setup'); }
      if (a === 'date') { delete n.orders[n.period]; saveSettings(n); teacher(T, 'setup'); }
      if (a === 'newclass' && confirm('Start a fresh class game? The current one will be cleared.')) { saveRun(newRun('class')); toast('Fresh class game ready'); teacher(T, 'setup'); }
    });
  }

  if (tab === 'reveal') {
    const order = getRun('class')?.order || periodOrder(s);
    pane.innerHTML = `
      <p>Plays the newspaper cards one at a time in the order the class heard the pitches, then a summary of every payout.</p>
      <div class="row"><button class="btn primary" data-act="rc">Start Where Are They Now (class)</button>
        <button class="btn" data-act="rs">Catch-up results on this device</button></div>
      <h3>Payouts (game design, not historical rates)</h3>
      <table class="calc"><thead><tr><th>Venture</th><th>Every $1,000 became</th></tr></thead><tbody>
        ${order.map((id) => `<tr><td>${title(id)}</td><td class="num">${money(T.pitches[id].payout)}</td></tr>`).join('')}</tbody></table>
      <h3>Math check</h3><ul class="note-list">${T.benchmarks.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;
    pane.addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]')?.dataset.act;
      if (a === 'rc') { store.session.del('tank.reveal.class'); location.hash = '#/reveal/class'; }
      if (a === 'rs') { store.session.del('tank.reveal.solo'); location.hash = '#/reveal/solo'; }
    });
  }

  if (tab === 'calc') {
    const order = getRun('class')?.order || periodOrder(s);
    pane.innerHTML = `<p>Type a student's five investments to check their math.</p>
      <table class="calc"><thead><tr><th>Venture</th><th>Invested</th><th>&times; payout</th><th>Now worth</th></tr></thead><tbody>
      ${order.map((id) => `<tr><td>${title(id)}</td><td><input type="number" min="0" step="1" data-id="${id}" value="0"></td><td class="num">${money(T.pitches[id].payout)} per $1,000</td><td class="num" data-out="${id}">$0</td></tr>`).join('')}
      </tbody><tfoot><tr><td><b>Total</b></td><td class="num" data-sum></td><td></td><td class="num" data-total style="color:var(--brass-2);font-weight:700"></td></tr></tfoot></table>
      <div class="err" data-warn></div>`;
    const upd = () => {
      let sum = 0, tot = 0;
      pane.querySelectorAll('input[data-id]').forEach((i) => {
        const v = Math.max(0, Number(i.value) || 0), w = (v * T.pitches[i.dataset.id].payout) / 1000;
        sum += v; tot += w;
        pane.querySelector(`[data-out="${i.dataset.id}"]`).textContent = money(w);
      });
      pane.querySelector('[data-sum]').textContent = money(sum);
      pane.querySelector('[data-total]').textContent = money(tot);
      pane.querySelector('[data-warn]').textContent = sum === START ? '' : `These add up to ${money(sum)}, not $1,000. Check the worksheet.`;
    };
    pane.addEventListener('input', upd); upd();
  }

  if (tab === 'board') {
    const order = getRun('class')?.order || periodOrder(s);
    const key = `tank.board.${s.period}`;
    let rows = store.local.get(key, []);
    const worth = (r) => order.reduce((a, id) => a + ((Number(r[id]) || 0) * T.pitches[id].payout) / 1000, 0);
    const draw = () => {
      const ranked = rows.map((r, i) => ({ r, i, w: worth(r) })).sort((a, b) => b.w - a.w);
      pane.innerHTML = `<p>Period ${esc(s.period)}. Type names and investments to rank the class (saved in this browser). The money winner is here; consider a Best Analyst award for the strongest notes too.</p>
        <table class="board"><thead><tr><th>#</th><th>Name</th>${order.map((id) => `<th>${esc(C.pitches[id].title.replace(/^The /, ''))}</th>`).join('')}<th>Total</th><th></th></tr></thead><tbody>
        ${ranked.map(({ r, i, w }, rank) => `<tr><td>${rank + 1}</td><td><input class="name" type="text" data-i="${i}" data-f="name" value="${esc(r.name || '')}"></td>
          ${order.map((id) => `<td><input type="number" min="0" data-i="${i}" data-f="${id}" value="${r[id] ?? ''}"></td>`).join('')}
          <td class="num"><b>${money(w)}</b></td><td><button class="btn small ghost" data-del="${i}" aria-label="Remove">&times;</button></td></tr>`).join('')}
        </tbody></table>
        <div class="row"><button class="btn small" data-act="add">Add student</button><button class="btn small ghost" data-act="sort">Re-rank</button><button class="btn small ghost" data-act="clear">Clear period</button></div>`;
    };
    draw();
    pane.addEventListener('change', (e) => {
      const i = e.target.dataset.i;
      if (i == null) return;
      rows[i][e.target.dataset.f] = e.target.dataset.f === 'name' ? e.target.value : Number(e.target.value);
      store.local.set(key, rows);
      const cell = e.target.closest('tr').querySelector('td.num b');
      if (cell) cell.textContent = money(worth(rows[i]));
    });
    pane.addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]')?.dataset.act, d = e.target.closest('[data-del]')?.dataset.del;
      if (a === 'add') { rows.push({ name: '' }); store.local.set(key, rows); draw(); pane.querySelector('tbody tr:last-child input.name')?.focus(); }
      if (a === 'sort') draw();
      if (a === 'clear' && confirm(`Clear the period ${s.period} leaderboard?`)) { rows = []; store.local.set(key, rows); draw(); }
      if (d != null) { rows.splice(Number(d), 1); store.local.set(key, rows); draw(); }
    });
  }

  if (tab === 'debrief') {
    pane.innerHTML = `<h3>Debrief questions</h3><ul class="note-list">${T.debrief.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>
      ${C.defaultOrder.map((id) => {
        const t = T.pitches[id];
        return `<h3>${title(id)} · ${esc(C.pitches[id].speaker)} · pays ${money(t.payout)}</h3>
          <div><b>Clues students can catch</b></div><ul class="note-list">${t.clues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
          <div><b>What each answer gives away</b></div>
          ${(C.faq[id] || []).map((q, i) => `<div class="faqnote"><div class="q">${i + 1}. ${esc(q.q)}</div><div class="n">${esc(t.faqNotes[i] || '')}</div></div>`).join('')}`;
      }).join('')}`;
  }
}

// ---------- router ----------
async function route() {
  const h = location.hash.replace(/^#\/?/, '');
  if (h === 'play/class') return play('class');
  if (h === 'play/solo') return play('solo');
  if (h === 'teacher') return gate('Teacher tools', (T) => teacher(T));
  if (h === 'reveal/class') return gate('Where Are They Now', (T) => reveal('class', T));
  if (h === 'reveal/solo') return gate('Where Are They Now', (T) => reveal('solo', T));
  return lobby();
}

async function boot() {
  const get = (f) => fetch(`content/${f}`).then((r) => r.json());
  const [p, scripts, faq] = await Promise.all([get('pitches.json'), get('scripts.json'), get('faq.json')]);
  C = { ...p, scripts, faq };
  window.addEventListener('hashchange', route);
  route();
}
boot();
