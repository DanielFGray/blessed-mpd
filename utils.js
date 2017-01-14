function isObject(item) {
  return (item && typeof item === 'object' && ! Array.isArray(item) && item !== null)
}

function mergeDeep(target, source) {
  const output = Object.assign({}, target)
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (! (key in target)) Object.assign(output, { [key]: source[key] })
        else output[key] = mergeDeep(target[key], source[key])
      } else Object.assign(output, { [key]: source[key] })
    })
  }
  return output
}

function parseMpd(data) {
  const lines = data.split('\n')
    .filter(l => l.length > 0)
  const files = {}
  const response = { data: [], status: false }
  response.raw = lines

  for (let i = 0, currentFile = null; i < lines.length; ++i) {
    const line = lines[i]

    if (line.substr(0, 3) === 'ACK') {
      response.status = false
      return response
    } else if (line.substr(0, 6) === 'OK MPD') {
      response.status = true
    }

    const key = line.substr(0, line.indexOf(':')).toLowerCase()
    let value = line.substr((line.indexOf(':')) + 1)
      .replace(/^\s+|\s+$/g, '')

    if (value.match(/^\d+$/)) value = Number(value)
    if (key === 'last-modified') value = new Date(value)

    if (key === 'file') {
      currentFile = value
      files[currentFile] = { file: value }
    }
    if (currentFile) {
      files[currentFile][key] = value
    } else {
      response.data.push({ [key]: value })
    }
  }
  Object.keys(files)
    .forEach(e => response.data.push(files[e]))
  return response
}
module.exports = { isObject, mergeDeep, parseMpd }
