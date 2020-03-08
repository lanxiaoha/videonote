# 基于Electron开发的应用




## 技术说明

1. 使用`sql.js`操作db数据库
2. 使用`Electron`的`<webview>`组件用来播放视频
3. 通过`<webview>`组件的`execJavascript()`方法，往网页中注入`inject`代码




## 代码目录

### `electron`

  这个是Electron的代码。用于创建窗口，和操作db数据库。

### `learn/inject`

  这个是一段注入代码。
  可以实现网页和应用的通信。

  生成注入代码：

  操作：

  ```
  > cd ./inject
  > npm run pack

  ```

  会在`learn/inject/dist/index.js`生成已编译好的代码。
  把这段代码复制下来。然后在`LearnPlay.tsx`中替换里面的`code`的变量。

### `src`

  这个是应用的代码。
  本应用是通过vue实现的


## 生成包的操作

  1. 先生成注入代码

  2. 注入代码替换掉`code`

  3. 设置`vue.config.js`中的`publicPath:'./',`

  3. 在`learn`目录下执行 npm run build

  4. 在`learn`目录下执行 `npm run ebuild` 就可以生成mac版的app




## 创建数据库语句


```sql


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

```

### 对应结构说明

```js

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

```
