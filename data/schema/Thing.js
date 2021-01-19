const Schema = require('./Schema.js')
const schema = new Schema(require('./schema.json'));

PRIMITIVE_DATA_TYPES = {
  'Time': (x) => typeof x === 'string' && x.match(/^[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)$/),
  'Date': (x) => typeof x === 'string' && x.match(/^\d{4}-[01]\d-[0-3]\d$/),
  'DateTime': (x) => typeof x === 'string' && x.match(/(^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/),
  'Number': (x) => typeof x === 'number',
  'Integer': (x) => typeof x === 'number' && Math.floor(x) === x,
  'Text': (x) => typeof x === 'string',
  'URL': (x) => typeof x === 'string',
  'Boolean': (x) => typeof x === 'boolean',
}

class Thing {
    context = 'https://schema.org';
    type = 'Thing';
    properties = {};

    constructor(type, properties) {
        if (typeof type === 'object') {
            ({ '@type': type, ...properties } = type);
        }

        if (properties.sys && properties.fields) {
          properties = {
            identifier: properties.sys.id,
            ...properties.fields,
          }
        }

        if (properties['@type']) {
            if (properties['@type'] === type) delete properties['@type'];
            else throw new Error(`Type definition mismatch: ${properties['@type']} is not equal to ${this.type}`);
        }

        this.type = type;

        schema.getProperties(type).forEach(property => {
          this.properties[property.id] = {
            ...property,
            value: null,
            validate: this._mapTypeToValidate(property.type),
          }
        });

        Object.entries(properties).forEach(([key, value]) => {
          if (typeof value !== 'undefined') this.set(key, value)
        });
    }

    set(key, value) {
      const prop = this.properties[key]

      if (!prop) {
        throw new Error(`Property "${key}" does not exist on ${this.type}`)
      }

      if (value === null) {
        this.properties[key].value = null
      } else if (Array.isArray(value)) {
        this.properties[key].value = value.map(prop.validate)
      } else {
        this.properties[key].value = prop.validate(value)
      }
    }

    _mapTypeToValidate(type) {
      if (Array.isArray(type)) {
          const rules = type.map(x => this._mapTypeToValidate(x));
          return (x) => {
            for (let rule of rules) {
              try {
                return rule(x)
              } catch (e) {}
            }
            throw new Error(`${JSON.stringify(x)} did not match any of the types ${type.join(', ')}`);
          }
      }

      if (type in PRIMITIVE_DATA_TYPES) {
          return (x) => {
            if (PRIMITIVE_DATA_TYPES[type](x)) {
              return x
            } else {
              throw new Error(`${JSON.stringify(x)} is an invalid value for ${type}`);
            }
          }
      }

      return (x) => x instanceof Thing ? x : new Thing(type, x)
    }

    toJSON() {
      const obj = {
          '@type': this.type,
      };

      Object.entries(this.properties)
        .forEach(([key, prop]) => {
          if (prop.value !== null) {
            obj[key] = prop.value
          }
        })

      return obj
    }
}


const c = new Thing('Movie', {
  "actor": [
    {
      "@type": "Person",
      "name": "Johnny Depp"
    },
    new Thing({
      "@type": "Person",
      "name": "Penelope Cruz"
    }),
    new Thing('Person', {
      "name": "Ian McShane"
    })
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "bestRating": 10,
    "ratingCount": 200,
    "ratingValue": 8,
    "reviewCount": 50
  },
  "description": "Jack Sparrow and Barbossa embark on a quest to find the elusive fountain of youth, only to discover that Blackbeard and his daughter are after it too.",
  "director": {
    "@type": "Person",
    "name": "Rob Marshall"
  },
  "name": "Pirates of the Carribean: On Stranger Tides (2011)"
})

module.exports = Thing
