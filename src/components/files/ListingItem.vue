<template xmlns:v-touch="http://www.w3.org/1999/xhtml">
    <div :id="itmId"
         @contextmenu.prevent="openContextMenu"
         v-touch:longtap="openContextMenu"
         class="item"
         role="button"
         tabindex="0"
         draggable="true"
         @dragstart="dragStart"
         @dragover="dragOver"
         @drop="drop"
         @click="click"
         @dblclick="open"
         v-touch:start="touchstart"
         :data-dir="isDir"
         :aria-label="name"
         :aria-selected="isSelected">
        <div>
            <template v-if="thumb||(thumb&&isShare)">
                <img class="thumb" :src="getThumbNailURL()" @error="thumb = false"/>
            </template>
            <template v-else>
                <i class="material-icons">{{ icon }}</i>
            </template>
        </div>
        <div>
            <p class="name">{{ name }}</p>

            <p v-if="isDir" class="size" data-order="-1">&mdash;</p>
            <p v-else class="size" :data-order="humanSize()">{{ humanSize() }}</p>

            <p class="modified">
                <time :datetime="modified">{{ humanTime() }}</time>
            </p>
        </div>
    </div>
</template>

<script>
    import {mapMutations, mapGetters, mapState} from 'vuex'
    import filesize from 'filesize'
    import moment from 'moment'
    import * as files from "../../api/files";
    import * as url from "@/utils/url"
    import {external, isMobile} from '@/utils/constants'

    export default {
        name: 'item',
        data: function () {
            return {
                thumb: false,
                touches: 0
            }
        },
        props: ['name', 'isDir', 'url', 'type', 'size', 'modified', 'index'],
        computed: {
            ...mapState(['selected', 'req', 'jwt', 'isShare']),
            ...mapGetters(['selectedCount']),
            itmId() {
                return "itm_" + this.index
            },
            isSelected() {
                return (this.selected.indexOf(this.index) !== -1)
            },
            icon() {
                if (this.isDir) return (this.isShare ? 'folder_shared' : 'folder')
                if (this.type === 'image') return 'insert_photo'
                if (this.type === 'audio') return 'volume_up'
                if (this.type === 'video') return 'movie'
                return 'insert_drive_file'
            },
            canDrop() {
                if (!this.isDir) return false

                for (let i of this.selected) {
                    if (this.req.items[i].url === this.url) {
                        return false
                    }
                }

                return true
            }
        }, mounted() {
            this.thumb = (this.type == 'image' || this.type == 'video') && !this.isDir
        },
        methods: {
            ...mapMutations(['addSelected', 'removeSelected', 'resetSelected']),
            openContextMenu(e) {
                if (isMobile) {
                    if (e.type === 'touchend') {
                        this.$parent.$refs.menu.openMenu(e, this.index)
                    }
                } else {
                    if (e.type === 'contextmenu') {
                        this.$parent.$refs.menu.openMenu(e, this.index)
                    }
                }
            },
            getThumbNailURL: function () {
                return url.convertToPreview(this.url, true, this.jwt, this.isShare, this.$route.query.rootHash)
            },
            humanSize: function () {
                return filesize(this.size)
            },
            humanTime: function () {
                return moment(this.modified).fromNow()
            },
            dragStart: function () {
                if (this.selectedCount === 0) {
                    this.addSelected(this.index)
                    return
                }

                if (!this.isSelected) {
                    this.resetSelected()
                    this.addSelected(this.index)
                }
            },
            dragOver: function (event) {
                if (!this.canDrop) return

                event.preventDefault()
                let el = event.target

                for (let i = 0; i < 5; i++) {
                    if (!el.classList.contains('item')) {
                        el = el.parentElement
                    }
                }

                el.style.opacity = 1
            },
            drop: function (event) {
                if (!this.canDrop) return
                event.preventDefault()

                if (this.selectedCount === 0) return

                let items = []

                for (let i of this.selected) {
                    items.push({
                        from: this.req.items[i].url,
                        to: this.url + encodeURIComponent(this.req.items[i].name)
                    })
                }

                files.move(items)
                    .then(() => {
                        this.$store.commit('setReload', true)
                    })
                    .catch(this.$showError)
            },
            click: function (event) {
                if (this.selectedCount !== 0) event.preventDefault()
                if (this.$store.state.selected.indexOf(this.index) !== -1) {
                    this.removeSelected(this.index)
                    return
                }

                if (event.shiftKey && this.selected.length === 1) {
                    let fi = 0
                    let la = 0

                    if (this.index > this.selected[0]) {
                        fi = this.selected[0] + 1
                        la = this.index
                    } else {
                        fi = this.index
                        la = this.selected[0] - 1
                    }

                    for (; fi <= la; fi++) {
                        this.addSelected(fi)
                    }

                    return
                }

                if (!event.ctrlKey && !this.$store.state.multiple) this.resetSelected()

                this.addSelected(this.index)
            },
            touchstart(e) {
                setTimeout(() => {
                    this.touches = 0
                }, 300)

                this.touches++
                if (this.touches > 1) {
                    this.open()
                }
            },
            open: function (event) {
                if (this.type == 'audio') {
                    event.preventDefault()
                    this.$root.$emit('playTrack', [{
                        name: this.name,
                        url: this.url
                    }])
                } else if (this.isShare) {
                    let p = this.url.split("?")
                    p = '/shares' + p[0]
                    if (external) {
                        this.$router.push({
                            path: p,
                            query: {'rootHash': this.$route.query.rootHash}
                        })
                    } else {

                        this.$router.push({path: p})
                    }
                } else {
                    this.$router.push({path: '/files' + this.url})
                }
            }
        }
    }
</script>
