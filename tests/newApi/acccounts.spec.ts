import { StatusCodes } from 'http-status-codes'
import { expect, test } from '@playwright/test'
import { AccountDTO } from '../../dto/AccountDTO'

const baseUrl = 'https://shop.tl-academy.ee'
const authHeader = {
  'X-API-KEY': 'my-api-key',
}

// interface CreatedAccountResp {
//   id: number,
//   owner: string,
//   currency: string,
//   balance: number,
//   createdAt: string
// }ßß

type CreatedAccountResp = {
  id: number
  owner: string
  currency: string
  balance: number
  createdAt: string
}

type CreatedAccountErrorResp = {
  error: string
}

test.describe('POST /api/accounts', () => {
  test('TL-11-1 POST /api/accounts with valid data without currency', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })
    const respBody: CreatedAccountResp = await response.json()
    console.log(respBody)
    expect(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect(response.status()).toBe(StatusCodes.CREATED)
    expect(respBody.owner).toBe(account.owner)
  })

  const currencies = ['USD', 'EUR', 'GBP']

  test(`TL-11-2 POST /api/accounts with valid data and all supported currencies: ${currencies}`, async ({ request, }) => {
    for (const currency of currencies) {
      const account = new AccountDTO('Test Owner', currency)
      const response = await request.post(baseUrl + '/api/accounts', {
        headers: authHeader,
        data: account,
      })
      const respBody: CreatedAccountResp = await response.json()
      console.log(respBody)
      expect.soft(response.status(), `Tested ${currency} currency`).not.toBe(StatusCodes.FORBIDDEN)
      expect.soft(response.status(), `Tested ${currency} currency`).toBe(StatusCodes.CREATED)
      expect.soft(respBody.owner, `Tested ${currency} currency`).toBe(account.owner)
      expect.soft(respBody.currency, `Tested ${currency} currency`).toBe(account.currency)
    }
  })
})

test.describe('POST /api/accounts negative tests', () => {
  test('TL-11-3 POST /api/accounts with invalid data', async ({ request }) => {
    const account = new AccountDTO('Test Owner', 'PLN')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })

    const respBody: CreatedAccountErrorResp = await response.json()
    console.log(respBody)
    expect.soft(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect.soft(response.status()).toBe(StatusCodes.BAD_REQUEST)
    expect.soft(respBody.error).not.toBeUndefined()
    expect.soft(respBody.error.length).toBeGreaterThan(0)
  })

  test('TL-11-4 POST /api/accounts without authHeader should receive code 401', async ({ request }) => {
    const account = new AccountDTO('Test Owner', 'EUR')
    const response = await request.post(baseUrl + '/api/accounts', {
      data: account,
    })
    const respBody: CreatedAccountErrorResp = await response.json()
    console.log(respBody)
    expect.soft(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect.soft(response.status()).toBe(401)
  })

  test('TL-11-5 POST /api/accounts with invalid authHeader should receive code 401', async ({ request, }) => {
    const authHeaderInvalid = {
      'X-API-KEY': 'my-api-key2',
    }
    const account = new AccountDTO('Test Owner', 'EUR')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeaderInvalid,
      data: account,
    })
    const respBody: CreatedAccountErrorResp = await response.json()
    console.log(respBody)
    expect.soft(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect.soft(response.status()).toBe(401)
  })
})

test.describe('GET /api/accounts', () => {
  test('TL-11-6 Get full list of accounts and receive code 200', async ({ request }) => {
    const response = await request.get(baseUrl + '/api/accounts', {
      headers: authHeader,
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('Full list of accounts:', responseBody)
    expect(statusCode).toBe(StatusCodes.OK)
  })

  test('TL-11-7 Get full list of accounts without authHeader should receive code 401', async ({ request }) => {
    const response = await request.get(baseUrl + '/api/accounts', {})
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('Full list of accounts:', responseBody)
    expect(statusCode).toBe(401)
  })

  test('TL-11-8 Get full list of accounts with invalid authHeader should receive code 401', async ({ request, }) => {
    const authHeaderInvalid = {
      'X-API-KEY': 'my-api-key2',
    }
    const response = await request.get(baseUrl + '/api/accounts', {
      headers: authHeaderInvalid,
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('Full list of accounts:', responseBody)
    expect(statusCode).toBe(401)
  })
})

test.describe('GET /api/accounts/{id}', () => {
  test('TL-11-9 Get account with correct id should receive code 200', async ({ request }) => {
    const response = await request.get(baseUrl + '/api/accounts/1', {
      headers: authHeader,
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('Account:', responseBody)
    expect(statusCode).toBe(StatusCodes.OK)
  })

  test('TL-11-10 Get account with invalid id should receive code 400', async ({ request }) => {
    const response = await request.get(baseUrl + '/api/accounts/-5', {
      headers: authHeader,
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log(responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-11 Get account with not existing id should receive code 400', async ({ request }) => {
    const nonExistingId = Math.floor(Math.random() * 1000) + 1000
    const response = await request.get(baseUrl + `/api/accounts/${nonExistingId}`, {
      headers: authHeader,
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log(`Account with id ${nonExistingId} not exist.`, responseBody)
    expect(statusCode).toBe(StatusCodes.NOT_FOUND)
  })
})

test.describe('POST /api/accounts/{id}/deposit', () => {
  test('TL-11-12 Deposit valid amount to the account should receive code 200', async ({ request }) => {
    const amount: number = 100
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: {amount: amount},
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log('Deposit was successful. ', responseBody)
    expect(statusCode).toBe(StatusCodes.OK)
  })

  test('TL-11-13 Deposit 0 to the account should receive code 400', async ({
    request,
  }) => {
    const amount: number = 0
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: { amount: amount },
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log(responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-14 Deposit amount with invalid data to the account should receive code 400', async ({ request }) => {
    const amount = 'hjgjgjh'
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: { amount: amount },
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log(responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-15 Deposit amount with more than 2 decimal places to the account should receive code 400', async ({
    request,
  }) => {
    const amount: number = 1.45456
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: { amount: amount },
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log(responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-16 Deposit correct amount to not existing account should receive code 404', async ({ request, }) => {
    const amount: number = 100
    const nonExistingId = Math.floor(Math.random() * 1000) + 1000
    const response = await request.post(baseUrl + `/api/accounts/${nonExistingId}/deposit`, {
      headers: authHeader,
      data: { amount: amount },
    })
    const responseBody = await response.json()
    const statusCode = response.status()
    console.log(`Account with id ${nonExistingId} not exist. Deposit is unavailable`, responseBody)
    expect(statusCode).toBe(StatusCodes.NOT_FOUND)
  })
})