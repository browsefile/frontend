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
            u += "?rootHash=" + encodeURIComponent(route.query.rootHash)
        } else {
            u += "?share=list"
        }
    }

    return u
}


export function convertToPreview(url, isPreview, auth, isShare, rootHash) {
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
        if (rootHash) {
            parm.rootHash = rootHash
        }
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

// this code borrow from mozilla
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#Examples
export function encodeRFC5987ValueChars(str) {
    return encodeURIComponent(str).
    // Note that although RFC3986 reserves "!", RFC5987 does not,
    // so we do not need to escape it
    replace(/['()]/g, escape). // i.e., %27 %28 %29
    replace(/\*/g, '%2A').
    // The following are not required for percent-encoding per RFC5987,
    // so we can allow for a little better readability over the wire: |`^
    replace(/%(?:7C|60|5E)/g, unescape);
}


