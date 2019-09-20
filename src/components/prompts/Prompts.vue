<template>
    <div>
        <help v-if="showHelp"></help>
        <new-file v-else-if="showNewFile"></new-file>
        <new-dir v-else-if="showNewDir"></new-dir>
        <rename v-else-if="showRename"></rename>
        <delete v-else-if="showDelete"></delete>
        <info v-else-if="showInfo"></info>
        <move v-else-if="showMove"></move>
        <copy v-else-if="showCopy"></copy>
        <replace v-else-if="showReplace"></replace>
        <share v-else-if="show === 'share'"></share>
        <download-playlist v-else-if="showDownloadPlaylist"></download-playlist>
        <div v-show="showOverlay" @click="resetPrompts" class="overlay"></div>
    </div>
</template>

<script>
    import Help from './Help'
    import Info from './Info'
    import Delete from './Delete'
    import Rename from './Rename'
    import Move from './Move'
    import Copy from './Copy'
    import NewFile from './NewFile'
    import NewDir from './NewDir'
    import Replace from './Replace'
    import Share from './Share'
    import DownloadPlaylist from './DownloadPlaylist'
    import {mapState} from 'vuex'
    import buttons from '@/utils/buttons'

    export default {
        name: 'prompts',
        components: {
            Info,
            Delete,
            Rename,
            Move,
            Copy,
            Share,
            NewFile,
            NewDir,
            Help,
            Replace,
            DownloadPlaylist
        },
        data: function () {
            return {
                pluginData: {
                    buttons,
                    'store': this.$store,
                    'router': this.$router
                }
            }
        },
        computed: {
            ...mapState(['show', 'plugins']),
            showInfo: function () {
                return this.show === 'info'
            },
            showHelp: function () {
                return this.show === 'help'
            },
            showDelete: function () {
                return this.show === 'delete'
            },
            showRename: function () {
                return this.show === 'rename'
            },
            showMove: function () {
                return this.show === 'move'
            },
            showCopy: function () {
                return this.show === 'copy'
            },
            showNewFile: function () {
                return this.show === 'newFile'
            },
            showNewDir: function () {
                return this.show === 'newDir'
            },
            showReplace: function () {
                return this.show === 'replace'
            },
            showOverlay: function () {
                return (this.show !== null && this.show !== 'search' && this.show !== 'more')
            },
            showDownloadPlaylist: function () {
                return this.show === 'downloadplaylist'
            }
        },
        methods: {
            resetPrompts() {
                this.$store.commit('closeHovers')
            }
        }
    }
</script>
