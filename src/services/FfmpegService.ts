const ffmpegPath = (window as any).require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = (window as any).require('@ffprobe-installer/ffprobe').path;
const ffmpeg = (window as any).require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
const fs = (window as any).require('fs');
const http = (window as any).require('http');
var express = (window as any).require('express');
var expressApp = express();


export default class FfmpegService {

  private ffmpegCommand!: any;
  private server!: any;
  private startTime: number = 0;
  private progress: number = 0;

  private kill() {

    if (this.ffmpegCommand != null) {
      this.ffmpegCommand.kill();
      this.ffmpegCommand = null;
    }
  }

  videoPath!: string;

  constructor(videoPath: string) {
    this.videoPath = videoPath;
  }

  public setVideoPath(videoPath: string) {
    this.videoPath = videoPath;
  }

  public readDuration(): Promise<number> {

    return new Promise<number>((resolve: any, reject: any) => {
      if (this.videoPath) {

        ffmpeg.ffprobe(this.videoPath, (err: any, metadata: any) => {
          console.log('metadata', err, metadata);
          if (err) {
            reject(err);
            return;
          }
          resolve(metadata.format.duration);
        });
      } else {
        reject({msg: 'videoPath empty'});

      }
    });
  }

  public start() {
    if (this.server) {
      return;
    }
    this.createService();
  }

  public seek(startTime: number) {

    this.startTime = startTime;

  }

  public stop(): Promise<any> {

    return new Promise((resolve => {

      console.log('FfmpegService stop()');

      this.kill();

      if (this.server) {
        console.log('FfmpegService stop() this.server');
        this.server.close(() => {

          console.log('server closed');
          resolve();
        });

        console.log('FfmpegService stop() this.server close()');

      } else {
        resolve();
      }

    }));

  }

  private createService() {

    if (this.server) {
      return;
    }

    console.log('createService');
    this.server = http.createServer((request: any, response: any) => {

      console.log('FfmpegService handle request', request);
      this.startTime = parseInt(this.getParam(request.url, 'startTime'));
      this.kill();

      setTimeout(()=>{
        let stat = fs.statSync(this.videoPath);

        response.writeHead(200, {
          'Content-Type': 'video/mp4',
          'Content-Length': stat.size,
          'Keep-Alive': 'timeout=10',
          'Etag': '138011f-3b2c882-5a10610ee822a',

        });

        console.log('FfmpegService play() startTime', this.startTime);

        let startTime = this.startTime;
        let videoCodec = 'libx264';
        let audioCodec = 'aac';

        this.ffmpegCommand = ffmpeg()
          .input(this.videoPath)
          .nativeFramerate()
          .videoCodec(videoCodec)
          .audioCodec(audioCodec)
          .format('mp4')
          .seekInput(startTime)
          .outputOptions('-movflags', 'frag_keyframe+empty_moov')
          .on('progress', (progress: any) => {
            console.log('time: ' + progress.timemark, progress);
            this.progress = progress.timemark;
          })
          .on('error', (err: any) => {
            console.log('An error occurred: ' + err.message);
          })
          .on('end', () => {
            console.log('Processing finished !');
          });

        console.log("play this.ffmpegCommand",this.ffmpegCommand);
        let videoStream = this.ffmpegCommand.pipe();
        videoStream.pipe(response);
      },1000);

    }).listen(6688);
  }

  private play() {


  }

  private getParam(url: string, key: string) {
    var param: any = {};
    var item: any = [];
    var urlList = url.split('?');
    var req;
    if (urlList.length == 1) {
      req = urlList[0];
    } else {
      req = urlList[1];
    }
    var list = req.split('&');
    for (var i = 0; i < list.length; i++) {
      item = list[i].split('=');
      param[item[0]] = item[1];
    }
    return param[key] ? param[key] : null;
  }
}
