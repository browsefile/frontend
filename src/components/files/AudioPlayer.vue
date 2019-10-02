<template>
    <div class="player">
        <div id="player"></div>
    </div>
</template>

<script>
    import APlayer from 'aplayer/dist/APlayer.min'
    import 'aplayer/dist/APlayer.min.css'
    import {mapMutations, mapGetters, mapState} from 'vuex'
    import * as url_parser from '../../utils/url'
    import {files as api, share as shares} from '@/api'
    import {external} from "../../utils/constants";

    export default {
        name: 'AudioPlayer',
        data: function () {
            return {
                player: null,
            }
        },
        props: [],
        computed: {
            ...mapState(['req', 'jwt', 'isShare']),
            ...mapGetters([])

        },
        methods: {
            ...mapMutations([]),
            async fetch(path) {
                let _that = this
                try {

                    if (path.includes('?')) {
                        path += '&recursive=true&query=type:audio%20n'
                    } else {
                        path += "?recursive=true&query=type:audio%20n"
                    }
                    if (external) {
                        path += '&rootHash=' + this.$route.query.rootHash
                    }

                    let res
                    if (this.isShare) {
                        res = await shares.get(path, false)
                    } else {
                        res = await api.fetch(path)
                    }
                    let itemsFiltered = res.items.filter(it => it.type == 'audio')
                    for (let i in itemsFiltered) {
                        itemsFiltered[i].url = url_parser.convertToPreview(itemsFiltered[i].url, false, this.jwt, this.isShare, this.$route.query.rootHash)
                    }

                    if (itemsFiltered.length > 0)
                        _that.player.list.add(itemsFiltered.map(it => {
                            return {
                                name: it.name,
                                url: it.url
                            }
                        }))
                    if (_that.player.list.audios.length == 0) {
                        _that.player.notice('Empty list')
                    } else {
                        _that.player.play()
                    }
                } catch (e) {
                    this.$showError(e)
                }
            },
            playTrack(tracks) {
                this.init()
                this.player.list.clear()

                for (let i in  tracks) {
                    let itm = tracks[i]
                    itm.url = url_parser.convertToPreview(itm.url, false, this.jwt, this.isShare, this.$route.query.rootHash)
                    this.player.list.add(itm)
                }
                if (this.player.list.audios.length == 0) {
                    this.player.notice('Empty list')
                } else {
                    this.player.play()
                }
            },
            playFolders(paths) {
                this.init()
                this.player.setMode('normal')
                this.player.list.show()
                this.player.list.clear()
                for (let p in paths) {
                    this.fetch(paths[p])
                }
            },
            init() {
                if (!this.player) {
                    this.player = new APlayer({
                        element: document.getElementById('player'),
                        fixed: true
                    })
                }
            }
        }, beforeDestroy() {
            this.$root.$off('playTrack', this.playTrack)
            this.$root.$off('playFolders', this.playFolders)
            if (this.player) {
                this.player.destroy()
            }
        },
        mounted() {
            this.$root.$on('playTrack', this.playTrack)
            this.$root.$on('playFolders', this.playFolders)
        }

    }
</script>
