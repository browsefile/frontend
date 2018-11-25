<template>

    <div v-if="req.type == 'image'">
        <!-- Root element of PhotoSwipe. Must have class pswp. -->
        <div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">
            <!-- Background of PhotoSwipe.
                 It's a separate element as animating opacity is faster than rgba(). -->
            <div class="pswp__bg"></div>

            <!-- Slides wrapper with overflow:hidden. -->
            <div class="pswp__scroll-wrap">

                <!-- Container that holds slides.
                    PhotoSwipe keeps only 3 of them in the DOM to save memory.
                    Don't modify these 3 pswp__item elements, data is added later on. -->
                <div class="pswp__container">
                    <div class="pswp__item"></div>
                    <div class="pswp__item"></div>
                    <div class="pswp__item"></div>
                </div>

                <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->
                <div class="pswp__ui pswp__ui--hidden">

                    <div class="pswp__top-bar">

                        <!--  Controls are self-explanatory. Order can be changed. -->

                        <div class="pswp__counter"></div>

                        <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>

                        <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>

                        <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>

                        <!-- Preloader demo http://codepen.io/dimsemenov/pen/yyBWoR -->
                        <!-- element will get class pswp__preloader--active when preloader is running -->
                        <div class="pswp__preloader">
                            <div class="pswp__preloader__icn">
                                <div class="pswp__preloader__cut">
                                    <div class="pswp__preloader__donut"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                        <div class="pswp__share-tooltip"></div>
                    </div>

                    <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
                    </button>

                    <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
                    </button>

                    <div class="pswp__caption">
                        <div class="pswp__caption__center"></div>
                    </div>

                </div>

            </div>

        </div>
    </div>
    <div id="previewer" v-else>
        <div class="bar">
            <button @click="back" class="action" :title="$t('files.closePreview')"
                    :aria-label="$t('files.closePreview')" id="close">
                <i class="material-icons">close</i>
            </button>

            <rename-button v-if="allowEdit()"></rename-button>
            <delete-button v-if="allowEdit()"></delete-button>
            <download-button></download-button>
            <info-button></info-button>
        </div>

        <button class="action" @click="prev" v-show="hasPrevious" :aria-label="$t('buttons.previous')"
                :title="$t('buttons.previous')">
            <i class="material-icons">chevron_left</i>
        </button>
        <button class="action" @click="next" v-show="hasNext" :aria-label="$t('buttons.next')"
                :title="$t('buttons.next')">
            <i class="material-icons">chevron_right</i>
        </button>

        <div class="preview">
            <img v-if="req.type == 'image'" :src="raw()">
            <span class="video-container" v-else-if="req.type == 'video'">
                <video :src="raw()" autoplay controls>
                    <track v-for="(sub, index) in subtitles" :kind="sub.kind" :src="'/api/subtitle/' + sub.src"
                           :label="sub.label" :default="index === 0">
                    Sorry, your browser doesn't support embedded videos,
                    but don't worry, you can <a :href="download()">download it</a>
                    and watch it with your favorite video player!
                </video>
            </span>
            <object v-else-if="req.extension == '.pdf'" class="pdf" :data="raw()"></object>
            <a v-else-if="req.type == 'blob'" :href="download()">
                <h2 class="message">{{ $t('buttons.download') }} <i class="material-icons">file_download</i></h2>
            </a>
            <pre v-else>{{ req.content }}</pre>
        </div>
    </div>
</template>

<script>
    import {mapState} from 'vuex'
    import * as url from '@/utils/url'
    import * as api from '@/utils/api'
    import InfoButton from '@/components/buttons/Info'
    import DeleteButton from '@/components/buttons/Delete'
    import RenameButton from '@/components/buttons/Rename'
    import DownloadButton from '@/components/buttons/Download'

    import PhotoSwipe from '@dlevs/photoswipe/dist/photoswipe'
    import PhotoSwipeUI_Default from '@dlevs/photoswipe/dist/photoswipe-ui-default'
    import '@dlevs/photoswipe/dist/default-skin/default-skin.css'
    import '@dlevs/photoswipe/dist/photoswipe.css'

    export default {
        name: 'preview',
        components: {
            InfoButton,
            DeleteButton,
            RenameButton,
            DownloadButton
        },
        data: function () {
            return {
                ps: null,
                options: {
                    barsSize: {top: 0, bottom: 'auto'},
                    index: 0,
                    getDoubleTapZoom: function (isMouseClick, item) {
                        if (isMouseClick) {
                            return 2 //<---- This 4
                        } else {
                            return item.initialZoomLevel < 0.7 ? 2 : 1.33 //<---- 4 here
                        }
                    },
                    maxSpreadZoom: 2 //<---- and this 4 here
                },
                previousLink: '',
                nextLink: '',
                listing: null,
                subtitles: []
            }
        },
        computed: {
            ...mapState(['req', 'oldReq']),
            hasPrevious() {
                return (this.previousLink !== '')
            },
            hasNext() {
                return (this.nextLink !== '')
            }
        },
        mounted() {
            api.fetch(url.removeLastDir(this.$route.path))
                .then(req => {
                    this.listing = req
                    this.applyTypeFilter(this.req.type)
                    if (this.req.type == 'image') {
                        let items = this.listing.items
                        let list = []
                        for (let i = 0; i < items.length; i++) {
                            let src = this.raw(items[i].url)
                            list.push({
                                src: src,
                                w: 0,
                                h: 0
                            })
                        }
                        this.options.index = this.getPos()
                        let gallery = this.ps = new PhotoSwipe(document.querySelectorAll('.pswp')[0], PhotoSwipeUI_Default, list, this.options)
                        gallery.listen('gettingData', function (index, item) {
                            if (item.w < 1 || item.h < 1) { // unknown size
                                let img = new Image()
                                img.onload = () => { // will get size after load
                                    item.w = img.width  // set image width
                                    item.h = img.height   // set image height
                                    gallery.invalidateCurrItems() // reinit Items
                                    gallery.updateSize(true) // reinit Items
                                }
                                img.src = item.src // let's download image
                            }
                        })
                        let _that = this
                        gallery.listen('destroy', function (ev) {
                            _that.back(ev)
                        })
                        gallery.listen('parseVerticalMargin', function (item) {
                            // For example:
                            var gap = item.vGap

                            gap.top = 0 // There will be 50px gap from top of viewport
                            gap.bottom = 0 // and 100px gap from the bottom
                        })
                        this.ps.init()

                    } else {
                        this.updateLinks()
                        window.addEventListener('keyup', this.key)
                    }

                }).catch(this.$showError)

            if (this.req.type === 'audio' || this.req.type === 'video') {
                api.subtitles(this.req.url.slice(6))
                    .then(req => {
                        this.subtitles = req
                    }).catch(this.$showError)
            }

        },
        beforeDestroy() {
            window.removeEventListener('keyup', this.key)
        },
        methods: {
            getPos() {
                for (let i = 0; i < this.listing.items.length; i++) {
                    if (this.listing.items[i].name === this.req.name) {
                        return i
                    }
                }
                return null
            },
            applyTypeFilter(t) {
                if (!t || t == '') {
                    return
                }
                this.listing.items = this.listing.items.filter(item => item.type == t)
            },
            download(itemUrl) {
                let res
                if (!itemUrl) {
                    res = `${this.$store.state.baseURL}/api/download`
                    res += this.req.url.slice(6)
                } else {
                    res = url.convertToDownload(itemUrl)
                }
                return res
            },
            raw(itemUrl) {
                return `${this.download(itemUrl)}?&inline=true`
            },
            back(event) {
                let uri = url.removeLastDir(this.$route.path) + '/'
                this.$router.push({path: uri})
            },
            prev() {
                this.$router.push({path: this.previousLink})
            },
            next() {
                this.$router.push({path: this.nextLink})
            },
            key(event) {
                event.preventDefault()

                if (event.which === 13 || event.which === 39) { // right arrow
                    if (this.hasNext) this.next()
                } else if (event.which === 37) { // left arrow
                    if (this.hasPrevious) this.prev()
                }
            },
            updateLinks() {
                let pos = this.getPos()

                if (pos === null) {
                    return
                }

                if (pos !== 0) {
                    this.previousLink = this.listing.items[pos - 1].url
                }

                if (pos !== this.listing.items.length - 1) {
                    this.nextLink = this.listing.items[pos + 1].url
                }
            },
            allowEdit(event) {
                return this.$store.state.user.allowEdit
            }
        }
    }
</script>
