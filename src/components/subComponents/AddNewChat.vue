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


      username: "",
      searchQuery: "",
      chatName: "",
      lat: "",
      long: "",
      openedChat: "",
      openedChatIndex: "",
      message: "",
      marker: {},
      markerList: [],
      messages: [],
      messagesByChat: [],
      activeChat: false,
      showChatList: true,
      initChat: false,
      markerIndex: 0,
      removedFirst: 0,
      click: 0,
    };
  },

    created: function(){
        eventBus.$on('displayPopups', (values) => { 
            this.showNewChatPopup = values.showNewChatPopup;
            this.showChatLocationPopup = values.showChatLocationPopup;
        });
        eventBus.$on('getCoords', (values) => { 
            this.lat = values.lat;
            this.long = values.long;
        });
        eventBus.$on('getStoredChats', (chatlist) => { 
            this.chatList = chatlist;
        });
    },

    methods:{
        
        createNewChat(){
            this.newChat = {};
            this.newChat['name'] = this.chatName;
            this.newChat['lat'] = this.lat;
            this.newChat['lng'] = this.long;
            this.chatList.push(this.newChat);      
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
            }else{
                this.click++; 
            }
        }
    }
}
</script>
<style lang="sass" scoped>
  @import "../../scss/styles"
</style>