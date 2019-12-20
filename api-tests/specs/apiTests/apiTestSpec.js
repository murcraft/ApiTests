'use strict'

let GetMetadataHelper = require('../../helpers/getMetadataHelper')

let dataTest = require('../testData/validParamsData.json')
let authorizationResponse
let response

describe('Compare METADATA for RETs - PLS: ', () => {

  beforeAll(async () => {
    authorizationResponse = await GetMetadataHelper.AuthenticateUser()
  })

  dataTest.map(data => {
    it(`Get response with parameters: type=${data.type} id=${data.id}: `, async () => {
      response = await GetMetadataHelper.GetMetadataByParams(data, authorizationResponse.authorKeys, authorizationResponse.cookie)
      await expect(response).not.toBe(undefined, 'Response in undefined')

      let stringResponse = await GetMetadataHelper.GetJsonFromResponse(response)
      stringResponse = stringResponse.replace(/\\n/g, '').replace(/\\t/g, '')
      let arrayResponse = stringResponse.split(',')
      for (let i = 0; i < arrayResponse.length; i++) {
        if(i <1000) {
          await expect(arrayResponse[i]).not.toEqual(undefined, `Value ${arrayResponse[i]} is undefined`)
          console.log('+++++ TEST COMPLETED');
        }
      }
    })
  })

}, 20000000)
