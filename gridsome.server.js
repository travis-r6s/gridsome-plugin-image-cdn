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
    for (const { typeName, sourceField } of types) {
      addSchemaResolvers({
        [ typeName ]: {
          [ sourceField ]: {
            // Add configured resolver args
            args: createResolverArgs() || {},
            resolve: (parent, args, ctx, info) => {
              // Get the sourceUrl, using the path key in case of an alias.
              const sourceUrl = parent[ info.path.key ].replace(site.baseUrl, '')

              // If no transformer is configure, ignore it and return the opiginal url
              if (!transformer) return sourceUrl
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
