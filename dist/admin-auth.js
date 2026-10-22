// Browser-only demo session shared with the reservation prototype.
const AdminAuth = {
 sessionKey:'letsrunPlayAdminSessionV1',
 pages:['admin-discounts.html','admin.html','admin-shipping.html','admin-settlement.html','admin-products.html','admin-banner.html','admin-settings.html','admin-accounts.html'],
 destination(value){
  const fallback='admin.html';
  try{
   const base=new URL('.',location.href),target=new URL(value||fallback,base);
   return target.origin===base.origin&&target.pathname.startsWith(base.pathname)&&this.pages.includes(target.pathname.slice(base.pathname.length))?target.pathname.slice(base.pathname.length)+target.search+target.hash:fallback;
  }catch{return fallback;}
 },
 current(){return sessionStorage.getItem(this.sessionKey);},
 login(id){sessionStorage.setItem(this.sessionKey,id);},
 logout(){sessionStorage.setItem(this.sessionKey,'signed-out');location.href='admin-login.html';},
 guard(){if(!this.current()||this.current()==='signed-out')location.replace('admin-login.html?next='+encodeURIComponent(this.destination(location.href)));}
};
