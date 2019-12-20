'use strict'

const Slack = require('slack-node')
const common = require('../../common.conf.js')
const LoggerHelper = require('./loggerHelper')

const webhookUri = common.slackWebHookStage
const slackChannel = common.slackChannelStage
const isPostToSlack = common.isPostToSlack === undefined ? 'false' : common.isPostToSlack
const username = common.slackUsername

let slack = new Slack()
slack.setWebhook(webhookUri)

class SlackHelper {

  static PostToSlack (message) {
    if (isPostToSlack === 'true') {
      console.log('Slack ', message)
      slack.webhook({
        channel: slackChannel,
        username: username,
        icon_emoji: ':ghost:',
        text: 'API: ' + message
      }, (err) => {
        if (err !== null) {
          LoggerHelper.Debug(err)
        }
      })
    }
  }
}

module.exports = SlackHelper