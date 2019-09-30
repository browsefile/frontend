import {sync} from 'vuex-router-sync'
import store from '@/store'
import router from '@/router'
import i18n from '@/i18n'
import Vue from '@/utils/vue'
import {recaptcha, noAuth, external} from '@/utils/constants'
import {login, validateLogin} from '@/utils/auth'
import App from '@/App'
import Vue2TouchEvents from 'vue2-touch-events'

sync(store, router)

async function start() {

    if (external) {
        await login('guest', 'guest', '')
    } else if (noAuth) {
        await login('', '', '')
    } else {
        await validateLogin()
    }

    if (recaptcha) {
        await new Promise(resolve => {
            const check = () => {
                if (typeof window.grecaptcha === 'undefined') {
                    setTimeout(check, 100)
                } else {
                    resolve()
                }
            }

            check()
        })
    }
    Vue.use(Vue2TouchEvents)
    new Vue({
        el: '#app',
        store,
        router,
        i18n,
        template: '<App/>',
        components: {App}
    })

}

start()
