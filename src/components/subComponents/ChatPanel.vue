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
          <div class="chatlist" v-if="showChatList">
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
          <div v-else class="opened-chat">
            <i class="fa fa-chevron-left" v-on:click="exitChat(openedChatIndex)"></i>
            <div class="chat-title">{{openedChat.name}}</div>
            <div class="chat-body"> 
              <div class="messages">
                  <div v-for="(msg, index) in messagesByChat" :key="index" class="msg-bubble">
                    <div class="msg-data" :class="msg.user == username ? 'right':''">
                      <div class="userName">{{msg.user}}</div> 
                      <div class="sentMsg">{{msg.message}}</div>
                    </div>
                  </div>
              </div>
              <form @submit.prevent="sendMessage">
                <div class="msg-input input-group">
                  <input type="text" class="msg-inputfield form-control" v-model="message" :placeholder="typeTxt" />
                  <button class="send-msg btn btn-dark" type="submit">{{sendTxt}}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>


<script>
import "leaflet/dist/leaflet.css"
import "font-awesome/css/font-awesome.css";
import L from 'leaflet';
import io from 'socket.io-client';
import {eventBus} from "../../main";


export default {

  data: function() {
    return {
      emptyChatsMsg: "Nothing to show here.",
      plusButtonInfo: "Use the + button to create a new chat",
      //create: "Create",
      yourNamePlaceholder: "Your name",
      startTxt: "Start chatting",
      //chooseLocation: "Choose the chat location on the map",
      //newChatTxt: "New Chat",
      latTxt: "Latitude",
      longTxt: "Longitude",
      //nameThisChat: "Name this chat",
      searchTxt: "Chat name",
      typeTxt: "Type a message",
      sendTxt: "Send",
      imgUrl: require('../../assets/user-picture.png'),
      username: "",
      searchQuery: "",
      chatName: "",
      lat: "",
      long: "",
      openedChat: "",
      openedChatIndex: "",
      message: "",
      marker: {},
      newChat: {},
      markerList: [],
      chatList: [],
      messages: [],
      messagesByChat: [],
      activeChat: false,
      showChatList: true,
      initChat: false,
      markerIndex: 0,
      removedFirst: 0,
      click: 0,
      socket: io('localhost:3000')
    };
  },

  props:{
      leafletMap: Object,
      featureGroup: Object,
      myIcon: Object,
      selectedChatIcon: Object
  },

  mounted: function(){
    this.socket.on('message', (data) => { 
      this.messages = [...this.messages, data]; 
      localStorage.setItem('storedMessages', JSON.stringify(this.messages));
      this.messagesByChat = this.messages.filter((msg) => {
          if(msg.chatId ==  this.openedChatIndex) return msg;
        }
      );
    });
  },

  updated(){
    if(this.$el.querySelector('.messages')){ 
      this.$el.querySelector('.messages').scrollTop  = this.$el.querySelector('.messages').scrollHeight;
    }
  },
  
  methods:{
    
    addMarker(e){
      //lil' workaround to 'escape' the first click so it doesn't become a marker
      if(typeof this.markerList[this.markerIndex] != 'undefined'){   
        this.leafletMap.removeLayer(this.markerList[this.markerIndex]); 
        this.removedFirst = 1;
      }
      this.lat = parseFloat(e.latlng.lat).toFixed(2); 
      this.long = parseFloat(e.latlng.lng).toFixed(2); 
      eventBus.$emit('getCoords', {'lat': this.lat, 'long': this.long});     
      this.markerList[this.markerIndex] = L.marker(e.latlng, {icon: this.myIcon}).addTo(this.featureGroup);   
      this.markerList[this.markerIndex].chatIndex = this.markerIndex;
      if (this.removedFirst == 1){ 
        this.removedFirst = 0;
        eventBus.$emit('displayPopups', {'showNewChatPopup': true, 'showChatLocationPopup': false});
        this.leafletMap.off('click', this.addMarker);
        this.markerIndex++;
      }  
    },

    renderStoredData(){
      this.chatList = JSON.parse(localStorage.getItem('storedChats'));
      eventBus.$emit('getStoredChats', this.chatList);
      this.markerIndex = JSON.parse(localStorage.getItem('markerIndex'));
      for (let i=0; i<this.chatList.length; i++){
        this.markerList[i] = L.marker([this.chatList[i].lat, this.chatList[i].lng], {icon: this.myIcon}).addTo(this.featureGroup);  
        this.markerList[i].chatIndex = i; 
      }
    },

    start(){
      this.initChat = true;
      if (JSON.parse(localStorage.getItem('storedChats'))){
        this.renderStoredData();
      }
      this.socket.emit('join', this.username);
    },

    addNewChat(){ 
      eventBus.$emit('displayPopups', {'showNewChatPopup': false, 'showChatLocationPopup': true});
      this.chatName = "";
      this.leafletMap.on('click', this.addMarker);
    },

    openChat(chat, index){ 
      this.showChatList = false;
      this.openedChat = chat;
      this.openedChatIndex = index;
      this.markerList[index] = L.marker([chat.lat, chat.lng], {icon: this.selectedChatIcon}).addTo(this.leafletMap); 
      this.activeChat = true;
      
      if (this.messages.length == 0){ 
        if (JSON.parse(localStorage.getItem('storedMessages')) !== null){
          this.messages = JSON.parse(localStorage.getItem('storedMessages')); 
          this.messagesByChat = this.messages.filter((msg) => { 
            if(msg.chatId == index) return msg;
          });
        }
      }
      else{
        this.messagesByChat = this.messages.filter((msg) => { 
            if(msg.chatId == index) return msg;
          });
      }
    },

    exitChat(index){
      this.leafletMap.removeLayer(this.markerList[index]);
      this.showChatList = true;
      this.searchQuery = "";
      this.activeChat = false;
    },

    groupClick(e){
      for (let i=0; i<this.chatList.length; i++){ 
        if(e.layer.chatIndex == i){ 
          this.openChat(this.chatList[i], i);
        }
      }
    },

    sendMessage(){
      this.socket.emit('message', this.message, this.openedChatIndex);
      this.message = ''
    },

    clearSearch(){
      this.searchQuery='';
    }
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
  }
}
</script>

<style lang="sass" scoped>
  @import "../../scss/styles"
</style>