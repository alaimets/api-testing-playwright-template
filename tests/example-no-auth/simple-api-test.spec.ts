import { StatusCodes } from 'http-status-codes'
import { expect, test } from '@playwright/test'

test.describe('GET /products/{id} and GET /products', () => {
  test('Get product with correct id should receive code 200', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/2')

    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status, body and headers
    console.log('response body:', responseBody)
    // Check if the response status is 200
    expect(statusCode).toBe(StatusCodes.OK)
  })

  test('Get all products should receive code 200', async ({ request }) => {
    const response = await request.get('https://shop.tl-academy.ee/api/products/')
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.OK)
  })

  test('Get product with not existing id should receive code 404', async ({ request }) => {
    const allProductResponse = await request.get('https://shop.tl-academy.ee/api/products')
    const allProductBody = await allProductResponse.json()
    const lastProductId: number = allProductBody.length

    const oneProductResponse = await request.get(
      'https://shop.tl-academy.ee/api/products/' + lastProductId + 1,
    ) // + 1 req
    const oneProductBody = await oneProductResponse.json()
    const oneProductStatusCode = oneProductResponse.status()

    console.log('response body:', oneProductBody)
    expect(oneProductStatusCode).toBe(StatusCodes.NOT_FOUND)
  })

  test('Get product with incorrect id should receive code 400', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/test12code')

    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('Get product with negative id should receive code 400', async ({ request }) => {
    const response = await request.get('https://shop.tl-academy.ee/api/products/-1')

    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('Get product with incorrect id with number first should receive code 400', async ({
    request,
  }) => {
    const response = await request.get('https://shop.tl-academy.ee/api/products/1fewfwefwef')

    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('Get product with incorrect id with special symbols should receive code 400', async ({
    request,
  }) => {
    const response = await request.get('https://shop.tl-academy.ee/api/products/!!*^&#(^*&#*@')

    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('Get product with incorrect id with only letters should receive code 400', async ({
    request,
  }) => {
    const response = await request.get('https://shop.tl-academy.ee/api/products/Raymond')

    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

test.describe('POST /products', () => {
  test('Post product with correct data should receive code 201', async ({ request }) => {
    // prepare request body
    const requestBody = {
      name: 'Lays Spring Onion',
      category: 'Chips',
      price: 2.99,
      quantity: 5,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.CREATED)
    // check that body.name is string type
    expect(typeof responseBody.name).toBe('string')
    // check that body.price is number type
    expect(typeof responseBody.price).toBe('number')
    // check that body.category is string type
    expect(typeof responseBody.category).toBe('string')
    // check that body.quantity is number type
    expect(typeof responseBody.quantity).toBe('number')
  })

  //получается бага - должно показывать available - false, так как идёт проверка quantity и если оно 0, автоматом available - false
  test.fail(
    'Post product with 0 quantity should receive code 201 and available "false"',
    async ({ request }) => {
      const requestBody = {
        name: 'Fourth Wing',
        category: 'Book',
        price: 19.2,
        quantity: 0,
      }
      const response = await request.post('https://shop.tl-academy.ee/api/products', {
        data: requestBody,
      })
      const responseBody = await response.json()
      const statusCode = response.status()

      console.log('response status:', statusCode)
      console.log('response body:', responseBody)
      console.log('availability:', responseBody.available)
      expect(statusCode).toBe(StatusCodes.CREATED)
      expect(typeof responseBody.name).toBe('string')
      expect(typeof responseBody.price).toBe('number')
      expect(typeof responseBody.category).toBe('string')
      expect(typeof responseBody.quantity).toBe('number')
      expect(typeof responseBody.available).toBe('boolean')
      expect(responseBody.available).toBeFalsy()
    },
  )

  //получается бага - должно показывать available - false, так как идёт проверка quantity и если его нет, то автоматом ставится 0 и available - false
  test.fail(
    'Post product without quantity should receive code 201 and available "false"',
    async ({ request }) => {
      const requestBody = {
        name: 'Fourth Wing',
        category: 'Book',
        price: 19.2,
      }
      const response = await request.post('https://shop.tl-academy.ee/api/products', {
        data: requestBody,
      })
      const responseBody = await response.json()
      const statusCode = response.status()

      console.log('response status:', statusCode)
      console.log('response body:', responseBody)
      console.log('availability:', responseBody.available)
      expect(statusCode).toBe(StatusCodes.CREATED)
      expect(typeof responseBody.name).toBe('string')
      expect(typeof responseBody.price).toBe('number')
      expect(typeof responseBody.category).toBe('string')
      expect(typeof responseBody.quantity).toBe('number')
      expect(typeof responseBody.available).toBe('boolean')
      expect(responseBody.available).toBeFalsy()
    },
  )

  test('Post product without required field "price" should receive code 400', async ({
    request,
  }) => {
    const requestBody = {
      name: 'Coca-Cola',
      category: 'Drink',
    }
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response status:', statusCode)
    //мне не нравится, что ошибку он выдаёт Price must be a number, а не Price is required
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('Post product without required field "name" should receive code 400', async ({
    request,
  }) => {
    const requestBody = {
      category: 'Drink',
      price: 3.33,
    }
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('Post product without required field "category" should receive code 400', async ({
    request,
  }) => {
    const requestBody = {
      name: 'Coca-Cola',
      price: 3.33,
    }
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('Post product with incorrect filled field "name" should receive code 400', async ({
    request,
  }) => {
    const requestBody = {
      name: 12345,
      category: 'Dessert',
      price: 3.33,
      quantity: 2,
    }

    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

test.describe('PUT /products/{id}', () => {
  test('Change whole product using PUT command should receive code 200', async ({ request }) => {
    //Create new product
    const newProduct = {
      name: 'Cat',
      category: 'Pets',
      price: 300,
    }
    const postResponse = await request.post('https://shop.tl-academy.ee/api/products/', {
      data: newProduct,
    })
    const createdProductBody = await postResponse.json()
    const productStatusCode = postResponse.status()
    const productId = createdProductBody.id
    console.log('POST response status:', productStatusCode)
    console.log('POST response body:', createdProductBody)
    expect(productStatusCode).toBe(StatusCodes.CREATED)
    //Change product
    const requestBody = {
      name: 'Dog',
      category: 'Food',
      price: 9.99,
    }
    const putResponse = await request.put(`https://shop.tl-academy.ee/api/products/${productId}`, {
      data: requestBody,
    })
    const putResponseBody = await putResponse.json()
    const statusCode = putResponse.status()
    console.log('PUT response status:', statusCode)
    console.log('PUT response body:', putResponseBody)
    expect(statusCode).toBe(200)
  })

  test('Change one field in the product using PUT command should receive code 400', async ({request, }) => {
    //Create new product
    const newProduct = {
      name: 'Mozzarella',
      category: 'Cheese',
      price: 31.86,
    }
    const postResponse = await request.post('https://shop.tl-academy.ee/api/products/', {
      data: newProduct,
    })
    const createdProductBody = await postResponse.json()
    const productStatusCode = postResponse.status()
    const productId = createdProductBody.id
    console.log('POST response status:', productStatusCode)
    console.log('POST response body:', createdProductBody)
    expect(productStatusCode).toBe(StatusCodes.CREATED)
    //Change product
    const requestBody = {
      name: 'Suluguni',
    }
    const response = await request.put(`https://shop.tl-academy.ee/api/products/${productId}`, {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('PUT response status:', statusCode)
    console.log('PUT response body:', responseBody)
    expect(statusCode).toBe(400)
  })

  test('Change whole product using PUT command with not existing id should receive code 404', async ({request, }) => {
   //Get all products and the last one
    const allProductResponse = await request.get('https://shop.tl-academy.ee/api/products')
    const allProductBody= await allProductResponse.json()

    const maxProductId = Math.max(...allProductBody.map((product: { id: number }) => product.id))
    const nonExistingProductId = maxProductId + 1
    //Change product
    const requestBody = {
      name: 'Misha',
      category: 'People',
      price: 1000,
    }
    const response = await request.put(
      `https://shop.tl-academy.ee/api/products/${nonExistingProductId}`,
      {
        data: requestBody,
      },
    )
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(404)
  })
})

test.describe('PATCH /products/{id}', () => {
  //тест проходит, только почему-то категория становится пустой
  test('Changing one field using command PATCH should receive code 200', async ({ request }) => {
    //Create new product
    const newProduct = {
      name: 'BMW',
      category: 'Cars',
      price: 0,
    }
    const postResponse = await request.post('https://shop.tl-academy.ee/api/products/', {
      data: newProduct,
    })
    const createdProductBody = await postResponse.json()
    const productStatusCode = postResponse.status()
    const productId = createdProductBody.id
    console.log('POST response status:', productStatusCode)
    console.log('POST response body:', createdProductBody)
    expect(productStatusCode).toBe(StatusCodes.CREATED)
    //Change product
    const requestBody = {
      name: 'BMW e36',
    }
    const response = await request.patch(`https://shop.tl-academy.ee/api/products/${productId}`, {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('PATCH response status:', statusCode)
    console.log('PATCH response body:', responseBody)
    expect(statusCode).toBe(200)
    expect(typeof responseBody.name).toBe('string')
    expect(typeof responseBody.price).toBe('number')
    expect(typeof responseBody.category).toBe('string')
    expect(typeof responseBody.quantity).toBe('number')
    expect(typeof responseBody.available).toBe('boolean')
  })

  test('Changing all required fields using command PATCH should receive code 200', async ({request, }) => {
    //Create new product
    const newProduct = {
      name: 'Fanta',
      category: 'Drinks',
      price: 6453241546,
    }
    const postResponse = await request.post('https://shop.tl-academy.ee/api/products/', {
      data: newProduct,
    })
    const createdProductBody = await postResponse.json()
    const productStatusCode = postResponse.status()
    const productId = createdProductBody.id
    console.log('POST response status:', productStatusCode)
    console.log('POST response body:', createdProductBody)
    expect(productStatusCode).toBe(StatusCodes.CREATED)
    //Change product
    const requestBody = {
      name: 'Jaffa',
      category: 'Juice',
      price: 5,
    }
    const response = await request.patch(`https://shop.tl-academy.ee/api/products/${productId}`, {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('PATCH response status:', statusCode)
    console.log('PATCH response body:', responseBody)
    expect(statusCode).toBe(200)
    expect(typeof responseBody.name).toBe('string')
    expect(typeof responseBody.price).toBe('number')
    expect(typeof responseBody.category).toBe('string')
    expect(typeof responseBody.quantity).toBe('number')
    expect(typeof responseBody.available).toBe('boolean')
  })

  //баг, раз команда ничего не меняет, ничего и меняться не должно
  test.fail(
    'Using command PATCH with blank request body should receive code 400',
    async ({ request }) => {
      //Create new product
      const newProduct = {
        name: 'Apple',
        category: 'Iphone',
        price: 784,
      }
      const postResponse = await request.post('https://shop.tl-academy.ee/api/products/', {
        data: newProduct,
      })
      const createdProductBody = await postResponse.json()
      const productStatusCode = postResponse.status()
      const productId = createdProductBody.id
      console.log('POST response status:', productStatusCode)
      console.log('POST response body:', createdProductBody)
      expect(productStatusCode).toBe(StatusCodes.CREATED)
      //Change product
      const requestBody = {}
      const response = await request.patch(`https://shop.tl-academy.ee/api/products/${productId}`, {
        data: requestBody,
      })
      const responseBody = await response.json()
      const statusCode = response.status()
      console.log('PATCH response status:', statusCode)
      console.log('PATCH response body:', responseBody)
      expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
    },
  )

  test('Changing required field with invalid information using command PATCH should receive code 400', async ({request, }) => {
    //Create new product
    const newProduct = {
      name: 'Drumsticks',
      category: 'Tree',
      price: 0,
    }
    const postResponse = await request.post('https://shop.tl-academy.ee/api/products/', {
      data: newProduct,
    })
    const createdProductBody = await postResponse.json()
    const productStatusCode = postResponse.status()
    const productId = createdProductBody.id
    console.log('POST response status:', productStatusCode)
    console.log('POST response body:', createdProductBody)
    expect(productStatusCode).toBe(StatusCodes.CREATED)
    //Change product
    const requestBody = {
      name: 424,
    }
    const response = await request.patch(`https://shop.tl-academy.ee/api/products/${productId}`, {
      data: requestBody,
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('PATCH response status:', statusCode)
    console.log('PATCH response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

test.describe('DELETE /products/{id}', () => {
  test('Delete product with correct id should receive code 204', async ({ request }) => {
    //Create new product
    const newProduct = {
      name: 'Shampoo',
      category: 'Care',
      price: 0,
    }
    const postResponse = await request.post('https://shop.tl-academy.ee/api/products/', {
      data: newProduct,
    })
    const createdProductBody = await postResponse.json()
    const productStatusCode = postResponse.status()
    const productId = createdProductBody.id
    console.log('POST response status:', productStatusCode)
    console.log('POST response body:', createdProductBody)
    expect(productStatusCode).toBe(StatusCodes.CREATED)
    //Delete product
    const response = await request.delete(`https://shop.tl-academy.ee/api/products/${productId}`)
    const statusCode = response.status()
    console.log('DELETE response status:', statusCode)
    expect(statusCode).toBe(204)
  })

  test('Delete product with incorrect id should receive code 400', async ({ request }) => {
    const response = await request.delete('https://shop.tl-academy.ee/api/products/sadasdasd')
    const statusCode = response.status()
    console.log('DELETE response status:', statusCode)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  //бага, удаляет то, чего нет
  test.fail('Delete product with not existing id should receive code 404', async ({ request }) => {
    //Get all products and the last one
    const allProductResponse = await request.get('https://shop.tl-academy.ee/api/products')
    const allProductBody = await allProductResponse.json()

    const maxProductId = Math.max(...allProductBody.map((product: { id: number }) => product.id))
    const nonExistingProductId = maxProductId + 1
    //Change product
    const response = await request.delete(
      `https://shop.tl-academy.ee/api/products/${nonExistingProductId}`,
    )
    const statusCode = response.status()
    console.log('DELETE response status:', statusCode)
    expect(statusCode).toBe(StatusCodes.NOT_FOUND)
  })
})