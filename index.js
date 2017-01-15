const mpd = require('mpd')
const Blessed = require('blessed')
const cfg = require('./config.js')
const playlistView = require('./playlist.js')
const { parseMpd } = require('./utils.js')

function main(config) {
  const client = mpd.connect({
    port: process.env.MPD_PORT || 6600,
    host: process.env.MPD_HOST || 'localhost',
  })

  const screen = Blessed.screen({
    fastCSR: true,
    useBCE: true,
    dockBorders: false,
    cursor: {
      artificial: true,
      blink: true,
      shape: 'block',
    },
    debug: true,
    log: './log.log',
  })

  const layout = Blessed.layout({
    width: '100%',
    height: '100%',
    layout: 'grid',
  })

  const progress = Blessed.progressbar({
    height: 1,
    width: '100%',
    value: 50,
    pch: config.progress.char,
    orientation: 'horizontal',
    style: {
      fg: config.progress.fg,
      bg: config.progress.bg,
    },
  })

  const header = Blessed.text({
    parent: layout,
    align: 'center',
    tags: true,
    width: '100%',
    // height: 2,
    style: {
      fg: 'white',
    },
  })

  const headerLine = Blessed.line({
    orientation: 'horizontal',
    style: {
      fg: 'white',
    },
  })

  const getCurrentSong = () => {
    client.sendCommand(mpd.cmd('currentsong', []), (err, msg) => {
      const song = parseMpd(msg).data[0]
      const lines = [
        `{center}${song.artist} - ${song.title}{/center}`,
        `{center}${song.album} (${song.date}){/center}`,
      ]
      header.setContent(lines.join('\n'))
      screen.render()
    })
  }

  client.on('ready', () => {
    getCurrentSong()
    layout.append(headerLine)
    // layout.append(playlistView(client, screen, config))
    layout.append(progress)
    screen.render()
  })

  screen.key([ 'q', 'C-c' ], () => process.exit(0))

  screen.key([ '>' ], () => client.sendCommand(mpd.cmd('next', [])))
  screen.key([ '<' ], () => client.sendCommand(mpd.cmd('previous', [])))
  screen.key([ 's' ], () => client.sendCommand(mpd.cmd('stop', [])))
  screen.key([ 'p' ], () => client.sendCommand(mpd.cmd('pause', [])))

  screen.append(layout)
}

cfg.then(c => main(c))
