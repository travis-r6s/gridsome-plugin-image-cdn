# gridsome-plugin-cdn-images

> A plugin to help you use an image CDN with Gridsome.

This plugin enables you to add an image CDN to your site (e.g. [ImageKit](https://imagekit.io), [Cloudinary](https://cloudinary.com), [Sirv](https://sirv.com)) and easily use the CDN transform parameters in your GraphQL query. For example, using [ImageKit](https://imagekit.io) (and `@gridsome/source-graphql`):

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
          ) # https://ik.imagekit.io/<some account>/<endpoint id>/tr:w-600,h-400,q-85,c-maintain_ratio,cm-resize,f-auto/path/to/some/image.jpg
        }
      }
    }
  }
}
```

## Install

```
yarn add gridsome-plugin-cdn-images # or
npm install gridsome-plugin-cdn-images
```

## Usage

`gridsome.config.js`
```js
module.exports = {
  plugins: [
    {
      use: 'gridsome-plugin-cdn-images',
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
| preset | 'imageKit' | |
| imagePrefix | Not needed for ImageKit. | |

`cloudinary`
| Options | Explanantion | Example |
|---------|--------------|---------|
| baseUrl | The base URL of your Cloudinary account - this will be show as 'Secure delivery URL:' in your account dashboard. | `https://res.cloudinary.com/<your account>` |
| preset | 'cloudinary' | |
| imagePrefix | If pulling from a remote source, and your images go into a folder, you will probably need to add that prefix here (make sure to include a leading slash). | '/some-folder' |

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
  use: 'gridsome-plugin-cdn-images',
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
          crop: MAINTAIN,
          cropMode: RESIZE,
          quality: 85
          format: AUTO
        ) # [https://ik.imagekit.io/travis/wordpress/tr:w-600,h-400,q-85,c-maintain_ratio,cm-resize,f-auto/wp-content/uploads/2013/03/featured-image-horizontal.jpg](https://ik.imagekit.io/travis/wordpress/tr:w-600,h-400,q-85,c-maintain_ratio,cm-resize,f-auto/wp-content/uploads/2013/03/featured-image-horizontal.jpg)
      }
    }
  }
}
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
  use: 'gridsome-plugin-cdn-images',
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
        ) # [https://res.cloudinary.com/travis/w_600,h_400,c_crop,q_auto/wp-graphql/wp-content/uploads/2013/03/featured-image-horizontal.jpg](https://res.cloudinary.com/travis/w_600,h_400,c_crop,q_auto/wp-graphql/wp-content/uploads/2013/03/featured-image-horizontal.jpg)
      }
    }
  }
}
```
