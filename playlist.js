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
    scrollbar: {
      ch: config.scrollbar.char,
    },
    mouse: true,
    invertSelected: true,
    label: ' Playlist ',
    border: config.playlist.border,
    style: {
      fg: config.playlist.default_fg,
      border: {
        fg: config.playlist.border_color,
      },
      selected: {
        bg: config.playlist.selected_bg,
        fg: config.playlist.selected_fg,
      },
      scrollbar: {
        fg: config.scrollbar.fg,
        bg: config.scrollbar.bg,
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
        .map(e => config.playlist.format
          .replace(/%([^\s%]+)%/g, (_, match) => // eslint-disable-line no-confusing-arrow
            ! match ? '%' : match in e ? e[match] : match)) // eslint-disable-line no-nested-ternary
      playlist.setItems(items)
      screen.render()
    })
  }

  playlist.on('select', (e, i) => client.sendCommand(mpd.cmd('play', [ i ])))

  updatePlaylist()
  screen.prepend(playlist)
  playlist.focus()
  return playlist
}

module.exports = playlistView
