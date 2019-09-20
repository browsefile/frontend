<template>

    <button v-if="isOne" class="action copy-clipboard"
            :data-clipboard-text="buildClipboardLink()"
            :aria-label="$t('buttons.copyToClipboard')"
            :title="$t('buttons.copyToClipboard')"><i class="material-icons">live_tv</i></button>

    <button v-else @click="show" :aria-label="$t('buttons.afolder')" :title="$t('buttons.afolder')"
            class="action"
            id="aplay-button">
        <i class="material-icons">live_tv</i>
        <span>{{ $t('buttons.afolder') }}</span>
    </button>
</template>

<script>
    import {mapGetters, mapState} from 'vuex'
    import * as url from "@/utils/url"

    export default {
        name: 'download-playlist-btn',
        computed: {
            ...mapState(['selected', 'req', 'jwt']),
            ...mapGetters(['selectedCount']),
            isOne: function () {
                return this.selected.length == 1 && !this.req.items[this.selected[0]].isDir
            },
        }, methods: {

            show: function (event) {
                event.preventDefault()

                this.$store.commit('showHover', 'downloadplaylist')

            },
            buildClipboardLink: function () {
                let src = ""
                if (this.selected.length > 0) {
                    src = url.convertToPreview(this.req.items[this.selected[0]].url, false, this.jwt, this.isShare)
                }

                return src
            }
        }
    }
</script>
