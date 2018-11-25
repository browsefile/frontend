<template>
    <div class="player">
        <div id="player"></div>
    </div>
</template>

<script>
    import {playerEventBus} from '../../main'
    import APlayer from 'aplayer/dist/APlayer.min'
    import 'aplayer/dist/APlayer.min.css'
    import {mapMutations, mapGetters, mapState} from 'vuex'
    import * as api from '../../utils/api'
    import * as url from '../../utils/url'

    export default {
        name: 'AudioPlayer',
        data: function () {
            return {
                player: null,
            }
        },
        props: [],
        computed: {
            ...mapState(['req']),
            ...mapGetters([])

        },
        methods: {
            ...mapMutations([]),
            fetch(path) {
                let _that = this
                api.fetch(path)
                    .then(function (req) {
                        for (let i in  req.items) {
                            let item = req.items[i]
                            if (item.isDir) {
                                // Do recursive here
                                _that.fetch(item.url)
                            } else if (item.type == 'audio') {
                                _that.player.list.add({
                                    name: item.name,
                                    url: url.convertToDownload(item.url)
                                })
                                if (!this.isShow) {
                                    this.isShow = true
                                }
                            }
                        }
                    }).catch(_that.$showError)
            },
            playTrack(tracks) {
                this.init()
                this.player.list.clear()
                //
                for (let i in  tracks) {
                    let itm = tracks[i]
                    this.player.list.add(itm)
                }
                if (this.player.list.audios.length == 0) {
                    this.player.notice('Empty list')
                } else {
                    this.isShow = true
                }

                this.player.setMode('normal')
                this.player.play()
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
            playerEventBus.$off('playTrack', this.playTrack)
            playerEventBus.$off('playFolders', this.playFolders)
            if (this.player) {
                this.player.destroy()
            }
        },
        mounted() {
            playerEventBus.$on('playTrack', this.playTrack)
            playerEventBus.$on('playFolders', this.playFolders)
        }

    }
</script>
