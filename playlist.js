const mpd = require('mpd')
const Blessed = require('blessed')
const { parseMpd } = require('./utils.js')

function playlistView(client, screen, config) {
  let playlistData = []
  const playlist = Blessed.list({
    align: 'left',
    keys: true,
    tags: true,
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

  const updatePlaylist = () => {
    client.sendCommand(mpd.cmd('playlistinfo', []), (err, msg) => {
      if (err) throw err
      playlistData = parseMpd(msg).data
      const items = playlistData
        .map(e => `${e.artist} - ${e.album} - ${e.title} `)
      playlist.setItems(items)
    })
  }

  client.on('playlist', () => updatePlaylist())

  playlist.on('select', (e, i) => {
    client.sendCommand(mpd.cmd('play', [ i ]))
  })

  updatePlaylist()
  screen.append(playlist)
  playlist.focus()
  screen.render()
}

module.exports = playlistView
