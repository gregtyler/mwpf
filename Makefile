up:
	npx serve public --single

sync:
	node data/download.js ./public/data.json
