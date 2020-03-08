import {Vue,Component,Prop} from 'vue-property-decorator';
import './LessonImportItem.less';

const {remote} = window.require('electron');


@Component({})
export default class LessonImportItem extends Vue{

  @Prop()
  private courseId!:number;

  private render(){

    return <div class="lesson-item add-lesson-item">

      <div class="add-lesson-item-add" onClick={this.clickAdd}>
        <div class="add-lesson-item-add-single-add" />
        <span class="add-title">添加视频</span>
      </div>

      {/*<div class="add-lesson-item-add ml-100" onClick={this.clickMulti}>*/}
        {/*<div class="add-lesson-item-add-multi-add" />*/}
        {/*<span class="add-title">批量导入</span>*/}
      {/*</div>*/}
    </div>
  }

  private clickAdd() {

    this.$router.push({
      path: '/lesson/create', query: {
        courseId: this.courseId + ''
      }
    });
  }

  private clickMulti(){

    let dialog = remote.dialog;
    let win = remote.getCurrentWindow();

    let result = dialog.showOpenDialogSync(win,{
      title:'批量导入',
      filters: [
        { name: 'All Files', extensions: ['*'] }
      ],
      properties:[
        'openFile',
        'multiSelections',
        'openDirectory'


      ]
    });

    console.log('clickMulti result=',result);

    if(!result ){
      return;
    }

  }
}
