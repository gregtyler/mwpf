function Router() {
  const map = []

  function add (match, callback) {
    map.push({ match, callback });

    return this;
  }

  function parse (path) {
    map.some(({ match, callback }) => {
      const m = path.match(match);

      if (m) {
        callback.apply(window, m.slice(1))
        return true;
      }
    })
  }

  return { add, parse }
}
