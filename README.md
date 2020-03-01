# 基于Electron开发的应用

目的：播放视频的时候可以记录零碎的笔记。并且可以最后把笔记合并成markdown.


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

