import {Vue, Component} from 'vue-property-decorator';
import './Setting.less';
import configManager from '@/config/ConfigManager';

const {remote} = window.require('electron');

@Component({})
export default class Setting extends Vue {

  private dbPath: string = '';

  mounted(){
    this.dbPath = configManager.getDbPath();
  }

  private render() {

    return <div class="setting">
      <div class="title">设置</div>
      <div class="setting-width">
        <van-divider content-position="left">数据库存放目录</van-divider>
      </div>
      <van-field class="input-style" v-model={this.dbPath} readonly="" label="" placeholder="" />

      <div class="setting-btns mt-10">
        <div class="button4" onclick={this.clickChooseDbPath}>选择现有位置</div>
        <div class="button4" onclick={this.clickOpenSaveDbPathDialog}>移到其他位置</div>
      </div>
    </div>;
  }

  /**
   * 移到其他位置
   */
  private clickOpenSaveDbPathDialog() {

    console.log('clickOpenSaveDbPathDialog');

    let dialog = remote.dialog;
    let win = remote.getCurrentWindow();

    let result = dialog.showSaveDialogSync(win,{
      title:'移到其他位置',
      defaultPath:'learn_sql',
      filters: [
        {name: 'db数据库', extensions: ['db']},
      ],
      properties:[
        'createDirectory'
      ]
    });

    console.log('clickOpenSaveDbPathDialog result=',result);

    if(!result ){
      return;
    }

    let newPath:string = result;

    if(!newPath.lastIndexOf('.db')){
      this.$toast('保存的文件格式吧不是db');
      return;
    }

    configManager.moveDbToNewPath(newPath).then(()=>{
      this.$toast('移动数据库成功');
      this.dbPath = configManager.getDbPath();

    }).catch((err)=>{
      console.log('clickOpenSaveDbPathDialog() err=',err);
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

    }).catch((err:any) => {
      console.log('Setting chooseNewDb err',err);
      this.$toast('连接新数据库失败');

    });
  }
}
