<template>
    <header>
        <div>
            <button @click="openSidebar" :aria-label="$t('buttons.toggleSidebar')" :title="$t('buttons.toggleSidebar')"
                    class="action">
                <i class="material-icons">menu</i>
            </button>
            <img :src="logoURL" alt="Browsefile">
            <search v-if="isLogged"></search>
        </div>
        <div>
            <template v-if="isLogged">
                <button @click="openSearch" :aria-label="$t('buttons.search')" :title="$t('buttons.search')"
                        class="search-button action">
                    <i class="material-icons">search</i>
                </button>

                <button v-show="showSaveButton" :aria-label="$t('buttons.save')" :title="$t('buttons.save')"
                        class="action" id="save-button">
                    <i class="material-icons">save</i>
                </button>

                <button @click="openMore" id="more" :aria-label="$t('buttons.more')" :title="$t('buttons.more')"
                        class="action">
                    <i class="material-icons">more_vert</i>
                </button>

                <!-- Menu that shows on listing AND mobile when there are files selected -->
                <div id="file-selection" v-if="isMobile && isListing">
                    <span v-if="selectedCount > 0">{{ selectedCount }} selected</span>
                    <share-button v-show="showShareButton"></share-button>
                    <rename-button v-show="showRenameButton"></rename-button>
                    <copy-button v-show="showCopyButton"></copy-button>
                    <move-button v-show="showMoveButton"></move-button>
                    <delete-button v-show="showDeleteButton"></delete-button>
                </div>
                <play-audio-folder v-show="showMusicPlayer"></play-audio-folder>
                <download-playlist-btn v-if="showDownloadPlaylist"></download-playlist-btn>

                <!-- This buttons are shown on a dropdown on mobile phones -->
                <div id="dropdown" :class="{ active: showMore }">
                    <div v-if="!isListing || !isMobile">
                        <share-button v-show="showShareButton"></share-button>
                        <rename-button v-show="showRenameButton"></rename-button>
                        <copy-button v-show="showCopyButton"></copy-button>
                        <move-button v-show="showMoveButton"></move-button>
                        <delete-button v-show="showDeleteButton"></delete-button>
                    </div>

                    <switch-button v-show="isListing"></switch-button>
                    <download-button v-show="showDownloadButton"></download-button>
                    <upload-button v-show="showUpload"></upload-button>
                    <info-button v-show="isFiles"></info-button>

                    <button v-show="isListing" @click="openSelect" :aria-label="$t('buttons.selectMultiple')"
                            :title="$t('buttons.selectMultiple')" class="action">
                        <i class="material-icons">check_circle</i>
                        <span>{{ $t('buttons.select') }}</span>
                    </button>
                </div>
            </template>

            <div v-show="showOverlay" @click="resetPrompts" class="overlay"></div>
        </div>
    </header>
</template>

<script>
    import Search from './Search'
    import InfoButton from './buttons/Info'
    import DeleteButton from './buttons/Delete'
    import RenameButton from './buttons/Rename'
    import UploadButton from './buttons/Upload'
    import DownloadButton from './buttons/Download'
    import SwitchButton from './buttons/SwitchView'
    import MoveButton from './buttons/Move'
    import CopyButton from './buttons/Copy'
    import ShareButton from './buttons/Share'
    import PlayAudioFolder from './buttons/PlayAudioFolder'
    import DownloadPlaylistBtn from './buttons/DownloadPlaylistBtn'
    import {mapGetters, mapState} from 'vuex'
    import {logoURL} from '@/utils/constants'
    import * as api from '@/api'

    import buttons from '@/utils/buttons'
    import Clipboard from 'clipboard'

    export default {
        name: 'header-layout',
        components: {
            Search,
            InfoButton,
            DeleteButton,
            ShareButton,
            RenameButton,
            DownloadButton,
            CopyButton,
            UploadButton,
            SwitchButton,
            MoveButton,
            PlayAudioFolder,
            DownloadPlaylistBtn
        },
        data: function () {
            return {
                clip: null,
                width: window.innerWidth,
                pluginData: {
                    api,
                    buttons,
                    'store': this.$store,
                    'router': this.$router
                }
            }
        },
        created() {
            window.addEventListener('resize', () => {
                this.width = window.innerWidth
            })
        },
        computed: {
            ...mapGetters([
                'selectedCount',
                'isFiles',
                'isEditor',
                'isListing',
                'isLogged'
            ]),
            ...mapState([
                'selected',
                'req',
                'user',
                'loading',
                'multiple',
                'isShare'
            ]),
            logoURL: () => logoURL,
            showMusicPlayer() {
                let items = false
                if (this.req.items && this.req.items.length > 0) {
                    for (let i = 0; i < this.selected.length; i++) {
                        let itm = this.req.items[this.selected[i]]
                        items = itm && (itm.isDir || itm.type === 'audio')
                        if (items) {
                            break
                        }
                    }
                }

                return this.isListing && items
            },
            isMobile() {
                return this.width <= 736
            },
            showUpload() {
                return this.isListing && !this.isShare
            },
            showSaveButton() {
                return this.isEditor && !this.isShare
            },
            showDownloadButton() {
                return this.isFiles
            },
            showDeleteButton() {
                return this.isFiles && this.selectedCount !== 0 && !this.isShare
            },
            showRenameButton() {
                return this.isFiles && this.selectedCount === 1 && !this.isShare
            },
            showShareButton() {
                return this.isFiles && this.selectedCount === 1 && !this.isShare && this.req.items[this.selected[0]].isDir
            },
            showMoveButton() {
                return this.isFiles && this.selectedCount > 0 && !this.isShare
            },
            showCopyButton() {
                return this.isFiles && this.selectedCount > 0 && !this.isShare
            },
            showDownloadPlaylist() {
                if (this.selectedCount > 0) {
                    let res = false
                    for (let i = 0; i < this.selectedCount; i++) {
                        let itm = this.req.items[this.selected[i]]
                        res = itm.isDir || itm.type === 'video' || itm.type === 'image' || itm.type === 'audio'
                        if (res) {
                            break
                        }
                    }
                    return res
                }
            },
            showMore() {
                return this.isFiles && this.$store.state.show === 'more'
            },
            showOverlay() {
                return this.showMore
            },
            isListing() {
                return this.req.kind === 'listing'
            }
        },
        mounted() {
            this.clip = new Clipboard('.copy-clipboard')
            this.clip.on('success', () => {
                this.$showSuccess(this.$t('success.linkCopied'))
            })
        },
        beforeDestroy() {
            this.clip.destroy()
        },
        methods: {
            openSidebar() {
                this.$store.commit('showHover', 'sidebar')
            },
            openMore() {
                this.$store.commit('showHover', 'more')
            },
            openSearch() {
                this.$store.commit('showHover', 'search')
            },
            openSelect() {
                this.$store.commit('multiple', true)
                this.resetPrompts()
            },
            resetPrompts() {
                this.$store.commit('closeHovers')
            }
        }
    }
</script>
