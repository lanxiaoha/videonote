import {Component, Vue, Prop} from 'vue-property-decorator';
import './NoteRecord.less';
import Event from '@/entity/Event';

@Component({})
export default class NoteRecord extends Vue {

  @Prop()
  note!: Note;

  private deleteDialogVisible: boolean = false;

  mounted() {
    // @ts-ignore
    let ele = window.document.getElementById(`noteRecord${this.note.id}`);
    if (ele) {
      ele.innerHTML = this.compiledMarkdown();
    }
  }

  private render() {

    let duration = this.parseDuration(this.note.duration);
    return <div class="note-record">
      <div class="note-record-content">
        <div class="note-record-header">
          <span class="note-record-header-duration">{duration} </span>
          <div class="note-record-header-play" onclick={this.clickPlay} />
          <div class="note-record-header-edit" onclick={this.clickEdit} />
        </div>

        <div class="note-record-close" onclick={() => {
          this.deleteDialogVisible = true;
        }} />
      </div>
      <div id={`noteRecord${this.note.id}`}>
      </div>

      <el-dialog
        title="提示"
        visible={this.deleteDialogVisible}
        width="500px"
      >
        <span>确定删除此条笔记吗？</span>
        <span slot="footer" className="dialog-footer">
    <el-button onclick={() => {
      this.deleteDialogVisible = false;
    }}>取 消</el-button>
      <el-button type="primary" onclick={this.clickDeleteNote}>确 定</el-button>
  </span>
      </el-dialog>

    </div>;
  }

  private clickEdit() {

    this.$bus.$emit(Event.EDIT_NOTE, this.note);
  }

  private clickPlay() {
    this.$bus.$emit(Event.PLAY_NOTE, this.note);
  }

  private clickDeleteNote() {

    this.$emit('delete', this.note.id);

  }

  private compiledMarkdown() {

    if (!this.note || !this.note.content) {
      return '';
    }
    let parse = (window as any).marked(this.note.content, {sanitize: true});
    // console.log('parse', parse);
    return parse;
  }

  private parseDuration(duration: number) {

    if (duration == 0) {
      return '00:00';
    }

    let second = duration % 60;
    let min = duration / 60;
    min = parseInt(min + '');
    if (min < 60) {
      return `${min < 10 ? '0' : ''}${min}:${second < 10 ? '0' : ''}${second}`;
    } else {
      let hour = min / 60;
      hour = parseInt(hour + '');

      min = min % 60;
      min = parseInt(min + '');
      return `${hour < 10 ? '0' : 0}${hour}:${min < 10 ? '0' : ''}${min}:${second < 10 ? '0' : ''}${second}`;

    }

  }
}
