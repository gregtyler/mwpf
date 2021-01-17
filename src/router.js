function Router() {
  const map = []

  function add (match, callback) {
    map.push({ match, callback });

    return this;
  }

  function parse (path) {
    for (let i = 0; i < map.length; i++) {
      const { match, callback } = map[i];

      const m = path.match(match);

      if (m) {
        return callback.apply(window, m.slice(1))
      }
    }
  }

  return { add, parse }
}
