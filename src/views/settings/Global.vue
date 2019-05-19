<template>
    <div class="card">


        <div class="card-content full">
            <table>
                <tr>
                    <th>{{ $t('settings.share.path') }}</th>
                    <th>{{ $t('settings.share.ausers') }}</th>
                    <th>{{ $t('settings.share.alocal') }}</th>
                    <th>{{ $t('settings.share.aexternal') }}</th>
                    <th>{{ $t('settings.perm.modify') }}</th>
                    <th>{{ $t('buttons.delete') }}</th>
                </tr>

                <tr v-for="shr in shares" :key="shr.path">
                    <td>{{ shr.path }}</td>
                    <td>
                        <template v-for="u in shr.allowedUsers">
                            {{u}},
                        </template>
                    <td>{{ shr.allowLocal }}</td>
                    <td>{{ shr.allowExternal }}</td>
                    <td>
                        <share-button :sharePath="shr.path"></share-button>
                    </td>
                    <td>
                        <delete-button :sharePath="shr.path"></delete-button>
                    </td>

                </tr>

            </table>
        </div>
    </div>
</template>

<script>
    import {mapState} from 'vuex'
    import {share} from '@/api'
    import UserForm from '@/components/settings/UserForm'
    import ShareButton from '../../components/buttons/Share'
    import DeleteButton from '../../components/buttons/Delete'

    export default {
        name: 'settings',
        components: {
            UserForm, ShareButton, DeleteButton
        },
        data: function () {
            return {
                myShares: []
            }
        },
        computed: {
            ...mapState(['user']),
            shares() {
                return this.myShares
            }
        },
        async created() {
            try {
                this.myShares = await share.get('/', true)

            } catch (e) {
                this.$showError(e)
            }
        },
        methods: {}
    }
</script>
