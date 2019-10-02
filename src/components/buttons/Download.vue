<template>
    <button @click="download" :aria-label="$t('buttons.download')" :title="$t('buttons.download')" id="download-button"
            class="action">
        <i class="material-icons">file_download</i>
        <span>{{ $t('buttons.download') }}</span>
        <span v-if="selectedCount > 0" class="counter">{{ selectedCount }}</span>
    </button>
</template>

<script>
    import {mapGetters, mapState} from 'vuex'
    import * as files from '@/api/files'
    import * as share from '@/api/share'

    export default {
        name: 'download-button',
        computed: {
            ...mapState(['req', 'selected', 'isShare']),
            ...mapGetters(['selectedCount'])
        },
        methods: {
            download: function () {
                if (this.selectedCount === 0) {
                    if (this.isShare) {
                        share.download('zip', '', this.$route.path)
                    } else {
                        files.download('zip', this.$route.query.rootHash, this.$route.path)
                    }
                } else {
                    let filesList = []

                    for (let i of this.selected) {
                        filesList.push(this.req.items[i].url)
                    }

                    if (this.isShare) {
                        share.download('zip', this.$route.query.rootHash, ...filesList)
                    } else {
                        files.download('zip', ...filesList)
                    }
                }


            }
        }
    }
</script>
