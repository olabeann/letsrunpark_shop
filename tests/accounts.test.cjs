const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../dist/admin-accounts.js'), 'utf8');

for (const origin of ['null', 'http://localhost:8000']) {
  test(`accounts avoids inaccessible nested admin shell on ${origin}`, () => {
    const view = {innerHTML: '', querySelector() {throw new Error('Remote iframe must not be loaded');}};
    vm.runInNewContext(source, {URL, location: {origin}, $: () => view});
    assert.match(view.innerHTML, /https:\/\/olabeann.github.io\/letsrunpark_shop\/admin-accounts.html/);
    assert.doesNotMatch(view.innerHTML, /<iframe/);
  });
}

test('hosted accounts still embeds shared account management with a load handler', () => {
  const frame = {addEventListener(event, handler) {assert.equal(event, 'load'); assert.equal(typeof handler, 'function');}};
  vm.runInNewContext(source, {URL, location: {origin: 'https://olabeann.github.io'}, $: () => ({querySelector: () => frame})});
  assert.match(frame.src, /^https:\/\/olabeann.github.io\/letsrunpark-reser\/account-admin.html/);
});
