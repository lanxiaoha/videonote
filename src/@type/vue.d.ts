import Vue from 'vue';
//@ts-ignore
import Toast from 'vant/lib/toast';

declare module 'vue/types/vue' {
  interface Vue {
  }
}

declare module 'vue/types/vue' {


  interface Vue {
    $bus: Vue,
    $toast:Toast
  }
}

