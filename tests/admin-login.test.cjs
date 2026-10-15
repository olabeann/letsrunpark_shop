const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
function setup(session=null,settings=[]){
 const elements={},storage=new Map([['letsrunParkDepartmentAccountsV3',JSON.stringify(settings)]]),sessions=new Map(session?[['letsrunPlayAdminSessionV1',session]]:[]);
 const location={href:'https://example.com/shop/admin-shipping.html?status=pending',search:'?next=admin-shipping.html%3Fstatus%3Dpending',replace(url){this.redirect=url;}};
 const context=vm.createContext({URL,URLSearchParams,location,navigator:{},document:{getElementById(id){return elements[id]??=( {value:'',hidden:false,focus(){},addEventListener(event,handler){this[event]=handler;}});}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},sessionStorage:{getItem:k=>sessions.get(k)||null,setItem:(k,v)=>sessions.set(k,v)}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/admin-auth.js'),'utf8')+'\nglobalThis.auth=AdminAuth;',context);
 for(const match of fs.readFileSync(path.join(__dirname,'../dist/admin-login.html'),'utf8').matchAll(/id="([^"]+)"/g))context.document.getElementById(match[1]);
 return {context,elements,storage,sessions,location,auth:context.auth,load(){vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/admin-login.js'),'utf8'),context);},submit(id){elements[id].submit({preventDefault(){}});}};
}
test('anonymous and signed-out sessions go to login with the original page',()=>{
 for(const session of [null,'signed-out']){const app=setup(session);app.auth.guard();assert.equal(app.location.redirect,'admin-login.html?next=admin-shipping.html%3Fstatus%3Dpending');}
 const app=setup('admin');app.auth.guard();assert.equal(app.location.redirect,undefined);
});
test('return destination rejects external and unrelated pages',()=>{
 const {auth}=setup();for(const value of ['https://evil.example/admin.html','//evil.example/admin.html','../admin.html','index.html','javascript:alert(1)'])assert.equal(auth.destination(value),'admin.html');
 assert.equal(auth.destination('admin-products.html#stock'),'admin-products.html#stock');
});
test('password and OTP must succeed before the session is created',()=>{
 const app=setup();app.load();const e=app.elements;
 e['admin-login-id'].value='admin';e['admin-login-password'].value='wrong';app.submit('admin-login-form');assert.equal(app.auth.current(),null);assert.equal(e['admin-login-error'].hidden,false);
 e['admin-login-password'].value='1234';app.submit('admin-login-form');assert.equal(app.auth.current(),null);assert.equal(e['admin-otp-form'].hidden,false);assert.equal(e['admin-login-password'].value,'');
 e['admin-otp-code'].value='000000';app.submit('admin-otp-form');assert.equal(app.auth.current(),null);
 e['admin-otp-code'].value='123456';app.submit('admin-otp-form');assert.equal(app.auth.current(),'admin');assert.equal(app.location.redirect,'admin-shipping.html?status=pending');assert.equal(JSON.parse(app.storage.get('letsrunParkOtpDemoV1')).admin,true);
 app.auth.logout();assert.equal(app.auth.current(),'signed-out');assert.equal(app.location.href,'admin-login.html');
});
test('optional OTP permits login but existing registration keeps OTP required',()=>{
 for(const registered of [false,true]){const app=setup(null,[{loginId:'admin',type:'super',otpRequired:false,otpRegistered:registered}]);app.load();app.elements['admin-login-id'].value='admin';app.elements['admin-login-password'].value='1234';app.submit('admin-login-form');assert.equal(app.auth.current(),registered?null:'admin');}
});
test('inactive account cannot sign in',()=>{
 const app=setup(null,[{loginId:'admin',active:false}]);app.load();app.elements['admin-login-id'].value='admin';app.elements['admin-login-password'].value='1234';app.submit('admin-login-form');assert.equal(app.auth.current(),null);assert.match(app.elements['admin-login-error'].textContent,/중지/);
});
