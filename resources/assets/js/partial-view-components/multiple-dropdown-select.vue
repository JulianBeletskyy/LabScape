<template>
    <ul class="nav nav-tabs">
        <li class="dropdown">
            <a class="dropdown-toggle" @click="toogleDropdown($event)" data-toggle="dropdown" href="#" :title="selectedValuesNamesString? name +': '+ selectedValuesNamesString : name">

                <span class="caret"></span>
                {{selectedValuesNamesString? selectedValuesNamesString : name}}
            </a>
            <ul class="dropdown-menu">
                <li v-for="option in options">
                    <div class="grey-checkbox">
                        <label>
                            <input type="checkbox" @click="checkboxClick(option.value)" :id="blockId + option.value">
                            <span class="borders"></span>
                            <span class="remember_text">{{option.label}}</span>
                        </label>
                    </div>
                </li>
            </ul>
        </li>
    </ul>
</template>

<script>
    export default {

        data: function () {
            return {
                selectedValues: [],
                blockId: ''
            }
        },

        computed: {
            selectedValuesNamesString: function () {
                let str = '';
                this.selectedValues.forEach((id, index) => {
                    let option = this.options.find(el => el.value == id);

                    str += option.label

                    if(++index !== this.selectedValues.length) {
                        str += ', ';
                    }
                });

                return str;
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
            },

            setIdForCurrentComponent: function () {
                this.blockId = this.name.replace(/[^A-Za-z0-9]/g,'').toLowerCase() + Math.round(Math.random()*100);
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