const remote = window.require('electron').remote;

console.log('remote', remote);

class CourseService {

  private dbService!: DbService;

  constructor() {

    this.dbService = remote.getGlobal('dbService');
  }

  /**
   * 创建课程
   * @param name
   * @param cover
   * @param author
   * @param intro
   * @return -1:创建失败
   */
  public createCourse(name: string,cover:string,author:string,intro:string): number {

    if (!name) {
      return -1;
    }

    let time = new Date().getTime();
    let course: Course = {
      name: name,
      time: time,
      cover,
      author,
      intro
    };
    return this.dbService.insertCourse(course);
  }


  /**
   * 编辑课程
   * @param course
   * @return -1:创建失败
   */
  public editCourse(course:Course): number {

    if (!course) {
      return -1;
    }

    return this.dbService.editCourse(course);
  }


  public queryCourse(courseId:number):Course| null {
    let course = this.dbService.queryCourse(courseId);
    if(!course || course.length <=0){
      return null;
    }
    let list = this.parseQueryData(course);
    if(!list || list.length == 0){
      return null;
    }

    return list[0];
  }

  /**
   * 创建课
   * @param courseId 课程id
   * @param name 课的名字
   * @param path 视频地址
   * @param cover
   * @param author
   * @param intro
   */
  public createLesson(courseId: number, name: string, path: string,cover:string,author:string,intro:string): number {

    if (courseId <= 0 || !name || !path) {
      return -1;
    }

    let time = new Date().getTime();
    let lesson: Lesson = {
      courseId,
      name,
      path,
      time,
      cover,
      author,
      intro,
      currentTime:0,
      length:0
    };
    return this.dbService.insertLesson(lesson);
  }


  /**
   * 编辑课
   * @param lesson
   */
  public editLesson(lesson:Lesson):any{
    if(!lesson || !lesson.id){
      return -1;
    }
    console.log('CourseService editLesson() lesson=',lesson);
    let result = this.dbService.editLesson(lesson);
    console.log('CourseService editLesson() result=',result);
    return lesson.id;
  }

  /**
   * 创建笔记
   * @param lessonId
   * @param content
   * @param duration
   */
  public createNote(lessonId: number, content: string, duration: number): number {

    if (lessonId <= 0 || !content || duration < 0) {
      return -1;
    }
    let time = new Date().getTime();
    let note: Note = {
      lessonId,
      duration,
      content,
      type: 0,
      time
    };

    return this.dbService.insertNote(note);
  }

  /**
   * 编辑笔记
   * @param note
   */
  public editNote(note:Note):any{
    if(!note || !note.id){
      return -1;
    }
    console.log('CourseService editNote() note=',note);
    let result = this.dbService.editNote(note);
    console.log('CourseService editNote() result=',result);
    return note.id;
  }

  /**
   *
   * @param courseId
   */
  public deleteCourse(courseId:number):boolean{

    let result = this.dbService.deleteCourse(courseId);
    console.log('deleteCourse result=',result,courseId);
    return true;
  }


  /**
   *
   * @param lessonId
   */
  public deleteLesson(lessonId:number):boolean{

    let result = this.dbService.deleteLesson(lessonId);
    console.log('deleteLesson result=',result,lessonId);
    return true;
  }

  /**
   *
   * @param noteId
   */
  public deleteNote(noteId:number):boolean{

    let result = this.dbService.deleteNote(noteId);
    console.log('deleteNote result=',result,noteId);
    return true;
  }

  loadCourses(): Array<Course> {

    let courses = this.dbService.loadCourses();
    console.log('loadCourses', courses);
    let list = this.parseQueryData(courses);
    console.log('loadCourses list = ', list);

    return list;
  }

  loadLessons(courseId: number): any {

    let lessons = this.dbService.loadLessons(courseId);
    console.log('loadLessons',lessons);
    let list = this.parseQueryData(lessons);
    console.log('loadLessons',list);
    return list;
  }

  loadNotes(lessonId: number): any {
    let notes = this.dbService.loadNotes(lessonId);
    console.log('loadNotes',notes);
    let list = this.parseQueryData(notes);
    console.log('loadNotes',list);
    return list;
  }

  queryLesson(lessonId:number):any{

    let lesson = this.dbService.queryLesson(lessonId);
    if(!lesson || lesson.length <=0){
      return null;
    }
    let list = this.parseQueryData(lesson);
    if(!list || list.length == 0){
      return null;
    }

    return list[0];
  }

  saveDb(){
    this.dbService.saveDb();
  }

  private parseQueryData(data: any) {

    if (!data || data.length < 1) {
      return [] as Array<Course>;
    }
    let datas = data[0];
    let columns = datas['columns'];
    let values: Array<any> = datas['values'];
    if (!values || values.length < 1) {
      return [];
    }

    let list: Array<Course> = [];
    values.forEach((value: any) => {
      if (value && value.length > 0) {
        let resultItem: any = {};
        value.forEach((item: any, index: number) => {
          let name = columns[index];
          resultItem[name] = item;
        });
        list.push(resultItem);
      }
    });

    return list;
  }

}

const courseService: CourseService = new CourseService();

export default courseService;
