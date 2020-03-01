import {Component, Vue, Watch} from 'vue-property-decorator';
import './LessonCreate.less';
import courseService from '@/services/CourseService';
import CoverChooser from '@/components/cover/CoverChooser';

@Component({
  components: {
    CoverChooser
  }
})
export default class LessonCreate extends Vue {

  private courseId!: number;
  private lessonName: string ='';
  private videoPath: string ='';
  private author: string = '';
  private intro: string = '';
  private cover: string = '';
  private isLoading: boolean = false;


  @Watch('cover')
  private onCoverChange() {
    if (this.cover) {

    } else {

    }
  }

  private created() {

    this.courseId = parseInt(this.$route.query.courseId as string);

  }

  mounted() {

  }

  private render() {

    return <div class="lesson-create">
      <div class="title">创建</div>


      <van-field class="input-style mt-20" v-model={this.lessonName} label="课名" maxlength="20" />

      <div class="url-container">
        <van-field class="input-style mt-20" v-model={this.videoPath} label="视频" placeholder="支持本地、URL链接" />
        <van-icon name="ellipsis" class=" add-video" onclick={this.openLocalFile}>
          <input type="file" id="localFile" style="display:none;"  onchange={this.onLocalFileChange}/>
        </van-icon>

      </div>
      <cover-chooser ref="coverChooser" class='mt-20' />

      <van-field class="input-style mt-20" v-model={this.author} label="作者" />

      <van-field class="input-style mt-20" v-model={this.intro} rows="2" label="简介" type="textarea" maxlength="50"
                 placeholder="简介内容" show-word-limit />

      <div class="button2 mt-40" onclick={this.createLesson}>
        {
          this.isLoading ? <van-loading /> : null
        }
        创建</div>
    </div>;
  }

  private openLocalFile() {

    let ele = document.getElementById('localFile');
    if (ele) {
      ele.click();
    }
  }

  private onLocalFileChange(e:any){

    console.log('onLocalFileChange',e);
    //获取读取我文件的File对象
    let ele = document.getElementById('localFile');
    if(!ele){
      return;
    }
    var selectedFile = (ele as any).files[0];

    var name = selectedFile.name;//读取选中文件的文件名
    var size = selectedFile.size;//读取选中文件的大小
    console.log('selectedFile',selectedFile);
    console.log("文件名:"+name+"大小:"+size);

    if(!this.lessonName){
      this.lessonName = selectedFile.name;
    }
    this.videoPath = "file:///"+selectedFile.path;
  }


  private createLesson() {
    if (!this.courseId) {
      this.$notify('课程有问题');
      return;
    }
    if (!this.lessonName) {
      this.$notify('课名不能为空');
      return;
    }
    if (!this.videoPath) {
      this.$notify('视频地址不能为空');
      return;
    }

    let coverChooser = this.$refs.coverChooser as CoverChooser;
    let cover = coverChooser.getCover();

    this.isLoading = true;
    let lessonId = courseService.createLesson(this.courseId, this.lessonName, this.videoPath, cover, this.author, this.intro);
    this.isLoading = false;
    if (lessonId > 0) {
      this.$toast('创建成功，可以继续创建新的课');
    } else {
      this.$toast('创建失败');
    }
  }
}
