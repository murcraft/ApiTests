'use strict'

const fs = require('fs')
const path = require('path')
const AllureReporter = require('jasmine-allure-reporter')

const common = require('../../common.conf.js')
const Logger = require('./loggerHelper')

let isCleanAllure = common.isCleanAllure === undefined ? 'false' : common.isCleanAllure.toLowerCase()

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000

jasmine.getEnv().addReporter(new AllureReporter({
  resultsDir: 'allure-results'
}))

if (isCleanAllure === 'true') {
  let pathAllure = 'allure-results'
  if (fs.existsSync(pathAllure)) {
    fs.readdirSync(pathAllure).forEach((file) => {
      let curPath = path.resolve(pathAllure, file)
      fs.unlinkSync(curPath)
    })
  }
}

jasmine.getEnv().addReporter(new function () {
  this.jasmineStarted = function (summary) {
    global.showColors = true
    global.TOTAL = summary.totalSpecsDefined
    global.PASSED = 0
    global.FAILED = 0
    global.SKIPPED = 0
    Logger.Info(`>>>>>>>>>>Tests started. Total tests: ${TOTAL}<<<<<<<<<<`)
  }
  this.suiteStarted = result => {
    Logger.Info(`**************************************************`)
    Logger.Info(`Suite started: ${result.fullName}`)
    Logger.Info(`**************************************************`)
    global.SuiteDescribe = result.fullName
  }
  this.specStarted = result => {
    Logger.Info(`Spec started: ${result.description}`)
  }
  this.specDone = function (result) {
    if (result.status === 'failed') {
      FAILED++
      Logger.Failed(result)
    }
    if (result.status === 'passed') {
      PASSED++
    }
    if (result.status === 'disabled' || result.status === 'pending') {
      SKIPPED++
    }
  }
  this.jasmineDone = () => {
    Logger.Info(`**************************************************`)
    Logger.Info(`${PASSED + FAILED + SKIPPED} of ${TOTAL} tests done`)
    Logger.Info(`Passed: ${PASSED}`)
    Logger.Info(`Failed: ${FAILED}`)
    Logger.Info(`Skipped: ${SKIPPED}`)
    Logger.Info(`**************************************************`)
  }
})