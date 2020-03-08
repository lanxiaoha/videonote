<template>
  <div id="app">
    <div v-if="showNav" class="mb-nav">
      <div class="mb-nav-left">
        <menu-bar class="margin-left-90" />
      </div>

      <windows-bar class="margin-right-2" />
    </div>
    <router-view/>
  </div>
</template>

<script>
  import MenuBar from '@/components/MenuBar/MenuBar';
  import WindowsBar from '@/components/MenuBar/WindowsBar';
  export default {

    components: {MenuBar,WindowsBar},
    data () {
      return {
        showNav: true
      }
    },
    mounted(){
      let index = this.$route.fullPath.indexOf('/lesson/local/play' );
      console.log('path',this.$route.path,index);
      if (index >=0){
        console.log('showNav = false');
        this.showNav = false;
      }
    },
    methods:{

    }
  }

</script>

<style lang="less">
  @import "~@/assets/less/style.less";

#app {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  display: flex;
  flex-direction: column;

  .mb-nav {
    width: 100%;
    flex-shrink: 0;
    height: @menubar-height;
    /*position: fixed;*/
    background-color: @primary;
    -webkit-app-region: drag;
    z-index: 100;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    &-left{
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .margin-left-90 {
      margin-left: 90px;
    }

    .margin-left-180 {
      margin-left: 180px;
    }
    .margin-right-2{
      margin-right: 2.5px;
    }
  }
}

  ::-webkit-scrollbar{
    display: none;
  }

*{
  margin: 0;
  padding: 0;
}

html,body{
  height: 100%;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}


</style>
