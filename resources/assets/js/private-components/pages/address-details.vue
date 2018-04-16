<template>
    <section class="sidebar">
        <div class="address-details-container">

            <div class="address-overview">

                <h2>
                    <span>Laboratorium Dr. G. Bichsel AG</span>
                    <a href="#"><i class="fa fa-pencil"></i></a>
                </h2>

                <select class="customer-status-select-box">
                    <option >My Customer</option>
                    <option >Potential Customer</option>
                    <option >Not a Customer</option>
                </select>

                <div style="clear: both"></div>

                <p class="lab-chain">
                    <span class="current-chain-name">Medical Laboratory</span>
                    <span class="lab-chain-text">Lab Chain:</span>
                    <a href="#" class="add-to-chain-link">Add to Chain</a>
                </p>

                <ul class="tag-list">
                    <li><a href="">ISO</a></li>
                    <li><a href="">Medical Laboratory</a></li>
                    <li><a href="">Radiology</a></li>
                </ul>

                <p class="address-line">
                    Hottingerstrasse 9, 8032 Zürich, Switzerland
                </p>

                <p class="link-and-phone">
                    <a href="#">bichsel.ch</a>
                    <span class="pone-number">+41 033 827 80 00</span>
                </p>
            </div>

            <div class="stuff-overview">
                <div class="header">
                    <h3>Stuff <a href="#"><i class="fa fa-pencil"></i></a></h3>
                    <a href="" class="view-contacts-chain">View Contacts Chain</a>
                </div>

                <ul class="stuff-list">
                    <li>
                        <div class="image">
                            <img src="/images/anonimus-person_100x100.png" alt="">
                        </div>
                    </li>
                </ul>

                <a href="#">Show All Employers</a>
            </div>

            <div class="used-products-overview">
                <div class="header">
                    <h3>Used Products <a href="#"><i class="fa fa-pencil"></i></a></h3>
                    <a href="" class="view-contacts-chain">View Contacts Chain</a>
                </div>

                <ul class="used-products-list">
                    <li>
                        <img src="/images/anonimus-person_100x100.png" alt="">
                        <span>Sysmex</span>
                    </li>
                    <li>
                        <img src="/images/anonimus-person_100x100.png" alt="">
                        <span>Joyfact</span>
                    </li>
                    <li>
                        <img src="/images/anonimus-person_100x100.png" alt="">
                        <span>TeslaMed</span>
                    </li>
                    <li>
                        <a href="">Show All</a>
                    </li>
                </ul>
            </div>

            <div class="lab-chain-members-overview">
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
                    <li class="view-all-chain-link">
                        <a href="#">Lab Chain Details</a>
                    </li>
                </ul>
            </div>

            <div class="lab-news-overview">
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
                addressId: null
            }
        },

        methods: {
            loadAddressDetails: function () {

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