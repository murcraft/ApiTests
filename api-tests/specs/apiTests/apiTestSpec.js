'use strict'

let GetMetadataHelper = require('../../helpers/getMetadataHelper')

let dataTest = require('../testData/validParamsData.json')
let authorizationResponse
let response

describe('Compare METADATA for RETs - PLS: ', () => {
/*  beforeAll(async () => {
    authorizationResponse = await GetMetadataHelper.AuthenticateUser()
  })*/

  it(`Get response with param `, async () => {
    authorizationResponse = await GetMetadataHelper.AuthenticateUser()
    console.log('Respone:', authorizationResponse)
    let a = await GetMetadataHelper.GetMetadataByParams2(dataTest[0], authorizationResponse.authorKeys, authorizationResponse.cookie1)
    // let a1 = await GetMetadataHelper.GetMetadataByParams2(dataTest[1], authorizationResponse.authorKeys, authorizationResponse.cookie1)
    // console.log('a ++++++\n', a)
    // console.log('a1 ++++++\n',a1)
  })
  it(`Get response with param `, async () => {
    authorizationResponse = await GetMetadataHelper.AuthenticateUser()
    console.log('Respone:', authorizationResponse)
    let a = await GetMetadataHelper.GetMetadataByParams2(dataTest[1], authorizationResponse.authorKeys, authorizationResponse.cookie1)
    // let a1 = await GetMetadataHelper.GetMetadataByParams2(dataTest[1], authorizationResponse.authorKeys, authorizationResponse.cookie1)
    // console.log('a ++++++\n', a)
    // console.log('a1 ++++++\n',a1)
  })
  it(`Get response with param `, async () => {
    authorizationResponse = await GetMetadataHelper.AuthenticateUser()
    console.log('Respone:', authorizationResponse)
    let a = await GetMetadataHelper.GetMetadataByParams2(dataTest[1], authorizationResponse.authorKeys, authorizationResponse.cookie1)
    // let a1 = await GetMetadataHelper.GetMetadataByParams2(dataTest[1], authorizationResponse.authorKeys, authorizationResponse.cookie1)
    // console.log('a ++++++\n', a)
    // console.log('a1 ++++++\n',a1)
  })
  /*
  /*
    dataTest.map(data => {
      it(`Get response with parameters: type=${data.type} id=${data.id}: `, async () => {

        response = await GetMetadataHelper.GetMetadataByParams(data, authorizationResponse.authorKeys, authorizationResponse.cookie1)
        await expect(response).not.toBe(undefined, 'Response in undefined')

        let stringResponse = await GetMetadataHelper.GetJsonFromResponse(response)
        stringResponse = stringResponse.replace(/\\n/g, '').replace(/\\t/g, '')
        let arrayResponse = stringResponse.split('\n')
        for (let i = 0; i < arrayResponse.length; i++) {
          if(i <1000) {
            await expect(arrayResponse[i]).not.toEqual(undefined, `Value ${arrayResponse[i]} is undefined`)
            console.log('+++++ TEST COMPLETED');
          }
        }
      })
    })*/

}, 20000000)
