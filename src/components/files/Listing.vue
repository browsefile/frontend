<template>
    <div v-if="(req.numDirs + req.numFiles) == 0">
        <h2 class="message">
            <i class="material-icons">sentiment_dissatisfied</i>
            <span>{{ $t('files.lonely') }}</span>
        </h2>
        <input style="display:none" type="file" id="upload-input" @change="uploadInput($event)" multiple>
    </div>
    <div v-else id="listing"
         :class="user.viewMode"
         @dragenter="dragEnter"
         @dragend="dragEnd">
        <div>
            <div class="item header">
                <div></div>
                <div>
                    <p :class="{ active: nameSorted }" class="name"
                       role="button"
                       tabindex="0"
                       @click="sort('name')"
                       :title="$t('files.sortByName')"
                       :aria-label="$t('files.sortByName')">
                        <span>{{ $t('files.name') }}</span>
                        <i class="material-icons">{{ icon }}</i>
                    </p>

                    <p :class="{ active: sizeSorted }" class="size"
                       role="button"
                       tabindex="0"
                       @click="sort('size')"
                       :title="$t('files.sortBySize')"
                       :aria-label="$t('files.sortBySize')">
                        <span>{{ $t('files.size') }}</span>
                        <i class="material-icons">{{ icon }}</i>
                    </p>
                    <p :class="{ active: modifiedSorted }" class="modified"
                       role="button"
                       tabindex="0"
                       @click="sort('modified')"
                       :title="$t('files.sortByLastModified')"
                       :aria-label="$t('files.sortByLastModified')">
                        <span>{{ $t('files.lastModified') }}</span>
                        <i class="material-icons">{{ icon }}</i>
                    </p>

                </div>
            </div>
        </div>
        <context-menu ref="menu"></context-menu>
        <h2 v-if="req.numDirs > 0">{{ $t('files.folders') }}</h2>
        <div v-if="req.numDirs > 0">
            <item v-for="(item, index) in dirs" :key="item.index"
                  v-bind:index="item.index"
                  v-bind:name="item.name"
                  v-bind:isDir="item.isDir"
                  v-bind:url="item.url"
                  v-bind:modified="item.modified"
                  v-bind:type="item.type"
                  v-bind:size="item.size">
            </item>


        </div>

        <h2 v-if="req.numFiles > 0">{{ $t('files.files') }}</h2>

        <div v-if="req.numFiles > 0">
            <item v-for="(item, index) in files" :key="item.index"
                  v-bind:index="item.index"
                  v-bind:name="item.name"
                  v-bind:isDir="item.isDir"
                  v-bind:url="item.url"
                  v-bind:modified="item.modified"
                  v-bind:type="item.type"
                  v-bind:size="item.size">
            </item>

        </div>

        <input style="display:none" type="file" id="upload-input" @change="uploadInput($event)" multiple>

        <div :class="{ active: $store.state.multiple }" id="multiple-selection">
            <p>{{ $t('files.multipleSelectionEnabled') }}</p>
            <div @click="$store.commit('multiple', false)" tabindex="0" role="button" :title="$t('files.clear')"
                 :aria-label="$t('files.clear')" class="action">
                <i class="material-icons">clear</i>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState, mapMutations} from 'vuex'
    import Item from './ListingItem'
    import css from '@/utils/css'
    import {users, files as api} from '@/api'
    import buttons from '@/utils/buttons'
    import ContextMenu from "../ContextMenu";
    import * as url from "../../utils/url"
    import * as pLimit from "promise-limit"
    import moment from 'moment'

    export default {
        name: 'listing',
        components: {ContextMenu, Item},
        data: function () {
            return {
                show: 50,
                sortField: '',
                isAsc: false
            }
        },
        computed: {
            ...mapState(['req', 'selected', 'user', 'isShare']),
            nameSorted() {
                return (this.sortField === 'name')
            },
            sizeSorted() {
                return (this.sortField === 'size')
            },
            modifiedSorted() {
                return (this.sortField === 'modified')
            },
            items() {
                const dirs = []
                const files = []

                for (let i = 0; i < this.req.items.length; i++) {
                    this.req.items[i].index = i
                    if (this.req.items[i].isDir) {
                        dirs.push(this.req.items[i])
                    } else {
                        files.push(this.req.items[i])
                    }
                }

                return {dirs, files}
            },
            dirs() {
                return this.items.dirs.slice(0, this.show)
            },
            files() {
                let show = this.show - this.items.dirs.length

                if (show < 0) show = 0

                return this.items.files.slice(0, show)
            },
            icon() {
                return this.isAsc ? 'arrow_upward' : 'arrow_downward';
            }
        },
        beforeMount() {
            if (this.sortField.length == 0) {
                if (localStorage.sortField && localStorage.sortField.length > 0) {
                    this.sortField = localStorage.sortField
                } else {
                    this.sortField = 'modified'
                }
            }

            this.isAsc = localStorage.order == 'asc'
            this.req.items = this.req.items.sort(this.comparator)
        },
        mounted() {
            // Check the columns size for the first time.
            this.resizeEvent()

            // Add the needed event listeners to the window and document.
            window.addEventListener('keydown', this.keyEvent)
            window.addEventListener('resize', this.resizeEvent)
            window.addEventListener('scroll', this.scrollEvent)
            document.addEventListener('dragover', this.preventDefault)
            document.addEventListener('drop', this.drop)
        },
        beforeDestroy() {
            // Remove event listeners before destroying this page.
            window.removeEventListener('keydown', this.keyEvent)
            window.removeEventListener('resize', this.resizeEvent)
            window.removeEventListener('scroll', this.scrollEvent)
            document.removeEventListener('dragover', this.preventDefault)
            document.removeEventListener('drop', this.drop)
        },
        methods: {
            ...mapMutations(['updateUser', 'setReload']),
            base64: function (name) {
                return window.btoa(unescape(encodeURIComponent(name)))
            },
            keyEvent(event) {
                if (!event.ctrlKey && !event.metaKey) {
                    return
                }

                let key = String.fromCharCode(event.which).toLowerCase()

                switch (key) {
                    case 'f':
                        event.preventDefault()
                        this.$store.commit('showHover', 'search')
                        break
                    case 'c':
                    case 'x':
                        this.copyCut(event, key)
                        break
                    case 'v':
                        this.paste(event)
                        break
                }
            },
            preventDefault(event) {
                // Wrapper around prevent default.
                event.preventDefault()
            },
            copyCut(event, key) {
                if (event.target.tagName.toLowerCase() === 'input') {
                    return
                }

                let items = []

                for (let i of this.selected) {
                    items.push({
                        from: this.req.items[i].url,
                        name: encodeURIComponent(this.req.items[i].name)
                    })
                }

                if (items.length == 0) {
                    return
                }

                this.$store.commit('updateClipboard', {
                    key: key,
                    items: items
                })
            },
            paste(event) {
                if (event.target.tagName.toLowerCase() === 'input') {
                    return
                }

                let items = []

                for (let item of this.$store.state.clipboard.items) {
                    const from = item.from.endsWith('/') ? item.from.slice(0, -1) : item.from
                    const to = this.$route.path + item.name
                    items.push({from, to})
                }

                if (items.length === 0) {
                    return
                }

                if (this.$store.state.clipboard.key === 'x') {
                    api.move(items).then(() => {
                        this.setReload(true)
                    }).catch(this.$showError)
                    return
                }

                api.copy(items).then(() => {
                    this.setReload(true)
                }).catch(this.$showError)
            },
            resizeEvent() {
                // Update the columns size based on the window width.
                let columns = Math.floor(document.querySelector('main').offsetWidth / 300)
                let items = css(['#listing.mosaic .item', '.mosaic#listing .item'])
                if (columns === 0) columns = 1
                items.style.width = `calc(${100 / columns}% - 1em)`
            },
            scrollEvent() {
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                    this.show += 50
                }
            },
            dragEnter() {
                // When the user starts dragging an item, put every
                // file on the listing with 50% opacity.
                let items = document.getElementsByClassName('item')

                Array.from(items).forEach(file => {
                    file.style.opacity = 0.5
                })
            },
            dragEnd() {
                this.resetOpacity()
            },
            drop: function (event) {
                event.preventDefault()
                this.resetOpacity()

                let dt = event.dataTransfer
                let files = dt.files
                let el = event.target

                if (files.length <= 0) {
                    console.error("files empty")
                    return
                }

                for (let i = 0; i < 5; i++) {
                    if (el !== null && !el.classList.contains('item')) {
                        el = el.parentElement
                    }
                }

                let base = ''
                if (el !== null && el.classList.contains('item') && el.dataset.dir === 'true') {
                    base = el.querySelector('.name').innerHTML + '/'
                }

                if (base !== '') {
                    api.fetch(this.$route.path + base)
                        .then(req => {
                            this.checkConflict(files, req.items, base)
                        })
                        .catch(this.$showError)

                    return
                }

                this.checkConflict(files, this.req.items, base)
            },
            checkConflict(files, items, base) {
                if (typeof items === 'undefined' || items === null) {
                    items = []
                }

                let conflict = false
                for (let i = 0; i < files.length; i++) {
                    let res = items.findIndex(function hasConflict(element) {
                        return (element.name === this)
                    }, files[i].name)

                    if (res >= 0) {
                        conflict = true
                        break
                    }
                }

                if (!conflict) {
                    this.handleFiles(files, base)
                    return
                }

                this.$store.commit('showHover', {
                    prompt: 'replace',
                    confirm: (event) => {
                        event.preventDefault()
                        this.$store.commit('closeHovers')
                        this.handleFiles(files, base, true)
                    }
                })
            },
            uploadInput(event) {
                this.checkConflict(event.currentTarget.files, this.req.items, '')
            },
            resetOpacity() {
                let items = document.getElementsByClassName('item')

                Array.from(items).forEach(file => {
                    file.style.opacity = 1
                })
            },
            handleFiles(files, base, overwrite = false) {
                buttons.loading('upload')
                let promises = []
                let progress = new Array(files.length).fill(0)

                let onupload = (id) => (event) => {
                    progress[id] = (event.loaded / event.total) * 100

                    let sum = 0
                    for (let i = 0; i < progress.length; i++) {
                        sum += progress[i]
                    }

                    this.$store.commit('setProgress', Math.ceil(sum / progress.length))
                }
                //limit concurrent upload
                let limit = pLimit(2)

                for (let i = 0; i < files.length; i++) {
                    let file = files[i]
                    let path = this.$route.path + base + url.encodeRFC5987ValueChars(file.name)
                    promises.push(limit(() => api.post(path, file, overwrite, onupload(i))))
                }

                let finish = () => {
                    buttons.success('upload')
                    this.$store.commit('setProgress', 0)
                }

                Promise.all(promises)
                    .then(() => {
                        finish()
                        this.$store.commit('setReload', true)
                    })
                    .catch(error => {
                        finish()
                        this.$showError(error)
                    })

                return false
            },
            comparator: function (a, b) {
                let rs = 0;
                let v1 = a[this.sortField]
                let v2 = b[this.sortField]

                if (this.sortField === 'modified') {
                    v1 = moment(v1).valueOf()
                    v2 = moment(v2).valueOf()
                }

                if (v1 < v2)
                    rs = this.isAsc ? -1 : 1;
                else if (v2 < v1)
                    rs = this.isAsc ? 1 : -1;

                return rs;

            },
            sort(field) {
                this.isAsc = !this.isAsc
                localStorage.sortField = this.sortField = field
                localStorage.order = this.isAsc ? 'asc' : 'desc'
                this.req.items = this.req.items.sort(this.comparator)
            }
        }
    }
</script>
