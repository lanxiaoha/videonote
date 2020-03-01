import {Component, Vue} from 'vue-property-decorator';
import './LessonPlay.less';
import NotesList from './notes/NotesList';
import courseService from '@/services/CourseService';
import NoteEdit from './notes/NoteEdit';
import Event from '@/entity/Event';

// console.log('__dirname', __dirname);

// let fs = window.require('fs');
// ''
// fs.readFileSync()
//  console.log('indexjs',indexjs);

@Component({
  components: {
    NotesList,
    NoteEdit
  }
})
export default class LessonPlay extends Vue {

  private webView!:any;
  private lessonId!: number;
  private list: Array<Note> = [];
  private url!: string;
  private lesson!: Lesson;
  private videoUrl: string = '';
  private  isEdit:boolean = false;
  private hasInit:boolean = false;

  private created() {

    this.lessonId = parseInt(this.$route.query.lessonId + '');
    this.lesson = courseService.queryLesson(this.lessonId);

    this.list = courseService.loadNotes(this.lessonId);

    console.log('lessonId', this.lessonId, this.lesson, this.list);

    if (this.lesson.path.startsWith("file:///")){

      let path = encodeURI(this.lesson.path);
      this.videoUrl = `#/lesson/local/play?path=${path}`;

    } else{
      this.videoUrl = this.lesson.path;

    }

    // require(['./shadow.js'],(data:any)=>{
    //   console.log("当前的shadow.js的数据",data);
    // })
  }

  private mounted() {

    let notesList= this.$refs.notesList as NotesList;
    notesList.setNoteList(this.list);

    setTimeout(()=>{
      let webView: any = document.getElementById('playerWebView');
      webView.openDevTools();
      this.webView = webView;
      //第一次加载webview的时候注入。
      this.injectCode();
      this.onDomReadyInject();
    },2000);

  }


  private destroyed(){

    courseService.saveDb();
  }

  /**
   * 跳转新连接后
   * 简单dom渲染完成再进行注入。
   *
   */
  private onDomReadyInject(){

    if(!this.webView){
      return;
    }
    this.webView.addEventListener('dom-ready',()=>{
      console.log('dom-ready');
      this.injectCode();
    });
  }

  private injectCode(){

    let code = '!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var r=e();for(var n in r)("object"==typeof exports?exports:t)[n]=r[n]}}(window,(function(){return function(t){var e={};function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)r.d(n,o,function(e){return t[e]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=4)}([function(t,e,r){t.exports=r(6)},function(t,e){function r(t,e,r,n,o,i,a){try{var u=t[i](a),c=u.value}catch(t){return void r(t)}u.done?e(c):Promise.resolve(c).then(n,o)}t.exports=function(t){return function(){var e=this,n=arguments;return new Promise((function(o,i){var a=t.apply(e,n);function u(t){r(a,o,i,u,c,"next",t)}function c(t){r(a,o,i,u,c,"throw",t)}u(void 0)}))}}},function(t,e){t.exports=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},function(t,e){function r(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}t.exports=function(t,e,n){return e&&r(t.prototype,e),n&&r(t,n),t}},function(t,e,r){t.exports=r(5)},function(t,e,r){"use strict";r.r(e);var n=r(0),o=r.n(n),i=r(1),a=r.n(i),u=r(2),c=r.n(u),l=r(3),s=r.n(l);new(function(){function t(){c()(this,t);var e=null;try{e=window.require("electron")}catch(t){e=window.module.require("electron")}if(e){var r=e,n=r.ipcRenderer,o=r.remote;this.ipcRenderer=n,this.remote=o,this.loopToGetDuration(),this.listen()}}var e,r,n;return s()(t,[{key:"listen",value:(n=a()(o.a.mark((function t(){var e=this;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:this.ipcRenderer.on("play-video",(function(t,r){e.video&&(console.log("play-video",t,r),r?(e.video.currentTime=r.duration,e.video.play()):e.video.play())})),this.ipcRenderer.on("pause-video",(function(){console.log("listen pause"),e.video&&e.video.pause()}));case 2:case"end":return t.stop()}}),t,this)}))),function(){return n.apply(this,arguments)})},{key:"sendDuration",value:function(t){this.ipcRenderer.sendToHost("duration",t)}},{key:"loopToGetDuration",value:(r=a()(o.a.mark((function t(){var e;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:this.video=this.findVideo();case 1:if(this.video){t.next=7;break}return this.video=this.findVideo(),t.next=6,this.sleep(500);case 6:return t.abrupt("continue",1);case 7:return e=parseInt(this.video.currentTime.toFixed(0)),this.sendDuration(e),t.next=11,this.sleep(500);case 11:t.next=1;break;case 13:case"end":return t.stop()}}),t,this)}))),function(){return r.apply(this,arguments)})},{key:"findVideo",value:function(){if(location.href.indexOf("pan.baidu.com/play/video")>0){console.log("是在百度云播放页延时1秒再查找");var t=document.querySelector("#video-root");if(!t)return null;var e=t.shadowRoot;if(!e)return null;var r=e.querySelector("video");return r?(console.log("已找到"),this.baiduStyle(e),r):null}var n=document.getElementsByTagName("video");return n&&0!=n.length?n[0]:null}},{key:"editWidthStyle",value:function(t,e){var r=document.querySelector(t);r?r.style.width=e:console.log("editWidthStyle() ".concat(t," 样式没有找到对应的element"))}},{key:"editminWidthStyle",value:function(t,e){var r=document.querySelector(t);r?r.style.minWidth=e:console.log("editminWidthStyle() ".concat(t," 样式没有找到对应的element"))}},{key:"editDisplayStyle",value:function(t,e){var r=document.querySelector(t);r?r.style.display=e:console.log("editDisplayStyle() ".concat(t," 样式没有找到对应的element"))}},{key:"baiduStyle",value:(e=a()(o.a.mark((function t(e){var r;return o.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,this.sleep(2e3);case 2:(r=document.querySelector("video-main"))&&(r.style.width="100%;"),this.editWidthStyle("div.video-main","100%"),this.editWidthStyle("span.video-title-left","100%"),this.editDisplayStyle("div.other-video-box","none"),this.editDisplayStyle("#video-toolbar","none"),this.editDisplayStyle("div.dis-footer","none"),this.editDisplayStyle("dd.vyQHNyb","none"),this.editDisplayStyle("dt.EHazOI","none"),this.editminWidthStyle("dl.xtJbHcb","0px"),(r=e.querySelector("#video-player"))&&(r.style.width="100%");case 14:case"end":return t.stop()}}),t,this)}))),function(t){return e.apply(this,arguments)})},{key:"sleep",value:function(t){return new Promise((function(e){setTimeout((function(){e()}),t)}))}}]),t}())},function(t,e,r){var n=function(t){"use strict";var e=Object.prototype,r=e.hasOwnProperty,n="function"==typeof Symbol?Symbol:{},o=n.iterator||"@@iterator",i=n.asyncIterator||"@@asyncIterator",a=n.toStringTag||"@@toStringTag";function u(t,e,r,n){var o=e&&e.prototype instanceof s?e:s,i=Object.create(o.prototype),a=new S(n||[]);return i._invoke=function(t,e,r){var n="suspendedStart";return function(o,i){if("executing"===n)throw new Error("Generator is already running");if("completed"===n){if("throw"===o)throw i;return E()}for(r.method=o,r.arg=i;;){var a=r.delegate;if(a){var u=w(a,r);if(u){if(u===l)continue;return u}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if("suspendedStart"===n)throw n="completed",r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);n="executing";var s=c(t,e,r);if("normal"===s.type){if(n=r.done?"completed":"suspendedYield",s.arg===l)continue;return{value:s.arg,done:r.done}}"throw"===s.type&&(n="completed",r.method="throw",r.arg=s.arg)}}}(t,r,a),i}function c(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}t.wrap=u;var l={};function s(){}function f(){}function h(){}var d={};d[o]=function(){return this};var p=Object.getPrototypeOf,y=p&&p(p(L([])));y&&y!==e&&r.call(y,o)&&(d=y);var v=h.prototype=s.prototype=Object.create(d);function m(t){["next","throw","return"].forEach((function(e){t[e]=function(t){return this._invoke(e,t)}}))}function g(t){var e;this._invoke=function(n,o){function i(){return new Promise((function(e,i){!function e(n,o,i,a){var u=c(t[n],t,o);if("throw"!==u.type){var l=u.arg,s=l.value;return s&&"object"==typeof s&&r.call(s,"__await")?Promise.resolve(s.__await).then((function(t){e("next",t,i,a)}),(function(t){e("throw",t,i,a)})):Promise.resolve(s).then((function(t){l.value=t,i(l)}),(function(t){return e("throw",t,i,a)}))}a(u.arg)}(n,o,e,i)}))}return e=e?e.then(i,i):i()}}function w(t,e){var r=t.iterator[e.method];if(void 0===r){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=void 0,w(t,e),"throw"===e.method))return l;e.method="throw",e.arg=new TypeError("The iterator does not provide a \'throw\' method")}return l}var n=c(r,t.iterator,e.arg);if("throw"===n.type)return e.method="throw",e.arg=n.arg,e.delegate=null,l;var o=n.arg;return o?o.done?(e[t.resultName]=o.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=void 0),e.delegate=null,l):o:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,l)}function x(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function b(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function S(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(x,this),this.reset(!0)}function L(t){if(t){var e=t[o];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var n=-1,i=function e(){for(;++n<t.length;)if(r.call(t,n))return e.value=t[n],e.done=!1,e;return e.value=void 0,e.done=!0,e};return i.next=i}}return{next:E}}function E(){return{value:void 0,done:!0}}return f.prototype=v.constructor=h,h.constructor=f,h[a]=f.displayName="GeneratorFunction",t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===f||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,h):(t.__proto__=h,a in t||(t[a]="GeneratorFunction")),t.prototype=Object.create(v),t},t.awrap=function(t){return{__await:t}},m(g.prototype),g.prototype[i]=function(){return this},t.AsyncIterator=g,t.async=function(e,r,n,o){var i=new g(u(e,r,n,o));return t.isGeneratorFunction(r)?i:i.next().then((function(t){return t.done?t.value:i.next()}))},m(v),v[a]="Generator",v[o]=function(){return this},v.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){for(;e.length;){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},t.values=L,S.prototype={constructor:S,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method="next",this.arg=void 0,this.tryEntries.forEach(b),!t)for(var e in this)"t"===e.charAt(0)&&r.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=void 0)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function n(r,n){return a.type="throw",a.arg=t,e.next=r,n&&(e.method="next",e.arg=void 0),!!n}for(var o=this.tryEntries.length-1;o>=0;--o){var i=this.tryEntries[o],a=i.completion;if("root"===i.tryLoc)return n("end");if(i.tryLoc<=this.prev){var u=r.call(i,"catchLoc"),c=r.call(i,"finallyLoc");if(u&&c){if(this.prev<i.catchLoc)return n(i.catchLoc,!0);if(this.prev<i.finallyLoc)return n(i.finallyLoc)}else if(u){if(this.prev<i.catchLoc)return n(i.catchLoc,!0)}else{if(!c)throw new Error("try statement without catch or finally");if(this.prev<i.finallyLoc)return n(i.finallyLoc)}}}},abrupt:function(t,e){for(var n=this.tryEntries.length-1;n>=0;--n){var o=this.tryEntries[n];if(o.tryLoc<=this.prev&&r.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,l):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),l},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),b(r),l}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;b(r)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,r){return this.delegate={iterator:L(t),resultName:e,nextLoc:r},"next"===this.method&&(this.arg=void 0),l}},t}(t.exports);try{regeneratorRuntime=n}catch(t){Function("r","regeneratorRuntime = r")(n)}}])}));';
    this.webView.executeJavaScript(code).then(()=>{

      this.startCommunicate(this.webView);
      this.initListener();

    });
  }

  /**
   * 注入成功，开始通信
   * @param webView
   */
  private startCommunicate(webView:any){

    let noteEdit = this.$refs.noteEdit as NoteEdit;
    noteEdit.setWebView(webView);

    //监听webView里面发送过来的消息
    webView.addEventListener('ipc-message', (event:any) => {
      // console.log('ipc-message',event);

      let channel = event.channel;
      if(channel === 'duration'){
        let duration = event.args[0];
        noteEdit.onDurationChange(duration);
      }
    })
  }

  private onSavedNote(note:any){
    console.log('onSavedNote',note);

    let notesList = this.$refs.notesList as NotesList;
    notesList.addNote(note);
  }

  private onEditChange(isEdit:boolean){
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
      <div class="lesson-play-left">

        <notes-list ref="notesList" style={this.isEdit?'height:0px !important;':'height:90%;'} class="lesson-play-left-top" />
        <note-edit style={this.isEdit?'height:100%;':'height:10%;'} class="lesson-play-left-bottom" ref="noteEdit" lessonId={this.lessonId} onsaved={this.onSavedNote} oneditchange={this.onEditChange}/>

      </div>
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
      </div>

    </div>;
  }

}
