import {Vue, Component} from 'vue-property-decorator';
import LessonItem from './item/LessonItem';
import LessonImportItem from './item/LessonImportItem';
import './LessonList.less';

import courseService from '@/services/CourseService';
import {Arr} from 'tern/lib/infer';


@Component({
  components: {
    LessonItem,
    LessonImportItem
  }
})
export default class LessonList extends Vue {

  private courseId: number = 0;
  private list: Array<Lesson> = [];
  private title = '视频列表';
  private deleteDialogVisible = false;

  created() {
    this.courseId = parseInt(this.$route.query.id as string);
    this.list = courseService.loadLessons(this.courseId);
    let course = courseService.queryCourse(this.courseId);
    if (course && course.name) {
      this.title = course.name;
    }
  }

  private render() {

    return (<div id="lesson-container">
      <div class="title">{this.title}</div>
      <div class="lesson-list">
        {
          this.renderItems()
        }
      </div>

      <div class="course-func">
        <div class="course-func-setting" onClick={this.clickJumpSetting} />
        <div class="course-func-delete mt-10" onClick={()=>{this.deleteDialogVisible = true}} />
      </div>

      <el-dialog
        title="是否删除课程"
        visible={this.deleteDialogVisible}
        width="500px"
      >
        <span>确定删除课程吗？会把相关的所有视频和笔记都删除。</span>
        <span slot="footer" class="dialog-footer">
    <el-button onclick={() => {
      this.deleteDialogVisible = false;
    }}>取 消</el-button>
      <el-button type="primary" onclick={this.clickDeleteCourse}>确 定</el-button>
  </span>
      </el-dialog>

    </div>);
  }

  private renderItems() {

    let list: Array<any> = [];

    list.push(<lesson-import-item courseId={this.courseId} />);

    this.list.forEach((item: Lesson) => {

      list.push(<lesson-item item={item} ondelete={this.onDeleteLesson} />);

    });
    return list;
  }

  private clickDeleteCourse() {
    this.deleteDialogVisible = false;

    let list:Array<Lesson> = courseService.loadLessons(this.courseId);

    list.forEach((lesson:Lesson)=>{

      let noteList:Array<Note> = courseService.loadNotes(lesson.id as number);
      noteList.forEach((note:Note)=>{
        courseService.deleteNote(note.id as number);
      });

      courseService.deleteLesson(lesson.id as number);
    });

    courseService.deleteCourse(this.courseId);
    courseService.saveDb();
    this.$toast('删除成功');
    setTimeout(()=>{
      this.$router.back();
    },500);
  }

  private clickJumpSetting() {

    this.$router.push({
      path: '/course/edit',
      query: {
        courseId: this.courseId + ''
      }
    });
  }

  private onDeleteLesson() {
    this.list = courseService.loadLessons(this.courseId);
  }


}
