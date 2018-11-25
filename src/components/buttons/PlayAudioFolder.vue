<template>
    <button @click="show" :aria-label="$t('buttons.afolder')" :title="$t('buttons.afolder')" class="action"
            id="aplay-button">
        <i class="material-icons">queue_music</i>
        <span>{{ $t('buttons.afolder') }}</span>
    </button>
</template>

<script>
  import {mapGetters, mapState} from 'vuex'
  import {playerEventBus} from '../../main'
  import * as url from '@/utils/url'

  export default {
    name: 'play-audio-folder',
    computed: {
      ...mapState(['selected', 'req']),
      ...mapGetters(['selectedCount'])
    }, methods: {
      show: function (event) {
        event.preventDefault()
        let playList = []
        for (let i = 0; i < this.selected.length; i++) {
          let sel = this.req.items[this.selected[i]]
          if (sel.isDir) {
            playList.push(sel.url)
          }
        }
        if (playList.length == 0) {
          if (this.req.items) {
            for (let i = 0; i < this.req.items.length; i++) {
              let sel = this.req.items[i]
              if (!sel.isDir && (sel.type == 'audio' || sel.type == 'video')) {
                playList.push({
                  name: sel.name,
                  url: url.convertToDownload(sel.url)
                })
              }
            }
          }

          playerEventBus.$emit('playTrack', playList)
        } else {
          playerEventBus.$emit('playFolders', playList)
        }
      }
    }
  }
</script>
