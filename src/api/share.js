import {fetchURL, fetchJSON, removePrefix} from './utils'
import {baseURL} from '@/utils/constants'
import store from '@/store'

export async function get(url) {
    url = removePrefix(url)
    let data = await fetchJSON(`/api/shares/resource${url}`)
    data.url = `/shares${url}`
    if (data.isDir) {
        data.items = data.items.map((item, index) => {
            item.index = index
            return item
        })
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
    const res = await fetchURL(`/api${url}`, {
        method: 'DELETE'
    })

    if (res.status !== 200) {
        throw new Error(res.status)
    }
}

export async function create(url) {
    url = removePrefix(url)
    url = `/api${url}`
    if (expires !== '') {
        url += `?expires=${expires}&unit=${unit}`
    }

    return fetchJSON(url, {
        method: 'POST'
    })
}
