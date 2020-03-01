import {Vue, Component} from "vue-property-decorator";
import './MenuBar.less';

@Component({
})
export default class MenuBar extends Vue {

  private isShowRefreshAnim: boolean = false;
  private isShowBackAnim: boolean = false;
  private isShowGoAnim: boolean = false;

  private created() {

    this.$router.beforeEach((to, from, next) => {

      const path = to.path;
      const fromPath = from.path;

      next();

    })

  }

  private render() {

    let backStyle = '';
    if (this.isShowBackAnim) {
      backStyle = 'menu-bar-back back-anim';
    } else {
      backStyle = 'menu-bar-back';
    }

    let goStyle = '';
    if (this.isShowGoAnim) {
      goStyle = 'menu-bar-go go-anim';
    } else {
      goStyle = 'menu-bar-go';
    }

    let refreshStyle = '';
    if (this.isShowRefreshAnim) {
      refreshStyle = 'menu-bar-refresh rotate-anim'
    } else {
      refreshStyle = 'menu-bar-refresh';
    }

    return <div class="menu-bar">
      <a class={backStyle} onclick={this.back} />
      <a class={goStyle} onclick={this.go} />
      {/*<a class={refreshStyle} onclick={this.refresh} />*/}

    </div>
  }

  private back() {

    let path = this.$route.path;
    console.log('path', path);

    if ('/' === path) {
      return;
    }

    this.$router.back();
    this.showBackAnim();
  }


  private showBackAnim() {

    this.isShowBackAnim = true;
    setTimeout(() => {
      this.isShowBackAnim = false;
    }, 1000);
  }


  private go() {

    this.$router.forward();
    this.showGoAnim();
  }

  private showGoAnim() {

    this.isShowGoAnim = true;
    setTimeout(() => {
      this.isShowGoAnim = false;
    }, 1000);
  }

  private lastRefreshTime = 0;

  private refresh() {

    // location.reload();
    this.isShowRefreshAnim = true;
    this.lastRefreshTime = new Date().getTime();

  }

  private stopRefresh() {
    let now = new Date().getTime();
    let diff = now - this.lastRefreshTime;
    if (diff < 1000) {
      setTimeout(() => {
        this.isShowRefreshAnim = false;
      }, 500);
    } else {
      this.isShowRefreshAnim = false;
    }
  }

}
