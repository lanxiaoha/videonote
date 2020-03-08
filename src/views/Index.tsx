import {Component, Vue} from 'vue-property-decorator';
import courseService from '@/services/CourseService';
import './Index.less';
import configManager from '@/config/ConfigManager';

@Component({})
export default class Index extends Vue {

  private list: Array<Course> = [];

  private created() {

    configManager.loadInfo();
    configManager.loadDb().then(()=>{
      let courses = courseService.loadCourses();
      this.list = courses;
    });
    // this.$router.push('/setting');
  }

  public render() {
    return (<div class="app-index">
      <div class="title">Just Do It</div>
      <div class="course-list">
        {
          this.renderCourse()
        }
      </div>

      <div class="app-index-func">
        <div class="app-index-func-setting" onclick={this.clickJumpSetting}/>
        <div class="app-index-func-about mt-10" onclick={this.clickJumpAbout}/>
      </div>

    </div>);
  }

  private renderCourse() {

    let list: Array<any> = [];

    list.push(<div class="course-item" onclick={this.clickCreateCourse}>
      <div class="add-icon" />
      <span class="add-title">创建新课程</span>
    </div>);

    this.list.forEach((item: Course) => {

      let viewItem = (<div class="course-item" onclick={() => {
        this.clickCourse(item);
      }}>
        {
          item.cover && item.cover != 'undefined' ? <img class="course-item-img" src={item.cover} /> :
            <div class="course-item-img">暂无图片</div>

        }
        <div class="course-item-title">{item.name}</div>
      </div>);

      list.push(viewItem);
    });

    return list;
  }

  private clickCourse(course: Course) {
    console.log('clickCourse', course);
    let id = course.id;
    this.$router.push({
      path: '/lesson/list', query: {
        id: id + ''
      }
    });
  }

  private clickCreateCourse() {
    this.$router.push({path: '/course/create'});
  }

  private clickJumpSetting(){
    this.$router.push("/setting");
  }

  private clickJumpAbout(){
    this.$router.push("/about");
  }
}
