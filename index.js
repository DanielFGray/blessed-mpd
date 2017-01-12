const mpd = require('mpd')
const Blessed = require('blessed')

function playlistView(client, screen) {
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
  })

  client.sendCommand(mpd.cmd('playlist', []), (err, msg) => {
    if (err) throw err
    const songs = msg.split('\n')
      .filter(e => e.length > 0)
      .map(e => e.slice(e.indexOf(' ') + 1))

    playlist.setItems(songs)
  })

  screen.append(playlist)
  playlist.focus()
  screen.render()
}

function main() {
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

  client.on('ready', () => {
    playlistView(client, screen)
  })

  screen.key([ 'q', 'C-c' ], () => {
    process.exit(0)
  })

  screen.render()
}

main()
