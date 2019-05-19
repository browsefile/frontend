import {fetchURL, fetchJSON, removePrefix} from './utils'
import {baseURL} from '@/utils/constants'
import store from '@/store'

export async function get(url, isMeta) {
    url = removePrefix(url)
    url = '/api/shares/resource' + url
    if (isMeta) {
        url += '?share=my-meta'
    }

    let data = await fetchJSON(url)
    if (!isMeta) {
        data.url = `/shares${url}`
        if (data.isDir) {
            data.items = data.items.map((item, index) => {
                item.index = index
                return item
            })
        }
    }

    return data
}

export function download(format, ...files) {
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

    url += `auth=${store.state.jwt}`;

    window.open(url)
}


export async function remove(url) {
    url = removePrefix(url)
    url = '/api/shares/resource' + url

    const res = await fetchURL(url, {
        method: 'DELETE'
    })

    if (res.status !== 200) {
        throw new Error(res.status)
    }
}

export async function create(item) {
    let url = removePrefix(item.path)
    url = '/api/shares/resource' + url + '?share=my-meta'


    return fetchJSON(url, {
        method: 'POST',
        body: JSON.stringify(item)
    })
}
