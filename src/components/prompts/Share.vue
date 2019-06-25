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
    import {users as u} from '@/api'
    import {share as api} from '@/api'
    import {baseURL} from '@/utils/constants'


    export default {
        name: 'share',

        data: function () {
            return {
                allUsers: [],
                allowed: [],
                item: {},
            }
        },
        computed: {
            ...mapState(['user', 'req', 'selected', 'selectedCount']),
            ...mapGetters(['isListing']),
            url() {
                if (this.$store.state.showMessage) {
                    return this.$store.state.showMessage.path
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
                let uPath = this.url
                if (this.$store.state.showMessage) {
                    uPath = this.$store.state.showMessage.path;
                }

                let itm = await api.get(uPath, true);

                if (itm && itm[0]) {
                    itm = itm[0]
                }
                if (!itm.allowedUsers) {
                    itm.allowedUsers = [];
                }
                this.item = itm;
                try {
                    this.allUsers = await u.getAll()
                } catch (e) {
                    this.$showError(e)
                }


                this.filterUsers()


            } catch (e) {
                this.$showError(e)
            }
        },

        methods: {
            filterUsers: function () {
                this.allowed = []
                this.allUsers.forEach(itm => {
                    if (this.user.username == itm.username) {
                        return
                    }
                    this.allowed.push({
                        'user': itm.username,
                        'allowed': this.isAllowed(itm)
                    })
                })
            },
            isAllowed: function (itm) {
                return this.item.allowedUsers.filter(name => name === itm.username).length > 0

            },
            saveShare: async function () {
                try {
                    this.item.AllowedUsers = this.allowed.filter(usr => usr.allowed).map(usr => usr.user)
                    this.item = await api.create(this.item)
                    this.filterUsers(this.item)
                    this.$store.commit('closeHovers')
                    //this.$router.go()
                } catch (e) {
                    this.$showError(e)
                }
            }
        }
    }
</script>

