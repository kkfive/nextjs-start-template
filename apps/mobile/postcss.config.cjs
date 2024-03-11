const postcssConfig = require('@kkproject/configs/tailwind/postcss.config.cjs')

postcssConfig.plugins['postcss-pxtorem'] = {
  rootValue: 32,
  propList: ['*', '!font*', '!--adm*'],
}
module.exports = postcssConfig
