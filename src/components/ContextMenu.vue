<template>
    <div>
        <vue-context ref="menuctx" :closeOnScroll="false" class="context-scroll">
            <li>
                <share-button v-show="showShareButton"></share-button>
            </li>
            <li>
                <rename-button v-show="showRenameButton"></rename-button>
            </li>
            <li>
                <copy-button v-show="showCopyButton"></copy-button>
            </li>
            <li>
                <move-button v-show="showMoveButton"></move-button>
            </li>
            <li>
                <delete-button v-show="showDeleteButton"></delete-button>
            </li>
            <li>
                <switch-button v-show="isListing"></switch-button>
            </li>
            <li>
                <download-button v-show="showDownloadButton"></download-button>
            </li>
            <li>
                <upload-button v-show="showUpload"></upload-button>
            </li>
            <li>
                <info-button v-show="isFiles"></info-button>
            </li>
            <li>
                <play-audio-folder v-show="showMusicPlayer"></play-audio-folder>
            </li>
            <li>
                <download-playlist-btn v-if="showDownloadPlaylist"></download-playlist-btn>
            </li>
            <li>
                <button v-show="isListing" @click="openSelect" :aria-label="$t('buttons.selectMultiple')"
                        :title="$t('buttons.selectMultiple')" class="action">
                    <i class="material-icons">check_circle</i>
                    <span>{{ $t('buttons.select') }}</span>
                </button>
            </li>
        </vue-context>
    </div>
</template>

<script>
    import {VueContext} from 'vue-context'
    import {mapGetters, mapState} from 'vuex'
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
    import {isMobile} from '@/utils/constants'

    export default {
        components: {
            VueContext,
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

        data() {
            return {};
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
                for (let i = 0; i < this.selected.length; i++) {
                    let itm = this.req.items[this.selected[i]]
                    items = itm.isDir || itm.type === 'audio'
                    if (items) {
                        break
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
            isListing() {
                return this.req.kind === 'listing'
            }
        },

        methods: {
            openSelect() {
                this.$store.commit('multiple', true)
                this.resetPrompts()
            },
            resetPrompts() {
                this.$store.commit('closeHovers')
            },
            openMenu(event, data) {
                let element = document.getElementById('itm_' + data)
                //only 1 event
                element.dispatchEvent(new Event('click'))

                //due to some internal conflict between vue or something, need to trigger second event  only on android, did not test on others
                if (isMobile && !event.target.classList.contains("thumb")) {
                    element.dispatchEvent(new Event('click'))
                }

                this.$refs.menuctx.open(event)
            }
        }
    }
</script>
