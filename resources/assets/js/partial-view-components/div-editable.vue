<template>
    <div @keydown.enter.prevent
         contenteditable="true"
         @input="$emit('update:content', $event.target.innerText)" class="address-name"></div>
</template>

<script>
    export default {
        name: "div-editable",
        props: ['content'],
        mounted: function () {
            this.$el.innerText = this.content;
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