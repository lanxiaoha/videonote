import {Component, Vue} from 'vue-property-decorator';
import './CourseCreate.less';
import courseService from '@/services/CourseService';
import CoverChooser from '@/components/cover/CoverChooser';

@Component({
  components: {
    CoverChooser
  }
})
export default class CourseCreate extends Vue {

  private courseName: string = '';

  private author: string = '';
  private intro: string = '';
  private cover: string = '';
  private isLoading: boolean = false;

  cad!: Course;

  public render() {

    return (
      <div id="course-create">
        <h1 class="title">创建课程</h1>
        <van-field class="input-style mt-20" v-model={this.courseName} label="标题*" maxlength="20" />

        <cover-chooser ref="coverChooser" class='mt-20' />

        <van-field class="input-style mt-20" v-model={this.author} label="作者" />

        <van-field class="input-style mt-20" v-model={this.intro} rows="2" label="简介" type="textarea" maxlength="50"
                   placeholder="简介内容" show-word-limit />

        <div class="button2 mt-40" onClick={this.createCourse}>
          {
            this.isLoading ? <van-loading /> : null
          }
          创建</div>
      </div>
    );
  }

  private createCourse() {

    if (!this.courseName) {
      this.$toast('标题不能为空');
      return;
    }
    let coverChooser = this.$refs.coverChooser as CoverChooser;

    let cover = coverChooser.getCover();


    let id = courseService.createCourse(this.courseName, cover, this.author, this.intro);
    if (id <= 0) {
      this.$toast('创建失败');
      return;
    }
    this.$toast({message: '创建成功'});
    courseService.saveDb();
    this.$router.back();

  }
}
