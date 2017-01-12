const mpd = require('mpd')
const Blessed = require('blessed')
Blessed.contrib = require('blessed-contrib')

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
    shape: 'underline',
  },
  debug: true,
  dockBorders: true,
})

screen.key([ 'q', 'C-c' ], () => process.exit(0));

const playlist = Blessed.list({
  align: 'left',
  keys: true,
  // tags: true,
  vi: true,
  clickable: true,
  scrollable: true,
  mouse: true,
  style: {
    selected: {
      bg: 'blue',
      fg: 'black',
    },
  },
  width: '100%',
  height: '100%',
});

client.on('ready', () => {
  client.sendCommand(mpd.cmd('playlist', []), (err, msg) => {
    if (err) throw err
    const songs = msg.split('\n')
      .filter(e => e.length > 0)
      .map(e => e.slice(e.indexOf(' ') + 1))
   // .map(id3 tags, user formatting, etc)

    playlist.setItems(songs)
  })
})

playlist.focus()

screen.append(playlist)

screen.render()
