document.addEventListener('DOMContentLoaded', function () {
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // Mobile menu toggle + auto-close
  var menuBtn = document.querySelector('.menu-btn');
  var navEl = document.getElementById('nav');
  if (menuBtn && navEl) {
    menuBtn.addEventListener('click', function () { navEl.classList.toggle('open'); });
    navEl.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navEl.classList.remove('open'); });
    });
  }
});

// Contact form: sends the enquiry to the shared HubSpot "Website enquiry" form
// (enquiry_brand = growth_knowhow), then shows the confirmation. The booking page
// opens during the click itself so pop-up blockers allow it.
var HS_PORTAL = '149559148', HS_FORM = '7f54c12e-0cf7-4caf-b25c-6c6dab495e3f';
var HS_HOSTS = ['https://api.hsforms.com', 'https://api-eu1.hsforms.com'];
function hsSend(i, payload) {
  return fetch(HS_HOSTS[i] + '/submissions/v3/integration/submit/' + HS_PORTAL + '/' + HS_FORM, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  }).then(function (r) {
    if (r.ok) return r;
    if (i + 1 < HS_HOSTS.length) return hsSend(i + 1, payload);
    throw new Error('status ' + r.status);
  }, function (err) {
    if (i + 1 < HS_HOSTS.length) return hsSend(i + 1, payload);
    throw err;
  });
}
function handleSubmit(e) {
  e.preventDefault();
  var form = e.target;
  var v = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
  if (v('bot-field')) return false;
  if (!form.checkValidity()) { form.reportValidity(); return false; }
  var success = form.parentNode.querySelector('.form-success');
  var btn = form.querySelector('button[type=submit]');
  window.open('https://calendar.app.google/g3XnCTvhj4SAgEpz9?source=Growth+KnowHow', '_blank', 'noopener');
  var name = v('name').split(/\s+/), first = name.shift() || '', last = name.join(' ');
  var message = (v('workshop') ? 'Workshop of interest: ' + v('workshop') + '\n\n' : '') + v('message');
  var fields = [['firstname', first], ['lastname', last], ['email', v('email')], ['company', v('company')], ['message', message], ['enquiry_brand', 'growth_knowhow']]
    .filter(function (f) { return f[1]; })
    .map(function (f) { return { objectTypeId: '0-1', name: f[0], value: f[1] }; });
  var ctx = { pageUri: location.href, pageName: document.title };
  var m = document.cookie.match(/(?:^|; )hubspotutk=([^;]*)/); if (m) ctx.hutk = decodeURIComponent(m[1]);
  if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending…'; }
  hsSend(0, { fields: fields, context: ctx })
    .then(function () {
      if (success) { success.textContent = 'Thanks! We’ve opened the calendar so you can pick a time – we’ll be in touch shortly too.'; success.classList.add('show'); }
      form.reset();
    })
    .catch(function () {
      var body = 'Name: ' + v('name') + '\nEmail: ' + v('email') + '\nCompany: ' + v('company') + '\n\n' + message;
      window.location.href = 'mailto:hello@growth-knowhow.com?subject=' + encodeURIComponent('Website enquiry from ' + (v('name') || 'the website')) + '&body=' + encodeURIComponent(body);
    })
    .then(function () { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Send'; } });
  return false;
}
