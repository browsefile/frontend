import {fetchJSON, removePrefix} from './utils'

export default async function search(url, query, exshare) {
    query = encodeURIComponent(query)
    let link = `/api/search${url}?query=${query}`

    if (exshare) {
        link += '&exshare=' + encodeURIComponent(exshare)
    }


    return fetchJSON(link, {})
}
