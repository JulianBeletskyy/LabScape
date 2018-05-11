<template>
    <div @keydown.enter.prevent
         contenteditable="true"
         :data-placeholder="placeholder"
         @input="$emit('update:content', $event.target.innerText)" class="address-name"></div>
</template>

<script>
    export default {
        name: "div-editable",
        data: function () {
            return {
                showPlaceholder: false,
            }
        },
        props: ['content', 'placeholder'],
        mounted: function () {
            this.$el.innerText = this.content;
        },
        watch: {
            content: function() {
                this.showPlaceholder = false;

                if (this.content === "") {
                    // this.$el.placeholder = 'phone';
                    this.showPlaceholder = true;
                }

                console.log(this.placeholder);
            }
        }
    }
</script>

<style scoped>
    .address-name {
        cursor: text;
    }
    .address-name:focus {
        outline: none;
        cursor: text;
    }
</style>