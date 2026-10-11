(() => {
  const grid = document.querySelector('#property-grid');
  const countEl = document.querySelector('#result-count');
  const toastEl = document.querySelector('#toast');
  const detailDialog = document.querySelector('#detail-dialog');
  const authDialog = document.querySelector('#auth-dialog');
  let properties = [];
  let savedOnly = false;
  let toastTimer;
  let authMode = 'login';
  let busy = false;
  const reactCountRoot = window.React && window.ReactDOM ? window.ReactDOM.createRoot(document.querySelector('#saved-count')) : null;

  const money = value => '₹' + Number(value).toLocaleString('en-IN');
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const showToast = message => {
    toastEl.textContent = message; toastEl.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 2800);
  };
  const renderCount = () => {
    const saved = properties.filter(item => item.interested).length;
    document.querySelector('#saved-count').textContent = saved;
    if (reactCountRoot) {
      reactCountRoot.render(window.React.createElement(function ShortlistCount() { return window.React.createElement(window.React.Fragment, null, saved); }));
    }
  };
  const getVisible = () => properties.filter(item => !savedOnly || item.interested);
  const render = () => {
    const items = getVisible();
    const filterActive = [...document.querySelectorAll('.filters select')].some(input => input.value);
    countEl.textContent = savedOnly ? 'YOUR SHORTLIST' : filterActive ? `${items.length} ${items.length === 1 ? 'PLACE' : 'PLACES'} TO EXPLORE` : 'A FEW PLACES TO START';
    if (!items.length) {
      grid.innerHTML = `<div class="empty-state"><span>♡</span><h3>${savedOnly ? 'Your shortlist is ready when you are.' : 'No places found just yet.'}</h3><p>${savedOnly ? 'Tap the heart on a place that feels right.' : 'Try a wider budget or a different city.'}</p></div>`;
      document.querySelector('#show-more').hidden = true; return;
    }
    grid.innerHTML = items.map((p, i) => `
      <article class="property-card" style="--card-index:${i}">
        <button class="card-image" data-detail="${p.id}" aria-label="View ${escapeHTML(p.name)} details"><img loading="lazy" src="${escapeHTML(p.image_url)}" alt="Interior at ${escapeHTML(p.name)}"><span class="gender-pill">${escapeHTML(p.gender === 'Female' ? 'Women' : p.gender === 'Male' ? 'Men' : 'Co-ed')}</span></button>
        <button class="heart-button ${p.interested ? 'is-saved' : ''}" data-save="${p.id}" aria-label="${p.interested ? 'Remove from' : 'Add to'} shortlist">${p.interested ? '♥' : '♡'}</button>
        <div class="card-body"><div class="card-location"><span>⌖</span> ${escapeHTML(p.area)}, ${escapeHTML(p.city)} <span class="rating">★ ${Number(p.rating).toFixed(1)} <small>(${p.review_count})</small></span></div>
          <button class="card-title" data-detail="${p.id}">${escapeHTML(p.name)} <span>↗</span></button>
          <div class="card-amenities">${(p.amenities || []).slice(0,3).map(x => `<span>${escapeHTML(x)}</span>`).join('')}</div>
          <div class="card-bottom"><div><strong>${money(p.price)}</strong><small> / month</small></div><button class="view-link" data-detail="${p.id}">Take a look <span>→</span></button></div>
        </div>
      </article>`).join('');
    document.querySelector('#show-more').hidden = true;
  };
  const loadProperties = async () => {
    grid.innerHTML = '<div class="loading-state"><span class="loader"></span> Finding lovely places for you…</div>';
    const query = new URLSearchParams();
    if (!savedOnly) {
      const city = document.querySelector('#city-filter').value;
      const budget = document.querySelector('#budget-filter').value;
      const gender = document.querySelector('#gender-filter').value;
      if (city) query.set('city', city); if (budget) query.set('budget', budget); if (gender) query.set('gender', gender);
    }
    try {
      const response = await fetch(`api/properties.php?${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load places.');
      properties = data.properties || []; render(); renderCount();
    } catch (error) {
      grid.innerHTML = `<div class="empty-state setup-state"><span>✳</span><h3>One little setup step first.</h3><p>${escapeHTML(error.message)} See the run instructions in <strong>README.md</strong>, then refresh this page.</p></div>`;
    }
  };
  const openDetail = id => {
    const p = properties.find(item => Number(item.id) === Number(id)); if (!p) return;
    const photos = p.images?.length ? p.images : [p.image_url];
    document.querySelector('#detail-content').innerHTML = `<div class="detail-photo"><img id="detail-main-photo" src="${escapeHTML(photos[0])}" alt="${escapeHTML(p.name)}"><span class="gender-pill">${escapeHTML(p.gender === 'Female' ? 'Women' : p.gender === 'Male' ? 'Men' : 'Co-ed')}</span></div>${photos.length > 1 ? `<div class="detail-gallery">${photos.map((photo,index)=>`<button type="button" data-image="${index}" class="${index===0?'active':''}" aria-label="View photo ${index+1}"><img src="${escapeHTML(photo)}" alt="${escapeHTML(p.name)} photo ${index+1}"></button>`).join('')}</div>` : ''}<div class="detail-copy"><div class="card-location">⌖ ${escapeHTML(p.area)}, ${escapeHTML(p.city)} <span class="rating">★ ${Number(p.rating).toFixed(1)} <small>(${p.review_count} reviews)</small></span></div><h2>${escapeHTML(p.name)}</h2><p>${escapeHTML(p.description)}</p><h3>The little things</h3><div class="detail-amenities">${(p.amenities || []).map(a => `<span>✦ ${escapeHTML(a)}</span>`).join('')}</div><div class="detail-bottom"><div><strong>${money(p.price)}</strong><small> / month</small></div><button class="search-button detail-save" data-save="${p.id}">${p.interested ? '♥ Saved to shortlist' : '♡ Add to shortlist'}</button></div></div>`;
    detailDialog.showModal();
  };
  const saveProperty = async id => {
    if (!window.HAVENLY_USER) { showToast('Log in to keep this stay on your shortlist.'); authMode = 'login'; syncAuthMode(); authDialog.showModal(); return; }
    const button = document.querySelector(`[data-save="${id}"]`);
    try {
      if (button) button.disabled = true;
      const response = await fetch('api/interest.php', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({property_id:Number(id)})});
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not update shortlist.');
      const p = properties.find(item => Number(item.id) === Number(id)); if (p) p.interested = data.interested;
      render(); renderCount();
      if (detailDialog.open) openDetail(id);
      showToast(data.interested ? 'Saved. A good one to come back to.' : 'Removed from your shortlist.');
    } catch (error) { showToast(error.message); if (button) button.disabled = false; }
  };
  grid.addEventListener('click', event => {
    const save = event.target.closest('[data-save]'); const detail = event.target.closest('[data-detail]');
    if (save) saveProperty(save.dataset.save); else if (detail) openDetail(detail.dataset.detail);
  });
  document.querySelector('#detail-content').addEventListener('click', event => {
    const save = event.target.closest('[data-save]');
    const image = event.target.closest('[data-image]');
    if (save) saveProperty(save.dataset.save);
    if (image) {
      const p = properties.find(item => Number(item.id) === Number(document.querySelector('[data-save]')?.dataset.save));
      const src = p?.images?.[Number(image.dataset.image)];
      if (src) { document.querySelector('#detail-main-photo').src = src; document.querySelectorAll('.detail-gallery button').forEach(button => button.classList.toggle('active', button === image)); }
    }
  });
  document.querySelector('#filter-form').addEventListener('submit', event => { event.preventDefault(); savedOnly = false; document.querySelector('#saved-button').classList.remove('selected'); loadProperties(); });
  document.querySelectorAll('.filters select').forEach(select => select.addEventListener('change', () => document.querySelector('#filter-form').requestSubmit()));
  document.querySelector('#clear-filters').addEventListener('click', () => { document.querySelectorAll('.filters select').forEach(select => select.value = ''); savedOnly = false; document.querySelector('#saved-button').classList.remove('selected'); loadProperties(); });
  document.querySelector('#saved-button').addEventListener('click', () => { savedOnly = !savedOnly; document.querySelector('#saved-button').classList.toggle('selected', savedOnly); if (savedOnly && !window.HAVENLY_USER) { savedOnly = false; document.querySelector('#saved-button').classList.remove('selected'); authMode='login'; syncAuthMode(); authDialog.showModal(); showToast('Log in to see your saved stays.'); return; } loadProperties(); });
  const syncAuthMode = () => {
    const signup = authMode === 'signup';
    document.querySelector('#auth-title').innerHTML = signup ? 'Find a place<br><em>that feels yours.</em>' : 'Your next chapter<br><em>is waiting.</em>';
    document.querySelector('#auth-note').textContent = signup ? 'Create your free account and start a shortlist.' : 'Log in to keep your favourite stays close.';
    document.querySelector('#name-wrap').hidden = !signup;
    document.querySelector('#name-wrap input').required = signup;
    document.querySelector('#auth-submit').innerHTML = signup ? 'Create account <span>↗</span>' : 'Log in <span>↗</span>';
    document.querySelector('#auth-toggle').textContent = signup ? 'Already have an account? Log in' : 'New here? Create an account';
  };
  document.querySelector('#login-button').addEventListener('click', async () => {
    if (window.HAVENLY_USER) {
      try { await fetch('api/logout.php',{method:'POST'}); window.HAVENLY_USER=null; properties.forEach(p=>p.interested=false); document.querySelector('#login-button').innerHTML='Log in <span>↗</span>'; render(); renderCount(); showToast('You’re logged out. See you soon.'); }
      catch (_) { showToast('Could not log out. Please try again.'); }
      return;
    }
    authMode='login'; syncAuthMode(); authDialog.showModal();
  });
  document.querySelector('#auth-toggle').addEventListener('click', () => { authMode = authMode === 'login' ? 'signup' : 'login'; syncAuthMode(); });
  document.querySelector('#auth-form').addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return; busy = true;
    const submit = document.querySelector('#auth-submit'); submit.disabled = true;
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('api/auth.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:authMode,name:form.get('name'),email:form.get('email'),password:form.get('password')})});
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Could not sign in.');
      window.HAVENLY_USER=data.user; authDialog.close(); event.currentTarget.reset();
      document.querySelector('#login-button').innerHTML=`Hi, ${escapeHTML(data.user.name.split(' ')[0])} <span>↗</span>`;
      await loadProperties(); showToast(authMode==='signup' ? 'You’re in. Welcome to Havenly.' : 'Welcome back.');
    } catch (error) { showToast(error.message); }
    finally { busy=false; submit.disabled=false; }
  });
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  [detailDialog,authDialog].forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); }));
  if (window.HAVENLY_USER) document.querySelector('#login-button').innerHTML=`Hi, ${escapeHTML(window.HAVENLY_USER.name.split(' ')[0])} <span>↗</span>`;
  renderCount(); loadProperties();
})();
