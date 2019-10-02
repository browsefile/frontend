<template>
    <div class="card floating">
        <div class="card-title">
            <h2>{{ $t('prompts.downloadPlaylist.name') }}</h2>
        </div>

        <div class="card-content">
            <ul>
                <li>
                    <input type="checkbox" id="videos" v-model="v">
                    <label for="videos">{{ $t('checkbox.video') }}</label>
                </li>
                <li>
                    <input type="checkbox" id="music" v-model="a">
                    <label for="music">{{ $t('checkbox.music') }}</label>
                </li>
                <li>
                    <input type="checkbox" id="image" v-model="i">
                    <label for="image">{{ $t('checkbox.image') }}</label>
                </li>

            </ul>
        </div>

        <div class="card-action">
            <button class="button button--flat button--grey"
                    @click="$store.commit('closeHovers')"
                    :aria-label="$t('buttons.cancel')"
                    :title="$t('buttons.cancel')">{{ $t('buttons.cancel') }}
            </button>
            <button type="submit"
                    @click="downloadPlaylist"
                    class="button button--flat"
                    :aria-label="$t('buttons.ok')"
                    :title="$t('buttons.ok')">{{ $t('buttons.ok') }}
            </button>
        </div>
    </div>
</template>

<script>
    import {mapState, mapGetters} from 'vuex'
    import * as files from '@/api/files'
    import * as share from '@/api/share'

    export default {
        name: "downloadplaylist",
        data: function () {
            return {
                v: true,
                a: false,
                i: false
            }
        },
        computed: {
            ...mapState(['req', 'selected', 'isShare']),
            ...mapGetters(['selectedCount'])
        },
        methods: {
            downloadPlaylist: async function (event) {
                event.preventDefault()
                //directory

                let ft = ''
                if (this.v) {
                    ft += 'v'
                }
                if (this.a) {
                    ft += 'a'
                }
                if (this.i) {
                    ft += 'i'
                }

                if (ft.length > 0) {
                    let filesList = []

                    for (let sel of this.selected) {
                        sel = this.req.items[sel]
                        if (sel.isDir || sel.type === 'audio' || sel.type === 'image' || sel.type === 'video') {
                            filesList.push(sel.url)
                        }
                    }
                    if (this.isShare) {
                        share.download('m3u_' + ft, this.$route.query.rootHash, ...filesList)
                    } else {
                        files.download('m3u_' + ft, ...filesList)
                    }
                }

                this.$store.commit('closeHovers')
            }
        }
    }
</script>

