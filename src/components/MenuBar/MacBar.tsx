import {Vue, Component} from "vue-property-decorator";
import './MacBar.less'
//@ts-ignore
const {remote} = window.require('electron');
import courseService from '@/services/CourseService';


@Component({
})
export default class WindowsBar extends Vue {

  private isMac: boolean = false;

  created() {
    this.isMac = remote.process.platform === 'darwin';

  }

  render() {
    if (!this.isMac) {
      return null;
    }
    return (<div class="mac-bar">

      <div class="mac-bar-item" onClick={this.close}>
        <div class="mac-bar-close" />

      </div>

      <div class="mac-bar-item" onclick={this.clickMin}>
        <div class="mac-bar-min" />

      </div>
      <div class="mac-bar-item" onclick={this.clickMax}>
        <div class="mac-bar-max" />

      </div>



    </div>);
  }

  private clickMin() {
    remote.BrowserWindow.getFocusedWindow().hide();
  }

  private clickMax() {
    const win = remote.BrowserWindow.getFocusedWindow();
    win.isMaximized() ? win.unmaximize() : win.maximize();
  }

  private close() {

    courseService.saveDb();
    setTimeout(() => remote.app.quit(), 1);
  }
}
