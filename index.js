const mpd = require('mpd')
const Blessed = require('blessed')

const cfg = require('./config.js')
const playlistView = require('./playlist.js')

function main(config) {
  const client = mpd.connect({
    port: process.env.MPD_PORT || 6600,
    host: process.env.MPD_HOST || 'localhost',
  })

  const screen = Blessed.screen({
    fastCSR: true,
    useBCE: true,
    cursor: {
      artificial: true,
      blink: true,
      shape: 'block',
    },
    debug: true,
    dockBorders: true,
  })

  client.on('ready', () => playlistView(client, screen, config))

  screen.key([ 'q', 'C-c' ], () => process.exit(0))

  screen.key([ '>' ], () => client.sendCommand(mpd.cmd('next', [])))
  screen.key([ '<' ], () => client.sendCommand(mpd.cmd('previous', [])))
  screen.key([ 's' ], () => client.sendCommand(mpd.cmd('stop', [])))
  screen.key([ 'p' ], () => client.sendCommand(mpd.cmd('pause', [])))

  screen.render()
}

cfg.then(c => main(c))
