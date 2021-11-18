<template>
    <ul id="">
        <li v-for="member in members" :key="member.number" @dragover.prevent @dragenter.prevent>
            <a v-bind:href=phoneUrl(member.number) draggable @dragstart="dragList($event, member.number)">{{ member.name }}:{{member.fixnum}}</a>
        </li>    
    </ul>    
</template>

<script>
export default {
    props:{
        members: Array,
        groupname:String
    },  
    methods:{
        phoneUrl: function(number){
            return 'callto:' + number
        },
        dragList:function(event, id){
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.dropEffect = 'move'
            event.dataTransfer.setData('list-id', id)
        }
    }
}
</script>