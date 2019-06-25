<template>
    <button class="action copy-clipboard"
            :data-clipboard-text="buildClipboardLink()"
            :aria-label="$t('buttons.copyToClipboard')"
            :title="$t('buttons.copyToClipboard')"><i class="material-icons">view_stream</i></button>
</template>

<script>
    import {mapState} from 'vuex'
    import * as url from '../../utils/url'

    export default {
        name: 'clipboard-button',
        computed: {
            ...mapState(['req', 'selected', 'isShare', 'jwt']),
        },
        methods: {
            buildClipboardLink() {
                let src = ""
                if (this.selected.length > 0) {
                    src = url.convertToPreview(this.req.items[this.selected[0]].url, false, this.jwt)
                }

                return src
            }
        }
    }
</script>
