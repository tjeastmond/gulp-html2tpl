test:
	./node_modules/.bin/mocha ./test/test.coffee;

cat:
	./node_modules/.bin/mocha ./test/test.coffee --reporter nyan;

.PHONY: test cat