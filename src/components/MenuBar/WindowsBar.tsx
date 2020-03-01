import {Vue, Component} from "vue-property-decorator";
import './WindowsBar.less'
//@ts-ignore
const {remote} = window.require('electron');

import courseService from '@/services/CourseService';


@Component({
  components: {
  }
})
export default class WindowsBar extends Vue {

  private isMac: boolean = false;

  created() {
    this.isMac = remote.process.platform === 'darwin';
  }

  render() {
    if (this.isMac) {
      return null;
    }
    return (<div class="windows-bar">
      <div class="windows-bar-item" onclick={this.clickMin}>
        <div class="windows-bar-min" />

      </div>
      <div class="windows-bar-item" onclick={this.clickMax}>
        <div class="windows-bar-max" />

      </div>
      <div class="windows-bar-item" onclick={this.close}>
        <div class="windows-bar-close" />
      </div>

    </div>);
  }

  private clickMin() {

    remote.BrowserWindow.getFocusedWindow().hide();
  }

  private clickMax() {

    const win = remote.BrowserWindow.getFocusedWindow();
    console.log(" win.isMaximized() ", win.isMaximized());
    win.isMaximized() ? win.unmaximize() : win.maximize();
  }


  private close() {

    courseService.saveDb();
    setTimeout(() => remote.app.quit(), 1);
  }
}
