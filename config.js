const fs = require('fs')
const Promise = require('bluebird')
const yaml = require('js-yaml')
const utils = require('./utils.js')

const readFile = Promise.promisify(fs.readFile)

const defaults = {
  playlist: {
    default_fg: undefined,
    selected_bg: 'blue',
    selected_fg: 'black',
    playing_fg: 'green',
    playing_bg: undefined,
    format: '{green-fg}%artist%{/green-fg} / {red-fg}(%date%) %album%{/red-fg} / {blue-fg}%track% - %title%{/blue-fg}',
    border: undefined,
    border_color: 'brightblack',
  },
  scrollbar: {
    fg: 'brightblack',
    bg: undefined,
    char: '░',
  },
  progress: {
    char: '░',
    position: 'bottom',
    fg: undefined,
    bg: 'black',
  },
}

const configDir = process.env.XDG_CONFIG_DIR || `${process.env.HOME}/.config`
const configFile = `${configDir}/blessed-mpd/conf.yaml`

/* eslint-disable no-console */
module.exports = Promise.try(() => readFile(configFile))
  .catch((e) => {
    if (e.code !== 'ENOENT') console.log('error opening config file:\n', e)
  })
  .then(data => yaml.load(data))
  .catch(e => console.log('error parsing config file:\n', e.message))
  .then(e => utils.mergeDeep(defaults, e))
