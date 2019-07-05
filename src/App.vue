<template>
  <div id="app">
    <WolfChatter/>
  </div>
</template>
<script>
import WolfChatter from './components/WolfChatter.vue'

export default {
  name: 'app',
  components: {
    WolfChatter
  }
}
</script>

<style lang="scss">
body,
html {
  height: 100%;
}
#app {
  height: 100%;
}
</style>
