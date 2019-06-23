<template>
    <div class="dashboard">
        <ul id="nav">
            <li :class="{ active: $route.path === '/settings/profile' }">
                <router-link to="/settings/profile">{{ $t('settings.profileSettings') }}</router-link>
            </li>
            <li :class="{ active: $route.path === '/settings/shares' }">
                <router-link to="/settings/shares">{{ $t('settings.myShares') }}</router-link>
            </li>
            <li v-if="user.admin" :class="{ active: $route.path === '/settings/users' }">
                <router-link to="/settings/users">{{ $t('settings.userManagement') }}</router-link>
            </li>

            <li v-if="user.admin" :class="{ active: $route.path === '/settings/config' }">
                <router-link to="/settings/config">{{ $t('settings.config') }}</router-link>
            </li>
        </ul>


        <router-view></router-view>
    </div>
</template>

<script>
    import {mapState} from 'vuex'

    export default {
        name: 'settings',
        computed: mapState(['user'])
    }
</script>
