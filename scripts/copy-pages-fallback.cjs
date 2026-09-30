const { copyFileSync } = require('node:fs');

// GitHub Pages serves this entry for direct visits to client-side routes.
copyFileSync('dist/index.html', 'dist/404.html');
