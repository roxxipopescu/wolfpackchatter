<template>
  <div id="map">
    <div v-if="showChatLocationPopup" class="choose-location">
      {{chooseLocation}}
    </div>
    <div v-if="showNewChatPopup" class="new-chat">
      <form @submit.prevent="createNewChat()">
        <p class="title">{{newChatTxt}}</p>
        <p class="latlong">{{latTxt}} {{lat}}, {{longTxt}} {{long}}</p>
        <input type="text" class="chatname-inputfield form-control" v-model="chatName" :placeholder="nameThisChat"/>
        <button class="create-chat btn btn-dark" type="submit">{{create}}</button>
      </form>
    </div>
    <div class="chat-panel">
      <div v-if="!initChat" class="chat-init">
        <form @submit.prevent="start()">
          <input type="text" class="name-inputfield form-control" v-model="username" :placeholder="yourNamePlaceholder"/>
          <button class="start-chat btn btn-dark" type="submit">{{startTxt}}</button>
        </form>
      </div>
      <div v-if="initChat" class="open-chat">
        <div class="user-info">
          <img class="user-picture" src="../../static/images/user-picture.png"/>
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
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css"
import "font-awesome/css/font-awesome.css";
import L from 'leaflet';
import $ from 'jquery';
import io from 'socket.io-client';

export default {

  data: function() {
    return {
      emptyChatsMsg: "Nothing to show here.",
      plusButtonInfo: "Use the + button to create a new chat",
      create: "Create",
      yourNamePlaceholder: "Your name",
      startTxt: "Start chatting",
      chooseLocation: "Choose the chat location on the map",
      newChatTxt: "New Chat",
      latTxt: "Latitude",
      longTxt: "Longitude",
      nameThisChat: "Name this chat",
      searchTxt: "Chat name",
      typeTxt: "Type a message",
      sendTxt: "Send",
      username: "",
      searchQuery: "",
      chatName: "",
      lat: "",
      long: "",
      openedChat: "",
      openedChatIndex: "",
      message: "",
      map: {},
      myIcon: {},
      selectedChatIcon: {},
      marker: {},
      newChat: {},
      markerList: [],
      chatList: [],
      messages: [],
      messagesByChat: [],
      showNewChatPopup: false,
      showChatLocationPopup: false,
      showChatList: true,
      initChat: false,
      markerIndex: 0,
      removedFirst: 0,
      featureGroup: {},
      socket: io('localhost:3000')
    };
  },
  mounted: function(){
    // Create a Tile Layer and add it to the map
    var tiles = new L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png');
    // Initialize the map and assign it to a variable for later use
    this.map = L.map('map', {
        // Set latitude and longitude of the map center (required)
        center: [46.7712, 23.6236],
        // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
        zoom: 5,
        layers: [tiles]
    });

    this.featureGroup = L.featureGroup().addTo(this.map).on("click", this.groupClick);

    this.myIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.1.0/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.1.0/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.1.0/dist/images/marker-shadow.png',
        iconSize:    [25, 41],
        iconAnchor:  [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize:  [41, 41]
    });

    this.selectedChatIcon = L.icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconRetinaUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        iconSize:    [25, 41],
        iconAnchor:  [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize:  [41, 41]
    });

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
    createNewChat(){
      this.newChat = {};
      this.newChat['name'] = this.chatName;
      this.newChat['lat'] = this.lat;
      this.newChat['lng'] = this.long;
      this.chatList.push(this.newChat);      
      localStorage.setItem('storedChats', JSON.stringify(this.chatList));
      localStorage.setItem('markerIndex', JSON.stringify(this.markerIndex)); 
      this.showNewChatPopup = false;
    },
    addMarker(e){ 
      if(!$.isEmptyObject(this.markerList[this.markerIndex])){ 
        this.map.removeLayer(this.markerList[this.markerIndex]);
        this.removedFirst = 1;
      }

      this.lat = parseFloat(e.latlng.lat).toFixed(2); 
      this.long = parseFloat(e.latlng.lng).toFixed(2);      
      this.markerList[this.markerIndex] = L.marker(e.latlng, {icon: this.myIcon}).addTo(this.featureGroup);   
      this.markerList[this.markerIndex].chatIndex = this.markerIndex;

      if (this.removedFirst == 1){
        this.removedFirst = 0;
        this.showChatLocationPopup = false;  
        this.showNewChatPopup = true;
        this.map.off('click', this.addMarker);
        this.markerIndex++;
      }  
    },
    renderStoredData(){
      this.chatList = JSON.parse(localStorage.getItem('storedChats'));
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
      this.showChatLocationPopup = true;  
      this.chatName = "";
      this.map.on('click', this.addMarker);
    },
    openChat(chat, index){ 
      this.showChatList = false;
      this.openedChat = chat;
      this.openedChatIndex = index;
      this.markerList[index] = L.marker([chat.lat, chat.lng], {icon: this.selectedChatIcon}).addTo(this.map); 
      $(".chat-panel").addClass("chat-active");
      
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
      this.map.removeLayer(this.markerList[index]);
      this.showChatList = true;
      this.searchQuery = "";
      $(".chat-panel").removeClass("chat-active");
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
    },
  },

  computed:{
    filteredChatsList(){
      if (this.searchQuery){
        return this.chatList.filter((item, index)=>{ 
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
  @import "../scss/styles"
</style>
