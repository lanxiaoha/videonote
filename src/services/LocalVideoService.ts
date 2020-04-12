const fs = (window as any).require('fs');
const http = (window as any).require('http');

export default class LocalVideoService{

  private httpServer!:any;

  public createServer(){


    this.httpServer = http.create((request:any,response:any)=>{


      let videoPath = '';
      fs.openSync(videoPath);

    })

  }
}
