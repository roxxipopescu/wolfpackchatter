<template>
  <div id="map">
    <AddNewChat :leafletMap="map"></AddNewChat>
    <ChatPanel :leafletMap="map" :myIcon="myIcon" :selectedChatIcon="selectedChatIcon"></ChatPanel>
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
      myIcon: {},
      selectedChatIcon: {},
    };
  },

  mounted: function(){

    let tiles = new L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png');
    this.map = L.map('map', {
        center: [46.7712, 23.6236],
        zoom: 5,
        layers: [tiles]
    });

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

  }
}
</script>

<style lang="sass" scoped>
  @import "../scss/styles"
</style>
