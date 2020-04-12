const {app, BrowserWindow} = require('electron')
const initSqlJs = require('sql.js')
const url = require('url')
const path = require('path')
const fs = require('fs')



console.log('__dirname', __dirname)

const isDev = true;
const openDevTool = false;

var mainWindow

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

  // mainPath = 'https://www.baidu.com';
  win.loadURL(mainPath)
  mainWindow = win

  if(openDevTool){
    // 打开开发者工具
    win.webContents.openDevTools()
  }
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

// console.log('initSqlJs', initSqlJs)

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

  console.log('main connect() dbFilePath', dbFilePath)
  if (!dbFilePath) {
    mainWindow.webContents.send('db_connected', false)
    return
  }

  if (this.db && this.dbFilePath === dbFilePath) {
    console.log('is reconnect the same db')
    mainWindow.webContents.send('db_connected', true)
    return
  }

  this.dbFilePath = dbFilePath
  var dbBuffer = fs.readFileSync(this.dbFilePath)

  initSqlJs().then((SQL) => {
    // console.log('SQL',SQL);
    if (this.db != null) {
      // this.db.close();
    }

    this.db = new SQL.Database(dbBuffer)
    console.log('main.js connect db success')
    mainWindow.webContents.send('db_connected', true)
  }).catch(() => {
    console.log('main.js connect db fail')
    mainWindow.webContents.send('db_connected', false)

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

DbService.prototype.editCourse = function editCourse (course) {

  if (!this.db || !course) {
    return -1
  }
  console.log('editCourse', course)

  let sql = `UPDATE course SET name='${course.name}',status=${course.status},cover='${course.cover}',intro='${course.intro}',author='${course.author}',time=${course.time} WHERE id=${course.id}`

  return this.db.run(sql)
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
  let length = data.length
  let currentTime = data.currentTime

  let sql = `INSERT INTO lesson(id,courseId,path,name,status,cover,intro,author,time,currentTime,length) VALUES(${id},${courseId},'${path}','${name}',${status},'${cover}','${intro}','${author}',${time},${currentTime},${length})`

  this.db.run(sql)
  this.saveDb()
  return id
}

DbService.prototype.editLesson = function editLesson (item) {

  if (!this.db || !item) {
    return -1
  }
  console.log('editLesson', item)

  let sql = `UPDATE lesson SET courseId=${item.courseId},path='${item.path}',name='${item.name}',status=${item.status},cover='${item.cover}',intro='${item.intro}',author='${item.author}',time=${item.time},length=${item.length},currentTime=${item.currentTime} WHERE id=${item.id}`

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

DbService.prototype.queryCourse = function queryCourse (courseId) {

  if (!this.db) {
    return
  }
  return this.db.exec(`select * from course where id = ${courseId}`)
}

DbService.prototype.queryLesson = function queryLesson (lessonId) {

  if (!this.db) {
    return
  }
  return this.db.exec(`select * from lesson where id = ${lessonId}`)
}

DbService.prototype.deleteCourse = function deleteCourse (courseId) {
  if (!this.db) {
    return -1
  }
  let sql = `delete from course where id = ${courseId}`
  return this.db.exec(sql)
}

DbService.prototype.deleteLesson = function deleteLesson (lessonId) {
  if (!this.db) {
    return -1
  }
  let sql = `delete from lesson where id = ${lessonId}`
  return this.db.exec(sql)
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

function VideoService () {

  this.ffmpegCommand = null
}

VideoService.prototype.kill = function kill () {

  if (this.ffmpegCommand != null) {
    this.ffmpegCommand.kill()
  }
}

VideoService.prototype.create = function create () {

  http.createServer((req, response) => {

    console.log('on request', req.url)
    let urlStr = req.url.substring('/?path='.length)
    videoPath = decodeURI(urlStr)
    var stat = fs.statSync(videoPath)

    response.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size,
      'Keep-Alive': 'timeout=10',
      'Etag': '138011f-3b2c882-5a10610ee822a',

    })

    console.log('videoPath', videoPath, stat.size)

    // this.kill();

    let startTime = 10 * 60
    let videoCodec = 'libx264'
    let audioCodec = 'aac'

    this.ffmpegCommand = ffmpeg()
      .input(videoPath)
      .nativeFramerate()
      .videoCodec(videoCodec)
      .audioCodec(audioCodec)
      .format('mp4')
      .duration(3600)
      .seekInput(startTime)
      .outputOptions('-movflags', 'frag_keyframe+empty_moov')
      .on('progress', function (progress) {
        // console.log('time: ' + progress.timemark);
      })
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message)
      })
      .on('end', function () {
        console.log('Processing finished !')
      })

    let videoStream = this.ffmpegCommand.pipe()
    videoStream.pipe(response)

  }).listen(6688)
}

VideoService.prototype.create2 = function create () {

  expressApp.get('/', (req, response) => {

    console.log('on request', req.url)
    let urlStr = req.url.substring('/?path='.length)
    videoPath = decodeURI(urlStr)
    var stat = fs.statSync(videoPath)
    let fileSize = stat.size
    let range = req.headers.range
    if (range) {
      //有range头才使用206状态码
      let parts = range.replace(/bytes=/, '').split('-')
      let start = parseInt(parts[0], 10)
      let end = parts[1] ? parseInt(parts[1], 10) : start + 999999

      // end 在最后取值为 fileSize - 1
      end = end > fileSize - 1 ? fileSize - 1 : end

      let chunksize = (end - start) + 1
      let file = fs.createReadStream(videoPath, {
        start,
        end,
      })

      let head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
      response.writeHead(206, head)
      file.pipe(response)
    } else {
      let head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
      response.writeHead(200, head)
      fs.createReadStream(videoPath).pipe(response)
    }

    // response.writeHead(206, {
    //   'Content-Type': 'video/mp4',
    //   'Content-Length': stat.size,
    //   'Content-Range':'bytes ',
    //   'Keep-Alive':'timeout=10',
    //   'Etag':'138011f-3b2c882-5a10610ee822a'
    //
    // });
    //
    // console.log("videoPath",videoPath,stat.size);
    //
    // // this.kill();
    //
    // let startTime = 10*60;
    // let videoCodec = 'libx264';
    // let audioCodec = 'aac';
    //
    // this.ffmpegCommand = ffmpeg()
    //   .input(videoPath)
    //   .nativeFramerate()
    //   .videoCodec(videoCodec)
    //   .audioCodec(audioCodec)
    //   .format('mp4')
    //   .duration(3600)
    //   .seekInput(startTime)
    //   .outputOptions('-movflags', 'frag_keyframe+empty_moov')
    //   .on('progress', function (progress) {
    //     // console.log('time: ' + progress.timemark);
    //   })
    //   .on('error', function (err) {
    //     console.log('An error occurred: ' + err.message);
    //   })
    //   .on('end', function () {
    //     console.log('Processing finished !');
    //   })
    //
    // let videoStream = this.ffmpegCommand.pipe();
    // videoStream.pipe(response);

  }).listen(6688)
}

VideoService.prototype.create1 = function create () {

  expressApp.get('/', (req, response) => {

    console.log('on request', req.url)
    let urlStr = req.url.substring('/?path='.length)
    videoPath = decodeURI(urlStr)
    var stat = fs.statSync(videoPath)
    let fileSize = stat.size
    let range = req.headers.range
    if (range) {
      //有range头才使用206状态码
      let parts = range.replace(/bytes=/, '').split('-')
      let start = parseInt(parts[0], 10)
      let end = parts[1] ? parseInt(parts[1], 10) : start + 999999

      // end 在最后取值为 fileSize - 1
      end = end > fileSize - 1 ? fileSize - 1 : end

      let chunksize = (end - start) + 1

      let head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
      response.writeHead(200, head)

      this.kill()

      let startTime = 10 * 60
      let videoCodec = 'libx264'
      let audioCodec = 'aac'

      this.ffmpegCommand = ffmpeg()
        .input(videoPath)
        .nativeFramerate()
        .videoCodec(videoCodec)
        .audioCodec(audioCodec)
        .format('mp4')
        .duration(3600)
        .seekInput(startTime)
        .outputOptions('-movflags', 'frag_keyframe+empty_moov')
        .on('progress', function (progress) {
          console.log('time: ' + progress.timemark)
        })
        .on('error', function (err) {
          console.log('An error occurred: ' + err.message)
        })
        .on('end', function () {
          console.log('Processing finished !')
        })

      let videoStream = this.ffmpegCommand.pipe()
      videoStream.pipe(response)

    } else {
      let head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
      response.writeHead(200, head)

      this.kill()

      let startTime = 10 * 60
      let videoCodec = 'libx264'
      let audioCodec = 'aac'

      this.ffmpegCommand = ffmpeg()
        .input(videoPath)
        .nativeFramerate()
        .duration(3600)
        .videoCodec(videoCodec)
        .audioCodec(audioCodec)
        .format('mp4')
        .seekInput(startTime)
        .outputOptions('-movflags', 'frag_keyframe+empty_moov')
        .on('progress', function (progress) {
          // console.log('time: ' + progress.timemark);
        })
        .on('error', function (err) {
          console.log('An error occurred: ' + err.message)
        })
        .on('end', function () {
          console.log('Processing finished !')
        })

      let videoStream = this.ffmpegCommand.pipe()
      videoStream.pipe(response)
    }

  }).listen(6688)
}

const dbService = new DbService()
// const videoService = new VideoService()
// videoService.create()

global.dbService = dbService
