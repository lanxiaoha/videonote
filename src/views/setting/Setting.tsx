import {Vue, Component} from 'vue-property-decorator';
import './Setting.less';
import configManager from '@/config/ConfigManager';
import uploadImageService from '@/services/ImageService'

const {remote} = window.require('electron');

@Component({})
export default class Setting extends Vue {

  private dbPath: string = '';
  private smmsApiToken: string = '';

  private showDbHelp: boolean = false;
  private showSmmsHelp: boolean = false;

  mounted() {
    this.dbPath = configManager.getDbPath();
    this.smmsApiToken = configManager.getSmmsApiToken();
  }

  private render() {

    return <div class="setting">

      <div class="title">设置</div>

      <div class="setting-width">
        <el-divider content-position="left">
          <div class="display-center-line">数据库存放目录 <div class="help ml-10" onclick={() => {
            this.showDbHelp = true;
          }} /></div>
        </el-divider>
        <van-field class="input-style" v-model={this.dbPath} readonly="" label="" placeholder="" />

        <div class="setting-btns mt-10">
          <div class="button4" onClick={this.clickChooseDbPath}>选择现有位置</div>
          <div class="button4" onClick={this.clickOpenSaveDbPathDialog}>移到其他位置</div>
        </div>

        <div class="setting-width mt-20">
          <el-divider content-position="left">
            <div class="display-center-line">SM.MS图床Token <div class="help ml-10" onclick={()=>{this.showSmmsHelp = true}}/></div>
          </el-divider>
        </div>

        <div class="setting-btns mt-10">
          <van-field class="input-style" v-model={this.smmsApiToken} label="" placeholder="" />
          <div class="setting-saveSmms button2" onClick={this.clickSaveSmmsApiToken}>保存</div>
        </div>
      </div>


      <el-dialog
        title="数据库帮助"
        width="50%"
        show-close={false}
        visible={this.showDbHelp}
        before-close="handleClose">
        <span>你的所有的课程、视频、笔记信息都保存在数据库中。为了以防万一强烈建议你定期备份你的数据库。</span>
        <span slot="footer" class="dialog-footer">
          <el-button onclick={() => {
            this.showDbHelp = false;
          }}>关 闭</el-button>
        </span>
      </el-dialog>


      <el-dialog
        title="图床帮助"
        width="50%"
        show-close={false}
        visible={this.showSmmsHelp}
        before-close="handleClose">
        <p>可以在服务器上保存图片，后续导图的md文件可以随时查看图片。</p>
        <p>本应用只实现sm.ms的上传图床的功能，不保证图片的安全等其他问题。</p>
        <p>到“https://sm.ms/”创建一个图床ApiToken，方能使用图床功能。</p>
        <span slot="footer" class="dialog-footer">
          <el-button onclick={() => {
            this.showSmmsHelp = false;
          }}>关 闭</el-button>
        </span>
      </el-dialog>

    </div>;
  }

  /**
   * 移到其他位置
   */
  private clickOpenSaveDbPathDialog() {

    console.log('clickOpenSaveDbPathDialog');

    let dialog = remote.dialog;
    let win = remote.getCurrentWindow();

    let result = dialog.showSaveDialogSync(win, {
      title: '移到其他位置',
      defaultPath: 'learn_sql',
      filters: [
        {name: 'db数据库', extensions: ['db']},
      ],
      properties: [
        'createDirectory'
      ]
    });

    console.log('clickOpenSaveDbPathDialog result=', result);

    if (!result) {
      return;
    }

    let newPath: string = result;

    if (!newPath.lastIndexOf('.db')) {
      this.$toast('保存的文件格式吧不是db');
      return;
    }

    configManager.moveDbToNewPath(newPath).then(() => {
      this.$toast('移动数据库成功');
      this.dbPath = configManager.getDbPath();

    }).catch((err) => {
      console.log('clickOpenSaveDbPathDialog() err=', err);
      this.$toast('移动数据库失败');

    });


  }

  /**
   * 选择现有位置
   */
  private clickChooseDbPath() {

    console.log('clickChooseDbPath');

    let dialog = remote.dialog;

    let win = remote.getCurrentWindow();
    let result = dialog.showOpenDialogSync(win, {
      title: '选择现有位置', properties: ['openFile'], filters: [
        {name: 'db数据库', extensions: ['db']},
      ]
    });

    console.log('result', result);

    if (!result || result.length == 0) {
      return;
    }

    let newPath = result[0];
    if (!newPath) {
      return;
    }
    configManager.chooseNewDb(newPath).then(() => {
      this.$toast('选择新数据库成功');
      this.dbPath = configManager.getDbPath();

    }).catch((err: any) => {
      console.log('Setting chooseNewDb err', err);
      this.$toast('连接新数据库失败');

    });
  }

  private clickSaveSmmsApiToken() {

    if (!this.smmsApiToken) {
      return;
    }

    configManager.setSmmsApiToken(this.smmsApiToken);
    uploadImageService.setToken(this.smmsApiToken);
    this.$message('保存成功');
  }

}
