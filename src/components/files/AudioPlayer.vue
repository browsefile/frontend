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
    import url from '@/utils/url'
    import {files as api} from '@/api'

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
            async fetch(path) {
                let _that = this
                try {
                    let res = await api.fetch(path + "?recursive=true")

                    let itemsFiltered = res.items.filter(it => it.type == 'audio')
                    for (let i in itemsFiltered) {
                        itemsFiltered[i].url = url.convertToPreview(itemsFiltered[i].url)
                    }
                    _that.player.list.add(itemsFiltered.map(it => {
                        return {
                            name: it.name,
                            url: url.convertToPreview(it.url)
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
