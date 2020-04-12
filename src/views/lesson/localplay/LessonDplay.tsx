import {Vue, Component, Prop} from 'vue-property-decorator';
import './LessonLocalPlay.less';
// import flowplayer from 'flowplayer';
import 'dplayer/dist/DPlayer.min.css';
//@ts-ignore
import DPlayer from 'dplayer';


@Component({})
export default class LessonDplay extends Vue {

  private dp!: DPlayer;

  created() {

  }

  mounted() {

    console.log('location.href', location.href);

    let paramPath = this.$route.query.path as string;

    const startWith = 'file:///';
    if (paramPath.startsWith(startWith)) {

      // let videoPath = paramPath;
      let videoPath = paramPath.substring(startWith.length);

      // videoPath = decodeURI(videoPath);

      // videoPath = decodeURIComponent(videoPath);
      videoPath = 'file://'+videoPath;
      console.log('sub videoPath', videoPath);

      this.dp = new DPlayer({
        container: document.getElementById('dplayer'),
        screenshot: true,
        autoplay:true,
        video: {
          url: videoPath,
        },
      });

      this.dp.video.setAttribute('crossOrigin', 'Anonymous');

    }
  }

  private beforeDestroy() {

  }


  private render() {

    return <div class="lesson-local-play" id="dplayer" />;

  }
}
