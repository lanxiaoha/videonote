import {Vue, Component} from 'vue-property-decorator';
import LessonItem from './item/LessonItem';

import './LessonList.less';

import courseService from '@/services/CourseService';

@Component({
  components:{
    LessonItem
  }
})
export default class LessonList extends Vue {

  private courseId: number = 0;
  private list: Array<Lesson> = [];

  created() {
    this.courseId = parseInt(this.$route.query.id as string);
    this.list = courseService.loadLessons(this.courseId);

  }

  private render() {

    return (<div id="lesson-container">
      <div class="title">课程列表</div>
      <div class="lesson-list">
        {
          this.renderItems()
        }
      </div>
    </div>);
  }

  private renderItems() {

    let list: Array<any> = [];

    list.push(<div class="lesson-item add-lesson-item" onclick={this.clickAdd}>
      <div class="add" />
      <span class="add-title">添加新课</span>
    </div>);

    this.list.forEach((item: Lesson) => {

      list.push(<lesson-item item={item}/>);

    });
    return list;
  }



  private clickAdd() {

    this.$router.push({
      path: '/lesson/create', query: {
        courseId: this.courseId + ''
      }
    });
  }

}
