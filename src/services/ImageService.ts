const dataUriToBuffer = (window as any).require('data-uri-to-buffer');
const axios = (window as any).require('axios').default;

const FormDataa = (window as any).require('form-data');


class ImageService {

  private apiToken!: string;
  private baseUrl!: string;
  private imageData!: any;


  constructor() {

    this.apiToken = '';
    this.baseUrl = 'http://sm.ms/api/v2/';
  }

  public setImageData(imageData: any) {
    this.imageData = imageData;
  }

  public getImageData(){
    return this.imageData;
  }
  public hasImageData(){
    if(this.imageData){
      return true;
    }else{
      return false;
    }
  }

  public setToken(apiToken: string) {
    this.apiToken = apiToken;
  }

  public profile():Promise<any> {

    let formData: any = new FormDataa();
    let h = {
      'Content-Type': 'multipart/form-data',
      'Authorization': `${this.apiToken}`,
      'Access-Control-Allow-Origin': '*'
    };

    return axios.post(`${this.baseUrl}profile`, formData, {
      headers: Object.assign(h, formData.getHeaders())
    });
  }

  /**
   * 上传图片
   * @param imageBase64
   */
  public upload(imageBase64: string): Promise<any> {

    console.log('ImageService upload', imageBase64);

    let image = dataUriToBuffer(imageBase64);
    let date = new Date();

    let formData: any = new FormDataa();
    let h = {
      'Content-Type': 'multipart/form-data',
      'Authorization': `${this.apiToken}`,
      'Access-Control-Allow-Origin': '*'
    };

    formData.append('smfile', image, {filename: 'xxxx.png', contentType: 'image/png'});
    formData.append('format', 'json');

    return axios.post(`${this.baseUrl}upload`, formData.getBuffer(), {
      headers: Object.assign(h, formData.getHeaders())
    });
  }
}

const uploadImageService = new ImageService();

export default uploadImageService;
