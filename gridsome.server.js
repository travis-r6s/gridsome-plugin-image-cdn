const transformers = require('./transformers')

function ImageCDN (api, options) {
  // Destructure plugin options
  const { site, cdn, types } = options

  // Get the configured transformer using either an option preset, or a custom transformer
  const Transformer = cdn.preset ? transformers[ cdn.preset ] : cdn.transformer

  if (!Transformer) throw new Error('Must provide a transformer.')

  const { createSchemaTypes, createResolverArgs, transformer } = Transformer

  api.loadSource(({ addSchemaTypes, schema, addSchemaResolvers }) => {
    // Create and add custom cdn schema types - i.e. width, height, crop mode
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
              // Get the sourceUrl, using either the sourceField, or the path key in case of an alias.
              const sourceUrl = (parent[ sourceField ] || parent[ info.path.key ]).replace(site.baseUrl, '')

              // If no transformer is configure, ignore it and return the original url
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
