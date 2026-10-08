function mountSharedAccounts() {
    const view=$('sharedAccountsView');
    const frame = view.querySelector('iframe');
    frame.addEventListener('load', () => {
      // Both GitHub Pages projects share an origin and the same account storage.
      let doc;try{doc=frame.contentDocument;}catch{return;}
      if (!doc) return;
      const style = doc.createElement('style');
      style.textContent = '.admin-sidebar,.admin-topbar,.skip-link{display:none!important}.admin-shell{margin-left:0!important}.account-admin-main{padding:0!important}html,body{background:#fff!important}body{min-width:0!important}';
      style.textContent += '.shop-account-modal-open html{background:transparent!important}body.shop-account-modal-open{background:transparent!important}.shop-account-modal-open .admin-shell{position:absolute!important;left:var(--shop-account-left)!important;top:var(--shop-account-top)!important;width:var(--shop-account-width)!important;margin:0!important;background:#fff}';
      doc.head.append(style);
      let previousOverflow;
      const syncDialogViewport = () => {
        const open = !!doc.querySelector('dialog[open]');
        if (open && !frame.classList.contains('has-account-modal')) {
          previousOverflow = document.body.style.overflow;
          view.style.minHeight = frame.offsetHeight + 'px';
          document.body.style.overflow = 'hidden';
        }
        if (open) {
          const bounds = view.getBoundingClientRect();
          doc.body.style.setProperty('--shop-account-left', bounds.left + 'px');
          doc.body.style.setProperty('--shop-account-top', bounds.top + 'px');
          doc.body.style.setProperty('--shop-account-width', bounds.width + 'px');
        } else if (frame.classList.contains('has-account-modal')) {
          document.body.style.overflow = previousOverflow;
          view.style.minHeight = '';
        }
        frame.classList.toggle('has-account-modal', open);
        doc.body.classList.toggle('shop-account-modal-open', open);
        doc.documentElement.style.setProperty('background', open ? 'transparent' : '#fff', 'important');
      };
      const observer = new MutationObserver(syncDialogViewport);
      doc.querySelectorAll('dialog').forEach(dialog => observer.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
      frame.contentWindow.addEventListener('resize', syncDialogViewport);
      syncDialogViewport();
    });
    frame.src='https://olabeann.github.io/letsrunpark-reser/account-admin.html?v=20261007-commerce1';
}
mountSharedAccounts();
