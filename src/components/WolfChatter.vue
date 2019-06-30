<template>
  <div id="map">
    <div class="chat-panel">
      <div class="chat-init">
        <input type="text" class="name-inputfield form-control" v-model="username" placeholder="Your name"/>
        <button class="start-chat btn btn-dark" type="button" v-on:click="openChat()">Start chatting</button>
      </div>
      <div class="open-chat">
        <img class="user-picture" src="../../static/images/user-picture.png"/>
        <span class="username">{{username}}</span>
        <div class="chats-container">
          <input type="text" class="search-inputfield form-control" v-model="search" placeholder="Chat name"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css"
import L from 'leaflet';

export default {

  data: function() {
    return {
      username: "",
      search: ""
    };
  },
  mounted: function(){
    // Initialize the map and assign it to a variable for later use
    var map = L.map('map', {
        // Set latitude and longitude of the map center (required)
        center: [46.7712, 23.6236],
        // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
        zoom: 5
    });

    // Create a Tile Layer and add it to the map
    var tiles = new L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png').addTo(map);
  },
  methods:{
    openChat(){
      $('.chat-init').hide();
      $('.open-chat').show();
    }
  }
}
</script>

<style lang="sass" scoped>
  @import "../scss/styles"
</style>
