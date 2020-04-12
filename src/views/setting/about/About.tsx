import {Vue,Component} from 'vue-property-decorator';
import './About.less';

@Component({})
export default class About extends Vue{


  private render(){

    return <div class="about">

      <div class="about-icon"/>
      <span class="about-title">VideoNote</span>
      <span class="about-version">当前版本：0.0.1</span>


      <div class="about-item">
        <div class="about-item-left mr-10">简介：</div>
        <span>目的是可以边看视频，边快速记录关键笔记。强烈使用Markdown语法。</span>
      </div>

      <div class="about-item">
        <div class="about-item-left mr-10">GitHub：</div>
        <span>https://github.com/lanxiaoha/videonote</span>
      </div>

      <div class="about-item">
        <div class="about-item-left mr-10">Mac推荐：</div>
        <span>腾讯的“JIETU”截图工具 和 “PicGo”免费图床应用。</span>
      </div>


    </div>
  }
}
