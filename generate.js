module.exports = generate

var mkdirp = require('mkdirp')
  , tmp = require('tmp')
  , path = require('path')
  , fs = require('fs')
  , template = require('lodash.template')
  , glob = require('glob')
  , logga = require('logga')({ logLevel: process.env.LOG_LEVEL || 'info', timeOnly: true })

function generate(cwd, destinationPath, settings, cb) {

  var logger = logga.setContext(path.basename(cwd))

  logger.info('Destination', destinationPath)

  tmp.dir({ prefix: 'generator-' }, function (err, tmpPath) {
    if (err) return cb(err)
    logger.trace('Creating tmp path for generated files', tmpPath)
    writeFilesVerbatim(tmpPath)
    writeFilesFromTemplates(tmpPath, settings)
    mkdirp.sync(destinationPath)
    glob.sync('**/*', { cwd: tmpPath, dot: true }).forEach(writeFile.bind(null, tmpPath))
    cb(null)
  })

  function writeFilesVerbatim(tmpPath) {
    glob.sync('**/*', { cwd: cwd + '/source', dot: true }).forEach(function (filename) {
      var src = path.join(cwd + '/source', filename)
        , dest = path.join(tmpPath, filename)
      if (fs.statSync(src).isDirectory()) return mkdirp.sync(dest)
      fs.writeFileSync(dest, fs.readFileSync(src))
    })
  }

  function writeFilesFromTemplates(tmpPath, settings) {
    glob.sync('**/*', { cwd: cwd + '/templates', dot: true }).forEach(function (filename) {
      var dest = path.join(tmpPath, filename.replace(/\.tpl$/, ''))
        , src = path.join(cwd + '/templates', filename)
      if (fs.statSync(src).isDirectory()) return mkdirp.sync(dest)
      fs.writeFileSync(dest, template(fs.readFileSync(src))(settings))
    })
  }

  function writeFile(tmpPath, filename) {

    logger.debug('Path: "' + filename + '"')

    var src = path.join(tmpPath, filename)
      , dest = path.join(destinationPath, filename)

    try {

      if (fs.statSync(src).isDirectory()) {
        logger.debug('Is it a directory? Yes.')
        logger.info('Creating directory', filename)
        mkdirp.sync(dest)
        return
      }

      logger.debug('Is it a directory? No.')

      if (!fs.existsSync(dest)) {
        logger.debug('Does it exist already? No.')
        logger.info('Creating new file', filename)
        fs.writeFileSync(dest, fs.readFileSync(src))
        return
      }

      logger.debug('Does it exist already? Yes.')
      logger.warn('Overwriting ' + dest)
      fs.writeFileSync(dest, fs.readFileSync(src))

    } catch (e) {
      return cb(e)
    }

  }

}
