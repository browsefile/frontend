<template>
    <div>
        <div id="breadcrumbs">

            <router-link v-if="isShare" :to="getBrCrmbURL" :aria-label="$t('sidebar.share')"
                         :title="$t('sidebar.share')">
                <i class="material-icons">folder_shared</i>
            </router-link>
            <router-link v-else :to="getBrCrmbURL" :aria-label="$t('files.home')" :title="$t('files.home')">
                <i class="material-icons">home</i>
            </router-link>
            <span v-for="(link, index) in breadcrumbs" :key="index">
        <span class="chevron"><i class="material-icons">keyboard_arrow_right</i></span>
        <router-link :to="link.url">{{ link.name }}</router-link>
      </span>
        </div>
        <div v-if="error">
            <not-found v-if="error.message === '404'"></not-found>
            <forbidden v-else-if="error.message === '403'"></forbidden>
            <internal-error v-else></internal-error>
        </div>
        <editor v-else-if="isEditor"></editor>
        <listing :class="{ multiple }" v-else-if="isListing"></listing>
        <preview v-else-if="isPreview"></preview>
        <div v-else>
            <h2 class="message">
                <span>{{ $t('files.loading') }}</span>
            </h2>
        </div>
    </div>
</template>

<script>
    import Forbidden from './errors/403'
    import NotFound from './errors/404'
    import InternalError from './errors/500'
    import Preview from '@/components/files/Preview'
    import Listing from '@/components/files/Listing'
    import Editor from '@/components/files/Editor'
    import {mapGetters, mapState, mapMutations} from 'vuex'
    import * as share from "@/api/share";
    import * as files from "@/api/files";
    import {external} from '@/utils/constants'
    import * as url from "@/utils/url"

    function clean(path) {
        return path.endsWith('/') ? path.slice(0, -1) : path
    }

    export default {
        name: 'files',
        components: {
            Forbidden,
            NotFound,
            InternalError,
            Preview,
            Listing,
            Editor,
        },
        computed: {
            ...mapGetters([
                'selectedCount',
                'isListing',
                'isEditor',
                'isFiles'
            ]),
            ...mapState([
                'req',
                'user',
                'reload',
                'multiple',
                'loading',
                'isShare'
            ]),
            isPreview() {
                console.dir(this.$route.path)
                return !this.loading && !this.isListing && !this.isEditor
            },
            getBrCrmbURL() {
                if (this.isShare) {
                    let rs
                    if (external && this.$route.query.rootHash) {
                        rs = '?rootHash=' + encodeURIComponent(this.$route.query.rootHash)
                    } else if (this.$route.query && this.$route.query.share) {
                        rs = '?share=list'
                    }
                    return '/shares/' + rs
                } else {
                    return '/files/'
                }

            },
            breadcrumbs() {
                let parts = this.$route.path.split('/')

                if (parts[0] === '') {
                    parts.shift()
                }

                if (parts[parts.length - 1] === '') {
                    parts.pop()
                }

                let breadcrumbs = []

                for (let i = 0; i < parts.length; i++) {
                    if (i === 0) {
                        breadcrumbs.push({name: decodeURIComponent(parts[i]), url: '/' + parts[i] + '/'})
                    } else {
                        breadcrumbs.push({
                            name: decodeURIComponent(parts[i]),
                            url: breadcrumbs[i - 1].url + parts[i] + '/'
                        })
                    }
                }
                for (let i = 0; i < breadcrumbs.length; i++) {
                    breadcrumbs[i].url += this.getParams()
                }

                breadcrumbs.shift()

                if (breadcrumbs.length > 3) {
                    while (breadcrumbs.length !== 4) {
                        breadcrumbs.shift()
                    }

                    breadcrumbs[0].name = '...'
                }

                return breadcrumbs
            }
        },
        data: function () {
            return {
                error: null
            }
        },
        created() {
            this.fetchData()
        },
        watch: {
            '$route': 'fetchData',
            'reload': function () {
                this.fetchData()
            }
        },
        mounted() {
            window.addEventListener('keydown', this.keyEvent)
        },
        beforeDestroy() {
            window.removeEventListener('keydown', this.keyEvent)
        },
        destroyed() {
            this.$store.commit('updateRequest', {})
        },
        methods: {
            ...mapMutations(['setLoading']),
            async fetchData() {
                // Reset view information.
                this.$store.commit('setReload', false)
                this.$store.commit('resetSelected')
                this.$store.commit('multiple', false)
                this.$store.commit('closeHovers')

                // Set loading to true and reset the error.
                this.setLoading(true)
                this.error = null

                let u = url.makeFileUrl(this.isShare, this.$route)
                try {
                    let res = null

                    if (this.isShare) {
                        res = await share.get(u)
                    } else {
                        res = await files.fetch(u)

                    }
                    this.$store.commit('updateRequest', res)

                    document.title = res.name
                } catch (e) {
                    this.error = e
                } finally {
                    this.setLoading(false)
                }
            },
            keyEvent(event) {
                // Esc!
                if (event.keyCode === 27) {
                    this.$store.commit('closeHovers')

                    // If we're on a listing, unselect all
                    // files and folders.
                    if (this.isListing) {
                        this.$store.commit('resetSelected')
                    }
                }

                // Del!
                if (event.keyCode === 46) {
                    if (this.isEditor ||
                        !this.isFiles ||
                        this.loading ||
                        (this.isListing && this.selectedCount === 0)) return

                    this.$store.commit('showHover', 'delete')
                }

                // F1!
                if (event.keyCode === 112) {
                    event.preventDefault()
                    this.$store.commit('showHover', 'help')
                }

                // F2!
                if (event.keyCode === 113) {
                    if (this.isEditor ||
                        !this.isFiles ||
                        this.loading ||
                        (this.isListing && this.selectedCount === 0) ||
                        (this.isListing && this.selectedCount > 1)) return

                    this.$store.commit('showHover', 'rename')
                }

                // CTRL + S
                if (event.ctrlKey || event.metaKey) {
                    if (this.isEditor) return

                    if (String.fromCharCode(event.which).toLowerCase() === 's') {
                        event.preventDefault()

                        if (this.req.kind !== 'editor') {
                            document.getElementById('download-button').click()
                        }
                    }
                }
            },
            openSidebar() {
                this.$store.commit('showHover', 'sidebar')
            },
            openSearch() {
                this.$store.commit('showHover', 'search')
            },
            getParams: function () {
                let rs = ''
                if (external && this.$route.query.rootHash) {
                    rs = '?rootHash=' + encodeURIComponent(this.$route.query.rootHash)
                } else if (this.$route.query && this.$route.query.share) {
                    rs = '?share=' + this.$route.query.share
                }
                return rs
            }
        }
    }
</script>
