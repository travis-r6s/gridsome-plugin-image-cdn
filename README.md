# gridsome-plugin-cdn-images

> A plugin to help you use an image CDN with Gridsome.

This plugin enables you to add an image CDN to your site (e.g. Cloudinary, ImageKit, Sirv) and easily use the CDN transform parameters in your GraphQL query. For example, using Cloudinary (and @gridsome/source-graphql):

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
            crop: CROP
            gravity: CENTER
            quality: "auto"
            format: AUTO
          ) # https://res.cloudinary.com/your-account/image/upload/w_600,h_400,c_crop,g_center,q_auto/path-to-some-image.jpg
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
          preset: 'cloudinary', # optional, but a custom transformer is required if not included
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

This intends to be a one-size-fits-all plugin, so there are a few configurable options.
