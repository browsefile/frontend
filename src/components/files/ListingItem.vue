<template>
    <div class="item"
         role="button"
         tabindex="0"
         draggable="true"
         @dragstart="dragStart"
         @dragover="dragOver"
         @drop="drop"
         @click="click"
         @dblclick="open"
         @touchstart="touchstart"
         :data-dir="isDir"
         :aria-label="name"
         :aria-selected="isSelected">
        <template v-if="thumb">
            <img class="thumb" :src="getThumbNailURL()" @error="thumb = false"/>
        </template>
        <template v-else>
            <div>
                <i class="material-icons">{{ icon }}</i>
            </div>
        </template>

        <div>
            <p class="name">{{ name }}</p>

            <p v-if="isDir" class="size" data-order="-1">&mdash;</p>
            <p v-else class="size" :data-order="humanSize()">{{ humanSize() }}</p>
            <p class="modified">
                <time :datetime="modified">{{ humanTime() }}</time>
            </p>
        </div>
    </div>
</template>

<script>
  import {mapMutations, mapGetters, mapState} from 'vuex'
  import filesize from 'filesize'
  import moment from 'moment'
  import * as api from '@/utils/api'
  import * as url from '../../utils/url'
  import {playerEventBus} from '../../main'

  export default {
    name: 'item',
    data: function () {
      return {
        thumb: false,
        touches: 0
      }
    },
    props: ['name', 'isDir', 'url', 'type', 'size', 'modified', 'index'],
    computed: {
      ...mapState(['selected', 'req']),
      ...mapGetters(['selectedCount']),
      isSelected () {
        return (this.selected.indexOf(this.index) !== -1)
      },
      icon () {
        if (this.isDir) return 'folder'
        if (this.type === 'image') return 'insert_photo'
        if (this.type === 'audio') return 'volume_up'
        if (this.type === 'video') return 'movie'
        return 'insert_drive_file'
      }
    }, mounted () {
      this.thumb = this.type != 'text' && this.type != 'audio' && !this.isDir
    },
    methods: {
      ...mapMutations(['addSelected', 'removeSelected', 'resetSelected']),
      getThumbNailURL: function () {
        return url.convertToDownload(this.url) + '?inline=true&previewType=thumb'
      },
      isThumb: function () {
        return this.thumb
      },
      humanSize: function () {
        return filesize(this.size)
      },
      humanTime: function () {
        return moment(this.modified).fromNow()
      },
      dragStart: function (event) {
        if (this.selectedCount === 0) {
          this.addSelected(this.index)
          return
        }

        if (!this.isSelected) {
          this.resetSelected()
          this.addSelected(this.index)
        }
      },
      dragOver: function (event) {
        if (!this.isDir) return

        event.preventDefault()
        let el = event.target

        for (let i = 0; i < 5; i++) {
          if (!el.classList.contains('item')) {
            el = el.parentElement
          }
        }

        el.style.opacity = 1
      },
      drop: function (event) {
        if (!this.isDir) return
        event.preventDefault()

        if (this.selectedCount === 0) return

        let items = []

        for (let i of this.selected) {
          items.push({
            from: this.req.items[i].url,
            to: this.url + encodeURIComponent(this.req.items[i].name)
          })
        }

        api.move(items)
          .then(() => {
            this.$store.commit('setReload', true)
          })
          .catch(this.$showError)
      },
      click: function (event, name) {
        if (this.selectedCount !== 0) event.preventDefault()
        if (this.$store.state.selected.indexOf(this.index) !== -1) {
          this.removeSelected(this.index)
          return
        }

        if (event.shiftKey && this.selected.length === 1) {
          let fi = 0
          let la = 0

          if (this.index > this.selected[0]) {
            fi = this.selected[0] + 1
            la = this.index
          } else {
            fi = this.index
            la = this.selected[0] - 1
          }

          for (; fi <= la; fi++) {
            this.addSelected(fi)
          }

          return
        }

        if (!event.ctrlKey && !this.$store.state.multiple) this.resetSelected()
        this.addSelected(this.index)
      },
      touchstart (event) {
        setTimeout(() => {
          this.touches = 0
        }, 300)

        this.touches++
        if (this.touches > 1) {
          this.open()
        }
      },
      open: function (event) {
        if (this.type == 'audio') {
          event.preventDefault()
          playerEventBus.$emit('playTrack', [{
            name: this.name,
            url: url.convertToDownload(this.url)
          }])
        } else {
          this.$router.push({path: this.url})
        }
      }
    }
  }
</script>
