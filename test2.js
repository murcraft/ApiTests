'use strict'
let request = require('request')
let CryptoJS = require('crypto-js')

console.log('Call')
let user = {
  username: 'perch659',
  pass: 'buy249jkv035'
}
let urlLog = 'http://rebny-web1.stratusdata.com:6103/rets/login'
let url = 'http://rebny-web1.stratusdata.com:6103/rets/getMetadata'

// const cookies = request.jar()
// request.defaults({
//   jar: true
// })

let formulateResponse = function (realm, method, nonce, nc, cnonce, qop) {
  let HA1 = CryptoJS.MD5(user.username+':'+realm+':'+user.pass).toString()
  let HA2 = CryptoJS.MD5(method+':'+url).toString()
  let response = CryptoJS.MD5(HA1+':'+
    nonce+':'+
    ('00000000' + nc).slice(-8)+':'+
    cnonce+':'+
    qop+':'+
    HA2).toString()
  return response
}
// generate 16 char client nonce
let generateCnonce = function() {
  let characters = 'abcdef0123456789'
  let token = ''
  for (let i = 0; i < 16; i++) {
    let randNum = Math.round(Math.random() * characters.length)
    token += characters.substr(randNum, 1)
  }
  return token
}

let parseAuthValues = function(respHeaders) {
  respHeaders = respHeaders.split(', ')
  console.log(respHeaders)
  let authorKeys = {}
  for (let i = 0; i < respHeaders.length; i++) {

    let equalIndex = respHeaders[i].indexOf('=')
    let keyValue = respHeaders[i].substring(0, equalIndex)
    let key = respHeaders[i].substring(respHeaders[i].length - 1, equalIndex)
    let val = respHeaders[i].substring(equalIndex + 1)
    val = val.replace(/['"]+/g, '')
    // find realm

    if (keyValue.match(/realm/i) != null) {
      authorKeys.realm = val.replace(/"/g, '')
    }
    // find nonce

    if (keyValue.match(/nonce/i) != null) {
      authorKeys.nonce = val.replace(/"/g, '')
    }
    // find opaque

    if (keyValue.match(/opaque/i) != null) {
      authorKeys.opaque = val.replace(/"/g, '')
    }
    // find QOP

    if (keyValue.match(/qop/i) != null) {
      authorKeys.qop = val.replace(/"/g, '')
    }
  }
  return authorKeys
}

let makeAuthenticatedReques = function(realm, nonce, opaque, qop, cnonce) {
  let response = formulateResponse()
  let digestAuthHeader = 'Digest'+' '+
    'username="'+user.username+'", '+
    'realm="'+realm+'", '+
    'nonce="'+nonce+'", '+
    'uri="'+url+'", '+
    'response="'+response+'", '+
    'opaque="'+opaque+'", '+
    'qop='+qop+', '+
    'nc="00000001", ' +// + self.nc).slice(-8)+', '+
    'algorithm="MD5", '+
    'uri="/rets/getMetadata", '+
    'cnonce="'+cnonce+'"'
  console.log(digestAuthHeader, 'digest header')
  return digestAuthHeader
}

request.post({
  jar: true,
  url: urlLog,
  auth: {
    user: user.username,
    pass: user.pass,
    sendImmediately: false
  },
  form: {
    Type: 'METADATA-TABLE',
    Format: 'STANDARD-XML',
    ID: '0'
  }
}, ( oError , oResponse , sBody) => {
  console.log(JSON.stringify(oResponse), 'Login response')
  console.log(oResponse.request.headers, 'Response headers')
  // let respHeaders = oResponse.request.headers.authorization
  // let authorKeys = parseAuthValues(respHeaders)
  // client generated keys
  // let cnonce = generateCnonce()
  // let prevCooki = oResponse.headers['set-cookie']
  // cookies.setCookie(prevCooki[0], url)
  // request.post({
  //   url: url,
  //   jar: true,
  //   auth: {
  //     user: user.username,
  //     pass: user.pass,
  //     sendImmediately: false
  //   },
  //   headers: {
  //     'content-type': 'application/x-www-form-urlencoded',
  //     'Authorization': makeAuthenticatedReques(authorKeys.realm, authorKeys.nonce, authorKeys.opaque, authorKeys.qop, cnonce)
  //   },
  //   form: {
  //     Type: 'METADATA-SYSTEM',
  //     Format: 'STANDARD-XML',
  //     ID: '0'
  //   }
  // }, ( oError , oResponse , sBody) => {
  //   console.log(JSON.stringify(oResponse))
  //   request.post({
  //     url: url,
  //     jar: true,
  //     auth: {
  //       user: user.username,
  //       pass: user.pass,
  //       sendImmediately: false
  //     },
  //     headers: {
  //       'content-type': 'application/x-www-form-urlencoded',
  //       'Authorization': makeAuthenticatedReques(authorKeys.realm, authorKeys.nonce, authorKeys.opaque, authorKeys.qop, cnonce)
  //     },
  //     form: {
  //       Type: 'METADATA-SYSTEM',
  //       Format: 'STANDARD-XML',
  //       ID: '0'
  //     }
  //   }, ( oError , oResponse , sBody) => {
  //     console.log(JSON.stringify(oResponse))
  //     // console.log(JSON.stringify(sBody))
  //   })
  //   // console.log(JSON.stringify(sBody))
  // })
})
