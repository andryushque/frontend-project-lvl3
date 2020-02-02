start:
	npm run build

develop:
	npx webpack-dev-server --open

build:
	rm -rf dist
	NODE_ENV=production npx webpack

publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	npm test

test-coverage:
	npm test -- --coverage
