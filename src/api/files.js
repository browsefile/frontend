import {fetchURL, removePrefix} from './utils'
import {baseURL} from '@/utils/constants'
import store from '@/store'

export async function fetch(url) {
    url = removePrefix(url)

    const res = await fetchURL(`/api/resource${url}`, {})
    if (res.status === 200) {
        let data = await res.json()
        data.url = `/files${url}`

        if (data.isDir) {
            let urlArr = data.url.split('/?')
            data.url = urlArr[0]

            if (!data.url.endsWith('/')) data.url += '/'
            if (!data.items) {
                data.items = []
            }
            data.items = data.items.map((item, index) => {
                item.index = index

                if (item.isDir && !item.url.endsWith('/')) {
                    item.url += '/'
                }

                return item
            })
        }

        return data
    } else {
        throw new Error(res.status)
    }
}

async function resourceAction(url, method, content) {
    url = removePrefix(url)
    let opts = {method}

    if (content) {
        opts.body = content
    }

    const res = await fetchURL(`/api/resource${url}`, opts)

    if (res.status !== 200) {
        throw new Error(res.responseText)
    } else {
        return res
    }
}

export async function remove(url) {
    return resourceAction(url, 'DELETE')
}

export async function put(url, content = '') {
    return resourceAction(url, 'PUT', content)
}

export function download(format, ...files) {

    let url = `${baseURL}/api/download`

    let arg = ''

    for (let file of files) {
        arg += removePrefix(file) + ','
    }

    arg = arg.substring(0, arg.length - 1)
    arg = encodeURIComponent(arg)
    url += `/?files=${arg}&`

    if (format !== null) {
        url += `algo=${format}&`
    }

    url += `auth=${store.state.jwt}`
    console.dir(url)
    window.open(url)
}

export async function post(url, content = '', overwrite = false, onupload) {
    url = removePrefix(url)

    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest()
        request.open('POST', `${baseURL}/api/resource${url}?override=${overwrite}`, true)
        request.setRequestHeader('X-Auth', store.state.jwt)

        if (typeof onupload === 'function') {
            request.upload.onprogress = onupload
        }

        // Send a message to user before closing the tab during file upload
        window.onbeforeunload = () => "Files are being uploaded."

        request.onload = () => {
            if (request.status === 200) {
                resolve(request.responseText)
            } else if (request.status === 409) {
                reject(request.status)
            } else {
                reject(request.responseText)
            }
        }

        request.onerror = (error) => {
            reject(error)
        }

        request.send(content)
        // Upload is done no more message before closing the tab
    }).finally(() => {
        window.onbeforeunload = null
    })
}

function moveCopy(items, copy = false) {
    let promises = []

    for (let item of items) {
        const from = removePrefix(item.from)
        const to = encodeURIComponent(removePrefix(item.to))
        const url = `${from}?action=${copy ? 'copy' : 'rename'}&destination=${to}`
        promises.push(resourceAction(url, 'PATCH'))
    }

    return Promise.all(promises)
}

export function move(items) {
    return moveCopy(items)
}

export function copy(items) {
    return moveCopy(items, true)
}

export async function checksum(url, algo) {
    const data = await resourceAction(`${url}?checksum=${algo}`, 'GET')
    return (await data.json()).checksums[algo]
}
