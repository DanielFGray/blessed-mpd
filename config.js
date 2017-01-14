const fs = require('fs')
const Promise = require('bluebird')
const yaml = require('js-yaml')

const readFile = Promise.promisify(fs.readFile)

const defaults = {
  playlist: {
    default_fg: undefined,
    selected_bg: 'blue',
    selected_fg: 'black',
    playing_fg: 'green',
    playing_bg: undefined,
  },
}

const configDir = process.env.XDG_CONFIG_DIR || `${process.env.HOME}/.config`
const configFile = `${configDir}/blessed-mpd/conf.yaml`

/* eslint-disable no-console */
module.exports = Promise.try(() => readFile(configFile))
  .catch((e) => {
    if (e.cause.code !== 'ENOENT') console.log('error opening config file', e)
  })
  .then(data => yaml.load(data))
  .catch(e => console.log('error parsing config file', e))
  .then(e => Object.assign(defaults, e))
