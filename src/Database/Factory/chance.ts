'use strict'
import _ = require('lodash')
const chance = require('chance').Chance()

/**
 * Adding custom mixins
 */
chance.mixin({
  username: function (length) {
    length = length || 5
    return chance.word({ length })
  },

  password: function (length) {
    length = length || 20
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return _.map(_.range(length), () => {
      return charset.charAt(Math.floor(Math.random() * charset.length))
    }).join('')
  },

})

export { chance }
