import {Component, Vue} from 'vue-property-decorator';
import './CourseEdit.less';
import courseService from '@/services/CourseService';
import CoverChooser from '@/components/cover/CoverChooser';

@Component({
  components: {
    CoverChooser
  }
})
export default class CourseEdit extends Vue {

  private courseId:number = 0;
  private course!:Course;
  private courseName: string = '';

  private author: string = '';
  private intro: string = '';
  private cover: string = '';
  private isLoading: boolean = false;

  cad!: Course;

  private created(){
    this.courseId = parseInt(this.$route.query.courseId as string);
    this.course = courseService.queryCourse(this.courseId) as Course;
    if(this.course ){
      this.courseName = this.course .name || '';

      if(this.course.author && this.course.author !== 'undefined'){
        this.author = this.course.author;
      }

      if(this.course.intro && this.course.intro !== 'undefined'){
        this.intro = this.course.intro;
      }


      if(this.course.cover && this.course.cover !== 'undefined'){
        this.cover = this.course.cover;
      }

    }


  }

  mounted(){
  }

  public render() {

    return (
      <div id="course-create">
        <h1 class="title">编辑</h1>
        <van-field class="input-style mt-20" v-model={this.courseName} label="标题*" maxlength="20" />

        <cover-chooser ref="coverChooser" class='mt-20' cover={this.cover} />

        <van-field class="input-style mt-20" v-model={this.author} label="作者" />

        <van-field class="input-style mt-20" v-model={this.intro} rows="2" label="简介" type="textarea" maxlength="50"
                   placeholder="简介内容" show-word-limit />

        <div class="button2 mt-40" onClick={this.createCourse}>
          {
            this.isLoading ? <van-loading /> : null
          }
          编辑</div>
      </div>
    );
  }

  private createCourse() {

    if (!this.courseName) {
      this.$toast('标题不能为空');
      return;
    }

    if(!this.courseId || !this.course){
      this.$toast('课程有误');
      return;
    }

    let coverChooser = this.$refs.coverChooser as CoverChooser;

    let cover = coverChooser.getCover();

    this.course.name = this.courseName;
    this.course.cover = cover;
    this.course.intro = this.intro;
    this.course.author = this.author;


    let id = courseService.editCourse(this.course);
    if (id <= 0) {
      this.$toast('编辑失败');
      return;
    }
    this.$toast({message: '编辑成功'});
    courseService.saveDb();
    this.$router.back();

  }
}
