<template>
    <ul class="nav nav-tabs single-dropdown-select" :id="blockId">
        <li class="dropdown">
            <a class="dropdown-toggle" @click="toogleDropdown($event)" data-toggle="dropdown" href="#" :title="selectedValuesNamesString? name +': '+ selectedValuesNamesString : name">

                <span class="caret"></span>
                {{selectedValuesNamesString? selectedValuesNamesString : name}}
            </a>
            <ul class="dropdown-menu">
                <li @click="selectValue('', name)" v-if="!isHiddenEmptyOption">
                    <div class="grey-checkbox">
                        <label>
                            <span class="remember_text">All</span>
                        </label>
                    </div>
                </li>
                <li v-for="option in options" @click="selectValue(option.value, option.label)">
                    <div class="grey-checkbox">
                        <label>
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
                blockId: '',
                selectedValue: null,
                selectedValuesNamesString: ''
            }
        },

        methods: {

            selectValue: function (value, displayedLabel) {
                this.selectedValuesNamesString = displayedLabel;
                this.selectedValue = value;
                $('#'+this.blockId+' li.open').removeClass('open');
                this.notifyParentComponent();
            },

            toogleDropdown: function ($event) {

                let dropdownContainer = $($event.target).parent();

                if(dropdownContainer.hasClass('open')) {
                    dropdownContainer.removeClass('open');
                }
                else {
                    dropdownContainer.addClass('open');
                }
            },

            notifyParentComponent: function () {
                this.$emit('changed', this.selectedValue);
            },

            setIdForCurrentComponent: function () {
                this.blockId = this.name.replace(/[^A-Za-z0-9]/g,'').toLowerCase() + Math.round(Math.random()*100);
            },
            resetSelectedValues: function () {
                this.selectedValue = '';
                this.selectedValuesNamesString = this.name;
            }
        },

        mounted: function () {
            $('.dropdown-menu').on('click', function (e) {
                e.stopPropagation();
            });

            this.setIdForCurrentComponent();
        },


        props: ['options', 'name', 'isHiddenEmptyOption']

    }
</script>

<style scoped>

</style>