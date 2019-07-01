<template>
  <div id="map">
    <div class="choose-location">
      {{chooseLocation}}
    </div>
    <div class="new-chat">
      <p class="title">{{newChat}}</p>
      <p class="latlong">{{latTxt}} {{lat}}, {{longTxt}} {{long}}</p>
      <input type="text" class="chatname-inputfield form-control" v-model="chatName" :placeholder="nameThisChat"/>
      <button class="create-chat btn btn-dark" type="button" v-on:click="createNewChat()">Create</button>
    </div>
    <div class="chat-panel">
      <div class="chat-init">
        <input type="text" class="name-inputfield form-control" v-model="username" :placeholder="yourNamePlaceholder"/>
        <button class="start-chat btn btn-dark" type="button" v-on:click="openChat()">Start chatting</button>
      </div>
      <div class="open-chat">
        <img class="user-picture" src="../../static/images/user-picture.png"/>
        <span class="username">{{username}}</span>
        <div class="chats-container">
          <i class="fa fa-search"></i>
          <input type="text" class="search-inputfield form-control" v-model="search" placeholder="Chat name"/>
          <i class="fa fa-plus-circle" v-on:click="addNewChat"></i>
          <div class="chatlist">
            <div class="empty-chatlist">
              <p>{{emptyChatsMsg}}</p>
              <p>{{plusButtonInfo}}</p>
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
      username: "",
      search: "",
      chatName: "",
      emptyChatsMsg: "Nothing to show here.",
      plusButtonInfo: "Use the + button to create a new chat",
      yourNamePlaceholder: "Your name",
      chooseLocation: "Choose the chat location on the map",
      newChat: "New Chat",
      latTxt: "Latitude",
      longTxt: "Longitude",
      nameThisChat: "Name this chat",
      map: {},
      myIcon: {},
      marker: {},
      removedFirst: 0,
      lat: "",
      long: ""
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
    
  },
  
  methods:{
    createNewChat(){
      console.log('hey');
    },
    addMarker(e){     
      if(!$.isEmptyObject(this.marker)){ 
        this.map.removeLayer(this.marker);
        this.removedFirst = 1;
      }
      this.lat = parseFloat(e.latlng.lat).toFixed(2); 
      this.long = parseFloat(e.latlng.lng).toFixed(2); 
      this.marker = L.marker(e.latlng, {icon: this.myIcon}).addTo(this.map);      
      if (this.removedFirst == 1){
        $('.choose-location').hide();
        $('.new-chat').show();
      }  
    },
    openChat(){
      $('.chat-init').hide();
      $('.open-chat').show();
    },
    addNewChat(){ 
      $('.choose-location').show();   
      this.map.on('click', this.addMarker);
    }
   
  }
}
</script>

<style lang="sass" scoped>
  @import "../scss/styles"
</style>
