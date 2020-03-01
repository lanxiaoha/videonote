import {Component, Vue, Prop} from 'vue-property-decorator';
import NoteRecord from './NoteRecord';
import './NotesList.less';
import courseService from '@/services/CourseService';

@Component({
  components: {
    'NoteRecord': NoteRecord
  }
})
export default class NotesList extends Vue {

  noteList: Array<Note> = [];

  private render() {

    return <div class="notes-list">
      {
        this.renderItems()
      }

    </div>;
  }

  public setNoteList(noteList: Array<Note>) {
    this.noteList = noteList;
    if (!this.noteList) {
      this.noteList = [];
    } else {
      let list = this.sort(this.noteList);
      this.noteList = [].concat(list as any);
    }

  }

  public addNote(note: Note) {

    let list = this.noteList.filter((item: Note) => {

      return note.id != item.id;
    });

    list.push(note);
    list = this.sort(list);

    list.forEach((item: Note, index: number) => {
      console.log('addNote note list index = ', index, item.content);

    });

    this.noteList = [].concat(list as any);

    this.$forceUpdate();
  }

  private sort(list: Array<Note>) {
    return list.sort((a: Note, b: Note) => {
      if (a.duration < b.duration) {
        return -1;
      } else if (a.duration === b.duration) {
        return 0;
      } else {
        return 1;
      }
    });
  }

  private renderItems() {

    let list: Array<any> = [];
    this.noteList.forEach((item: Note) => {
      let time = new Date().getTime();
      list.push(<note-record key={`key-${time}+${item.id}`} note={item} ondelete={this.onDeleteNote} />);
    });

    return list;
  }

  private onDeleteNote(noteId: number) {

    let result = courseService.deleteNote(noteId);
    // courseService.saveDb();
    let list = this.noteList.filter((item: Note) => {
      return item.id != noteId;
    });
    this.noteList = [].concat(list as any);

    list.forEach((item: Note, index: number) => {
      console.log('onDeleteNote note list index = ', index, item.content);

    });
    this.$forceUpdate();
  }
}
