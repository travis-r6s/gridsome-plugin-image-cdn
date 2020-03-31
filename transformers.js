const path = require('path')

const imageKitTransformer = {
  transformer: ({ cdn, sourceUrl, args }) => {
    // Create a map of all available transforms, their prefixes, and the type
    const transformArgs = new Map([
      ['height', { prefix: 'h', type: 'primary' }],
      ['width', { prefix: 'w', type: 'primary' }],
      ['rotate', { prefix: 'rt', type: 'primary' }],
      ['quality', { prefix: 'q', type: 'primary' }],
      ['blur', { prefix: 'bl', type: 'primary' }],
      ['trimEdges', { prefix: 't', type: 'primary' }],
      ['radius', { prefix: 'r', type: 'primary' }],
      ['grayscale', { prefix: 'e-grayscale', type: 'primary' }],
      ['contrast', { prefix: 'e-contrast', type: 'primary' }],
      ['sharpen', { prefix: 'e-sharpen', type: 'primary' }],
      ['crop', { prefix: 'c', type: 'secondary' }],
      ['cropMode', { prefix: 'cm', type: 'secondary' }],
      ['focus', { prefix: 'fo', type: 'secondary' }],
      ['format', { prefix: 'f', type: 'secondary' }],
      ['progressive', { prefix: 'pr', type: 'secondary' }]
    ])

    // We have two types (or levels) of transformations, so we need to seperate into two seperate strings, then join later
    const transformations = []
    const transformString = []

    // Loop through each argument, and add the respective transform
    for (const [key, value] of Object.entries(args)) {
      // Get the prefix for a transform, and add that and the value to the relevant transform string
      const { prefix, type } = transformArgs.get(key)

      if (type === 'primary') transformations.push(`${prefix}-${value}`)
      if (type === 'secondary') transformString.push(`${prefix}-${value}`)
    }

    // Concat all transforms with the tr: prefix
    if (transformations.length) transformString.unshift(`tr:${transformations.join(',')}`)

    // Return all our joined transforms
    return `${cdn.baseUrl}${transformString.length ? `/${transformString.join(',')}` : ''}${cdn.imagePrefix || ''}${sourceUrl}`
  },

  createSchemaTypes: schema => [
    schema.createEnumType({
      name: 'ImageCDNCrop',
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
      name: 'ImageCDNCropMode',
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
      name: 'ImageCDNRotate',
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
      name: 'ImageCDNFormat',
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
      name: 'ImageCDNFocus',
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
    crop: 'ImageCDNCrop',
    cropMode: 'ImageCDNCropMode',
    format: 'ImageCDNFormat',
    focus: 'ImageCDNFocus',
    blur: 'Int',
    trimEdges: 'Int',
    rotate: 'ImageCDNRotate',
    radius: 'String',
    grayscale: 'Boolean',
    contrast: 'Boolean',
    sharpen: 'Boolean'
  })
}

const cloudinaryTransformer = {
  transformer: ({ cdn, sourceUrl, args }) => {
    // Create a map of all available transforms, and their prefixes
    const transformArgs = new Map([
      ['width', { prefix: 'w' }],
      ['height', { prefix: 'h' }],
      ['crop', { prefix: 'c' }],
      ['aspectRatio', { prefix: 'ar' }],
      ['gravity', { prefix: 'g' }],
      ['zoom', { prefix: 'z' }],
      ['x', { prefix: 'x' }],
      ['y', { prefix: 'y' }],
      ['fetchFormat', { prefix: 'f' }],
      ['quality', { prefix: 'q' }],
      ['radius', { prefix: 'r' }],
      ['angle', { prefix: 'a' }],
      ['effect', { prefix: 'e' }],
      ['opacity', { prefix: 'o' }],
      ['border', { prefix: 'bo' }],
      ['background', { prefix: 'b' }],
      ['overlay', { prefix: 'l' }],
      ['underlay', { prefix: 'u' }],
      ['color', { prefix: 'co' }]
    ])

    // If we have a named transformation, we can just return that in the url
    if (args.transformation) return `${cdn.baseUrl}/t_${args.transformation}${cdn.imagePrefix || ''}${sourceUrl}`

    const transformString = []
    // Loop through each argument, and add the respective transform
    for (const [key, value] of Object.entries(args)) {
      // If key is equal to format, we need to change the image ext
      if (key === 'format') {
        const { dir, name } = path.parse(sourceUrl)
        sourceUrl = value !== 'auto' ? `${dir}/${name}.${value}` : sourceUrl
      } else {
        // Get the prefix for a transform, and add that and the value to the transform string
        const { prefix } = transformArgs.get(key)
        transformString.push(`${prefix}_${value}`)
      }
    }

    // Return all our joined transforms
    return `${cdn.baseUrl}${transformString.length ? `/${transformString.join(',')}` : ''}${cdn.imagePrefix || ''}${sourceUrl}`
  },

  createSchemaTypes: schema => [
    schema.createEnumType({
      name: 'ImageCDNCrop',
      values: {
        SCALE: {
          value: 'scale'
        },
        FIT: {
          value: 'fit'
        },
        LIMIT: {
          value: 'limit'
        },
        MFIT: {
          value: 'mfit'
        },
        FILL: {
          value: 'fill'
        },
        LFILL: {
          value: 'lfill'
        },
        PAD: {
          value: 'pad'
        },
        LPAD: {
          value: 'lpad'
        },
        MPAD: {
          value: 'mpad'
        },
        FILL_PAD: {
          value: 'fill_pad'
        },
        CROP: {
          value: 'crop'
        },
        THUMB: {
          value: 'thumb'
        }
      }
    }),
    schema.createEnumType({
      name: 'ImageCDNGravity',
      values: {
        NORTHWEST: {
          value: 'north_west'
        },
        NORTH: {
          value: 'north'
        },
        NORTHEAST: {
          value: 'north_east'
        },
        WEST: {
          value: 'west'
        },
        CENTER: {
          value: 'center'
        },
        EAST: {
          value: 'east'
        },
        SOUTHWEST: {
          value: 'south_west'
        },
        SOUTH: {
          value: 'south'
        },
        SOUTHEAST: {
          value: 'south_east'
        },
        FACE: {
          value: 'face'
        },
        FACE_CENTER: {
          value: 'face:center'
        },
        FACE_AUTO: {
          value: 'face:auto'
        },
        FACES_CENTER: {
          value: 'faces:center'
        },
        FACES_AUTO: {
          value: 'faces:auto'
        },
        BODY: {
          value: 'body'
        },
        BODY_FACE: {
          value: 'body:face'
        },
        LIQUID: {
          value: 'liquid'
        },
        AUTO_SUBJECT: {
          value: 'auto:subject'
        },
        AUTO_CLASSIC: {
          value: 'auto:classic'
        }
      }
    }),
    schema.createEnumType({
      name: 'ImageCDNFormat',
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
    })
  ],

  createResolverArgs: () => ({
    width: 'Float',
    height: 'Float',
    crop: 'ImageCDNCrop',
    aspectRatio: 'String',
    gravity: 'ImageCDNGravity',
    zoom: 'Float',
    x: 'Float',
    y: 'Float',
    format: 'ImageCDNFormat',
    fetchFormat: 'ImageCDNFormat',
    quality: 'String',
    radius: 'String',
    angle: 'String',
    effect: 'String',
    opacity: 'Int',
    border: 'String',
    background: 'String',
    overlay: 'String',
    underlay: 'String',
    color: 'String',
    transformation: 'String'
  })
}

const sirvTransformer = {
  // Create a map of all available transforms, their prefixes, and the type
  transformArgs: new Map([
    ['height', { prefix: 'h', arg: { type: 'Int' } }],
    ['width', { prefix: 'w', arg: { type: 'Int' } }],
    ['scale', { prefix: 'scale', arg: { type: 'enum', name: 'Scale', values: ['fit', 'fill', 'ignore', 'noup'] } }],
    ['rotate', { prefix: 'rotate', arg: { type: 'Int' } }],
    ['opacity', { prefix: 'opacity', arg: { type: 'Int' } }],
    ['brightness', { prefix: 'brightness', arg: { type: 'Int' } }],
    ['contrast', { prefix: 'contrast', arg: { type: 'Int' } }],
    ['exposure', { prefix: 'exposure', arg: { type: 'Int' } }],
    ['hue', { prefix: 'hue', arg: { type: 'Int' } }],
    ['saturation', { prefix: 'saturation', arg: { type: 'Int' } }],
    ['lightness', { prefix: 'lightness', arg: { type: 'Int' } }],
    ['shadows', { prefix: 'shadows', arg: { type: 'Int' } }],
    ['highlights', { prefix: 'highlights', arg: { type: 'Int' } }],
    ['colorLevelBlack', { prefix: 'colorlevel.black', arg: { type: 'Int' } }],
    ['colorLevelWhite', { prefix: 'colorlevel.white', arg: { type: 'Int' } }],
    ['histogram', { prefix: 'histogram', arg: { type: 'String' } }],
    ['grayscale', { prefix: 'grayscale', arg: { type: 'Boolean' } }],
    ['blur', { prefix: 'blur', arg: { type: 'Int' } }],
    ['sharpen', { prefix: 'sharpen', arg: { type: 'Int' } }],
    ['colorizeColor', { prefix: 'colorize.color', arg: { type: 'String' } }],
    ['colorizeOpacity', { prefix: 'colorize.opacity', arg: { type: 'Int' } }],
    ['colortone', { prefix: 'colortone', arg: { type: 'enum', name: 'Colortone', values: ['sepia', 'warm', 'cold', 'sunset', 'purpletan', 'texas', 'aurora', 'blackberry', 'coffee', 'clearwater', 'dusk', 'stereo', 'none'] } }],
    ['colortoneColor', { prefix: 'colortone.color', arg: { type: 'String' } }],
    ['colortoneLevel', { prefix: 'colortone.level', arg: { type: 'Int' } }],
    ['colortoneMode', { prefix: 'colortone.mode', arg: { type: 'enum', name: 'ColortoneMode', values: ['solid', 'highlights', 'shadows'] } }],
    ['vignetteValue', { prefix: 'vignette.value', arg: { type: 'Int' } }],
    ['vignetteColor', { prefix: 'vignette.color', arg: { type: 'String' } }],
    ['format', { prefix: 'format', arg: { type: 'enum', name: 'Format', values: ['jpg', 'png', 'webp', 'optimal', 'original'] } }],
    ['webpFallback', { prefix: 'webp.fallback', arg: { type: 'enum', name: 'WebpFallback', values: ['jpg', 'png'] } }],
    ['quality', { prefix: 'q', arg: { type: 'Int' } }],
    ['progressive', { prefix: 'progressive', arg: { type: 'Boolean' } }],
    ['subsampling', { prefix: 'subsampling', arg: { type: 'String' } }],
    ['pngOptimize', { prefix: 'png.optimize', arg: { type: 'Boolean' } }],
    ['filter', { prefix: 'filter', arg: { type: 'String' } }],
    ['cropWidth', { prefix: 'cw', arg: { type: 'Int' } }],
    ['cropHeight', { prefix: 'ch', arg: { type: 'Int' } }],
    ['cropX', { prefix: 'cx', arg: { type: 'Int' } }],
    ['cropY', { prefix: 'cy', arg: { type: 'Int' } }],
    ['autocrop', { prefix: 'autocrop', arg: { type: 'Boolean' } }],
    ['thumbnail', { prefix: 'thumbnail', arg: { type: 'Int' } }]
  ]),
  transformer: ({ cdn, sourceUrl, args }) => {
    const transformations = new URLSearchParams()

    for (const [key, value] of Object.entries(args)) {
      const { prefix } = sirvTransformer.transformArgs.get(key)
      transformations.append(prefix, value)
    }

    // Return all our joined transforms
    return `${cdn.baseUrl}${cdn.imagePrefix || ''}${sourceUrl}?${transformations.toString()}`
  },
  createSchemaTypes: schema => {
    const enums = []

    // eslint-disable-next-line no-unused-vars
    for (const [name, options] of sirvTransformer.transformArgs) {
      if (options.arg.type === 'enum') enums.push(options.arg)
    }

    return enums.map(({ name, values }) => schema.createEnumType({
      name: `SirvImage${name}`,
      values: Object.fromEntries(values.map(value => [value.toUpperCase(), { value }]))
    }))
  },
  createResolverArgs: () => {
    const args = []

    for (const [name, options] of sirvTransformer.transformArgs) {
      const type = options.arg.type === 'enum' ? `SirvImage${options.arg.name}` : options.arg.type
      args.push([name, type])
    }
    return Object.fromEntries(args)
  }
}

module.exports = {
  imageKit: imageKitTransformer,
  cloudinary: cloudinaryTransformer,
  sirv: sirvTransformer
}
