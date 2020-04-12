import {Vue, Component, Prop} from 'vue-property-decorator';
import './LessonLocalPlay.less';
// import flowplayer from 'flowplayer';
import 'dplayer/dist/DPlayer.min.css';
//@ts-ignore
import DPlayer from 'dplayer';

import FfmpegService from '@/services/FfmpegService';


@Component({})
export default class LessonLocalPlay extends Vue {

  private videoPath: string = '';
  private ffmpegService!: FfmpegService;
  private dp!: any;
  private startTime = 0;

  created() {

  }


  mounted() {

    console.log('location.href', location.href);

    let paramPath = this.$route.query.path as string;


    const startWith = 'file:///';
    if (paramPath.startsWith(startWith)) {

      let videoPath = paramPath.substring(startWith.length);
      this.ffmpegService = new FfmpegService(videoPath);
      this.ffmpegService.setVideoPath(videoPath);

      (window as any).ff = this.ffmpegService;
      this.ffmpegService.readDuration().then((duration: number) => {
        console.log('readDuration duration=', duration);

        this.ffmpegService.start();

        this.dp = new DPlayer({
          container: document.getElementById('dplayer'),
          screenshot: true,
          video: {
            url: this.buildRequestUrl(),
          },
        });

        (window as any).dp = this.dp;

        let video = document.querySelector('video');
        console.log('video',video);
        Object.defineProperty(video, 'duration', {value: duration, writable: true});
        // Object.defineProperty(video, 'currentTime', {
        //
        //   get:()=>{
        //     return this.startTime;
        //   },
        //   set: (newValue) => {
        //     this.startTime = newValue;
        //
        //     this.dp.switchVideo({
        //       url: this.buildRequestUrl()
        //     });
        //
        //     setTimeout(() => {
        //       this.dp.play();
        //     }, 1000);
        //
        //   }
        // });

        this.changeDp();

      }).catch((err: any) => {
        console.log('readDuration err=', err);
      });
    }
  }

  private beforeDestroy() {
    if (this.ffmpegService) {
      this.ffmpegService.stop();
    }
  }

  private changeDp() {

    this.dp.seek = (time: number) => {
      time = Math.max(time, 0);
      if (this.dp.video.duration) {
        time = Math.min(time, this.dp.video.duration);
      }
      if (this.dp.video.currentTime < time) {
        this.dp.notice(`${this.dp.tran('FF')} ${(time - this.dp.video.currentTime).toFixed(0)} ${this.dp.tran('s')}`);
      } else if (this.dp.video.currentTime > time) {
        this.dp.notice(`${this.dp.tran('REW')} ${(this.dp.video.currentTime - time).toFixed(0)} ${this.dp.tran('s')}`);
      }

      // this.dp.video.currentTime = time;


      this.dp.bar.set('played', time / this.dp.video.duration, 'width');
      this.dp.template.ptime.innerHTML = this.secondToTime(time);

      this.startTime = time;
      this.dp.video.currentTime = this.startTime;

      this.dp.switchVideo({
              url: this.buildRequestUrl()
            });
      setTimeout(() => {
              this.dp.play();
            }, 1000);

    };

  }

  private buildRequestUrl(): string {
    return 'http://localhost:6688?startTime=' + this.startTime;
  }

  private secondToTime(second: number) {
    second = second || 0;
    if (second === 0 || second === Infinity || second.toString() === 'NaN') {
      return '00:00';
    }
    const add0 = (num: any) => (num < 10 ? '0' + num : '' + num);
    const hour = Math.floor(second / 3600);
    const min = Math.floor((second - hour * 3600) / 60);
    const sec = Math.floor(second - hour * 3600 - min * 60);
    return (hour > 0 ? [hour, min, sec] : [min, sec]).map(add0).join(':');
  };

  private render() {

    return <div class="lesson-local-play" id="dplayer" />;

  }
}
