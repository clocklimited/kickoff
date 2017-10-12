module.exports = Generator

var inquirer = require('inquirer')

function Generator() {}

Generator.prototype.prompts = []
Generator.prototype.settings = {}

Generator.prototype.createConfig = function (userInput) {
  return userInput
}

Generator.prototype.generate = function (dest, cb) {
  inquirer.prompt(this.prompts).then(function (userInput) {
    this._generate(dest, this.createConfig(userInput), cb)
  }.bind(this))
}

Generator.prototype._generate = function () {
  throw new Error('Generator must implement the _generate(dest, settings, cb) method')
}
