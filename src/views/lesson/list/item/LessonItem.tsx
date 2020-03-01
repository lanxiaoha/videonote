import {Vue, Component, Prop} from 'vue-property-decorator';
import './LessonItem.less';

@Component({})

export default class LessonItem extends Vue {

  @Prop()
  private item!: Lesson;

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
            <el-dropdown-item command="export">导出</el-dropdown-item>
            <el-dropdown-item command="edit">编辑</el-dropdown-item>
            <el-dropdown-item command="delete">删除</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

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
    }
  }

  private clickEdit() {

    console.log('LessonItem lessonId',this.item.id);
    this.$router.push({
      path: '/lesson/edit', query: {
        lessonId: this.item.id+''
      }
    });
  }

  private clickDeleteLesson() {


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
