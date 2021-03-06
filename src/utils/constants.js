const name = window.FileBrowser.Name || 'Browsefile'
const disableExternal = window.FileBrowser.DisableExternal
const baseURL = ''
const staticURL = window.FileBrowser.StaticURL
const recaptcha = window.FileBrowser.ReCaptcha
const recaptchaKey = window.FileBrowser.ReCaptchaKey
const signup = window.FileBrowser.Signup
const version = window.FileBrowser.Version
const logoURL = `${staticURL}/img/logo.svg`
const noAuth = window.FileBrowser.NoAuth
const external = window.FileBrowser.isExternal
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? true : false

export {
    name,
    disableExternal,
    baseURL,
    logoURL,
    recaptcha,
    recaptchaKey,
    signup,
    version,
    noAuth,
    external,
    isMobile
}
