import {fetchURL, fetchJSON, removePrefix} from './utils'
import {baseURL} from '@/utils/constants'
import store from '@/store'
import {external} from '@/utils/constants'

export async function get(url, isMeta) {
    url = removePrefix(url)
    url = '/api/shares' + url
    if (isMeta) {
        let sym = '?'
        if (url.includes('?')) {
            sym = '&'
        }
        url += sym + 'share=my-meta';
    }

    let data = await fetchJSON(url)
    if (!isMeta) {
        data.url = `/shares${url}`
        if (data.isDir && data.items) {
            data.items = data.items.map((item, index) => {
                item.index = index
                return item
            })
        }
    }

    return data
}

export async function getExternal(url, isMeta) {
    url = removePrefix(url)
    url = '/api/shares' + url
    let sym = '?'
    if (url.includes('?')) {
        sym = '&'
    }
    url += sym + 'share=gen-ex';
    return await fetchJSON(url, {method: 'POST'})
}


export function download(format, exshare, ...files) {
    let url = `${baseURL}/api/shares/download`

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
    if (exshare) {
        url += '&exshare=' + encodeURIComponent(exshare)
    }
    window.open(url)
}


export async function remove(url) {
    url = removePrefix(url)
    url = '/api/shares' + url

    const res = await fetchURL(url, {
        method: 'DELETE'
    })

    if (res.status !== 200) {
        throw new Error(res.status)
    }
}

export async function create(item) {
    let url = removePrefix(item.path)
    url = url.replace("/files", "")
    if (url.endsWith("/")) {
        url = url.slice(0, -1)
    }
    url = '/api/shares' + url + '?share=my-meta'


    return fetchJSON(url, {
        method: 'POST',
        body: JSON.stringify(item)
    })
}
