import {baseURL} from '@/utils/constants'
import {external} from '@/utils/constants'

export function removeLastDir(url) {
    var arr = url.split('/')
    if (arr.pop() === '') {
        arr.pop()
    }

    return arr.join('/')
}

export function makeFileUrl(isShare, route) {
    let u = route.path

    if (u === '') u = '/'
    if (u[0] !== '/') u = '/' + u
    if (isShare) {
        if (external && route.query.rootHash) {
            u += "?rootHash=" + route.query.rootHash
        } else if (route.query && route.query.share) {
            u += "?share=" + route.query.share
        } else {
            u += "?share=list"
        }
    }

    return u
}


export function convertToPreview(url, isPreview, auth, isShare) {
    let res = ""

    let bu = window.location.href
    let arr = bu.split("/")
    bu = arr[0] + "//" + arr[2]

    if (baseURL && baseURL.length > 0) {
        bu = baseURL
    }

    let parm = {
        'inline': true
    };
    if (auth) {
        parm.auth = auth
    }
    if (isPreview) {
        parm.previewType = 'thumb'
    }
    let sym = url.includes('?') ? '&' : '?';
    if (isShare) {
        res = bu + '/api/shares/download' + url
    } else {
        res = bu + '/api/download' + url
    }
    return res + sym + encodeUrlData(parm)
}

export function convertToDownload(url) {
    return url.replace('files', 'api/download')
}


export function encodeUrlData(data) {
    return Object.keys(data).map(function (key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");

}

