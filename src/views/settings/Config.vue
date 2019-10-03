<template>
    <div>
        <form @submit="save" class="card">
            <div class="card-title">
                <h2>{{ $t('settings.config') }}</h2>
            </div>

            <div class="card-content full">

                <p>
                    <label for="ip">{{ $t('settings.ip') }}</label>
                    <input class="input input--block" type="text" v-model="conf.http.ip" id="ip" name="ip">
                </p>

                <p>
                    <label for="port">{{ $t('settings.port') }}</label>
                    <input class="input input--block" type="number" v-model="conf.http.port" id="port" name="port">
                </p>
                <p>
                    <label for="auth">{{ $t('settings.auth.auth') }}</label>
                    <select v-model="conf.http.authMethod" id="auth" name="auth">
                        <option value="ip">{{ $t('settings.auth.ip') }}</option>
                        <option value="default">{{ $t('settings.auth.default') }}</option>
                        <option value="noauth">{{ $t('settings.auth.noauth') }}</option>
                        <option value="proxy">{{ $t('settings.auth.proxy') }}</option>
                    </select>
                </p>
                <br>
                <h2>{{ $t('settings.configtls') }}</h2>

                <p>
                    <label for="ip">{{ $t('settings.ips') }}</label>
                    <input class="input input--block" type="text" v-model="conf.https.ip" id="ips" name="ip">
                </p>

                <p>
                    <label for="port">{{ $t('settings.ports') }}</label>
                    <input class="input input--block" type="number" v-model="conf.https.port" id="ports" name="port">
                </p>
                <p>
                    <label for="auths">{{ $t('settings.auth.auth') }}</label>
                    <select v-model="conf.https.authMethod" id="auths" name="auths">
                        <option value="ip">{{ $t('settings.auth.ip') }}</option>
                        <option value="default">{{ $t('settings.auth.default') }}</option>
                        <option value="noauth">{{ $t('settings.auth.noauth') }}</option>
                        <option value="proxy">{{ $t('settings.auth.proxy') }}</option>
                    </select>
                </p>
                <br>
                <p>
                    <label for="externalShareHost">{{ $t('settings.externalShareHost') }}</label>
                    <input class="input input--block" type="text" v-model="conf.externalShareHost"
                           id="externalShareHost" name="externalShareHost">
                </p>
                <p>
                    <label for="log">{{ $t('settings.log') }}</label>
                    <input class="input input--block" type="text" v-model="conf.log" id="log" name="log">
                </p>


                <p>
                    <label for="pscript">{{ $t('settings.preview.path') }}</label>
                    <input class="input input--block" type="text" v-model="conf.preview.scriptPath" id="pscript" name="log">


                </p>
                <p>
                    <input type="checkbox" v-model="conf.preview.previewsOnFirstRun"> {{ $t('settings.preview.firstRun')
                    }}

                </p>
                <p>
                    <label for="preview_threads">{{ $t('settings.preview.threads') }}</label>
                    <input class="input input--block" type="number" v-model="conf.preview.threads" id="preview_threads"
                           name="preview_threads">
                </p>

                <p>
                    <label for="scope">{{ $t('settings.scope') }}</label>
                    <input class="input input--block" type="text" v-model="conf.filesPath" id="scope">
                </p>
                <p>
                    <label for="scope">{{ $t('settings.keyPath') }}</label>
                    <input class="input input--block" type="text" v-model="conf.tlsKey" id="ke">
                </p>
                <p>
                    <label for="scope">{{ $t('settings.crtPath') }}</label>
                    <input class="input input--block" type="text" v-model="conf.tlsCert" id="crt">
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
                    http: {ip: "192.168.1.1", port: 8081, authMethod: "default"},
                    https: {ip: "", port: 0, authMethod: "default"},
                    externalShareHost: "http://127.0.0.1:8081",
                    log: "/var/log/bf.log", preview: {
                        threads: 2,
                        previewsOnFirstRun: false,
                        allowGeneratePreview: true
                    }
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
                    this.conf.preview.threads = parseInt(this.conf.preview.threads)
                    api.update(this.conf)
                    this.$showSuccess(this.$t('settings.settingsUpdated'))
                } catch (e) {
                    this.$showError(e)
                }

            }
        }
    }
</script>
