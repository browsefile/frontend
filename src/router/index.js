import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login'
import Layout from '@/views/Layout'
import Files from '@/views/Files'
import Users from '@/views/settings/Users'
import User from '@/views/settings/User'
import Settings from '@/views/Settings'
import SharesSettings from '@/views/settings/Shares'
import ProfileSettings from '@/views/settings/Profile'
import Config from '@/views/settings/Config'
import Error403 from '@/views/errors/403'
import Error404 from '@/views/errors/404'
import Error500 from '@/views/errors/500'
import store from '@/store'
import {baseURL} from '@/utils/constants'

Vue.use(Router)

const router = new Router({
    base: baseURL,
    mode: 'history',
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: Login,
            beforeEnter: (to, from, next) => {
                if (store.getters.isLogged) {
                    return next({path: '/files'})
                }
                /* else {
                                    return next({path: '/shares'})
                                }*/

                document.title = 'Login'
                next()
            }
        },
        {
            path: '/*',
            component: Layout,
            children: [
                {
                    path: '/shares/*',
                    name: 'Shares',
                    component: Files
                },
                {
                    path: '/files/*',
                    name: 'Files',
                    component: Files,
                    meta: {
                        requiresAuth: true
                    }
                },
                {
                    path: '/settings',
                    name: 'Settings',
                    component: Settings,
                    redirect: {
                        path: '/settings/profile'
                    },
                    meta: {
                        requiresAuth: true
                    },
                    children: [
                        {
                            path: '/settings/config',
                            name: 'Server Settings',
                            component: Config,
                        },
                        {
                            path: '/settings/profile',
                            name: 'Profile Settings',
                            component: ProfileSettings
                        },
                        {
                            path: '/settings/shares',
                            name: 'Shares Settings',
                            component: SharesSettings,
                            meta: {
                                requiresAdmin: true
                            }
                        },
                        {
                            path: '/settings/users',
                            name: 'Users',
                            component: Users,
                            meta: {
                                requiresAdmin: true
                            }
                        },
                        {
                            path: '/settings/users/*',
                            name: 'User',
                            component: User,
                            meta: {
                                requiresAdmin: true
                            }
                        }
                    ]
                },
                {
                    path: '/403',
                    name: 'Forbidden',
                    component: Error403
                },
                {
                    path: '/404',
                    name: 'Not Found',
                    component: Error404
                },
                {
                    path: '/500',
                    name: 'Internal Server Error',
                    component: Error500
                },
                {
                    path: '/files',
                    redirect: {
                        path: '/files/'
                    }
                },
                {
                    path: '/shares',
                    redirect: {
                        path: '/shares/'
                    }
                },
                {
                    path: '/*',
                    redirect: to => `/files${to.path}`
                }
            ]
        }
    ]
})

router.beforeEach((to, from, next) => {
    document.title = to.name

    if (to.matched.some(record => record.meta.requiresAuth)) {

        if (!store.getters.isLogged) {
            next({
                path: '/login',
                query: {redirect: to.fullPath}
            })

            return
        }

        if (to.matched.some(record => record.meta.requiresAdmin)) {
            if (!store.state.user.admin) {
                next({path: '/403'})
                return
            }
        }
    }

    if (to.name === 'Shares') {
        Vue.set(store.state, 'isShare', true)
    } else {
        Vue.set(store.state, 'isShare', false)
    }
    next()
})

export default router
