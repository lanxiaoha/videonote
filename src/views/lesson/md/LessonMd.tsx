import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import courseService from '@/services/CourseService';
import Editor from 'tui-editor';
import 'tui-editor/dist/tui-editor.css'; // editor's ui
import 'tui-editor/dist/tui-editor-contents.css'; // editor's content
import 'codemirror/lib/codemirror.css'; // codemirror
import 'highlight.js/styles/github.css'; // code block highlight
import './LessonMd.less';

const fs = window.require('fs');
const Buffer = require('buffer').Buffer;



const {remote} = window.require('electron');


type NodeInfo = {
  id: number;
  duration: number;
  content: string,
}

@Component({
  components: {}
})
export default class LessonMd extends Vue {

  private lessonId!: number;
  private source: string = '';
  private instance!: Editor;
  private lesson!: any;
  private originNoteList: Array<Note> = [];


  private created() {

   this.loadData();

  }

  private loadData(){

    this.lessonId = parseInt(this.$route.query.lessonId as string);

    let list: Array<Note> = courseService.loadNotes(this.lessonId);

    this.originNoteList = this.sort(list);

    list = this.originNoteList;

    this.lesson = courseService.queryLesson(this.lessonId);


    let noteStr = '';
    list.forEach((item: Note) => {

      let start = '```lan\n';
      let content = `id:${item.id}:duration:${item.duration}\n`;
      let end = '```\n';
      noteStr += start;
      noteStr += content;
      noteStr += end;

      noteStr += item.content + '\n';
    });
    this.source = noteStr;
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

  mounted() {
    this.renderMd();
  }


  private render() {

    let tip = '```lan\n id:1:duration:0\n```';

    return <div class="lessonmd">

      <div class="lessonmd-header">
        <code class="lessonmd-header-text mr-20" style="color:#FF3400;">
          {tip}
        </code>
        <span class="lessonmd-header-text">
          ⚠️：笔记开始标志，及上一条笔记的结束位置。（进行新增笔记）
        </span>
        <div class="button2 mr-20" onclick={this.save}>保存</div>
        <div class="button2 " onclick={this.exportMd}>导出</div>
      </div>
      <div id="editormd">
        <textarea style="display:none;" />
      </div>

    </div>;
  }

  private renderMd() {

    this.extension();

    this.instance = new Editor({
      el: document.querySelector('#editormd') as HTMLElement,
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      height: '100%',
      initialValue: this.source,
      exts: ['lan']
    });
    this.instance.getHtml();
  }


  private save() {

    let nodeInfoList = this.parseMarkDown();
    console.log('save() parseMarkDown() nodeInfoList', nodeInfoList);

    if (nodeInfoList.length === 0) {
      this.$toast('内容不能为空');
      return;
    }

    //校验是否有相同的id，如果有就报错
    let containsSameId = false;
    nodeInfoList.forEach((nodeInfo: NodeInfo) => {

      nodeInfoList.forEach((no: NodeInfo) => {
        if (nodeInfo != no && nodeInfo.id === no.id) {
          containsSameId = true;
        }
      });
    });
    console.log('save() containsSameId', containsSameId);

    if (containsSameId) {
      this.$toast('笔记有相同的id，导致错误。');
      return;
    }



    let newNodeList:Array<NodeInfo> = [];
    let oldNodeList = [];

    nodeInfoList.forEach((nodeInfo: NodeInfo) => {

      if (this.containsOriginNote(nodeInfo)) {
        oldNodeList.push(nodeInfo);
      } else {
        newNodeList.push(nodeInfo);
      }
    });

    console.log('save() newNodeList', newNodeList);

    if (newNodeList.length != 0) {
      this.$toast('不能新增笔记');
      return;
    }

    let saveData = '';
    //保存已修改的笔记。
    nodeInfoList.forEach((nodeInfo: NodeInfo) => {

      let note = this.findOriginNote(nodeInfo);
      if (note) {
        note.duration = nodeInfo.duration;
        note.content = nodeInfo.content;
        courseService.editNote(note);
        console.log("修改笔记：",note);
      }
    });

    let deleteNoteList: Array<Note> = [];
    //删掉不要的笔记
    this.originNoteList.forEach((note: Note) => {

      let contains = false;
      nodeInfoList.forEach((nodeInfo: NodeInfo) => {
        if (note.id === nodeInfo.id) {
          contains = true;
        }
      });
      if(!contains){
        deleteNoteList.push(note);
      }
    });

    if (deleteNoteList.length > 0) {
      deleteNoteList.forEach((note: Note) => {
        courseService.deleteNote(note.id as number);
        console.log("删除笔记：",note);

      });
    }
    courseService.saveDb();
    console.log('save() saved');
    this.$toast({message: '保存完毕'});
    this.loadData();

  }

  private containsNodeInfo(nodeInfoList: Array<NodeInfo>, id: number): boolean {

    let result = false;

    nodeInfoList.forEach((nodeInfo: NodeInfo) => {
      if (id) {

      }
    });

    return result;
  }

  private findOriginNote(nodeInfo: NodeInfo): Note {

    let result!: Note;
    this.originNoteList.forEach((note: Note) => {
      if (note.id === nodeInfo.id) {
        result = note;
      }
    });

    return result;
  }

  /**
   * 原来的笔记列表是否包含节点信息
   * @param nodeInfo
   */
  private containsOriginNote(nodeInfo: NodeInfo) {

    let result = false;
    this.originNoteList.forEach((note: Note) => {
      if (note.id === nodeInfo.id) {
        result = true;
      }
    });
    return result;
  }

  /**
   * 解析markdown
   */
  private parseMarkDown(): Array<NodeInfo> {
    let markdown: string = this.instance.getMarkdown();

    if (!markdown) {
      return [];
    }

    let nodeInfoList: Array<NodeInfo> = [];

    let splits = markdown.split('```lan');
    splits.forEach((nodeData: string) => {

      let nodeInfo = this.parseNodeInfo(nodeData);
      if (nodeInfo) {
        nodeInfoList.push(nodeInfo);
      }
    });
    return nodeInfoList;
  }

  /**
   * 解析头部信息。
   * @param nodeData
   */
  private parseNodeInfo(nodeData: string): NodeInfo | null {

    let index = nodeData.indexOf('```');
    if(index <=0){
      return null;
    }
    let nodeInfoStr = nodeData.substring(0, index);

    nodeInfoStr = nodeInfoStr.trim();
    let infoArr = nodeInfoStr.split(':');
    // console.log('nodeInfo',nodeInfo);
    if (infoArr.length != 4 || infoArr[0] != 'id' || infoArr[2] != 'duration') {
      return null;
    }

    if(!infoArr[1]){
      return null;
    }


    let id = parseInt(infoArr[1]);
    let duration = parseInt(infoArr[3]);

    let content = nodeData.substring(index+3).trim();


    return {
      id,
      duration,
      content
    };
  }

  /**
   * 导出笔记
   */
  private exportMd() {

    let dialog = remote.dialog;
    let win = remote.getCurrentWindow();

    let name = this.lesson ? this.lesson.name : '课堂笔记';

    let result = dialog.showSaveDialogSync(win, {
      title: '导出',
      defaultPath: name,
      filters: [
        {name: 'Markdown', extensions: ['md']},
      ],
      properties: [
        'createDirectory'
      ]
    });


    if (!result) {
      return;
    }

    let exportPath: string = result;
    if(!exportPath){
      return;
    }

    let nodeInfoList = this.parseMarkDown();
    console.log('exportMd() parseMarkDown() nodeInfoList', nodeInfoList);

    if (nodeInfoList.length === 0) {
      this.$toast('内容不能为空');
      return;
    }

    let saveData = '';
    //保存已修改的笔记。
    nodeInfoList.forEach((nodeInfo: NodeInfo) => {

      saveData += nodeInfo.content+'\n';
    });

    let buf = Buffer.from(saveData);
    fs.writeFileSync(exportPath, buf);

    this.$toast('导出完成');

  }


  private extension() {

    Editor.defineExtension('lan', () => {

      console.log('lan extension initialized');

      Editor.codeBlockManager.setReplacer('lan', (inputString: string) => {

        let arr = inputString.split(':');
        if (arr.length != 4) {
          return '';
        }
        let idName = arr[0];
        if (idName != 'id') {
          return '';
        }
        let id = arr[1];

        let durationName = arr[2];
        let duration = arr[3];
        let durationStr = this.parseDuration(parseInt(duration));

        return `<div class="mark">笔记进度：${durationStr}</div>`;
      });
    });
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
