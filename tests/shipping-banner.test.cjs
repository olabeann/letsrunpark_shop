const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('dist/store-common.js','utf8');
const code=source.slice(source.indexOf('const shippingAnnouncement='),source.indexOf('// A product uses'));
function page(storage={},enabled=true){
 let now=Date.parse('2026-11-02T23:59:00+09:00'),timer;
 const elements=Object.fromEntries(['shippingAnnouncement','shippingAnnouncementClose'].map(id=>[id,{}]));
 const listeners={};
 class Clock extends Date{static now(){return now;}}
 const context={Date:Clock,storeSettings:{shippingBannerEnabled:enabled},localStorage:{getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v},document:{getElementById:id=>elements[id],addEventListener(){}},window:{addEventListener:(key,fn)=>listeners[key]=fn},clearTimeout(){},setTimeout(fn,ms){timer={fn,ms};}};
 vm.runInNewContext(code,context);
 return {elements,listeners,close:()=>elements.shippingAnnouncementClose.onclick(),hidden:()=>elements.shippingAnnouncement.hidden,midnight(){now=Date.parse('2026-11-03T00:00:00.100+09:00');timer.fn();},delay:()=>timer.ms};
}
test('dismissal lasts through Korean midnight and persists only in the same browser storage',()=>{
 const storage={},first=page(storage);assert.equal(first.hidden(),false);first.close();assert.equal(first.hidden(),true);
 assert.equal(storage.goodsShippingBannerDismissedDay,'2026-11-02');assert.equal(page(storage).hidden(),true);assert.equal(page({}).hidden(),false);
 assert.equal(first.delay(),60100);first.midnight();assert.equal(first.hidden(),false);
});
test('dismissal synchronizes tabs and ignores legacy administrator visibility settings',()=>{
 const storage={},first=page(storage),second=page(storage);first.close();second.listeners.storage({key:'goodsShippingBannerDismissedDay'});assert.equal(second.hidden(),true);
 const disabled=page(storage,false);disabled.midnight();assert.equal(disabled.hidden(),false);
});
