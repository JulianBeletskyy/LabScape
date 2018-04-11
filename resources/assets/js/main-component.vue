<template>
    <div>

        <public-outlet v-if="!isLoggedIn"></public-outlet>

        <private-outlet v-if="isLoggedIn"></private-outlet>

        <loader></loader>

    </div>
</template>

<script>

    import AuthService from './services/auth-service';

    export default {

        data: function () {
            return {
                isLoggedIn: AuthService.isLoggedIn
            }
        },

        methods: {

        },

        created: function () {

        }
    }
</script>

<style scoped>

</style>