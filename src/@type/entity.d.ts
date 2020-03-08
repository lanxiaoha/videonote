
interface DbService{

  connect(path:string):void;
  copyEmptyDbToPath(distPath:string):void;
  isInitSuccess():boolean;
  insertCourse(course:Course):number;
  editCourse(course:Course):number;

  insertLesson(lesson:Lesson):number;
  editLesson(lesson:Lesson):number;
  insertNote(note:Note):number;
  editNote(note:Note):number;
  loadCourses():any;
  loadLessons(courseId:number):any;
  loadNotes(lessonId:number):any;
  saveDb():void;
  queryLesson(lessonId:number):any;
  deleteNote(noteId:number):any;
  deleteCourse(courseId:number):any;
  deleteLesson(lessonId:number):any;
  queryCourse(courseId:number):any;
}

//创建表的sql语句
/*

create table course(

id int auto_increment primary key,
name varchar(64) not null,
status int,
cover varchar(300),
intro varchar(300),
author varchar(20),
time int,
ext text
);

create table lesson(
	id int auto_increment primary key,
	courseId int not null,
	path varchar(1024),
	name varchar(200),
	status int,
	cover varchar(300),
 intro varchar(300),
 author varchar(20),
 length int,
 currentTime int,
 time int,
 tag varchar(50),
 ext text
);

create table note(
	id int auto_increment primary key,
	lessonId int not null,
	status int,
	duration int,
	type int,
	content text,
	time int,
	ext text
);
 */

type Course = {
  //主键,不能重复
  id?:number,
  //字符64
  name:string,
  /**
   * 0：正常，1：已删除
   */
  status?:number,
  /**
   * 封面
   */
  cover?:string,
  /**
   * 简介
   */
  intro?:string,
  /**
   * 作者
   */
  author?:string,
  /**
   * 插入时间
   */
  time:number,
  /**
   * 未来扩展
   */
  ext?:string,
}

type Lesson = {
  //主键,不能重复
  id?:number,
  //上面的Course iD
  courseId:number,
  //路径 500
  path:string,
  //200
  name:string,
  /**
   * 0正常，1已删除
   */
  status?:number,
  /**
   * 封面
   */
  cover?:string,
  /**
   * 简介
   */
  intro?:string,
  /**
   * 作者
   */
  author?:string,
  /**
   * 插入时间
   */
  time:number,
  /**
   * 视频长度
   */
  length:number,

  /**
   * 视频播放的进度。
   */
  currentTime:number,
  /**
   * 标签
   */
  tag?:string,
  /**
   * 未来扩展
   */
  ext?:string,
}

type Note = {
  //主键，不能重复
  id?:number,
  //上面的LessonId, 这个可以后面可以做修改
  lessonId:number,
  /**
   * 0正常，1已删除
   */
  status?:number,
  //记录的视频时间轴长度
  duration:number,
  //类型
  type:number,
  //内容
  content:string,
  /**
   * 插入时间
   */
  time:number,

  /**
   * 未来扩展
   */
  ext?:string,

}
