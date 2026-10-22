const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../dist');
const views={
 'admin-discounts.html':['discount-form','discount-policy-list'],
 'index.html':['products','homeBannerImage'],
 'products.html':['products'],
 'product.html':['productPage'],
 'checkout.html':['checkoutPage','checkoutForm'],
 'orders.html':['orders','orderList'],
 'order-detail.html':['orders','orderList','returnDialog','returnTrackingDialog'],
 'order-complete.html':['completePage'],
 'admin-login.html':['admin-login','admin-login-form'],
 'admin.html':['salesView','detailDialog','refundDialog'],
 'admin-shipping.html':['salesView','detailDialog','refundDialog'],
 'admin-settlement.html':['settlementView','detailDialog'],
 'admin-products.html':['operationsView','operationProducts','productDialog'],
 'admin-banner.html':['operationsView','operationBanner'],
 'admin-settings.html':['operationsView','operationSettings','inlineSettingsForm'],
 'admin-accounts.html':['sharedAccountsView'],
};
const exclusive=['products','homeBannerImage','productPage','checkoutPage','checkoutForm','orders','returnDialog','returnTrackingDialog','completePage','salesView','settlementView','operationProducts','operationBanner','operationSettings','productDialog','refundDialog','sharedAccountsView'];
for(const [file,expected] of Object.entries(views))test(`${file} owns only its intended screen and loads valid scripts`,()=>{
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
 assert.equal(new Set(ids).size,ids.length,'duplicate element IDs');
 for(const id of expected)assert.ok(ids.includes(id),`missing ${id}`);
 for(const id of exclusive)if(!expected.includes(id))assert.ok(!ids.includes(id),`unrelated screen ${id}`);
 const scripts=[...html.matchAll(/<script\s+src="([^"?]+)[^"]*"/g)].map(match=>match[1]).filter(src=>!src.startsWith('http'));
 assert.ok(scripts.length>0);
 let combined='';
 for(const script of scripts){assert.ok(fs.existsSync(path.join(root,script)),`missing ${script}`);combined+=fs.readFileSync(path.join(root,script),'utf8')+'\n';}
 new vm.Script(combined,{filename:file}); // Detect collisions across shared and page-specific scripts.
 for(const old of ['app.js','store-flow.js','admin-ui.js','admin-policy-v2.js'])assert.ok(!scripts.includes(old),`legacy bundle ${old}`);
});

test('OTP enrollment UI exists only in account permissions',()=>{
 const login=fs.readFileSync(path.join(root,'admin-login.html'),'utf8');
 const accounts=fs.readFileSync(path.join(root,'admin-accounts.html'),'utf8');
 assert.doesNotMatch(login,/admin-otp-setup|admin-otp-copy|otp-demo-qr/);
 assert.match(login,/id="admin-otp-form"/);
 for(const id of ['account-otp-setup','account-otp-code','account-otp-verify','account-otp-reset'])assert.ok(accounts.includes(`id="${id}"`));
 assert.doesNotMatch(accounts,/최초 로그인|로그인 시 OTP/);
});
