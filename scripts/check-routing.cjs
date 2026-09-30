process.env.NODE_ENV = 'production';
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const { buildSync } = require('esbuild');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { Provider } = require('react-redux');
const { createStore } = require('redux');

const output = buildSync({
  entryPoints: ['src/App.js'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  loader: { '.js': 'jsx' },
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/Working-Space-with-redux/') },
});
const compiled = new Module(path.resolve('routing-check.cjs'), module);
compiled.filename = path.resolve('routing-check.cjs');
compiled.paths = module.paths;
compiled._compile(output.outputFiles[0].text, compiled.filename);
const App = compiled.exports.default;
const store = createStore(() => ({ auth: { isAuthenticated: false } }));

function renderAt(pathname) {
  global.window = {
    location: { pathname, search: '', hash: '', origin: 'https://flexxcop.github.io' },
    history: { state: { idx: 0 }, replaceState() {} },
  };
  global.document = { defaultView: global.window };
  return renderToString(React.createElement(Provider, { store }, React.createElement(App)));
}

// Navigate renders no markup on the server; an unknown route renders the 404 page.
assert.equal(renderAt('/Working-Space-with-redux/'), '', 'Entry URL must match the home redirect');
assert.match(renderAt('/Working-Space-with-redux/login'), /Sign in to CoSpace/);
assert.equal(renderAt('/Working-Space-with-redux/dashboard'), '', 'Anonymous users must hit the login guard');
assert.match(renderAt('/Working-Space-with-redux/missing'), /Page not found/);
console.log('Routing checks passed: home, login, protected route, unknown route.');
