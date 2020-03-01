/*
因为百度网盘的视频用到了shadow-root。
并且是用了closed模式。
在正常情况下是无法，取到内部的video组件。
所以这里修改了attachShadow的方法。

这个文件会在'LessonPlay'的'webview'组件中使用到。

 */

Element.prototype._attachShadow = Element.prototype.attachShadow;
Element.prototype.attachShadow = function () {
  console.log('attachShadow');
  return this._attachShadow( { mode: "open" } );
};
