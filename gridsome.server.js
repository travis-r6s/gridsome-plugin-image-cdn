const get = require('lodash.get')
const transformers = require('./transformers')

function ImageCDN (api, options) {
  // Destructure plugin options
  const { site, cdn, types } = options

  // Get the configured transformer using either an option preset, or a custom transformer
  const { createSchemaTypes, createResolverArgs, transformer } = cdn.preset ? transformers[ cdn.preset ] : cdn.transformer

  api.loadSource(({ addSchemaTypes, schema, addSchemaResolvers }) => {
    // Create and add custom cdn schema types - i.e. width, heigh, crop mode
    const schemaTypes = createSchemaTypes(schema)
    addSchemaTypes(schemaTypes)

    // For each configured typeName, update the sourceField to include the cdn options
    for (const { typeName, sourceField, sourceFieldPath } of types) {
      // Set the parent resolver typeName, and the child path (when using a nested object) if required
      const [parentType, childPath] = sourceFieldPath ? sourceFieldPath.split('.') : [sourceField]

      addSchemaResolvers({
        [ typeName ]: {
          [ parentType ]: {
            // Add configured resolver args
            args: createResolverArgs() || {},
            resolve: (parent, args, ctx, info) => {
              // Get the sourceUrl, using the path key in case of an alias.
              const sourceUrl = parent[ info.path.key ].replace(site.baseUrl, '')
              // If no transformer is configure, ignore it and return the original url
              if (!transformer) return sourceUrl

              // If we have a nested object, then return the parent object with the child path key
              if (childPath) {
                const transformedSrc = transformer({ cdn, sourceUrl, args })
                return {
                  ...parent[ parentType ],
                  [ childPath ]: transformedSrc
                }
              }

              // Otherwise handoff to the transformer
              return transformer({ cdn, sourceUrl, args })
            }
          }
        }
      })
    }
  })
}

module.exports = ImageCDN

module.exports.defaultOptions = () => ({
  site: {
    baseUrl: ''
  },
  cdn: {
    baseUrl: '',
    imagePrefix: '',
    preset: ''
  },
  types: []
})
