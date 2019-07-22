<template>
  <div id="map">
    <AddNewChat></AddNewChat>
    <ChatPanel :leafletMap="map" :featureGroup="featureGroup" :myIcon="myIcon" :selectedChatIcon="selectedChatIcon"></ChatPanel>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css"
import L from 'leaflet';
import ChatPanel from './subComponents/ChatPanel'
import AddNewChat from './subComponents/AddNewChat'

export default {

  components: {
    ChatPanel,
    AddNewChat
  },

  data: function() {
    return {
      map: {},
      featureGroup: {},
      myIcon: {},
      selectedChatIcon: {},
      /*username: "",
      searchQuery: "",
      chatName: "",
      lat: "",
      long: "",
      openedChat: "",
      openedChatIndex: "",
      message: "",
      map: {},
      
      marker: {},
      newChat: {},
      markerList: [],
      chatList: [],
      messages: [],
      messagesByChat: [],
      showNewChatPopup: false,
      showChatLocationPopup: false,
      activeChat: false,
      showChatList: true,
      initChat: false,
      markerIndex: 0,
      removedFirst: 0,
      click: 0,
      featureGroup: {},
      //socket: io('localhost:3000')*/
    };
  },

  mounted: function(){

    let tiles = new L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png');
    this.map = L.map('map', {
        center: [46.7712, 23.6236],
        zoom: 5,
        layers: [tiles]
    });

    this.featureGroup = L.featureGroup().addTo(this.map).on("click", this.groupClick);

    //overriding leaflet default icon because of library bug(marker path file regex bug)
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
    
    /*groupClick(e){
      for (let i=0; i<this.chatList.length; i++){ 
        if(e.layer.chatIndex == i){ 
          this.openChat(this.chatList[i], i);
        }
      }
    }*/

  },
}
</script>

<style lang="sass" scoped>
  @import "../scss/styles"
</style>
