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
                api.fetch(path + "?recursive=true")
                    .then(function (req) {
                        let itemsFiltered = req.items.filter(it => it.type == 'audio')
                        for (let i in itemsFiltered) {
                            itemsFiltered[i].url = url.convertToDownload(itemsFiltered[i].url)
                        }
                        _that.player.list.add(itemsFiltered.map(it => {
                            return {
                                name: it.name,
                                url: url.convertToDownload(it.url)
                            }
                        }))
                        if (_that.player.list.audios.length == 0) {
                            _that.player.notice('Empty list')
                        } else {
                            _that.player.play()
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
