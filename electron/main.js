const {app, BrowserWindow} = require('electron')
const initSqlJs = require('sql.js')
const url = require('url')
const path = require('path')
const fs = require('fs')

console.log('__dirname', __dirname)

const isDev = true;
var mainWindow;

function createWindow () {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 1024,
    height: 670,
    resizable: true,
    minWidth: 1024,
    minHeight: 670,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      plugins: true,
    },
  })
  let mainPath
  if (isDev) {
    mainPath = 'http://localhost:8080/#/'
  } else {
    mainPath = url.format({
      pathname: path.join(__dirname, '../dist', 'index.html'),
      protocol: 'file:',
      slashes: true,
      hash: null,
    })
  }

  win.loadURL(mainPath)
  mainWindow = win;
  // 打开开发者工具
  win.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

/////////////////////////////////////////////////////////

console.log('initSqlJs', initSqlJs)

function DbService () {

  this.db = null
  this.dbFilePath = ''
  /*
  this.dbFilePath = path.join(__dirname, './', 'sql.db')
  console.log('dbFilePath', this.dbFilePath)

  var dbBuffer = fs.readFileSync(this.dbFilePath)
  this.db = null

  initSqlJs().then((SQL) => {
    // console.log('SQL',SQL);
    this.db = new SQL.Database(dbBuffer);
  })
  */
}

/**
 * 连接数据库
 */
DbService.prototype.connect = function connect (dbFilePath) {

  console.log("main connect() dbFilePath",dbFilePath);
  if (!dbFilePath) {
    mainWindow.webContents.send("db_connected",false);
    return
  }

  if(this.db  && this.dbFilePath === dbFilePath){
    console.log('is reconnect the same db');
    mainWindow.webContents.send("db_connected",true);
    return;
  }

  this.dbFilePath = dbFilePath
  var dbBuffer = fs.readFileSync(this.dbFilePath)

  initSqlJs().then((SQL) => {
    // console.log('SQL',SQL);
    if(this.db != null){
      // this.db.close();
    }

    this.db = new SQL.Database(dbBuffer);
    console.log("main.js connect db success");
    mainWindow.webContents.send("db_connected",true);
  }).catch(()=>{
    console.log("main.js connect db fail");
    mainWindow.webContents.send("db_connected",false);

  })
}

/**
 * 拷贝一个空的数据库到指定目录。
 */
DbService.prototype.copyEmptyDbToPath = function copyEmptyDbToPath (distPath) {

  let emptyDbPath = path.join(__dirname, './', 'sql.db')

  let buf = fs.readFileSync(emptyDbPath)
  fs.writeFileSync(distPath, buf)
}



/**
 * db数据库是否初始化成功
 */
DbService.prototype.isInitSuccess = function isInitSuccess () {
  if (this.db) {
    return true
  } else {
    return false
  }
}

/**
 * 查询course表中的最大的id值
 * @return {number} 0表示没有查到
 */
DbService.prototype.selectMaxIdOfCourse = function selectMaxIdOfCourse () {
  return this.selectMaxId('course')
}

/**
 * 查询lesson表中的最大的id值
 * @return {number} 0表示没有查到
 */
DbService.prototype.selectMaxIdOfLesson = function selectMaxIdOfLesson () {
  return this.selectMaxId('lesson')
}

/**
 * 查询note表中的最大的id值
 * @return {number} 0表示没有查到
 */
DbService.prototype.selectMaxIdOfNote = function selectMaxIdOfNote () {
  return this.selectMaxId('note')
}

/**
 * 查询 tableName 表中的最大的id值
 * @return {number} 0表示没有查到
 */
DbService.prototype.selectMaxId = function selectMaxId (tableName) {
  if (!this.db) {
    return 0
  }
  var res = this.db.exec(`SELECT max(id) FROM ${tableName}`)
  if (!res || res.length <= 0) {
    return 0
  }
  let line = res[0]
  let values = line['values']
  if (!values || values.length <= 0) {
    return 0
  }
  return values[0][0]
}

/**
 *
 * @param data
 * @return {number}
 */
DbService.prototype.insertCourse = function insertCourse (data) {
  if (!this.db || !data) {
    return -1
  }
  let id = this.selectMaxIdOfCourse()
  id++
  console.log('insertCourse', id, data)
  let name = data.name
  let status = 0
  let cover = data.cover
  let intro = data.intro
  let author = data.author
  let time = data.time

  let sql = `INSERT INTO course(id,name,status,cover,intro,author,time) VALUES(${id},'${name}',${status},'${cover}','${intro}','${author}',${time})`
  this.db.run(sql)
  this.saveDb()
  return id
}

DbService.prototype.insertLesson = function inserLesson (data) {

  if (!this.db || !data) {
    return -1
  }

  let id = this.selectMaxIdOfLesson()
  id++
  console.log('insertLesson', id, data)
  let courseId = data.courseId
  let path = data.path
  let name = data.name
  let status = 0
  let cover = data.cover
  let intro = data.intro
  let author = data.author
  let time = data.time

  let sql = `INSERT INTO lesson(id,courseId,path,name,status,cover,intro,author,time) VALUES(${id},${courseId},'${path}','${name}',${status},'${cover}','${intro}','${author}',${time})`

  this.db.run(sql)
  this.saveDb()
  return id
}



DbService.prototype.editLesson = function editLesson (item) {

  if (!this.db || !item) {
    return -1
  }
  console.log('editLesson', item)

  let sql = `UPDATE lesson SET courseId=${item.courseId},path='${item.path}',name='${item.name}',status=${item.status},cover='${item.cover}',intro='${item.intro}',author='${item.author}',time=${item.time} WHERE id=${item.id}`

  return this.db.run(sql)
}

DbService.prototype.insertNote = function insertNote (data) {

  if (!this.db || !data) {
    return -1
  }

  let id = this.selectMaxIdOfNote()
  id++
  console.log('insertNote', id, data)

  let lessonId = data.lessonId
  let status = 0
  let duration = data.duration
  let type = data.type
  let content = data.content
  let time = data.time

  let sql = `INSERT INTO note(id,lessonId,status,duration,type,content,time) VALUES(${id},${lessonId},${status},${duration},${type},'${content}',${time})`

  this.db.run(sql)
  this.saveDb()
  return id
}

DbService.prototype.loadCourses = function loadCourses () {

  if (!this.db) {
    return null
  }

  return this.db.exec('select * from course')
}

DbService.prototype.loadLessons = function loadLessons (courseId) {

  if (!this.db) {
    return null
  }

  return this.db.exec(`select * from lesson where courseId = ${courseId}`)
}

DbService.prototype.loadNotes = function loadNotes (lessonId) {

  if (!this.db) {
    return null
  }

  return this.db.exec(`select * from note where lessonId = ${lessonId}`)
}

DbService.prototype.queryLesson = function queryLesson (lessonId) {

  if (!this.db) {
    return
  }
  return this.db.exec(`select * from lesson where id = ${lessonId}`)
}

DbService.prototype.deleteNote = function deleteNote (noteId) {
  if (!this.db) {
    return -1
  }
  let sql = `delete from note where id = ${noteId}`
  return this.db.exec(sql)
}

DbService.prototype.editNote = function editNote (note) {

  if (!this.db || !note) {
    return -1
  }
  console.log('editNote', note)

  let sql = `UPDATE note SET lessonId=${note.lessonId},status=${note.status},duration=${note.duration},content='${note.content}',time=${note.time} WHERE id=${note.id}`

  return this.db.run(sql)
}

/**
 * 保存数据库
 */
DbService.prototype.saveDb = function saveDb () {

  if (!this.db) {
    return
  }

  const data = this.db.export()
  const buffer = Buffer.from(data, 'binary')
  fs.writeFileSync(this.dbFilePath, buffer)
}

const dbService = new DbService()

global.dbService = dbService
