<template>
    <div>
        <div v-if="showChatLocationPopup" class="choose-location">
            {{chooseLocation}}
        </div>
        <div v-if="showNewChatPopup" class="new-chat" ref="popup" v-closable="{handler:'deleteNewChat', exclude: ['popup']}">
            <form @submit.prevent="createNewChat()">
                <p class="title">{{newChatTxt}}</p>
                <p class="latlong">{{latTxt}} {{lat}}, {{longTxt}} {{long}}</p>
                <input type="text" class="chatname-inputfield form-control" v-model="chatName" :placeholder="nameThisChat"/>
                <button class="create-chat btn btn-dark" type="submit">{{create}}</button>
            </form>
        </div>
    </div>
</template>

<script>
import VueClosable from 'vue-closable';
import Vue from 'vue';
import {eventBus} from "../../main";

Vue.use(VueClosable);

export default {

    data: function() {
    return {
      newChatTxt: "New Chat",
      latTxt: "Latitude",
      longTxt: "Longitude",
      nameThisChat: "Name this chat",
      chooseLocation: "Choose the chat location on the map",
      create: "Create",
      showNewChatPopup: false,
      showChatLocationPopup: false,
      lat: "",
      long: "",
      newChat: {},
      chatList: [],
      chatName: "",
      markerList: [],
      markerIndex: 0,
      click: 0,
    };
  },

    props:{
        leafletMap: Object
    },

    created: function(){
        eventBus.$on('DISPLAY_POPUPS', (values) => { 
            this.showNewChatPopup = values.showNewChatPopup;
            this.showChatLocationPopup = values.showChatLocationPopup;
            this.chatName = values.chatName;
        });
        eventBus.$on('GET_COORDINATES', (values) => { 
            this.lat = values.lat;
            this.long = values.long;
        });
        eventBus.$on('GET_STORED_CHATS', (chatlist) => { 
            this.chatList = chatlist;
        });
        eventBus.$on('GET_MARKER_DATA', (values) => { 
            this.markerList = values.markerList;
            this.markerIndex = values.markerIndex;
        });
    },

    methods:{
        
        createNewChat(){
            this.newChat = {};
            this.newChat['name'] = this.chatName;
            this.newChat['lat'] = this.lat;
            this.newChat['lng'] = this.long;
            this.chatList.push(this.newChat);      
            eventBus.$emit('ADDED_CHAT', this.chatList);
            localStorage.setItem('storedChats', JSON.stringify(this.chatList));
            localStorage.setItem('markerIndex', JSON.stringify(this.markerIndex)); 
            this.showNewChatPopup = false;
            this.click = 0;
        },

        deleteNewChat(){
            if (this.click == 1){
                this.markerIndex--;
                this.leafletMap.removeLayer(this.markerList[this.markerIndex]);
                this.markerList.pop();
                this.showNewChatPopup = false;
                this.click = 0;
                eventBus.$emit('UPDATED_MARKERS', {'markerList': this.markerList, 'markerIndex': this.markerIndex});
            }else{
                this.click++; 
            }
        }
    }
}
</script>
<style lang="sass" scoped>
  @import "../../scss/newChat"
</style>