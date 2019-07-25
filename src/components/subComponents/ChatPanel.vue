<template>
<div class="chat-panel" :class="{'chat-active': activeChat}">
      <div v-if="!initChat" class="chat-init">
        <form @submit.prevent="start()">
          <input type="text" class="name-inputfield form-control" v-model="username" :placeholder="yourNamePlaceholder"/>
          <button class="start-chat btn btn-dark" type="submit">{{startTxt}}</button>
        </form>
      </div>
      <div v-if="initChat" class="open-chat">
        <div class="user-info">
          <img class="user-picture" :src="imgUrl"/>
          <span class="username">{{username}}</span>
        </div>
        <div class="chats-container">
          <div class="search-container" v-if="showChatList">
            <i class="fa fa-search"></i>
            <input type="text" class="search-inputfield form-control" v-model="searchQuery" :placeholder="searchTxt" />
            <i v-if="searchQuery" class="fa fa-times" v-on:click="clearSearch()"></i>
            <i class="fa fa-plus-circle" v-on:click="addNewChat"></i>
          </div>
          <div v-if="showChatList">
            <ChatList :searchQuery="searchQuery" :markerList="markerList" :leafletMap="leafletMap" :selectedChatIcon="selectedChatIcon" :chatList="chatList"></ChatList>
          </div>
          <div v-else>
            <ActiveChat :username="username" :markerList="markerList" :openedChatIndex="openedChatIndex" :leafletMap="leafletMap" :openedChat="openedChat"></ActiveChat>
          </div>
        </div>
      </div>
    </div>
</template>


<script>
import "leaflet/dist/leaflet.css"
import "font-awesome/css/font-awesome.css";
import L from 'leaflet';
import {eventBus} from "../../main";
import ActiveChat from '../subComponents/ActiveChat';
import ChatList from '../subComponents/ChatList';
import ChatService from "../../services/chatStorage.service";

export default {

   components: {
    ActiveChat,
    ChatList
  },

  data: function() {
    return {
      yourNamePlaceholder: "Your name",
      startTxt: "Start chatting",
      latTxt: "Latitude",
      longTxt: "Longitude", 
      searchTxt: "Chat name",
      imgUrl: require('../../assets/user-picture.png'),
      username: "",
      searchQuery: "",
      chatName: "",
      lat: "",
      long: "",
      openedChat: "",
      openedChatIndex: "",
      marker: {},
      newChat: {},
      featureGroup: {},
      markerList: [],
      chatList: [],
      activeChat: false,
      showChatList: true,
      initChat: false,
      markerIndex: 0,
      removedFirst: 0
    };
  },

  props:{
      leafletMap: Object,
      myIcon: Object,
      selectedChatIcon: Object
  },

  beforeUpdate(){
    
    this.featureGroup = L.featureGroup().addTo(this.leafletMap).on("click", this.groupClick);

    eventBus.$on('ADDED_CHAT', (chatlist) => { 
        this.chatList = chatlist;
    });
    eventBus.$on('UPDATED_MARKERS', (values) => { 
        this.markerList = values.markerList;
        this.markerIndex = values.markerIndex;
    });
    eventBus.$on('LEAVE_CHAT', (values) => { 
        this.showChatList = values.showChatList;
        this.activeChat = values.activeChat;
    });
    eventBus.$on('GET_OPENED_CHAT', (values) => { 
        this.showChatList = values.showChatList;
        this.activeChat = values.activeChat;
        this.openedChat = values.openedChat;
        this.openedChatIndex = values.openedChatIndex;
    });
  },

  updated(){
    if(this.$el.querySelector('.messages')){ 
      this.$el.querySelector('.messages').scrollTop  = this.$el.querySelector('.messages').scrollHeight;
    }
  },
  
  methods:{
    
    addMarker(e){
      this.escapeFirstMapClick();
      
      this.lat = parseFloat(e.latlng.lat).toFixed(2); 
      this.long = parseFloat(e.latlng.lng).toFixed(2); 
      eventBus.$emit('GET_COORDINATES', {'lat': this.lat, 'long': this.long}); 

      this.markerList[this.markerIndex] = L.marker(e.latlng, {icon: this.myIcon}).addTo(this.featureGroup);   
      this.markerList[this.markerIndex].chatIndex = this.markerIndex;
      
      if (this.removedFirst == 1){ 
        this.addedMarker();
      }
    },

    addedMarker(){ 
      this.removedFirst = 0;
      this.markerIndex++;
      this.leafletMap.off('click', this.addMarker);
      eventBus.$emit('GET_MARKER_DATA', {'markerList': this.markerList, 'markerIndex': this.markerIndex});
      eventBus.$emit('DISPLAY_POPUPS', {'showNewChatPopup': true, 'showChatLocationPopup': false});
    },

    escapeFirstMapClick(){ 
      //lil' workaround to 'escape' the first click so it doesn't become a marker
      if(typeof this.markerList[this.markerIndex] != 'undefined'){   
        this.leafletMap.removeLayer(this.markerList[this.markerIndex]); 
        this.removedFirst = 1;
      }
    },

    renderStoredData(){
      this.chatList = JSON.parse(ChatService.fetchAllMessages('storedChats')); 
      eventBus.$emit('GET_STORED_CHATS', this.chatList);
      
      this.markerIndex = JSON.parse(ChatService.fetchAllMessages('markerIndex'));
      
      for (let i=0; i<this.chatList.length; i++){
        this.markerList[i] = L.marker([this.chatList[i].lat, this.chatList[i].lng], {icon: this.myIcon}).addTo(this.featureGroup);  
        this.markerList[i].chatIndex = i; 
      }
    },

    start(){
      this.initChat = true; 
      if (ChatService.fetchAllMessages('storedChats') !== null){
        this.renderStoredData();
      }
    },

    addNewChat(){ 
      eventBus.$emit('DISPLAY_POPUPS', {'showNewChatPopup': false, 'showChatLocationPopup': true, 'chatName': ""});
      this.leafletMap.on('click', this.addMarker);
    },

    groupClick(e){
      for (let i=0; i<this.chatList.length; i++){ 
        if(e.layer.chatIndex == i){ 
          this.openChat(this.chatList[i], i);
        }
      }
    },

    clearSearch(){
      this.searchQuery='';
    }
  }
}
</script>

<style lang="sass" scoped>
  @import "../../scss/chatPanel"
</style>