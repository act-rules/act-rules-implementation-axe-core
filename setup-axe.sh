# Install `axe-core` from `wai-tools` branch & build `axe-core`
npm i git+https://github.com/dequelabs/axe-core.git#wai-tools --only=prod && cd ./node_modules/axe-core && npm uninstall husky && npm i && npm run build
