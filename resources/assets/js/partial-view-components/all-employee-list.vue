<template>
    <div class="slided-box-content">
        <h3 class="">
            Lab Employees
            <a data-v-cd5686be="" href="#">
                <i data-v-cd5686be="" class="fa fa-pencil"></i>
            </a>
        </h3>


        <ul class="staff-list">
            <li v-for="(person, i) in employeeList">
                <div class="image">
                    <img src="/images/anonimus-person_100x100.png" alt="">
                </div>
                <div class="personal-info">
                    <p class="name">{{person.name}}</p>
                    <p class="occupation">{{person.description}}</p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        props: ['employeeList'],
    }
</script>

<style scoped>

</style>