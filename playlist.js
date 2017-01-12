const mpd = require('mpd')
const Blessed = require('blessed')

function playlistView(client, screen, config) {
  const playlist = Blessed.list({
    align: 'left',
    keys: true,
    // tags: true,
    vi: true,
    clickable: true,
    scrollable: true,
    mouse: true,
    style: {
      fg: config.playlist.default_fg,
      selected: {
        bg: config.playlist.selected_bg,
        fg: config.playlist.selected_fg,
      },
    },
    width: '100%',
    height: '100%',
  })

  const updatePlaylist = () =>
    client.sendCommand(mpd.cmd('playlist', []), (err, msg) => {
      if (err) throw err
      const songs = msg.split('\n')
        .filter(e => e.length > 0)
        .map(e => e.slice(e.indexOf(' ') + 1))
      playlist.setItems(songs)
    })

  client.on('playlist', updatePlaylist)
  playlist.on('select', (e, i) => {
    client.sendCommand(mpd.cmd('play', [ i ]))
  })

  updatePlaylist()
  screen.append(playlist)
  playlist.focus()
  screen.render()
}

module.exports = playlistView
