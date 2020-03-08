import {Component, Vue, Prop,Watch} from 'vue-property-decorator';
import './CoverChooser.less';
import index from '@/store';

@Component({})
export default class CoverChooser extends Vue {

  @Prop()
  private cover!: string;
  private dataCover!:string;

  private showRemoteCover = false;

  private imagePathList: Array<any> = [];

  @Watch('cover')
  onCoverChange(c:any){
    this.dataCover =c;
  }

  created() {

    //添加本地图片
    let index = 1;
    let max = 14;
    while (index<=max){
      let imgUrl = `./cover/cover${index}.jpeg`;
      this.imagePathList.push(imgUrl);
      index++;
    }
    this.dataCover = this.cover;
  }

  private render() {

    return <div class="cover-container">
      <van-field class="input-style  mt-20" v-model={this.dataCover} label="封面" placeholder="封面图链接" />

      {
        this.dataCover ? <div class="cover">
          {
            this.dataCover ? <img src={this.dataCover} class="cover-url" /> : null
          }
        </div> : null
      }

      <van-icon name="ellipsis" class=" add-cover" onclick={this.showRemoteCoverOverLay} />

      <van-overlay show={this.showRemoteCover} onclick={this.hideRemoteCoverOverLay}>

        <div class="select-cover-root">
          <div class="select-cover">
            {
              this.renderImages()
            }

          </div>

        </div>
      </van-overlay>

    </div>;
  }

  private renderImages() {

    let list: Array<any> = [];
    this.imagePathList.forEach((path: string, index: number) => {
      list.push(<img class="select-cover-img" src={path} onclick={()=>{this.clickCover(path)}} />);
    });
    return list;
  }

  public setCover(cover:string){
    this.dataCover = cover;
  }

  public getCover(){
    return this.dataCover ?this.dataCover: '';
  }

  private clickCover(path: string) {
    if (!path) {
      return;
    }
    this.dataCover = path;
    this.$emit('select', {cover: path});

    this.showRemoteCover = false;
  }

  private showRemoteCoverOverLay() {
    this.showRemoteCover = true;
  }

  private hideRemoteCoverOverLay() {
    this.showRemoteCover = false;
  }
}
