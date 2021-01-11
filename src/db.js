/* globals contenful */

const DB = {
  data: null,

  load() {
    this.data = JSON.parse(window.localStorage.getItem('db'));
  },

  cleanObject(entry) {
    const id = entry.sys.id;
    const contentType = entry.sys.contentType.sys.id;
    const fields = {};

    Object.entries(entry.fields).forEach(([key, value]) => {
      const p = key.match(/^(.+)_[0-9]+$/);
      if (p) key = p[1];

      if (Array.isArray(value) && typeof value[0].sys !== 'undefined') {
        value = value.map(x => x.sys.id);
      }

      fields[key] = value;
    });

    return {
      contentType,
      id,
      fields,
    };
  },

  async update() {
    if (this.data !== null) return

    const client = contentful.createClient({
      space: "377d8odqein8",
      accessToken: "aXthknsj9f-YeRyFxUbY2EvyLq0A8QDwpiz6BpE4JZQ",
    });

    const allEntries = await client.getEntries({
      limit: 1000
    });
    this.data = {};

    allEntries.items.forEach((entry) => {
      const {contentType, id, fields} = this.cleanObject(entry)
      if (typeof this.data[contentType] === 'undefined') this.data[contentType] = [];

      this.data[contentType][id] = fields;
    });

    window.localStorage.setItem('db', this.serialize())
  },

  serialize() {
    return JSON.stringify(this.data)
  }
}

DB.load()

export default DB
