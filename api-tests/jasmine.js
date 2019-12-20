'use strict'

const Jasmine = require('jasmine')
const specsFolder = require('path').resolve(__dirname, './specs')

let jasmine = new Jasmine()

jasmine.loadConfig({
  'spec_dir': specsFolder,
  'spec_files': [
    specsFolder + '/apiTests/*.js'
  ],
  'helpers': [
    '/helpers/*.js'
  ],
  'stopSpecOnExpectationFailure': false,
  'random': false
})

jasmine.execute()