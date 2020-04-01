# gridsome-plugin-image-cdn

> A plugin to help you use an image CDN with Gridsome.

This plugin enables you to add an image CDN to your site (e.g. [ImageKit](https://imagekit.io), [Cloudinary](https://cloudinary.com), [Sirv](https://sirv.com)) and easily set the available transform parameters in your GraphQL query. For example, using [ImageKit](https://imagekit.io) (and `@gridsome/source-graphql`):

```graphql
{
  WordPress {
    posts {
      nodes {
        id
        title
        featuredImage {
          sourceUrl(
            width: 600
            height: 400
            crop: MAINTAIN,
            cropMode: RESIZE,
            quality: 85
            format: AUTO
          ) # https://ik.imagekit.io/my-account/named-endpoint/tr:w-600,h-400,q-85,c-maintain_ratio,cm-resize,f-auto/path/to/some/image.jpg
        }
      }
    }
  }
}
```

## Install

```
yarn add gridsome-plugin-image-cdn # or
npm install gridsome-plugin-image-cdn
```

## Usage

`gridsome.config.js`
```js
module.exports = {
  plugins: [
    {
      use: 'gridsome-plugin-image-cdn',
      options: {
        site: {
          baseUrl: '<URL of your site>'
        },
        cdn: {
          baseUrl: '<URL of the configured CDN>',
          preset: 'imageKit', # optional, but a custom transformer is required if not included
          imagePrefix: '/<some prefix>', # optional
        },
        types: [
          {
            typeName: '<some media type>',
            sourceField: '<image URL field>'
          }
        ]
      }
    }
  ]
}
```

## Configuration & Presets

This intends to be a one-size-fits-all plugin, so there are a few configurable options. It also comes with a few built-in presets for some popular image CDN providers.

| Key | Options | Explanantion |
|-----|---------|--------------|
| site | baseUrl | The base URL of the site the images are being pulled from. This will be replaced by the CDN url configured below. |
| cdn | baseUrl | The URL of the CDN you are using. |
| cdn | preset | You can use one of the preconfigured presets below. |
| cdn | imagePrefix | This will be added to the image path, *after* the CDN URL and transformations, and **before** the image path (`/path/to/image.jpg`) |
| types | typeName | The name of the GraphQL type which contains the image URL - you can find this in the GraphQL playground Schema/Docs tab. |
| types | sourceField | The field in the above type which contains the image URL. |

### Presets

This plugin supports three main CDN providers out of the box - [ImageKit](https://imagekit.io), [Cloudinary](https://cloudinary.com), [Sirv](https://sirv.com).
All of these allow remote file support, so you can use them in front of a headless WordPress site, or S3 bucket for example.

`imageKit`

| Options | Explanantion | Example |
|---------|--------------|---------|
| baseUrl | The base URL/image URL endpoint from your configured ImageKit source. | `https://ik.imagekit.io/<ImageKit ID>/<ImageKit Endpoint Identifier>` |
| preset | `imageKit` | |
| imagePrefix | Not needed for ImageKit. | |

`cloudinary`

| Options | Explanantion | Example |
|---------|--------------|---------|
| baseUrl | The base URL of your Cloudinary account - this will be show as 'Secure delivery URL:' in your account dashboard. | `https://res.cloudinary.com/<your account>` |
| preset | `cloudinary` | |
| imagePrefix | If pulling from a remote source, and your images go into a folder, you will probably need to add that prefix here (make sure to include a leading slash). | `/some-folder` |

`sirv`

| Options | Explanantion | Example |
|---------|--------------|---------|
| baseUrl | The base URL of your Sirv account (including subdomain) or the domain of your custom endpoint. | `https://<Account Subdomain>.sirv.com` |
| preset | `sirv` | |
| imagePrefix | If your images are organised into folders, for example when using the Wordpress plugin, you may need to add this prefix. | `/WP_some_site` |

### Examples

These examples assume a setup using the [Gridsome Source GraphQL](https://gridsome.org/plugins/@gridsome/source-wordpress) plugin, and [WordPress](https://wordpress.org) with [WPGraphQL](https://github.com/wp-graphql/wp-graphql).

`imageKit`
```js
{
  use: '@gridsome/source-graphql',
  options: {
    url: 'https://demo.wpgraphql.com/graphql',
    fieldName: 'WordPress',
    typeName: 'wordPress'
  }
},
{
  use: 'gridsome-plugin-image-cdn',
  options: {
    site: {
      baseUrl: 'https://demo.wpgraphql.com'
    },
    cdn: {
      baseUrl: 'https://ik.imagekit.io/travis/wordpress',
      preset: 'imageKit'
    },
    types: [
      {
        typeName: 'wordPress_MediaItem',
        sourceField: 'sourceUrl'
      }
    ]
  }
}
```
```vue
<template>
  <Layout>
    <div class="section">
      <h1>{{ this.$page.WordPress.post.title }}
      <img :src="this.$page.WordPress.post.featuredImage.sourceUrl" :alt="this.$page.WordPress.post.featuredImage.altText" />
    </div>
  </Layout>
</template>

<page-query>
query {
  WordPress {
    post (id: "cG9zdDoxMDEx") {
      id
      title
      featuredImage {
        altText
        sourceUrl(
          width: 600
          height: 400
          crop: MAINTAIN,
          cropMode: RESIZE,
          quality: 85
          format: AUTO
        ) # https://ik.imagekit.io/travis/wordpress/tr:w-600,h-400,q-85,c-maintain_ratio,cm-resize,f-auto/wp-content/uploads/2013/03/featured-image-horizontal.jpg
      }
    }
  }
}
</page-query>
```

`cloudinary`
```js
{
  use: '@gridsome/source-graphql',
  options: {
    url: 'https://demo.wpgraphql.com/graphql',
    fieldName: 'WordPress',
    typeName: 'wordPress'
  }
},
{
  use: 'gridsome-plugin-image-cdn',
  options: {
    site: {
      baseUrl: 'https://demo.wpgraphql.com'
    },
    cdn: {
      baseUrl: 'https://res.cloudinary.com/travis',
      preset: 'cloudinary',
      imagePrefix: '/wp-graphql'
    },
    types: [
      {
        typeName: 'wordPress_MediaItem',
        sourceField: 'sourceUrl'
      }
    ]
  }
}
```
```graphql
{
  WordPress {
    post (id: "cG9zdDoxMDEx") {
      id
      title
      cover: featuredImage {
        altText
        sourceUrl(
          width: 600
          height: 400
          crop: CROP,
          quality: "auto"
        ) # https://res.cloudinary.com/travis/w_600,h_400,c_crop,q_auto/wp-graphql/wp-content/uploads/2013/03/featured-image-horizontal.jpg
      }
    }
  }
}
```

## Lazy Load

You could easily use this plugin with some Vue lazy load plugins by making use of GraphQL aliases - for example, with [`v-lazy-image`](https://github.com/alexjoverm/v-lazy-image) (using `imageKit`):

```vue
<template>
  <Layout>
    <div class="section">
      <h1>{{ this.$page.WordPress.post.title }}
      <v-lazy-image
        :src="this.$page.WordPress.post.featuredImage.sourceUrl"
        :src-placeholder="this.$page.WordPress.post.featuredImage.placeholder"
        :alt="this.$page.WordPress.post.featuredImage.altText" />
    </div>
  </Layout>
</template>

<script>
import VLazyImage from 'v-lazy-image'
export default {
  components: {
    VLazyImage
  }
}
</script>

<page-query>
query {
  WordPress {
    post (id: "cG9zdDoxMDEx") {
      id
      title
      featuredImage {
        altText
        sourceUrl(
          width: 800
          height: 600
          crop: MAINTAIN,
          cropMode: RESIZE,
          quality: 85
          format: AUTO
        )
        placeholder: sourceUrl(
          width: 200
          height: 100
          crop: MAINTAIN,
          cropMode: RESIZE,
          quality: 40
          blur: 20
          format: AUTO
        )
      }
    }
  }
}
</page-query>
```

## Custom Transformer

This plugin uses a transformer function to convert query arguments into query parameters a CDN uses. You can add a custom transformer (along with custom query arguments) by using the `transformer` option in `gridsome.config.js`. Below is an explanation of what this option needs:

The `transformer` option takes in a object, containing three functions - `createSchemaTypes`, `createResolverArgs`, and `transformer`.

### `createSchemaTypes`

`createSchemaTypes` will receive a single argument - `schema`. Use this to add any custom Enums your arguments may use. For example:

```js
...
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
      ...
    }
  })
],
...
```

### `createResolverArgs`

`createResolverArgs` has no arguments, and should simply return an object, containing all image arguments (parameters):

```js
...
createResolverArgs: () => ({
  width: 'Int',
  height: 'Int',
  quality: 'Int',
  crop: 'ImageCDNCrop' // The custom Enum we created above
})
...
```

### `transformer`

`transformer` will receive an object containing three keys - `cdn` (from config options), `sourceUrl` (the bare image URL), and `args` (the arguments from the current query), and should return a string. These arguments can all be used to generate a transform url, for example:

```js
...
transformer: ({ cdn, sourceUrl, args }) => {
  // Create a map of all available transforms, and their prefixes
  const transformArgs = new Map([
    ['height', { prefix: 'h' }],
    ['width', { prefix: 'w' }],
    ['quality', { prefix: 'q' }],
    ['crop', { prefix: 'c' }]
  ])

  // Create an empty array we can push transformations to
  const transformations = []

  // Loop through each argument, and set the respective transform
  for (const [key, value] of Object.entries(args)) {
    // Get the prefix for a transform, and add that and the value to the transform array
    const { prefix } = transformArgs.get(key)
    transformations.push(`${prefix}-${value}`) // e.g. 'w-400', 'q-85'
  }

  // Concat and return all our joined transforms
  const transformUrl = transformations.length ? `/${transformations.join(',')}` : '' // e.g. /w-400,q-85
  return `${cdn.baseUrl}${transformUrl}${sourceUrl}`
},
...
```
