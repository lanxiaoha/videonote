/**
 * 应用配置表
 */
export default class InfoData {

  dbPath:string = "";
  editNotePauseVideo:boolean = true;
  //播放视频页面，默认编辑的宽度
  playPageNoteContentWidth = 400;
  /**
   * sm.ms的图床token
   */
  smmsApiToken:string = "";
  /*
    设置 编辑笔记时立即对视频截图
   */
  enableCaptureOnEdit:boolean = true;
  /**
   * 设置截图后立即上传
   */
  enableUploadOnCapture:boolean = false;
}
