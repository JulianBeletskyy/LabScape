<template>
    <header class="main-header">
        <!-- Logo -->



        <nav class="navbar navbar-static-top">

            <div class="box-for-logo">
                <div class="header-logo">
                    <span class="logo-lg"><router-link to="/dashboard"><img src="/images/labscape.png" alt=""></router-link></span>
                </div>
            </div>


            <div class="nav-search">
                <ul class="nav navbar-nav">
                    <li>
                        <img src="/images/ic-search.png" alt="">
                        <input
                               v-model="globalSearchInput"
                               @keyup="makeGlobalSearch()"
                               placeholder="Search by laboratory, people or location"
                        >
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
                user: {},
                globalSearchInput: this.$route.query['global-search'],
                timeOutId: null
            }
        },
        methods: {
            makeGlobalSearch: function () {


                if(this.timeOutId){
                    clearTimeout(this.timeOutId)
                }

                this.timeOutId = setTimeout(()=>{

                    if(this.$route.path != '/dashboard') {
                        this.$router.push('/dashboard?global-search=' + encodeURIComponent(this.globalSearchInput));
                        // this.$eventGlobal.$emit('notifyMapMainGlobalSearchPerformed', encodeURIComponent(this.globalSearchInput));
                    }
                    else{
                        this.$router.push('/dashboard?global-search=' + encodeURIComponent(this.globalSearchInput));
                        // this.$eventGlobal.$emit('globalSearchPerformed', encodeURIComponent(this.globalSearchInput));
                    }

                    if(this.globalSearchInput == '') {
                        this.$router.push('/dashboard');
                    }

                },1000)
            }
        },

        created: function () {

        },
        mounted: function () {
            this.$eventGlobal.$on('resetedAllFilters', () => {
                this.globalSearchInput = '';
            })
        }
    }
</script>

<style scoped>

</style>