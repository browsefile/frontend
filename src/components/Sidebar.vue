<template>
    <nav :class="{active}">
         <span v-if="!isExternal">
            <router-link class="action" :to="sharesPath" :aria-label="$t('sidebar.share')"
                         :title="$t('sidebar.share')">
                    <i class="material-icons">folder_shared</i>
                    <span>{{ $t('sidebar.share') }}</span>
            </router-link>
        </span>

        <template v-if="isLogged">
            <span v-if="!isExternal">
                <router-link class="action" :to="filesPath" :aria-label="$t('sidebar.myFiles')"
                             :title="$t('sidebar.myFiles')">
                         <i class="material-icons">folder</i>
                        <span>{{ $t('sidebar.myFiles') }}</span>
                </router-link>
            </span>
            <div v-if="user.allowNew && !isShare && isFiles">
                <button @click="$store.commit('showHover', 'newDir')" class="action"
                        :aria-label="$t('sidebar.newFolder')" :title="$t('sidebar.newFolder')">
                    <i class="material-icons">create_new_folder</i>
                    <span>{{ $t('sidebar.newFolder') }}</span>
                </button>

                <button @click="$store.commit('showHover', 'newFile')" class="action"
                        :aria-label="$t('sidebar.newFile')" :title="$t('sidebar.newFile')">
                    <i class="material-icons">note_add</i>
                    <span>{{ $t('sidebar.newFile') }}</span>
                </button>
            </div>

            <div>
                  <span v-if="!isExternal">
                        <router-link class="action" to="/settings" :aria-label="$t('sidebar.settings')"
                                     :title="$t('sidebar.settings')">
                            <i class="material-icons">settings_applications</i>
                            <span>{{ $t('sidebar.settings') }}</span>
                        </router-link>
                  </span>
                <button v-if="!noAuth" @click="logout" class="action" id="logout" :aria-label="$t('sidebar.logout')"
                        :title="$t('sidebar.logout')">
                    <i class="material-icons">exit_to_app</i>
                    <span>{{ $t('sidebar.logout') }}</span>
                </button>
            </div>
        </template>
        <template v-else>
            <router-link class="action" to="/login" :aria-label="$t('sidebar.login')" :title="$t('sidebar.login')">
                <i class="material-icons">exit_to_app</i>
                <span>{{ $t('sidebar.login') }}</span>
            </router-link>

            <router-link v-if="signup" class="action" to="/login" :aria-label="$t('sidebar.signup')"
                         :title="$t('sidebar.signup')">
                <i class="material-icons">person_add</i>
                <span>{{ $t('sidebar.signup') }}</span>
            </router-link>
        </template>

        <p class="credits">
      <span>
        <span v-if="disableExternal">Browsefile</span>
        <a v-else rel="noopener noreferrer" target="_blank" href="https://github.com/browsefile/backend">Browsefile</a>
        <span> {{ version }}</span>
      </span>
            <span><a @click="help">{{ $t('sidebar.help') }}</a></span>
        </p>
    </nav>
</template>

<script>
    import {mapState, mapGetters} from 'vuex'
    import * as auth from '@/utils/auth'
    import {version, signup, disableExternal, noAuth, external as ext} from '@/utils/constants'

    export default {
        name: 'sidebar',
        computed: {
            ...mapState(['user', 'isShare']),
            ...mapGetters(['isLogged', 'isFiles']),
            isExternal() {
                return ext
            },
            sharesPath() {
                return {path: '/shares/', query: {share: "list"}}
            },
            filesPath() {
                return {path: '/files/'}
            },
            active() {
                return this.$store.state.show === 'sidebar'
            },
            signup: () => signup,
            version: () => version,
            disableExternal: () => disableExternal,
            noAuth: () => noAuth
        },
        methods: {
            help() {
                if (ext) {
                }
                this.$store.commit('showHover', 'help')
            },
            logout: auth.logout
        }
    }
</script>
