import {baseURL} from '@/utils/constants'

export function removeLastDir(url) {
    var arr = url.split('/')
    if (arr.pop() === '') {
        arr.pop()
    }

    return arr.join('/')
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

export function encodeUrlData(data) {
    return Object.keys(data).map(function (key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");

}

