
function ImageCDN (api, options) {
  // Destructure plugin options
  const { site, cdn, types } = options

  // Create a map of default resolvers
  const transformers = new Map([['imageKit', imageKitTransformer]])

  // Get the configured transformer using either an option preset, or a custom transformer
  const { createSchemaTypes, createResolverArgs, transformer } = cdn.preset ? transformers.get(cdn.preset) : cdn.transformer

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
            resolve: (parent, args) => {
              const sourceUrl = parent[ sourceField ].replace(site.baseUrl, '')

              // If no transformer is configure, ignore it and return the opiginal url
              if (!transformer) return sourceUrl
              // Otherwise handoff to the transformer
              return transformer({ cdnUrl: cdn.baseUrl, sourceUrl, args })
            }
          }
        }
      })
    }
  })
}

const imageKitTransformer = {
  transformer: ({ cdnUrl, sourceUrl, args }) => {
    const { height, width, quality = '85', progressive = true, crop, cropMode, format, focus, blur, trimEdges, rotate, radius, grayscale, contrast, sharpen } = args
    const transformString = []

    const transformations = []
    if (rotate) transformations.push(`rt-${rotate}`)
    if (height) transformations.push(`h-${height}`)
    if (width) transformations.push(`w-${width}`)
    if (quality) transformations.push(`q-${quality}`)
    if (blur) transformations.push(`bl-${blur}`)
    if (trimEdges) transformations.push(`t-${trimEdges}`)
    if (radius) transformations.push(`r-${radius}`)
    // Enhancement
    if (grayscale) transformations.push('e-grayscale')
    if (contrast) transformations.push('e-contrast')
    if (sharpen) transformations.push('e-sharpen')
    // Concat all transforms with the tr: prefix
    if (transformations.length) transformString.push(`tr:${transformations.join(',')}`)

    // Cropping
    if (crop) transformString.push(`c-${crop}`)
    if (cropMode) transformString.push(`cm-${cropMode}`)
    if (focus) transformString.push(`fo-${focus}`)

    // Format
    if (format) transformString.push(`f-${format}`)
    if (progressive) transformString.push(`pr-${progressive}`)

    return `${cdnUrl}${transformString.length ? `/${transformString.join(',')}` : ''}${sourceUrl}`
  },

  createSchemaTypes: schema => [
    schema.createEnumType({
      name: 'CDNImageCrop',
      values: {
        MAINTAIN: {
          value: 'maintain_ratio'
        },
        FORCE: {
          value: 'force'
        },
        AT_LEAST: {
          value: 'at_least'
        },
        AT_MAX: {
          value: 'at_max'
        }
      }
    }),
    schema.createEnumType({
      name: 'CDNImageCropMode',
      values: {
        RESIZE: {
          value: 'resize'
        },
        EXTRACT: {
          value: 'extract'
        },
        PAD_EXTRACT: {
          value: 'pad_extract'
        },
        PAD_RESIZE: {
          value: 'pad_resize'
        }
      }
    }),
    schema.createEnumType({
      name: 'CDNImageRotate',
      values: {
        _0: {
          value: 0
        },
        _90: {
          value: 90
        },
        _180: {
          value: 180
        },
        _270: {
          value: 270
        },
        _360: {
          value: 360
        },
        auto: {}
      }
    }),
    schema.createEnumType({
      name: 'CDNImageFormat',
      values: {
        AUTO: {
          value: 'auto'
        },
        WEBP: {
          value: 'webp'
        },
        JPG: {
          value: 'jpg'
        },
        JPEG: {
          value: 'jpeg'
        },
        PNG: {
          value: 'png'
        }
      }
    }),
    schema.createEnumType({
      name: 'CDNImageFocus',
      values: {
        AUTO: {
          value: 'auto'
        },
        CENTER: {
          value: 'center'
        },
        TOP: {
          value: 'top'
        },
        LEFT: {
          value: 'left'
        },
        BOTTOM: {
          value: 'bottom'
        },
        RIGHT: {
          value: 'right'
        },
        TOP_LEFT: {
          value: 'top_left'
        },
        TOP_RIGHT: {
          value: 'top_right'
        },
        BOTTOM_LEFT: {
          value: 'bottom_left'
        },
        BOTTOM_RIGHT: {
          value: 'bottom_right'
        }
      }
    })
  ],

  createResolverArgs: () => ({
    width: 'Int',
    height: 'Int',
    quality: 'Int',
    progressive: 'Boolean',
    crop: 'CDNImageCrop',
    cropMode: 'CDNImageCropMode',
    format: 'CDNImageFormat',
    focus: 'CDNImageFocus',
    blur: 'Int',
    trimEdges: 'Int',
    rotate: 'CDNImageRotate',
    radius: 'String',
    grayscale: 'Boolean',
    contrast: 'Boolean',
    sharpen: 'Boolean'
  })
}

module.exports = ImageCDN

module.exports.defaultOptions = () => ({
  types: []
})
