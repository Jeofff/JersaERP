// JERSA ERP — router.js

export function initRouter(routes, notFoundRender) {
  function resolve() {
    const path = (window.location.hash || '#/').slice(1) || '/';
    const container = document.getElementById('app');
    container.innerHTML = '';
    const match = routes.find((r) => r.test(path));
    if (match) match.render(container, path);
    else notFoundRender(container);
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', resolve);
  window.addEventListener('DOMContentLoaded', resolve);
  if (document.readyState !== 'loading') resolve();
}

export function navigate(path) {
  window.location.hash = path;
}
