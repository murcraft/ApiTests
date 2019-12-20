let path = require('path')

module.exports = {
  baseUrl: `http://rebny-web1.stratusdata.com`,
  stagingUser: {
    username: 'perch659',
    pass: 't-buy249jkv035'
  },
  prodUser: {
    username: 'perch659',
    pass: 'buy249jkv035'
  },

  logsPath: path.resolve(__dirname, './logs'),

  slackWebHookStage: 'https://hooks.slack.com/services/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',
  slackChannelStage: '#slacktest',
  slackUsername: 'ogulikpuse',

  testEnv: process.env.env,
  logLevel: process.env.logLevel,
  isPostToSlack: process.env.isPostToSlack,
  isCleanAllure: process.env.isCleanAllure,
  isExecutedInGlobal: process.env.isExecutedInGlobal,
}