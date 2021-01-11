/* globals contenful */

const DB = {
  data: null,

  load() {
    this.data = JSON.parse(window.localStorage.getItem('db'));
  },

  async update() {
    if (this.data !== null) return

    const client = contentful.createClient({
      space: "377d8odqein8",
      accessToken: "aXthknsj9f-YeRyFxUbY2EvyLq0A8QDwpiz6BpE4JZQ"
    });

    const allEntries = await client.getEntries();
    this.data = {};

    allEntries.items.forEach(({sys, fields}) => {
      const contentType = sys.contentType.sys.id;
      if (typeof this.data[contentType] === 'undefined') this.data[contentType] = [];
      this.data[contentType].push(fields)
    });

    window.localStorage.setItem('db', this.serialize())
  },

  serialize() {
    return JSON.stringify(this.data)
  }
}

DB.load()

export default DB
