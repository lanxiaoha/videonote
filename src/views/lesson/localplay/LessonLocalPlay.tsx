import {Vue, Component, Prop} from 'vue-property-decorator';
import './LessonLocalPlay.less';


@Component({})
export default class LessonLocalPlay extends Vue {

  private videoUrl: string = '';

  created() {
    console.log('location.href', location.href);

    this.videoUrl = this.$route.query.path as string;
  }

  mounted() {

  }

  private render() {

    return <div class="lesson-local-play">
      <video class="video-js lesson-local-play-video"  src={this.videoUrl}  controls autoplay preload="auto" />
    </div>;
  }
}
