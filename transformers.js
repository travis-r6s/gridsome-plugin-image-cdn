const path = require('path')

const imageKitTransformer = {
  // Create a map of all available transforms, their prefixes, and the type
  transformArgs: new Map([
    ['height', { prefix: 'h', type: 'primary', arg: { type: 'Int' } }],
    ['width', { prefix: 'w', type: 'primary', arg: { type: 'Int' } }],
    ['rotate', { prefix: 'rt', type: 'primary', arg: { type: 'Int' } }],
    ['quality', { prefix: 'q', type: 'primary', arg: { type: 'Int' } }],
    ['blur', { prefix: 'bl', type: 'primary', arg: { type: 'Int' } }],
    ['trimEdges', { prefix: 't', type: 'primary', arg: { type: 'Int' } }],
    ['radius', { prefix: 'r', type: 'primary', arg: { type: 'String' } }],
    ['grayscale', { prefix: 'e-grayscale', type: 'primary', arg: { type: 'Boolean' } }],
    ['contrast', { prefix: 'e-contrast', type: 'primary', arg: { type: 'Boolean' } }],
    ['sharpen', { prefix: 'e-sharpen', type: 'primary', arg: { type: 'Boolean' } }],
    ['crop', { prefix: 'c', type: 'secondary', arg: { type: 'enum', name: 'Crop', values: ['maintain_ratio', 'force', 'at_least', 'at_max'] } }],
    ['cropMode', { prefix: 'cm', type: 'secondary', arg: { type: 'enum', name: 'CropMode', values: ['resize', 'extract', 'pad_extract', 'pad_resize'] } }],
    ['focus', { prefix: 'fo', type: 'secondary', arg: { type: 'enum', name: 'Focus', values: ['auto', 'center', 'top', 'left', 'bottom', 'right', 'top_left', 'top_right', 'bottom_left', 'bottom_right'] } }],
    ['format', { prefix: 'f', type: 'secondary', arg: { type: 'enum', name: 'Format', values: ['auto', 'webp', 'jpg', 'jpeg', 'png'] } }],
    ['progressive', { prefix: 'pr', type: 'secondary', arg: { type: 'Boolean' } }]
  ]),
  transformer: ({ cdn, sourceUrl, args }) => {
    // We have two types (or levels) of transformations, so we need to seperate into two seperate strings, then join later
    const transformations = []
    const transformString = []

    // Loop through each argument, and add the respective transform
    for (const [key, value] of Object.entries(args)) {
      // Get the prefix for a transform, and add that and the value to the relevant transform string
      const { prefix, type } = imageKitTransformer.transformArgs.get(key)

      if (type === 'primary') transformations.push(`${prefix}-${value}`)
      if (type === 'secondary') transformString.push(`${prefix}-${value}`)
    }

    // Concat all transforms with the tr: prefix
    if (transformations.length) transformString.unshift(`tr:${transformations.join(',')}`)

    // Return all our joined transforms
    return `${cdn.baseUrl}${transformString.length ? `/${transformString.join(',')}` : ''}${cdn.imagePrefix || ''}${sourceUrl}`
  },
  createSchemaTypes: schema => {
    const enums = []

    // eslint-disable-next-line no-unused-vars
    for (const [name, options] of imageKitTransformer.transformArgs) {
      if (options.arg.type === 'enum') enums.push(options.arg)
    }

    return enums.map(({ name, values }) => schema.createEnumType({
      name: `ImageKitImage${name}`,
      values: Object.fromEntries(values.map(value => [value.toUpperCase(), { value }]))
    }))
  },
  createResolverArgs: () => {
    const args = []

    for (const [name, options] of imageKitTransformer.transformArgs) {
      const type = options.arg.type === 'enum' ? `ImageKitImage${options.arg.name}` : options.arg.type
      args.push([name, type])
    }
    return Object.fromEntries(args)
  }
}

const cloudinaryTransformer = {
  // Create a map of all available transforms, and their prefixes
  transformArgs: new Map([
    ['width', { prefix: 'w', arg: { type: 'Float' } }],
    ['height', { prefix: 'h', arg: { type: 'Float' } }],
    ['crop', { prefix: 'c', arg: { type: 'enum', name: 'Crop', values: ['fit', 'scale', 'limit', 'mfit', 'fill', 'lfill', 'pad', 'lpad', 'mpad', 'fill_pad', 'crop', 'thumb'] } }],
    ['aspectRatio', { prefix: 'ar', arg: { type: 'String' } }],
    ['gravity', { prefix: 'g', arg: { type: 'enum', name: 'Gravity', values: ['north_west', 'north', 'north_east', 'west', 'center', 'east', 'south_west', 'south', 'south_east', 'face', 'face:center', 'face:auto', 'faces:center', 'faces:auto', 'body', 'body:face', 'liquid', 'auto:subject', 'auto:classic'] } }],
    ['zoom', { prefix: 'z', arg: { type: 'Float' } }],
    ['x', { prefix: 'x', arg: { type: 'Float' } }],
    ['y', { prefix: 'y', arg: { type: 'Float' } }],
    ['fetchFormat', { prefix: 'f', arg: { type: 'enum', name: 'Format', values: ['auto', 'webp', 'jpg', 'jpeg', 'png'] } }],
    ['fetchFormat', { prefix: 'f', arg: { type: 'enum', name: 'Format', values: ['auto', 'webp', 'jpg', 'jpeg', 'png'] } }],
    ['quality', { prefix: 'q', arg: { type: 'String' } }],
    ['radius', { prefix: 'r', arg: { type: 'String' } }],
    ['angle', { prefix: 'a', arg: { type: 'String' } }],
    ['effect', { prefix: 'e', arg: { type: 'String' } }],
    ['opacity', { prefix: 'o', arg: { type: 'Int' } }],
    ['border', { prefix: 'bo', arg: { type: 'String' } }],
    ['background', { prefix: 'b', arg: { type: 'String' } }],
    ['overlay', { prefix: 'l', arg: { type: 'String' } }],
    ['underlay', { prefix: 'u', arg: { type: 'String' } }],
    ['color', { prefix: 'co', arg: { type: 'String' } }],
    ['transformation', { prefix: 'transformation', arg: { type: 'String' } }]
  ]),
  transformer: ({ cdn, sourceUrl, args }) => {
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
        const { prefix } = cloudinaryTransformer.transformArgs.get(key)
        transformString.push(`${prefix}_${value}`)
      }
    }

    // Return all our joined transforms
    return `${cdn.baseUrl}${transformString.length ? `/${transformString.join(',')}` : ''}${cdn.imagePrefix || ''}${sourceUrl}`
  },
  createSchemaTypes: schema => {
    const enums = []

    // eslint-disable-next-line no-unused-vars
    for (const [name, options] of cloudinaryTransformer.transformArgs) {
      if (options.arg.type === 'enum') enums.push(options.arg)
    }

    return enums.map(({ name, values }) => schema.createEnumType({
      name: `CloudinaryImage${name}`,
      values: Object.fromEntries(values.map(value => [value.toUpperCase().replace(':', '_'), { value }]))
    }))
  },
  createResolverArgs: () => {
    const args = []

    for (const [name, options] of cloudinaryTransformer.transformArgs) {
      const type = options.arg.type === 'enum' ? `CloudinaryImage${options.arg.name}` : options.arg.type
      args.push([name, type])
    }
    return Object.fromEntries(args)
  }
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
