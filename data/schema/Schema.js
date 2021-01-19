class Schema {
    graph = null
    models = []

    constructor(schema) {
        this.graph = schema['@graph']
    }

    _getTypeChain(type) {
        const model = this.graph.find(x => x['@type'] === 'rdfs:Class' && x['@id'] === type);
        if (!model) throw new Error(`${type} is not a valid type`);

        let names = [model['@id']];

        if (model['rdfs:subClassOf']) {
            names = names.concat(this._getTypeChain(model['rdfs:subClassOf']['@id']))
        }

        return names;
    }

    _mapRangeToTypes(range) {
        if (Array.isArray(range)) {
            return range.map(x => this._mapRangeToTypes(x))
        }

        return range['@id'].substr(7)
    }

    _getProperties(type) {
        return this.graph
            .filter(x => x['@type'] === 'rdf:Property')
            .filter(property => {
                if (!('schema:domainIncludes' in property)) {
                    return false
                } else if (Array.isArray(property['schema:domainIncludes'])) {
                    for (let domain of property['schema:domainIncludes']) {
                        if (domain['@id'] === type) return true
                    }
                } else {
                    return property['schema:domainIncludes']['@id'] === type
                }
            })
            .map(property => ({
                id: property['@id'].substr(7),
                comment: property['rdfs:comment'],
                type: this._mapRangeToTypes(property['schema:rangeIncludes'])
            }))
    }

    getProperties(rawType) {
        let model = this.models.find(x => x.type === rawType)
        if (model) return model.properties

        const typeChain = this._getTypeChain(`schema:${rawType}`)

        const properties = typeChain
            .map(type => this._getProperties(type))
            .flat();

        this.models.push({
            type: rawType,
            properties,
        })

        return properties
    }
}

module.exports = Schema
