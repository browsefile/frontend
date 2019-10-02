import {fetchJSON, removePrefix} from './utils'

export default async function search(url, query, rootHash) {
    query = encodeURIComponent(query)
    let link = `/api/search${url}?query=${query}`

    if (rootHash) {
        link += '&rootHash=' + encodeURIComponent(rootHash)
    }


    return fetchJSON(link, {})
}
