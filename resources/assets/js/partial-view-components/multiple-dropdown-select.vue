<template>
    <ul class="nav nav-tabs">
        <li class="dropdown">
            <a class="dropdown-toggle" @click="toogleDropdown($event)" data-toggle="dropdown" href="#" >
                {{name}} <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
                <li v-for="option in options">
                    <input type="checkbox" @click="checkboxClick(option.value)" :id="option.value"><label :for="option.value">{{option.label}}</label>
                </li>
            </ul>
        </li>
    </ul>
</template>

<script>
    export default {

        data: function () {
            return {
                selectedValues: []
            }
        },

        methods: {
            toogleDropdown: function ($event) {

                let dropdownContainer = $($event.target).parent();

                if(dropdownContainer.hasClass('open')) {
                    dropdownContainer.removeClass('open');
                }
                else {
                    dropdownContainer.addClass('open');
                }
            },

            checkboxClick: function (selectedValue) {

                let index = this.selectedValues.indexOf(selectedValue);

                if (index === -1) {
                    this.selectedValues.push(selectedValue);
                }
                else {
                    this.selectedValues.splice(index, 1);
                }

                this.notifyParentComponent();
            },

            notifyParentComponent: function () {
                this.$emit('changed', JSON.parse(JSON.stringify(this.selectedValues)));
            }
        },

        mounted: function () {
            $('.dropdown-menu').on('click', function (e) {
                e.stopPropagation();
            });
        },


        props: ['options', 'name']

    }
</script>

<style scoped>

</style>