const server = require('../gridsome.server')

const transformerFn = jest.fn(({ cdn, sourceUrl, args }) => {
  return cdn.baseUrl + cdn.imagePrefix + sourceUrl
})

const customTransformer = {
  createSchemaTypes: jest.fn(),
  createResolverArgs: jest.fn(),
  transformer: transformerFn
}

function setup (config, data) {
  return new Promise((resolve, reject) => {
    const options = Object.assign(
      {
        site: {},
        cdn: {
          baseUrl: 'http://example.com',
          transformer: customTransformer,
          imagePrefix: '/'
        },
        types: [
          {
            typeName: 'Thing',
            sourceField: 'field'
          }
        ]
      },
      config
    )
    const addSchemaResolvers = jest.fn(cb => {
      const responses = []
      options.types.forEach(type => {
        const resp = cb[ type.typeName ][ type.sourceField ].resolve(
          data[ type.typeName ],
          {},
          {},
          {
            path: {
              key: ''
            }
          }
        )
        responses.push(resp)
      })
      resolve(responses)
    })

    const loadSource = jest.fn(cb => {
      const ctx = {
        addSchemaTypes: jest.fn(),
        schema: {
          createEnumType: jest.fn()
        },
        addSchemaResolvers
      }
      cb(ctx)
    })
    const api = {
      loadSource
    }
    server(api, options)
  })
}

test('resolves the full custom CDN URL', async () => {
  const responses = await setup(
    {
      cdn: {
        baseUrl: 'http://example.com',
        transformer: customTransformer,
        imagePrefix: '/'
      },
      types: [
        {
          typeName: 'Post',
          sourceField: 'featured'
        }
      ]
    },
    {
      Post: {
        featured: 'image.jpg'
      }
    }
  )

  expect(responses[ 0 ]).toEqual('http://example.com/image.jpg')
})

test.skip('resolves null as the orignal value', async () => { // Issue https://github.com/thetre97/gridsome-plugin-image-cdn/issues/20
  const responses = await setup(
    {
      cdn: {
        baseUrl: 'http://example.com',
        transformer: customTransformer,
        imagePrefix: '/'
      },
      types: [
        {
          typeName: 'Post',
          sourceField: 'featured'
        }
      ]
    },
    {
      Post: {
        featured: null
      }
    }
  )

  expect(responses[ 0 ]).toEqual(null)
})
