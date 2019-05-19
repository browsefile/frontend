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
                <label>{{ $t('buttons.allowedUsers')}}</label>
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
                if (this.$store.state.showMessage) {
                    return this.$store.state.showMessage
                }
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
                let urlPath = this.$store.state.showMessage ? this.$store.state.showMessage : this.url
                let itm = await api.get(urlPath, true)
                //console.dir(itm)

                if (!itm.path) {
                    itm.path = urlPath
                }
                if (!itm.allowedUsers) {
                    itm.allowedUsers = []
                }

                this.filterMounted(itm)
                this.item = itm;

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
            filterMounted: function (itm) {

                if (itm.allowedUsers) {
                    this.allowed = []
                    itm.allowedUsers.forEach(itm => {
                        this.allowed.push({
                            'user': itm,
                            'allowed': true
                        })
                    })
                }
            },
            saveShare: async function () {
                try {
                    this.item.AllowedUsers = this.allowed.filter(usr => usr.allowed).map(usr => usr.user)

                    this.item = await api.create(this.item)
                    this.filterMounted(this.item)
                    this.$store.commit('closeHovers')
                } catch (e) {
                    this.$showError(e)
                }
            }
        }
    }
</script>

