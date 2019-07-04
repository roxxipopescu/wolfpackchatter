<template>
  <div id="map">
    <div v-if="showChatLocationPopup" class="choose-location">
      {{chooseLocation}}
    </div>
    <div v-if="showNewChatPopup" class="new-chat">
      <p class="title">{{newChatTxt}}</p>
      <p class="latlong">{{latTxt}} {{lat}}, {{longTxt}} {{long}}</p>
      <input type="text" class="chatname-inputfield form-control" v-model="chatName" :placeholder="nameThisChat"/>
      <button class="create-chat btn btn-dark" type="button" v-on:click="createNewChat()">Create</button>
    </div>
    <div class="chat-panel">
      <div v-if="!initChat" class="chat-init">
        <input type="text" class="name-inputfield form-control" v-model="username" :placeholder="yourNamePlaceholder"/>
        <button class="start-chat btn btn-dark" type="button" v-on:click="start()">Start chatting</button>
      </div>
      <div v-if="initChat" class="open-chat">
        <img class="user-picture" src="../../static/images/user-picture.png"/>
        <span class="username">{{username}}</span>
        <div class="chats-container">
          <div class="search-container" v-if="showChatList">
            <i class="fa fa-search"></i>
            <input type="text" class="search-inputfield form-control" v-model="searchQuery" :placeholder="searchTxt" />
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

export default {

  data: function() {
    return {
      emptyChatsMsg: "Nothing to show here.",
      plusButtonInfo: "Use the + button to create a new chat",
      yourNamePlaceholder: "Your name",
      chooseLocation: "Choose the chat location on the map",
      newChatTxt: "New Chat",
      latTxt: "Latitude",
      longTxt: "Longitude",
      nameThisChat: "Name this chat",
      searchTxt: "Chat name",
      username: "",
      searchQuery: "",
      chatName: "",
      lat: "",
      long: "",
      openedChat: "",
      openedChatIndex: "",
      map: {},
      myIcon: {},
      selectedChatIcon: {},
      marker: {},
      newChat: {},
      markerList: [],
      chatList: [],
      showNewChatPopup: false,
      showChatLocationPopup: false,
      showChatList: true,
      initChat: false,
      markerIndex: 0,
      removedFirst: 0,

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
      this.markerList[this.markerIndex] = L.marker(e.latlng, {icon: this.myIcon}).addTo(this.map);   
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
        this.markerList[i] = L.marker([this.chatList[i].lat, this.chatList[i].lng], {icon: this.myIcon}).addTo(this.map);   
      }
    },
    start(){
      this.initChat = true;
      if (JSON.parse(localStorage.getItem('storedChats'))){
         this.renderStoredData();
      }
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

    },
    exitChat(index){
      this.map.removeLayer(this.markerList[index]);
      this.showChatList = true;
    }
  },

  computed:{
    filteredChatsList(){
      if (this.searchQuery){
        return this.chatList.filter((item)=>{
        return item.name.startsWith(this.searchQuery);
      })
      }else{
        return this.chatList;
      }
    }
  }
}
</script>

<style lang="sass" scoped>
  @import "../scss/styles"
</style>
