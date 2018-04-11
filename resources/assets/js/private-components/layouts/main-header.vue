<template>
    <header class="main-header">
        <!-- Logo -->
        <router-link to="/" class="logo">
            <!-- mini logo for sidebar mini 50x50 pixels -->
            <span class="logo-mini"><b>A</b>LT</span>
            <!-- logo for regular state and mobile devices -->
            <span class="logo-lg"><img src="/images/logo.png" alt=""></span>
        </router-link>
        <!-- Header Navbar: style can be found in header.less -->
        <nav class="navbar navbar-static-top">
            <!-- Sidebar toggle button-->
            <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button">
                <span class="sr-only">Toggle navigation</span>
            </a>

            <div class="nav-search">
                <ul class="nav navbar-nav">
                    <li>
                        <img src="/images/ic-search.png" alt="">
                        <input type="text" placeholder="Search by laboratory, people or location">
                    </li>
                </ul>
            </div>

        </nav>
    </header>
</template>

<script>
    export default {
        data: function () {
            return {
                user: {}
            }
        },
        created: function () {
            this.$eventGlobal.$on('update-user-profile', (data) => {
                this.user = data;
            });
        }
    }
</script>

<style scoped>

</style>