import {baseURL} from '@/utils/constants'

export function removeLastDir(url) {
    var arr = url.split('/')
    if (arr.pop() === '') {
        arr.pop()
    }

    return arr.join('/')
}

export function convertToPreview(url, isPreview, auth, isBase) {
    let res

    let bu = baseURL
    if (isBase) {
        bu = window.location.href
        let arr = bu.split("/")
        bu = arr[0] + "//" + arr[2]
    }

    let parm = {
        'inline': true
    }
    if (auth) {
        parm.auth = auth
    }
    if (isPreview) {
        parm.previewType = 'thumb'
    }
    let sym = url.includes('?') ? '&' : '?';
    if (url.startsWith('/shares')) {
        res = bu + url.replace('shares', 'api/shares/download')
    } else if (url.startsWith('/files')) {
        res = bu + url.replace('files', 'api/download')
    }
    return res + sym + encodeUrlData(parm)
}

export function encodeUrlData(data) {
    return Object.keys(data).map(function (key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");

}

