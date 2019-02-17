<template>
  <div class="dashboard" v-if="settings !== null">
    <form class="card" @submit.prevent="save">
      <div class="card-title">
        <h2>{{ $t('settings.globalSettings') }}</h2>
      </div>

      <div class="card-content">
        <p><input type="checkbox" v-model="settings.signup"> {{ $t('settings.allowSignup') }}</p>

        <h3>{{ $t('settings.rules') }}</h3>
        <p class="small">{{ $t('settings.globalRules') }}</p>
        <rules :rules.sync="settings.rules" />

        <h3>{{ $t('settings.branding') }}</h3>

        <i18n path="settings.brandingHelp" tag="p" class="small">
          <a class="link" target="_blank" href="https://docs.filebrowser.xyz/configuration/custom-branding">{{ $t('settings.documentation') }}</a>
        </i18n>

        <p>
          <input type="checkbox" v-model="settings.branding.disableExternal" id="branding-links" />
          {{ $t('settings.disableExternalLinks') }}
        </p>

        <p>
          <label for="branding-name">{{ $t('settings.instanceName') }}</label>
          <input class="input input--block" type="text" v-model="settings.branding.name" id="branding-name" />
        </p>

        <p>
          <label for="branding-files">{{ $t('settings.brandingDirectoryPath') }}</label>
          <input class="input input--block" type="text" v-model="settings.branding.files" id="branding-files" />
        </p>

      </div>

      <div class="card-action">
        <input class="button button--flat" type="submit" :value="$t('buttons.update')">
      </div>
    </form>

    <form class="card" @submit.prevent="save">
      <div class="card-title">
        <h2>{{ $t('settings.userDefaults') }}</h2>
      </div>

      <div class="card-content">
        <p class="small">{{ $t('settings.defaultUserDescription') }}</p>

        <user-form :isNew="false" :isDefault="true" :user.sync="settings.defaults" />
      </div>

      <div class="card-action">
        <input class="button button--flat" type="submit" :value="$t('buttons.update')">
      </div>
    </form>

    <form class="card" @submit.prevent="save">

      <div class="card-action">
        <input class="button button--flat" type="submit" :value="$t('buttons.update')">
      </div>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { settings as api } from '@/api'
import UserForm from '@/components/settings/UserForm'
import Rules from '@/components/settings/Rules'

export default {
  name: 'settings',
  components: {
    UserForm,
    Rules
  },
  data: function () {
    return {
      originalSettings: null,
      settings: null
    }
  },
  computed: {
    ...mapState([ 'user' ])
  },
  async created () {
    try {
      const original = await api.get()
      let settings = { ...original}

      this.originalSettings = original
      this.settings = settings
    } catch (e) {
      this.$showError(e)
    }
  },
  methods: {
    capitalize (name, where = '_') {
      if (where === 'caps') where = /(?=[A-Z])/
      let splitted = name.split(where)
      name = ''

      for (let i = 0; i < splitted.length; i++) {
        name += splitted[i].charAt(0).toUpperCase() + splitted[i].slice(1) + ' '
      }

      return name.slice(0, -1)
    },
    async save () {
      let settings = {
        ...this.settings

      }

      try {
        await api.update(settings)
        this.$showSuccess(this.$t('settings.settingsUpdated'))
      } catch (e) {
        this.$showError(e)
      }
    }
  }
}
</script>
