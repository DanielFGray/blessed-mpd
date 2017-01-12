const mpd = require('mpd')
const Blessed = require('blessed')
Blessed.contrib = require('blessed-contrib')

const client = mpd.connect({
  port: process.env.MPD_PORT || 6600,
  host: process.env.MPD_HOST || 'localhost',
})

const screen = Blessed.screen({
  // Example of optional settings:
  smartCSR: true,
  useBCE: true,
  cursor: {
    artificial: true,
    blink: true,
    shape: 'underline',
  },
  debug: true,
  dockBorders: true,
})

screen.key([ 'q', 'C-c' ], () => process.exit(0));

const table = Blessed.contrib.table({
  keys: true,
  fg: 'brightwhite',
  selectedFg: 'black',
  selectedBg: 'blue',
  interactive: true,
  label: 'Playlist',
  width: '100%',
  height: '100%',
  border: { type: 'line', fg: 'cyan' },
  columnSpacing: 1,
  columnWidth: [ 100000 ],
})

client.on('ready', () => {
  client.sendCommand(mpd.cmd('playlist', []), (err, msg) => {
    if (err) throw err
    const songs = msg.split('\n')
      .filter(e => e.length > 0)
      .map(e => e.slice(e.indexOf(' ') + 1))

    table.setData({
      headers: [ 'Path' ],
      data: songs.map(e => [ e ]),
    })
  })
})

table.focus()

screen.append(table)

screen.render()
