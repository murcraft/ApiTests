'use strict'

const log4js = require('log4js')
const common = require('../../common.conf.js')
const SlackHelper = require('./slackHelper')

const logLevel = common.logLevel === undefined ? 'info' : common.logLevel
const isPostToSlack = common.isPostToSlack === undefined ? false : common.isPostToSlack

const LoggerHelper = log4js.getLogger('API')

log4js.configure({
  appenders: {
    out: {type: 'stdout', layout: {type: 'colored'}}
  },
  categories: {
    default: {appenders: ['out'], level: logLevel}
  }
})

class LoggerUtil {

  static Info (message, json) {
    if (json !== undefined) {
      let str = this.Stringify(json)
      message = `${message}\n${str}`
    }
    LoggerHelper.info(message)
  }

  static Debug (message, json) {
    if (json !== undefined) {
      let str = this.Stringify(json)
      message = `${message}\n${str}`
    }
    LoggerHelper.debug(message)
  }

  static Warn (message, json) {
    if (json !== undefined) {
      let str = this.Stringify(json)
      message = `${message}\n${str}`
    }
    LoggerHelper.warn(message)
  }

  static Error (message, json) {
    if (json !== undefined) {
      let str = this.Stringify(json)
      message = `${message}\n${str}`
    }
    LoggerHelper.error(message)
  }

  static Stringify (json) {
    return JSON.stringify(json, null, '    ')
  }

  static SaveRequest (request) {
    LoggerUtil.Debug(`Sent Request:\nUri: \nResource: ${request.resource}\nMethod: ${request.method}\nHeaders: ${this.Stringify(request.headers)}\nBody:`, request.data)
  }

  static SaveResponse (response) {
    LoggerUtil.Debug(`Got Response:`, response)
  }

  static Failed (result) {
    let fName = result.fullName
    let failures = Object.assign([], result.failedExpectations)
    failures.forEach(failure => {
        delete failure.matcherName
        delete failure.stack
        delete failure.passed
        delete failure.expected
        delete failure.actual
      }
    )
    let fExpStr = JSON.stringify(result.failedExpectations, null, '    ')
    let fExpStrSlack = result.failedExpectations.reduce((prev, current) => {
      prev += JSON.stringify(current, null, '    ') + '\n'
      return prev
    }, '')
    let consoleMessage = `Failed: ${fName}\n ${fExpStr}`
    let slackMessage = `\`Failed: ${fName}\`\n \`\`\`${fExpStrSlack}\`\`\``
    LoggerUtil.Error(consoleMessage)
    if (isPostToSlack === 'true') {
      LoggerHelper.debug(`Posting error into Slack`)
      SlackHelper.PostToSlack(slackMessage)
    }
  }
}

module.exports = LoggerUtil