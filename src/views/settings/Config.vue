<template>
    <div>
        <form @submit="save" class="card">
            <div class="card-title">
                <h2>{{ $t('settings.config') }}</h2>
            </div>

            <div class="card-content full">

                <p>
                    <label for="ip">{{ $t('settings.ip') }}</label>
                    <input class="input input--block" type="text" v-model="conf.ip" id="ip" name="ip">
                </p>

                <p>
                    <label for="port">{{ $t('settings.port') }}</label>
                    <input class="input input--block" type="number" v-model="conf.port" id="port" name="port">
                </p>
                <p>
                    <label for="log">{{ $t('settings.log') }}</label>
                    <input class="input input--block" type="text" v-model="conf.log" id="log" name="log">
                </p>

                <p>
                    <label for="auth">{{ $t('settings.auth.auth') }}</label>
                    <select :value="conf.auth.method" id="auth" name="auth">
                        <option value="ip">{{ $t('settings.auth.ip') }}</option>
                        <option value="default">{{ $t('settings.auth.default') }}</option>
                        <option value="noauth">{{ $t('settings.auth.noauth') }}</option>
                        <option value="proxy">{{ $t('settings.auth.proxy') }}</option>
                    </select>
                </p>
                <p>
                    <input type="checkbox" :disabled="user.admin" v-model="conf.preview.allowGeneratePreview"> {{
                    $t('settings.preview.allow') }}
                </p>
                <p>
                    <input type="checkbox" v-model="conf.preview.previewsOnFirstRun"> {{ $t('settings.preview.firstRun')
                    }}

                </p>
                <p>
                    <label for="preview_threads">{{ $t('settings.preview.threads') }}</label>
                    <input class="input input--block" type="text" v-model="conf.preview.threads" id="preview_threads"
                           name="preview_threads">
                </p>

                <p>
                    <label for="scope">{{ $t('settings.scope') }}</label>
                    <input class="input input--block" type="text" v-model="conf.filesPath" id="scope">
                </p>


            </div>

            <div class="card-action">
                <input
                        class="button button--flat"
                        type="submit"
                        :value="$t('buttons.save')">
            </div>
        </form>

    </div>
</template>

<script>
    import {mapState, mapMutations} from 'vuex'
    import {settings as api} from '@/api'

    export default {
        name: 'settings',
        data: function () {
            return {
                conf: {
                    ip: "192.168.1.1", log: "/var/log/bf.log", port: 8081, preview: {
                        threads: 2, previewsOnFirstRun: false, allowGeneratePreview: true
                    }, auth: {method: "default"}
                }
            }
        },
        computed: {
            ...mapState(['user']),

        }, async created() {
            try {
                this.conf = await api.get()

            } catch (e) {
                this.$showError(e)
            }
        },
        methods: {
            async save(event) {
                event.preventDefault()
                try {
                    api.update(this.conf)
                    this.$showSuccess(this.$t('settings.settingsUpdated'))
                } catch (e) {
                    this.$showError(e)
                }

            }
        }
    }
</script>
