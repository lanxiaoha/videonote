import {Vue, Component, Prop} from 'vue-property-decorator';
import './NoteEdit.less';
import courseService from '@/services/CourseService';
import Event from '@/entity/Event';
import configManager from '@/config/ConfigManager';

import uploadImageService from '@/services/ImageService';

const {clipboard, nativeImage} = (window as any).require('electron');


@Component({})
export default class NoteEdit extends Vue {

  @Prop()
  private lessonId!: number;
  private message: string = '';
  private isEdit: boolean = false;
  private webView!: any;
  /**
   * 点击“记笔记”时，记下的进度条
   */
  private editDuration: number = 0;
  /**
   * 进度条
   */
  private duration: number = 0;
  /**
   * 编辑笔记
   */
  private editNote!: Note | null;

  private isVideoPause: boolean = true;

  private showMoreFunction: boolean = false;
  private enableCaptureOnEdit: boolean = false;
  private enableUploadOnCapture: boolean = false;
  private hasSetSmmsToken: boolean = false;
  private isUploadingImage: boolean = false;

  mounted() {

    console.log('NoteEdit mounted');
    this.$bus.$on(Event.EDIT_NOTE, this.onEditNote);
    this.$bus.$on(Event.PLAY_NOTE, this.onPlayNote);

    this.enableCaptureOnEdit = configManager.enableCaptureOnEdit();
    this.hasSetSmmsToken = configManager.getSmmsApiToken()  ? true : false;
    if (this.hasSetSmmsToken) {
      this.enableUploadOnCapture = configManager.enableUploadOnCapture();
    }
  }

  private render() {

    this.isVideoPause = configManager.isEditNotePauseVideo();

    if (this.isEdit) {
      return <div class="note-edit">
        <div class="note-edit-header">
          <div class="note-edit-header-cancel" onclick={this.cancel}>取消</div>

          <div class="note-edit-header-function-container">
            {
              this.isVideoPause ? this.renderPause() : this.renderPlay()
            }
            <el-tooltip class="item" effect="dark" content="截图" placement="top-start">
              <div class="note-edit-header-capture ml-10" onclick={this.captureVideo} />
            </el-tooltip>

            <el-tooltip class="item" effect="dark" content="上传图片" placement="top-start">
              <div class={this.hasSetSmmsToken ? 'upload ml-10' : 'upload-disable ml-10'}
                   onclick={this.uploadCapture} />
            </el-tooltip>
            <div class="more ml-10" onclick={() => {
              this.showMoreFunction = true;
            }}>
            </div>

          </div>

          <div class="note-edit-header-confirm" onclick={this.save}>保存</div>
        </div>
        <van-field
          class="note-edit-content"
          v-model={this.message}
          // autosize
          type="textarea"
          maxlength="400"
          placeholder="默认使用MarkDown语法"
          show-word-limit
        />


        <el-dialog
          title="功能设置"
          visible={this.showMoreFunction}
          width="50%"
          show-close={false}
        >
          <div>
            <el-checkbox v-model={this.enableCaptureOnEdit}>点击编辑笔记时截屏</el-checkbox>
            <el-checkbox v-model={this.enableUploadOnCapture} disable={this.hasSetSmmsToken}>截屏后立即上传图片到图床</el-checkbox>
          </div>
          <span slot="footer" class="dialog-footer">
        <el-button type="primary" onclick={() => {
          this.showMoreFunction = false;
          configManager.setEnableCaptureOnEdit(this.enableCaptureOnEdit);
          configManager.setEnableUploadOnCapture(this.enableUploadOnCapture);
        }}>确 定</el-button>
    </span>
        </el-dialog>


      </div>;
    } else {
      return <div class="note-edit-add">

        <div class="button2" onclick={this.startEdit}>记笔记</div>
      </div>;
    }
  }

  /**
   * 设置截图数据
   * @param imageData
   */
  public captureData(imageData: any) {

    if (!this.hasSetSmmsToken) {
      this.$message('截图到剪切板');
      return;
    }
    uploadImageService.setImageData(imageData);
    if (!this.enableUploadOnCapture) {
      this.$message('截图到剪切板');
      return;
    }


    if (this.isUploadingImage) {
      this.$message('还在上传中');
      return;
    }
    this.isUploadingImage = true;

    uploadImageService.upload(imageData).then((res: any) => {
      console.log('res', res);
      this.handleUploadCaptureResponse(res);
    }).catch((err: any) => {
      console.log('err', err);
      this.isUploadingImage = false;
      this.$message('上传图床失败');
    });

  }

  private uploadCapture() {

    if (!uploadImageService.hasImageData()) {
      this.$message('你没有截图');
      return;
    }
    uploadImageService.upload(uploadImageService.getImageData()).then((res: any) => {
      console.log('res', res);
      this.handleUploadCaptureResponse(res);
    }).catch((err: any) => {
      console.log('err', err);
      this.isUploadingImage = false;

      this.$message('上传图床失败');

    });
  }

  private handleUploadCaptureResponse(res: any) {

    this.isUploadingImage = false;

    if (res.data.code !== 'success') {
      this.$message('上传图床失败');
    }
    let url = res.data.data.url;
    let md = `![](${url})`;
    clipboard.writeText(md);
    uploadImageService.setImageData(null);
    this.$message(`上传成功：${md}`);
  }

  private renderPlay() {
    return <el-tooltip class="item" effect="dark" content="暂停视频" placement="top-start">
      <div class="note-edit-header-play" onclick={this.clickSetVideoPause} />
    </el-tooltip>;
  }

  private renderPause() {
    return <el-tooltip class="item" effect="dark" content="播放视频" placement="top-start">
      <div class="note-edit-header-pause" onclick={this.clickSetVideoPlay} />
    </el-tooltip>;
  }

  private clickSetVideoPause() {

    this.isVideoPause = true;
    configManager.setEditNotePauseVideo(true);
    //暂停播放
    this.pauseVideo();

  }

  private clickSetVideoPlay() {
    this.isVideoPause = false;
    configManager.setEditNotePauseVideo(false);
    //恢复播放
    this.playVideo();
  }

  private startEdit() {
    this.isEdit = true;
    this.editDuration = this.duration;
    if (this.isVideoPause) {
      this.pauseVideo();
    }
    this.sendEditStatus();

    if (this.enableCaptureOnEdit) {
      this.captureVideo();
    }
  }


  private cancel() {
    this.playVideo();
    this.isEdit = false;
    this.editNote = null;
    this.sendEditStatus();
  }

  private save() {

    if (!this.message) {
      this.$toast('请输入内容');
      return;
    }
    //记笔记
    if (this.lessonId) {

      if (this.editNote) {

        this.editNote.content = this.message;
        courseService.editNote(this.editNote);
        this.$emit('saved', this.editNote);

        this.isEdit = false;
        this.sendEditStatus();
        this.editNote = null;
        this.message = '';
        //恢复播放
        this.playVideo();
      } else {

        let id = courseService.createNote(this.lessonId, this.message, this.editDuration);

        if (id <= 0) {
          this.$toast('保存失败');
          return;
        } else {

          // courseService.saveDb();
          let note: Note = {
            id,
            lessonId: this.lessonId,
            status: 0,
            duration: this.editDuration,
            type: 0,
            content: this.message,
            time: 0
          };
          this.$emit('saved', note);

          this.isEdit = false;
          this.sendEditStatus();
          this.editNote = null;
          this.message = '';
          //恢复播放
          this.playVideo();
        }
      }

    } else {
      this.$toast('请重新进入播放页');

    }
  }

  public setWebView(webView: any) {
    this.webView = webView;
  }

  /**
   * 监听进度变化
   * @param duration
   */
  public onDurationChange(duration: any) {
    this.duration = duration;
  }

  /**
   * 监听记笔记
   * @param note
   */
  private onEditNote(note: Note) {
    console.log('onEditNote', note);
    if (!note || note.lessonId != this.lessonId) {
      return;
    }
    this.editNote = note;

    this.isEdit = true;
    this.editDuration = note.duration;
    this.message = note.content;
    if (this.isVideoPause) {
      this.pauseVideo();
    }
    this.sendEditStatus();

  }


  private onPlayNote(note: Note) {
    console.log('onPlayNote', note);
    if (!note || note.lessonId != this.lessonId) {
      return;
    }
    this.webView.send('play-video', {duration: note.duration});

  }


  private playVideo() {
    if (!this.webView) {
      return;
    }
    this.webView.send('play-video', '');
  }

  private pauseVideo() {
    if (!this.webView) {
      return;
    }
    this.webView.send('pause-video', '');
  }

  private sendEditStatus() {

    this.$emit('editchange', this.isEdit);
  }

  private captureVideo() {

    if (this.isUploadingImage) {
      this.$message('还在上传中');
      return;
    }

    if (!this.webView) {
      return;
    }
    this.webView.send('request-capture-video', '');

  }


}
