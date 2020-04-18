import {Component, Vue} from 'vue-property-decorator';
import './LessonPlay.less';
import NotesList from './notes/NotesList';
import courseService from '@/services/CourseService';
import NoteEdit from './notes/NoteEdit';
import {off} from 'codemirror';
import configManager from '@/config/ConfigManager';

const {clipboard, nativeImage} = (window as any).require('electron');

import injectCode from './InjectCode';
import uploadImageService from '@/services/ImageService';

@Component({
  components: {
    NotesList,
    NoteEdit
  }
})


export default class LessonPlay extends Vue {

  private webView!: any;
  private lessonId!: number;
  private list: Array<Note> = [];
  private url!: string;
  private lesson!: Lesson;
  private videoUrl: string = '';
  private isEdit: boolean = false;
  private hasInit: boolean = false;

  //是否显示mask div 。
  //在拖拽边距的时候显示，就可以捕捉到在播放上层的事件
  //就可以很灵活的处理
  private showMaskEventDiv: boolean = false;

  //获取视频长度

  private static VIDEO_LENGTH_STATUS_GETED = 'geted';
  private static VIDEO_LENGTH_STATUS_FAIL = 'fail';
  private static VIDEO_LENGTH_STATUS_REQUEST = 'request';
  private hasGetVideoLengthStatus: string = LessonPlay.VIDEO_LENGTH_STATUS_FAIL;//'geted'已获得  or 'fail'获取失败 or 'requesting'正在获取

  //是否已初始播放进度
  private hasInitPlayDuration = false;

  private currentTime: number = 0;

  //
  private noteContentWidth = 400;

  private created() {

    this.noteContentWidth = configManager.getPlayPageNoteContentWidth();

    this.lessonId = parseInt(this.$route.query.lessonId + '');
    this.lesson = courseService.queryLesson(this.lessonId);

    this.list = courseService.loadNotes(this.lessonId);

    console.log('lessonId', this.lessonId, this.lesson, this.list);

    if (this.lesson.path.startsWith('file:///')) {

      let path = encodeURIComponent(this.lesson.path);
      console.log('encodeURI(this.lesson.path)', path);
      this.videoUrl = `#/lesson/local/play?path=${path}`;
    } else {
      this.videoUrl = this.lesson.path;

    }


    // require(['./shadow.js'],(data:any)=>{
    //   console.log("当前的shadow.js的数据",data);
    // })
  }

  private mounted() {

    let notesList = this.$refs.notesList as NotesList;
    notesList.setNoteList(this.list);

    setTimeout(() => {
      let webView: any = document.getElementById('playerWebView');
      // webView.openDevTools();
      this.webView = webView;
      //第一次加载webview的时候注入。
      this.injectCode();
      this.onDomReadyInject();
    }, 2000);



    document.addEventListener('mousedown', this.onBarMouseDown);
    document.addEventListener('mousemove', this.onBarMouseMove);
    document.addEventListener('mouseup', this.onBarMouseUp);


  }

  beforeDestroy() {

    this.lesson.currentTime = this.currentTime;
    courseService.editLesson(this.lesson);
    courseService.saveDb();

    document.removeEventListener('mousedown', this.onBarMouseDown);
    document.removeEventListener('mousemove', this.onBarMouseMove);
    document.removeEventListener('mouseup', this.onBarMouseUp);
  }

  private destroyed() {

  }

  /**
   * 跳转新连接后
   * 简单dom渲染完成再进行注入。
   *
   */
  private onDomReadyInject() {

    if (!this.webView) {
      return;
    }
    this.webView.addEventListener('dom-ready', () => {
      console.log('dom-ready');
      this.injectCode();
    });
  }

  private injectCode() {

    this.webView.executeJavaScript(injectCode).then(() => {

      this.startCommunicate(this.webView);
      this.initListener();

    });
  }

  /**
   * 注入成功，开始通信
   * @param webView
   */
  private startCommunicate(webView: any) {

    let noteEdit = this.$refs.noteEdit as NoteEdit;
    noteEdit.setWebView(webView);

    //监听webView里面发送过来的消息
    webView.addEventListener('ipc-message', (event: any) => {
      // console.log('ipc-message',event);

      let channel = event.channel;
      if (channel === 'duration') {
        let duration = event.args[0];
        this.currentTime = duration;
        noteEdit.onDurationChange(duration);

        if (!this.hasInitPlayDuration) {
          this.hasInitPlayDuration = true;
          this.initPlayDuration();
        }

        if (duration != 0 && this.hasGetVideoLengthStatus === LessonPlay.VIDEO_LENGTH_STATUS_FAIL) {
          this.hasGetVideoLengthStatus = LessonPlay.VIDEO_LENGTH_STATUS_REQUEST;
          this.requestGetVideoLength();
        }
      }
      if (channel === 'video-length') {

        let length = parseInt(event.args[0] + '');
        console.log('on event video-length length', event, length);
        if (length <= 0) {
          this.hasGetVideoLengthStatus = LessonPlay.VIDEO_LENGTH_STATUS_FAIL;
        } else {

          if (this.lesson.length != length) {
            this.lesson.length = length;
            let id = courseService.editLesson(this.lesson);
            if (id < 0) {
              this.hasGetVideoLengthStatus = LessonPlay.VIDEO_LENGTH_STATUS_FAIL;
            } else {
              this.hasGetVideoLengthStatus = LessonPlay.VIDEO_LENGTH_STATUS_GETED;

            }
          } else {

          }

        }
      }

      if (channel === 'capture-video') {
        console.log('LessonPlay capture-video');
        let imageData = event.args[0];
        if (imageData) {
          console.log('LessonPlay capture-video has imageData');
          clipboard.writeImage(nativeImage.createFromDataURL(imageData));
          let noteEdit = this.$refs.noteEdit as NoteEdit;
          noteEdit.captureData(imageData);
        } else {
          this.$message('截图失败');
        }
      }

    });
  }

  /**
   * 初始化播放进度
   */
  private initPlayDuration() {

    this.webView.send('play-video', {duration: this.lesson.currentTime});
  }

  /**
   * 请求获取视频长度
   */
  private requestGetVideoLength() {

    console.log('requestGetVideoLength()');
    this.webView.send('request-get-video-length', '');
  }

  private onSavedNote(note: any) {
    console.log('onSavedNote', note);

    let notesList = this.$refs.notesList as NotesList;
    notesList.addNote(note);
  }

  private onEditChange(isEdit: boolean) {
    this.isEdit = isEdit;
  }

  private initListener() {


    let webView: any = document.getElementById('playerWebView');

    webView.addEventListener('new-window', async (e: any) => {
      console.log('new-window url =', e);
      let url = e.url;
      e.preventDefault();
      this.videoUrl = url;
    });

    webView.addEventListener('will-navigate', async (e: any) => {
      console.log('will-navigate', e);
      e.preventDefault();
      let url = e.url;
      webView.loadURL(url);
    });
    webView.addEventListener('did-navigate', async (e: any) => {
      console.log('did-navigate', e);
    });


    webView.addEventListener('did-finish-load', async (e: any) => {

    });


  }

  private render() {

    return <div class="lesson-play">
      <div id="leftNoteContent" class="lesson-play-left" style={`width:${this.noteContentWidth}px;`}>

        <notes-list ref="notesList" style={this.isEdit ? 'height:0px !important;' : 'height:90%;'}
                    class="lesson-play-left-top" />
        <note-edit style={this.isEdit ? 'height:100%;' : 'height:10%;'} class="lesson-play-left-bottom" ref="noteEdit"
                   lessonId={this.lessonId} onsaved={this.onSavedNote} oneditchange={this.onEditChange} />

      </div>

      <div class="lesson-play-bar" id="play-side-bar" />

      <div class="play-container">
        <div class="player">

          <webview id="playerWebView" class="videostyle"
                   src={this.videoUrl}
                   plugins="true"
                   preload="./shadow.js"
                   enableremotemodule="true"
                   nodeintegration="true"
                   disablewebsecurity
                   webPreferences="devTools" />


        </div>
        {
          this.showMaskEventDiv ? <div class="mask" /> : null
        }

      </div>

    </div>;
  }

  private isDownInBar = false;
  private mouseMoveX = 0;

  private onBarMouseDown(e: MouseEvent) {

    // console.log('LessonPlay onBarMouseDown()',e);

    let ele: HTMLElement = document.querySelector('#play-side-bar') as HTMLElement;
    if (ele) {
      let rect: DOMRect = ele.getBoundingClientRect();
      let right = rect.x + rect.width;

      // console.log('LessonPlay onBarMouseDown() rect ',rect,e.clientX);
      if (e.clientX > rect.x - 5 && e.clientX < right + 5) {
        this.isDownInBar = true;
        this.showMaskEventDiv = true;
      } else {
        this.isDownInBar = false;
      }
    }
  }

  private onBarMouseMove(e: MouseEvent) {
    let offset = e.clientX - this.mouseMoveX;
    // console.log("LessonPlay onBarMouseMove",this.isDownInBar,offset);
    if (!this.isDownInBar) {
      return;
    }

    if (offset < 10 && offset > -10) {
      return;
    }

    let width = e.clientX;
    if (width < 200) {
      width = 200;
    }
    if (width > 800) {
      width = 800;
    }

    // this.noteContentWidth = width;
    this.mouseMoveX = e.clientX;

    let ele: HTMLElement = document.querySelector('#leftNoteContent') as HTMLElement;
    if (ele) {
      ele.style.width = width + 'px';
    }
  }

  private onBarMouseUp(e: MouseEvent) {
    // console.log('LessonPlay onBarMouseUp()',e.clientX);
    if (this.isDownInBar) {
      let ele: HTMLElement = document.querySelector('#leftNoteContent') as HTMLElement;
      if (ele) {
        let width = parseInt(ele.style.width);
        configManager.setPlayPageNoteContentWidth(width);

      }
    }
    this.mouseMoveX = 0;
    this.isDownInBar = false;
    this.showMaskEventDiv = false;

  }

}
