<template>
    <header class="main-header">
        <!-- Logo -->

        <div class="box-for-logo">
            <div class="header-logo">
                <span class="logo-lg"><img src="/images/logo.png" alt=""></span>
            </div>
        </div>

        <nav class="navbar navbar-static-top">

            <div class="nav-search">
                <ul class="nav navbar-nav">
                    <li>
                        <img src="/images/ic-search.png" alt="">
                        <input type="text" placeholder="Search by laboratory, people or location">
                    </li>
                </ul>
            </div>
            
            <div class="nav-links">
                <ul>
                    <li><a href="#" class="active">Lab Map</a></li>
                    <!--<li><a href="#">Feed</a></li>-->
                    <li><a href="#">About</a></li>
                    <li><a href="#">Contact</a></li>
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