const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../dist/admin-accounts.html'),'utf8');
const source=fs.readFileSync(path.join(__dirname,'../dist/admin-accounts.js'),'utf8');
function mount(){
 const elements={},stored=new Map();
 function element(){return {value:'',hidden:false,checked:false,disabled:false,options:[],children:[],classList:{add(){},remove(){},toggle(){}},addEventListener(type,fn){this[type]=fn;},replaceChildren(){this.children=[];},append(row){this.children.push(row);},querySelector(){return this.button??=element();},showModal(){this.open=true;},close(){this.open=false;},insertAdjacentHTML(){},set innerHTML(value){this.markup=value;this.options=[...value.matchAll(/<option>(.*?)<\/option>/g)].map(m=>({value:m[1]}));if(this.options.length)this.value=this.options[0].value;},get innerHTML(){return this.markup||'';}};}
 for(const match of html.matchAll(/\bid="([^"]+)"/g))elements[match[1]]=element();
 const context={document:{getElementById:id=>elements[id]||null,createElement:element,querySelectorAll:()=>[]},localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},sessionStorage:{getItem:()=> 'admin'},setTimeout:()=>1,clearTimeout(){},Date};
 vm.runInNewContext(source,context);
 return {elements,stored};
}
test('account screen owns its content and dialogs without a remote frame',()=>{
 assert.doesNotMatch(html,/<iframe\b/i);assert.doesNotMatch(source,/contentDocument|frame\.src|mountSharedAccounts/);
 for(const id of ['admin-account-body','account-dialog','account-delete-dialog','account-commerce-permission'])assert.ok(html.includes(`id="${id}"`));
});
test('native accounts render, search, edit commerce permission and save the shared schema',()=>{
 const {elements:e,stored}=mount();assert.equal(e['admin-account-body'].children.length,5);
 e['account-search'].value='seoul_brand';e['account-search'].input();assert.equal(e['admin-account-body'].children.length,1);
 e['admin-account-body'].children[0].button.click();assert.equal(e['account-dialog'].open,true);assert.equal(e['account-login-id'].value,'seoul_brand');
 e['account-commerce-permission'].checked=true;e['save-admin-account'].click();
 const account=JSON.parse(stored.get('letsrunParkDepartmentAccountsV3')).find(a=>a.loginId==='seoul_brand');assert.equal(account.permissions.commerce,true);assert.equal(e['account-dialog'].open,false);
});
test('issuing an account validates input and clears the temporary password after save',()=>{
 const {elements:e,stored}=mount();e['issue-account'].click();e['account-login-id'].value='seoul_new';e['account-password'].value='short';e['save-admin-account'].click();assert.equal(stored.size,0);
 e['account-location'].value='서울';e['account-department'].value='홍보부';e['account-password'].value='temporary1234';e['save-admin-account'].click();
 const accounts=JSON.parse(stored.get('letsrunParkDepartmentAccountsV3'));assert.equal(accounts.length,6);assert.equal(accounts[5].loginId,'seoul_new');assert.equal(e['account-password'].value,'');assert.equal(accounts[5].password,undefined);
});
