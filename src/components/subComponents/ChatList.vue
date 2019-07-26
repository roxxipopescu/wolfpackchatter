<template>
    <div class="chatlist">
        <div v-if="chatList.length == 0" class="empty-chatlist">
            <p>{{emptyChatsMsg}}</p>
            <p>{{plusButtonInfo}}</p>
        </div>
        <div v-else> 
            <div class="chats" :key="index" v-for="(chat, index) in filteredChatsList" v-on:click="openChat(chat, index)">
            <div class="chat-title">{{chat.name}}</div>
            <div class="chat-coords">{{latTxt}} {{chat.lat}}, {{longTxt}} {{chat.lng}}</div>
            <i class="fa fa-chevron-right"></i>
            </div>
        </div>
    </div>
</template>

<script>
import "leaflet/dist/leaflet.css"
import "font-awesome/css/font-awesome.css";
import L from 'leaflet';
import {eventBus} from "../../main";

export default {
    
    data: function() {
        return {
            emptyChatsMsg: "Nothing to show here.",
            plusButtonInfo: "Use the + button to create a new chat", 
            latTxt: "Latitude",
            longTxt: "Longitude", 
        }
    },

    props:{
      chatList: Array,
      selectedChatIcon: Object,
      leafletMap: Object,
      markerList: Array,
      searchQuery: String
    },

    created(){ 
        eventBus.$on('markerClick',  (values) =>{ 
            this.openChat(values.chat, values.index);
        });
    },

    methods:{

        openChat(chat, index){     
            eventBus.$emit('GET_OPENED_CHAT', {'showChatList': false, 'openedChat': chat, 'openedChatIndex': index, 'activeChat': true});
            this.markerList[index] = L.marker([chat.lat, chat.lng], {icon: this.selectedChatIcon}).addTo(this.leafletMap);       
        },
    },

    computed:{
        filteredChatsList(){
            if (this.searchQuery){
                return this.chatList.filter((item)=>{ 
                    return item.name.toLowerCase().startsWith(this.searchQuery.toLowerCase());
                })
            }
            else{
                return this.chatList;
            }
        }
    },

    beforeDestroy() {
        eventBus.$off('markerClick');
    }
}
</script>

<style lang="scss" scoped>
    @import "../../scss/chatList"
</style>
