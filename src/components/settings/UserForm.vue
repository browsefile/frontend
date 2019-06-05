<template>
  <div>
    <p v-if="!isDefault">
      <label for="username">{{ $t('settings.username') }}</label>
      <input class="input input--block" type="text" v-model="user.username" id="username">
    </p>

    <p v-if="!isDefault">
      <label for="password">{{ $t('settings.password') }}</label>
      <input class="input input--block" type="password" :placeholder="passwordPlaceholder" v-model="user.password" id="password">
    </p>

    <p>
      <label for="scope">{{ $t('settings.scope') }}</label>
      <input class="input input--block" type="text" v-model="user.homePath" id="scope">
    </p>

    <p>
      <label for="locale">{{ $t('settings.language') }}</label>
      <languages class="input input--block" id="locale" :locale.sync="user.locale"></languages>
    </p>

    <p v-if="!isDefault">
      <input type="checkbox" :disabled="user.admin" v-model="user.lockPassword"> {{ $t('settings.lockPassword') }}
    </p>

    <p>
      <label for="scope">{{ $t('settings.uid') }}</label>
      <input class="input input--block" type="number" v-model="user.uid" id="uid">
    </p>
    <p>
      <label for="scope">{{ $t('settings.gid') }}</label>
      <input class="input input--block" type="number" v-model="user.gid" id="gid">
    </p>


  </div>
</template>

<script>
import Languages from './Languages'

export default {
  name: 'user',
  components: {
    Languages
  },
  props: [ 'user', 'isNew', 'isDefault' ],
  computed: {
    passwordPlaceholder () {
      return this.isNew ? '' : this.$t('settings.avoidChanges')
    }
  },
  watch: {
    'user.admin': function () {
      if (!this.user.admin) return
      this.user.lockPassword = false
    }
  }
}
</script>
