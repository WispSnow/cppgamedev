<!-- 
视频嵌入模板
使用方法：
1. 复制下面的HTML代码到您的Markdown文件中
2. 替换B站视频的BV号和YouTube视频的ID
3. 如有必要，调整视频的其他参数

B站视频参数: bvid=您的BV号
YouTube视频参数: src="https://www.youtube.com/embed/您的视频ID"
-->

<link rel="stylesheet" href="/static/css/videoStyles.css" />

<div class="video-container">
  <div class="video-tabs">
    <a href="#bilibili" class="video-tab bilibili-tab">哔哩哔哩</a>
    <a href="#youtube" class="video-tab youtube-tab">YouTube</a>
  </div>

  <div id="youtube" class="video-content">
    <iframe 
      class="video-frame"
      src="https://www.youtube.com/embed/YOUR_YOUTUBE_VIDEO_ID" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  </div>

  <div id="bilibili" class="video-content">
    <iframe 
      class="video-frame"
      src="//player.bilibili.com/player.html?bvid=YOUR_BILIBILI_BV_ID&page=1&autoplay=0&danmaku=0&high_quality=1" 
      scrolling="no" 
      border="0" 
      frameborder="no" 
      framespacing="0" 
      allowfullscreen="true">
    </iframe>
  </div>
</div> 