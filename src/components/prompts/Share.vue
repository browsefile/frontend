<template>
    <div class="card floating" id="share">
        <div class="card-title">
            <h2>{{ $t('buttons.share') + ' ' + item.path}}</h2>
        </div>

        <div class="card-content">
            <ul>
                <li>
                    <input type="checkbox" id="allowExternal" v-model="item.allowExternal">
                    <label for="allowExternal">{{ $t('buttons.allowExternal') }}</label>
                </li>
                <li>
                    <input type="checkbox" id="allowLocal" v-model="item.allowLocal">
                    <label for="allowLocal">{{ $t('buttons.allowLocal') }}</label>
                </li>
                <br>
                <label >{{ $t('buttons.allowedUsers')}}</label>
                <li v-for="u in allowed">
                    <input type="checkbox" :id="u.user" v-model="u.allowed">
                    <label :for="u">{{ u.user }}</label>
                </li>
            </ul>
        </div>

        <div class="card-action">
            <button class="button button--flat"
                    @click="saveShare()"
                    :aria-label="$t('buttons.save')"
                    :title="$t('buttons.save')">{{ $t('buttons.save') }}
            </button>
            <button class="button button--flat"
                    @click="$store.commit('closeHovers')"
                    :aria-label="$t('buttons.close')"
                    :title="$t('buttons.close')">{{ $t('buttons.close') }}
            </button>
        </div>
    </div>
</template>

<script>
    import {mapState, mapGetters} from 'vuex'
    import {share as api} from '@/api'
    import {baseURL} from '@/utils/constants'
    import moment from 'moment'
    import Clipboard from 'clipboard'

    export default {
        name: 'share',
        data: function () {
            return {
                allowed: [],
                item: {},
                clip: null
            }
        },
        computed: {
            ...mapState(['req', 'selected', 'selectedCount']),
            ...mapGetters(['isListing']),
            url() {
                if (!this.isListing) {
                    return this.$route.path
                }

                if (this.selectedCount === 0 || this.selectedCount > 1) {
                    // This shouldn't happen.
                    return
                }

                return this.req.items[this.selected[0]].url
            }
        },
        async beforeMount() {
            try {
                let urlPath = this.url
                let item = await api.get(urlPath, true)

                if (!item.path) {
                    item.path = urlPath
                }
                if (!item.allowedUsers) {
                    item.allowedUsers = []
                }
                item.allowedUsers.forEach(itm => {
                    this.allowed.push({
                        'user': itm,
                        'allowed': true
                    })
                })

                this.item = item;

            } catch (e) {
                this.$showError(e)
            }
        },
        mounted() {
            this.clip = new Clipboard('.copy-clipboard')
            this.clip.on('success', () => {
                this.$showSuccess(this.$t('success.linkCopied'))
            })
        },
        beforeDestroy() {
            this.clip.destroy()
        },
        methods: {
            saveShare: async function () {
                try {
                    this.item.AllowedUsers = this.allowed.map(usr => usr.user)
                    const res = await api.create(this.item)
                    this.$store.commit('closeHovers')
                } catch (e) {
                    this.$showError(e)
                }
            }
        }
    }
</script>

