import {Vue, Component, Prop} from 'vue-property-decorator';
import './NoteEdit.less';
import courseService from '@/services/CourseService';
import Event from '@/entity/Event';

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
  private editNote!:Note | null;

  mounted(){

    this.$bus.$on(Event.EDIT_NOTE,this.onEditNote);
    this.$bus.$on(Event.PLAY_NOTE,this.onPlayNote);

  }

  private render() {

    if (this.isEdit) {
      return <div class="note-edit">
        <div class="note-edit-header">
          <div class="note-edit-header-cancel" onclick={this.cancel}>取消</div>
          <div class="note-edit-header-confirm" onclick={this.save}>保存</div>
        </div>
        <van-field
          class="note-edit-content"
          v-model={this.message}
          // autosize
          type="textarea"
          maxlength="250"
          placeholder="请输入留言"
          show-word-limit
        />

      </div>;
    } else {
      return <div class="note-edit-add">

        <div class="button2" onclick={this.startEdit}>记笔记</div>
      </div>;
    }
  }

  private startEdit() {
    this.isEdit = true;
    this.editDuration = this.duration;
    this.pauseVideo();
    this.sendEditStatus();

  }

  private cancel() {
    this.playVideo();
    this.isEdit = false;
    this.editNote = null;
    this.sendEditStatus();
  }

  private save() {

    if (!this.message) {
      this.$notify('请输入内容');
      return;
    }
    //记笔记
    if (this.lessonId) {

      if(this.editNote){

        this.editNote.content = this.message;
        courseService.editNote(this.editNote);
        this.$emit('saved', this.editNote);

        this.isEdit = false;
        this.sendEditStatus();
        this.editNote = null;
        this.message = '';
        //恢复播放
        this.playVideo();
      }else{

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
  private onEditNote(note:Note){
    console.log('onEditNote',note);
    if(!note || note.lessonId != this.lessonId){
      return;
    }
    this.editNote = note;

    this.isEdit = true;
    this.editDuration = note.duration;
    this.message = note.content;
    this.pauseVideo();
    this.sendEditStatus();

  }


  private onPlayNote(note:Note){
    console.log('onPlayNote',note);
    if(!note || note.lessonId != this.lessonId){
      return;
    }
    this.webView.send('play-video',{duration: note.duration});

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

  private sendEditStatus(){

    this.$emit('editchange',this.isEdit);
  }

}
