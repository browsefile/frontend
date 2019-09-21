import {fetchJSON, removePrefix} from './utils'

export default async function search(url, query, share, rootHash) {
    query = encodeURIComponent(query)
    let link = `/api/search${url}?query=${query}`
    if (share) {
        link += '&share=' + share
    }
    if (rootHash) {
        link += '&rootHash=' + encodeURIComponent(rootHash)
    }


    return fetchJSON(link, {})
}
