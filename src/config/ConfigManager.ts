import {Info} from 'vant';

const {remote, ipcRenderer} = window.require('electron');
const fs = window.require('fs');
const Buffer = require('buffer').Buffer;
import InfoData from './InfoData';
import {reject} from 'q';

console.log('fs', fs);
console.log('Buffer', Buffer);


class ConfigManager {

  private dbService!: DbService;
  private infoData!: InfoData;

  constructor() {
    this.dbService = remote.getGlobal('dbService');
  }

  /**
   * 加载配置信息
   */
  public loadInfo() {
    //如果没有读取到
    let infoData = this.readInfoData();
    if (infoData) {

      this.infoData = infoData;

    } else {
      //如果没有，则默认初始化一个配置信息
      this.infoData = new InfoData();
      let dbPath = ConfigManager.getDefaultDbPath();
      this.infoData.dbPath = dbPath;
      this.saveInfoData(this.infoData);
    }

  }

  /**
   * 加载db数据库
   */
  public loadDb(): Promise<any> {

    return new Promise((resolve, reject) => {
      let dbPath = this.infoData.dbPath;

      let exist = fs.existsSync(dbPath);
      if (!exist) {
        this.dbService.copyEmptyDbToPath(dbPath);
      }

      ipcRenderer.once('db_connected', (event: any, result: boolean) => {
        if (result) {
          resolve();
        } else {
          reject();
        }
      });
      this.dbService.connect(dbPath);

    });
  }

  /**
   * 把数据库移到新的位置
   * @param distDbPath
   */
  public moveDbToNewPath(distDbPath:string):Promise<void>{

    return new Promise<void>((resolve,reject)=>{

      console.log('moveDbToNewPath()');

      this.dbService.saveDb();

      let buf = fs.readFileSync(this.infoData.dbPath);

      console.log('moveDbToNewPath() readFileSync()',this.infoData.dbPath);

      if(buf){
        console.log('moveDbToNewPath() writeFileSync()',distDbPath);

        fs.writeFileSync(distDbPath, buf);

        console.log('moveDbToNewPath() before connect db', distDbPath);

        ipcRenderer.once('db_connected', (event: any, result: boolean) => {
          console.log('moveDbToNewPath() db_connected result=', result);
          if (result) {
            this.infoData.dbPath = distDbPath;
            this.saveInfoData(this.infoData);
            resolve();
          } else {
            reject();
          }
        });
        this.dbService.connect(distDbPath);

      }else{
        console.log('moveDbToNewPath() oldDbBuf == null');
        reject();
      }




    });
  }

  /**
   * 选择新的数据库。
   * @param distDbPath
   */
  public chooseNewDb(distDbPath: string): Promise<void> {

    return new Promise<void>((resolve, reject) => {

      let exist = fs.existsSync(distDbPath);
      if (exist) {
        //先保存原来的db
        this.dbService.saveDb();
        console.log('chooseNewDb() before connect db', distDbPath);

        ipcRenderer.once('db_connected', (event: any, result: boolean) => {
          console.log('chooseNewDb() db_connected result=', result);
          if (result) {
            this.infoData.dbPath = distDbPath;
            this.saveInfoData(this.infoData);
            resolve();
          } else {
            reject();
          }
        });
        this.dbService.connect(distDbPath);


      } else {
        reject();
      }


    });

  }

  /**
   * 设置新的db
   * @param dbPath
   */
  public setDbPath(dbPath: string) {

  }

  public getDbPath() {

    return this.infoData.dbPath;
  }

  private saveInfoData(infoData: InfoData) {

    let infoPath = ConfigManager.getInfoPath();

    let json = JSON.stringify(infoData);
    let buf = Buffer.from(json);
    fs.writeFileSync(infoPath, buf);
  }

  private readInfoData(): InfoData | null {

    let infoPath = ConfigManager.getInfoPath();

    let exist = fs.existsSync(infoPath);
    if (exist) {
      let buf = fs.readFileSync(infoPath);
      if (buf) {
        let infoStr = buf.toString();
        if (infoStr) {
          let json = JSON.parse(infoStr);
          let infoData: InfoData = new InfoData();
          infoData = Object.assign(infoData, json);
          return infoData;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private firstInit() {

  }


  private static getAppPath() {

    let appPath = remote.app.getPath('userData');
    console.log('userDataPath', appPath);
    return appPath;

  }

  private static getDefaultDbPath() {
    return ConfigManager.getAppPath() + '/' + this.getDbName();
  }

  public static getDbName() {
    return 'important_learn_sql.db';
  }

  private static getInfoPath() {
    return ConfigManager.getAppPath() + '/info.json';
  }
}

var configManager = new ConfigManager();
export default configManager;
