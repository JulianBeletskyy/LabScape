<template>
    <div class="relative">
        <div class="wrap">
            <div class="form-group">
                <i class="fa fa-search icon" aria-hidden="true"></i>
                <input @input="handleChange" id="input" type="text" class="input" v-model="query" placeholder="Chain name" />
            </div>
            <div class="selects form-group">
                <label class="radio-container" v-for="(item, i) in filtered">{{item.name}}
                    <input type="radio" :id="item.id" :value="item.id" v-model="cluster.id" name="radio" />
                    <span class="checkmark"></span>
                </label>
            </div>
            <div class="text-right">
                <button type="button" @click="closeSelf" class="btn cancel-address-btn">Cancel</button>
                <a href="javascript:void(0)" class="button" @click="addItem">Add</a>
            </div>
        </div>
    </div>
</template>

<script>
    import http from '../mixins/http';
    export default {
        name: "autocompleteSelect",
        props: ['type', 'choose', 'selected', 'close'],
        mixins: [http],
        data: function () {
            return {
                list: [],
                filtered: [],
                query: '',
                cluster: {},
                oldValue: 0
            }
        },
        methods: {
            loadList: function () {
                this.httpGet('/api/' + this.type)
                    .then(data => {
                        this.list = data;
                        this.filtered = this.list;
                    })
            },
            handleChange: function (e) {
                this.filtered = this.list.filter((item) => {
                    return item.name.toLowerCase().indexOf(e.target.value.toLowerCase()) + 1
                })
            },
            addItem: function () {
                this.choose(this.cluster.id)
            },
            closeSelf: function () {
                this.cluster.id = this.oldValue
                this.close()
            }
        },
        mounted: function () {
            this.cluster = this.selected
            this.oldValue = this.selected.id
            document.getElementById('input').focus()
            this.loadList()
        }
    }
</script>

<style scoped>
    .relative {
        position: relative;
    }
   .wrap {
        position: absolute;
        z-index: 1;
        background: #fff;
        box-shadow: 0px 0px 20px 2px rgba(0,0,0,0.2);
        padding: 10px;
        border-radius: 5px;
        left: 10px;
   }
   .link {
        color: #4a90e3 !important;
        font-weight: 500;

   }
   .input {
        width: 300px;
        border-bottom: 2px solid #EAEFF4;
        outline: none;
        border-top: none;
        border-left: none;
        border-right: none;

   }
   .icon {
        margin-right: 6px;
   }
   .button {
        background: #4a90e3;
        color: #fff !important;
        padding: 10px 15px;
        border-radius: 5px;
        font-family: Montserrat;
        font-size: 13px;
        text-align: left;
        margin: 0;
        transition: background-color 0.1s linear;
   }
   .button:hover {
        background: #5ba3f4;
   }
   .selects {
        background: #fff;
        max-height: 200px;
        overflow: auto;
        overflow-x: hidden;
   }
   .radio-container {
        display: block;
        position: relative;
        padding-left: 22px;
        margin-bottom: 12px;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        font-weight: normal;
    }
    .radio-container input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
    }
    .checkmark {
        position: absolute;
        top: 3px;
        left: 0;
        height: 15px;
        width: 15px;
        background-color: #eee;
        border-radius: 50%;
    }
    .radio-container input:checked ~ .checkmark {
        background-color: #2196F3;
    }
    .checkmark:after {
        content: "";
        position: absolute;
        display: none;
    }
    .radio-container input:checked ~ .checkmark:after {
        display: block;
    }
    .radio-container .checkmark:after {
        top: 5px;
        left: 5px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: white;
    }
    .selects::-webkit-scrollbar {
        width: 5px;
        border-radius: 5px;
    }

    .selects::-webkit-scrollbar-track {
        background: #fff;
    }
 
    .selects::-webkit-scrollbar-thumb {
        background: #f1f1f1; 
        border-radius: 10px;
    }

    .selects::-webkit-scrollbar-thumb:hover {
        background: #555; 
    }
</style>