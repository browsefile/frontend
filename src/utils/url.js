export function removeLastDir (url) {
  var arr = url.split('/')
  if (arr.pop() === '') {
    arr.pop()
  }

  return arr.join('/')
}

export function convertToDownload (url) {
  return url.replace('files', 'api/download')
}
