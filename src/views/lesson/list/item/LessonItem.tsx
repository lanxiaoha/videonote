import {Vue, Component, Prop} from 'vue-property-decorator';
import './LessonItem.less';
import {Dialog} from 'vant';

@Component({})

export default class LessonItem extends Vue {

  @Prop()
  private item!: Lesson;
  private showDeleteDialog = false;

  private render() {

    return <div class="lesson-item" onClick={() => {
      this.clickLesson(this.item);
    }}>


      {
        this.item.cover && this.item.cover != 'undefined' ? <img class="lesson-item-img" src={this.item.cover} /> :
          <div class="lesson-item-img">暂无图片</div>
      }

      <div class="lesson-item-titles">
        <div class="lesson-item-titles-title">{this.item.name}</div>
        <div class="lesson-item-titles-des">{this.item.intro ? this.item.intro : '暂无简介'}</div>
      </div>
      <div class="lesson-item-ops mr-20" onclick={this.handleClick}>
        <el-dropdown oncommand={this.onSelectCommend} trigger="click">
            <span class="el-dropdown-link">
                <i class="el-icon-more"></i>
            </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="export">笔记</el-dropdown-item>
            <el-dropdown-item command="edit">简介</el-dropdown-item>
            <el-dropdown-item command="delete">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>


      <el-dialog
        title="提示"
        visible={this.showDeleteDialog}
        // width="30%"
        center>
        <span>{'请导出笔记!!'}</span><br/>
        <span>{'确定删除后，相关笔记也会被删除。'}</span>
        <span slot="footer" class="dialog-footer">
    <el-button onclick={(e:MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      this.showDeleteDialog = false;
    }}>取 消</el-button>
      <el-button type="primary" onclick={this.clickDeleteLesson}>确 定</el-button>
  </span>
      </el-dialog>

    </div>;
  }

  private handleClick(e: any) {
    console.log('handleClick');
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  private onSelectCommend(commend: string) {
    console.log('onSelectCommend', commend);

    if (commend === 'edit') {
      this.clickEdit();
    } else if (commend === 'export') {
      this.clickExport();
    } else if (commend === 'delete') {
      this.showDeleteDialog = true;
    }
  }

  private clickEdit() {

    console.log('LessonItem lessonId', this.item.id);
    this.$router.push({
      path: '/lesson/edit', query: {
        lessonId: this.item.id + ''
      }
    });
  }

  private clickExport() {
    this.$router.push({
      path: '/lesson/md', query: {
        lessonId: this.item.id + ''
      }
    });
  }

  private clickDeleteLesson(e:MouseEvent) {

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.showDeleteDialog = false;

  }

  private clickLesson(lesson: Lesson) {

    this.$router.push({
      path: '/lesson/play',
      query: {
        lessonId: lesson.id
      },
      params: {
        lesson: lesson,
      }
    } as any);

  }
}
