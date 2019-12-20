'use strict'

let Client = require('request')
let CryptoJS = require('crypto-js')
const converter = require('xml2json')

const common = require('../common.conf.js')
const Logger = require('./utils/loggerHelper')

let portEnv = common.testEnv === 'production' ? '6103' : '6106'
let urlLog = `${common.baseUrl}:${portEnv}/rets/login`
let url = `${common.baseUrl}:${portEnv}/rets/getMetadata`
let user = common.testEnv === 'production'
  ? common.prodUser
  : common.stagingUser

const cookies = Client.jar()
Client.defaults({
  jar: true,
})

class GetMetadataHelper {

  static FormulateResponse (realm, method, nonce, nc, cnonce, qop) {
    let HA1 = CryptoJS.MD5(user.username + ':' + realm + ':' + user.pass).
      toString()
    let HA2 = CryptoJS.MD5(method + ':' + url).toString()
    let response = CryptoJS.MD5(HA1 + ':' +
      nonce + ':' +
      ('00000000' + nc).slice(-8) + ':' +
      cnonce + ':' +
      qop + ':' +
      HA2).toString()
    return response
  }

  static GenerateCnonce () {
    let characters = 'abcdef0123456789'
    let token = ''
    for (let i = 0; i < 16; i++) {
      let randNum = Math.round(Math.random() * characters.length)
      token += characters.substr(randNum, 1)
    }
    return token
  }

  static ParseAuthorizationValues (respHeaders) {
    respHeaders = respHeaders.split(', ')
    let authorizationParams = {}
    for (let i = 0; i < respHeaders.length; i++) {
      let equalIndex = respHeaders[i].indexOf('=')
      let keyValue = respHeaders[i].substring(0, equalIndex)
      let val = respHeaders[i].substring(equalIndex + 1)
      val = val.replace(/['"]+/g, '')
      // find realm
      if (keyValue.match(/realm/i) != null) {
        authorizationParams.realm = val.replace(/"/g, '')
      }
      // find nonce
      if (keyValue.match(/nonce/i) != null) {
        authorizationParams.nonce = val.replace(/"/g, '')
      }
      // find opaque
      if (keyValue.match(/opaque/i) != null) {
        authorizationParams.opaque = val.replace(/"/g, '')
      }
      // find QOP
      if (keyValue.match(/qop/i) != null) {
        authorizationParams.qop = val.replace(/"/g, '')
      }
    }
    return authorizationParams
  }

  static MakeAuthenticatedRequest (realm, nonce, opaque, qop, cnonce) {
    let response = GetMetadataHelper.FormulateResponse()
    let digestAuthHeader = 'Digest' + ' ' +
      'username="' + user.username + '", ' +
      'realm="' + realm + '", ' +
      'nonce="' + nonce + '", ' +
      'uri="' + url + '", ' +
      'response="' + response + '", ' +
      'opaque="' + opaque + '", ' +
      'qop=' + qop + ', ' +
      'nc="00000001", ' +// + self.nc).slice(-8)+', '+
      'algorithm="MD5", ' +
      'uri="/rets/getMetadata", ' +
      'cnonce="' + cnonce + '"'
    Logger.Debug(digestAuthHeader)
    return digestAuthHeader
  }

  static async AuthenticateUser () {
    return new Promise((resolve, reject) => {
      Client.post({
        url: urlLog,
        resolveWithFullResponse: true,
        auth: {
          user: user.username,
          pass: user.pass,
          sendImmediately: false,
        },
      }, (oError, oResponse, sBody) => {
        if (oError) {
          Logger.Error(`Error. Response:`, oError)
          reject(oError)
        }
        let respHeaders = oResponse.request.headers.authorization
        let authorKeys = GetMetadataHelper.ParseAuthorizationValues(respHeaders)
        let prevCooki = oResponse.headers['set-cookie']
        cookies.setCookie(prevCooki[0], url)
        console.log('Login cookie', prevCooki)
        Logger.Debug('Success authorization: ', oResponse.headers)
        resolve({authorKeys: authorKeys, cookie: cookies})
      })
    })
  }

  static SleepTimer (milliseconds) {
    let start = new Date().getTime()
    console.log('Start time: ', start)
    for (let i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds) {
        console.log('End time: ', new Date().getTime())
        break
      }
    }
  }

  static async GetMetadataByParams2 (paramsObj, authorizationParams, cookies) {
    let cnonce = GetMetadataHelper.GenerateCnonce()
    Logger.Debug('Post request with parameters: ', paramsObj)
    return new Promise((resolve, reject) => {
      Client.post({
        url: url,
        resolveWithFullResponse: true,
        jar: cookies,
        auth: {
          user: user.username,
          pass: user.pass,
          sendImmediately: false,
        },
        headers: {
          sendImmediately: false,
          'Content-Type': 'application/x-www-form-urlencoded',
          authorization: GetMetadataHelper.MakeAuthenticatedRequest(
            authorizationParams.realm, authorizationParams.nonce,
            authorizationParams.opaque, authorizationParams.qop, cnonce),
        },
        form: {
          Type: paramsObj.type,
          Format: paramsObj.format,
          ID: paramsObj.id,
        },
      }, (oError, oResponse, sBody) => {
        if (oError) {
          reject(oError)
        }
        Logger.Debug('METADATA response:\n', oResponse.request)
        resolve(sBody)
      })
    })
  }

  static async GetMetadataByParams (paramsObj, authorizationParams, cookies) {
    GetMetadataHelper.SleepTimer(5000)
    let cnonce = GetMetadataHelper.GenerateCnonce()
    Logger.Debug('Post request with parameters: ', paramsObj)
    return await Client.post({
      url: url,
      resolveWithFullResponse: true,
      jar: cookies,
      auth: {
        user: user.username,
        pass: user.pass,
        sendImmediately: false,
      },
      headers: {
        sendImmediately: false,
        'Content-Type': 'application/x-www-form-urlencoded',
        authorization: GetMetadataHelper.MakeAuthenticatedRequest(
          authorizationParams.realm, authorizationParams.nonce,
          authorizationParams.opaque, authorizationParams.qop, cnonce),
      },
      form: {
        Type: paramsObj.type,
        Format: paramsObj.format,
        ID: paramsObj.id,
      },
    }).then(async (response) => {
      Logger.Debug('METADATA response:\n', response)
      return await response.body
    }).catch(async (err) => {
      Logger.Error(`Error. Response:`, err)
    })
  }

  static async GetJsonFromResponse (responseData, isSilent = true) {
    let responseJson = converter.toJson(responseData)
    if (!isSilent) {
      Logger.Debug(`Response is:\n${responseJson}`)
    }
    return responseJson
  }
}

module.exports = GetMetadataHelper