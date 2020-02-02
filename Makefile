install:
	npm install

start:
	npm run build

develop:
	npx webpack-dev-server

build:
	rm -rf dist
	NODE_ENV=production npx webpack

publish:
	npm publish

lint:
	npx eslint .

test:
	npm test

