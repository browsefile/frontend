<template>
    <div v-if="isMedia()">
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

            <rename-button></rename-button>
            <delete-button></delete-button>
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
            <img v-if="req.type == 'image'" :src="raw">
            <audio v-else-if="req.type == 'audio'" :src="raw" autoplay controls></audio>
            <video v-else-if="req.type == 'video'" :src="raw" autoplay controls>
                Sorry, your browser doesn't support embedded videos,
                but don't worry, you can <a :href="download">download it</a>
                and watch it with your favorite video player!
            </video>
            <object v-else-if="req.extension == '.pdf'" class="pdf" :data="raw"></object>
            <a v-else-if="req.type == 'blob'" :href="download">
                <h2 class="message">{{ $t('buttons.download') }} <i class="material-icons">file_download</i></h2>
            </a>
        </div>
    </div>
</template>

<script>
    import {mapState} from 'vuex'
    import * as url from "@/utils/url"
    import {baseURL} from '@/utils/constants'
    import * as files from "@/api/files";
    import * as share from "@/api/share";
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
                listing: null
            }
        },
        computed: {
            ...mapState(['req', 'user', 'oldReq', 'jwt', 'isShare']),
            hasPrevious() {
                return (this.previousLink !== '')
            },
            hasNext() {
                return (this.nextLink !== '')
            },
            download() {
                return `${baseURL}${url.convertToDownload(this.req.url)}?auth=${this.jwt}`
            },
            raw() {
                return `${this.download}&inline=true`
            }
        },
        async mounted() {

            try {
                let res
                if (this.oldReq.items) {
                    res = this.oldReq
                } else if (this.req.items) {
                    res = this.req
                } else {
                    let u = url.makeFileUrl(this.isShare, this.$route)
                    if (this.isShare) {
                        res = await share.get(u)

                    } else {
                        res = await files.fetch(u)

                    }

                }

                this.listing = res
                if (this.isMedia()) {
                    if (res.items) {
                        let items = this.applyTypeFilter(res.items, this.isMedia() ? ['image', 'video'] : [this.req.type]);
                        this.listing = items
                        let list = []
                        for (let i = 0; i < items.length; i++) {
                            let src = url.convertToPreview(items[i].url, false, this.jwt, this.isShare, this.$route.query.rootHash)

                            if (items[i].type == 'video') {
                                list.push({
                                    html: "<video src='" + src + "' controls > </video>",
                                    w: window.screen.width,
                                    h: window.screen.height
                                })
                            } else {
                                list.push({
                                    src: src,
                                    w: 0,
                                    h: 0
                                })
                            }
                        }
                        this.options.index = this.getPos()
                        let gallery = this.ps = new PhotoSwipe(document.querySelectorAll('.pswp')[0], PhotoSwipeUI_Default, list, this.options)
                        gallery.listen('gettingData', function (index, item) {
                            if (item.w < 1 || item.h < 1) { // unknown size
                                let img = new Image()
                                img.onload = () => { // will get size after load
                                    item.w = img.width  // set image width
                                    item.h = img.height   // set image height
                                    //gallery.invalidateCurrItems() // reinit Items
                                    item.needsUpdate = true
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
                        gallery.framework.bind(gallery.scrollWrap /* bind on any element of gallery */, 'pswpTap', function (e) {
                            if ('video' == e.detail.target.tagName.toLowerCase()) {
                                e.detail.target.setAttribute("controls", "controls");
                            }
                            // e.detail.origEvent  // original event that finished tap (e.g. mouseup or touchend)
                            // e.detail.target // e.target of original event
                            // e.detail.releasePoint // object with x/y coordinates of tap
                            // e.detail.pointerType // mouse, touch, or pen
                        });
                    }

                } else {
                    window.addEventListener('keyup', this.key)
                    this.updateLinks(res.items)
                }

            } catch (e) {
                this.$showError(e)
            }
        },
        beforeDestroy() {
            window.removeEventListener('keyup', this.key)
        },
        methods: {
            isMedia() {
                return this.req.type == 'video' || this.req.type == 'image'
            },
            getPos() {
                for (let i = 0; i < this.listing.length; i++) {
                    if (this.listing[i].name === this.req.name) {
                        return i
                    }
                }
                return null
            },
            applyTypeFilter(items, t) {
                if (!t || t.length == 0) {
                    return
                }
                return items.filter(file => t.filter(ti => file.type == ti).length > 0)
            },
            back() {
                this.$router.go(-1)
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
                    this.previousLink = this.listing[pos - 1].url
                }

                if (pos !== this.listing.length - 1) {
                    this.nextLink = this.listing[pos + 1].url
                }
            }

        }
    }
</script>
