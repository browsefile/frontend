import {baseURL} from '@/utils/constants'

export function removeLastDir(url) {
    var arr = url.split('/')
    if (arr.pop() === '') {
        arr.pop()
    }

    return arr.join('/')
}

export function convertToPreview(url, isShare, isPreview, auth, jwt) {
    let res
    let parm = {
        'inline': true
    }
    if (auth) {
        parm.auth = auth
    }
    if (isPreview) {
        parm.previewType = 'thumb'
    }
    if (jwt) {
        parm.auth = jwt
    }
    let sym = isShare ? '&' : '?';
    if (isShare) {
        res = baseURL + url.replace('shares', 'api/shares/download')
    } else res = baseURL + url.replace('files', 'api/download')
    return res + sym + encodeUrlData(parm)
}

export function encodeUrlData(data) {
    return Object.keys(data).map(function (key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");

}

