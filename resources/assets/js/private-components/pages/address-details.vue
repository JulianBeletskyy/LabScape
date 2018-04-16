<template>
    <section class="sidebar">
        <div class="address-details-container">

            <router-link to="/dashboard" title="Back to dashboard" class="link-back arrow-left">
                <i class="fa fa-angle-left"></i>
            </router-link>

            <div class="address-overview">

                <h2>
                    <span>{{addressData.name}}</span>
                    <a href="#"><i class="fa fa-pencil"></i></a>
                </h2>

                <select class="customer-status-select-box">
                    <option >My Customer</option>
                    <option >Potential Customer</option>
                    <option >Not a Customer</option>
                </select>

                <div style="clear: both"></div>

                <p class="lab-chain">
                    <span class="current-chain-name">{{addressData.cluster.name}}</span>

                    <br />

                    <span class="lab-chain-text">Lab Chain:</span>
                    <a href="#" class="add-to-chain-link">Add to Chain</a>
                </p>

                <ul class="tag-list">
                    <li v-for="tag in addressData.tags"><a href="">{{tag.name}}</a></li>
                </ul>

                <p class="address-line">
                    {{addressData.address}}
                </p>

                <p class="link-and-phone">
                    <a :href="addressData.url" target="_blank">{{addressData.url.replace('https://', '').replace('http://', '').replace('/', '')}}</a>
                    <span class="pone-number">{{addressData.phone}}</span>
                </p>
            </div>

            <div class="staff-overview address-box">
                <div class="header">
                    <h3>Staff <a href="#"><i class="fa fa-pencil"></i></a></h3>
                    <a href="" class="view-contacts-chain">View Contacts Chain</a>
                </div>

                <ul class="staff-list">
                    <li v-if="i < 3" v-for="(person, i) in addressData.people">
                        <div class="image">
                            <img src="/images/anonimus-person_100x100.png" alt="">
                        </div>
                        <div class="personal-info">
                            <p class="name">{{person.name}}</p>
                            <p class="occupation">{{person.description}}</p>
                        </div>
                    </li>
                </ul>

                <div style="clear: both"></div>

                <a href="#" class="address-box-show-more-link">Show All Employers</a>
            </div>

            <div class="used-products-overview address-box">
                <div class="header">
                    <h3>Used Products <a href="#"><i class="fa fa-pencil"></i></a></h3>
                </div>

                <ul class="used-products-list">
                    <li>
                        <span class="image"></span>
                        <span class="prod-name">Sysmex</span>
                    </li>
                    <li>
                        <span class="image"></span>
                        <span class="prod-name">Joyfact</span>
                    </li>
                    <li>
                        <span class="image"></span>
                        <span class="prod-name">TeslaMed</span>
                    </li>
                    <li>
                        <a href="" class="show-all-link">Show All</a>
                    </li>
                </ul>
            </div>

            <div class="lab-chain-members-overview address-box">
                <div class="header">
                    <h3>Lab Chain Members</h3>
                </div>

                <ul class="lab-chain-member-list">
                    <li>
                        <h4>Hospital Du Valais De Montana</h4>
                        <p>Route de la Moubra 87, 3963, Switzerland</p>
                    </li>
                    <li>
                        <h4>Hospital Du Valais De Montana</h4>
                        <p>Route de la Moubra 87, 3963, Switzerland</p>
                    </li>
                    <li>
                        <h4>Hospital Du Valais De Montana</h4>
                        <p>Route de la Moubra 87, 3963, Switzerland</p>
                    </li>
                    <li>
                        <h4>Hospital Du Valais De Montana</h4>
                        <p>Route de la Moubra 87, 3963, Switzerland</p>
                    </li>
                </ul>

                <a href="#" class="address-box-show-more-link">Lab Chain Details</a>
            </div>

            <div class="lab-news-overview address-box">
                <div class="header">
                    <h3>Lab News <a href="#"><i class="fa fa-plus"></i></a></h3>
                </div>

                <ul class="lab-news-list">
                    <li>
                        <p class="date">Feb 21, 2018</p>
                        <h4>New employee <a href="#">Jina James</a> joined the lab</h4>
                    </li>
                    <li>
                        <p class="date">Feb 21, 2018</p>
                        <h4>High-precision analysis of DNA is now provided by lab</h4>
                    </li>
                </ul>

                <a href="#" class="address-box-show-more-link">Go to Lab News</a>
            </div>

        </div>
    </section>
</template>

<script>

    import http from '../../mixins/http';

    export default {
        mixins: [http],

        data: function () {
            return {
                addressId: null,
                addressData: {
                    tags: [],
                    url: '',
                    cluster: {},
                    people: []
                },
            }
        },

        methods: {
            loadAddressDetails: function () {

                this.httpGet('/api/address-details/'+this.addressId)
                    .then(data => {
                        console.log('data', data);
                        this.addressData = data;
                    })

            }
        },

        mounted: function () {
            this.addressId = this.$route.params.id;

            this.loadAddressDetails();
        }
    }
</script>

<style scoped>

</style>