module.exports = run

function run(Generator) {

  if (!process.argv[2]) return console.log('Usage: generate [path]')

  var path = require('path')
    , g = new Generator()
    , targetPath = path.resolve(process.cwd(), process.argv[2])

  g.generate(targetPath, function (err) {
    if (err) return console.log(err.message, err)
  })

}
