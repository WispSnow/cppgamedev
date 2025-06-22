import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// 视频类型
type VideoType = 'bilibili' | 'youtube';

// 样式组件
const VideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9宽高比 */
  height: 0;
  overflow: hidden;
  margin: 30px auto; /* 中央对齐 */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 100%; /* 让它自适应父容器宽度 */
  max-width: 960px; /* 默认最大宽度 */

  /* 当在videos-row中时的样式 */
  .videos-row & {
    margin: 0;
    max-width: 100%;
  }
`;

const Thumbnail = styled.div<{ thumbnailUrl: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.thumbnailUrl});
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
  
  &::after {
    content: '';
    width: 0;
    height: 0;
    border-top: 18px solid transparent;
    border-left: 30px solid white;
    border-bottom: 18px solid transparent;
    margin-left: 7px;
  }
`;

const VideoLabel = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
  }
`;

const PlatformLogo = styled.div<{ platform: VideoType }>`
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const IframeWrapper = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 16px;
  z-index: 10;
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid white;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 组件属性接口
interface VideoPlayerProps {
  videoId: string;
  platform: VideoType;
  page?: number;
  title?: string;
  thumbnailUrl?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  platform,
  page = 1,
  title = '点击播放视频',
  thumbnailUrl
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePlay = () => {
    setIsLoading(true);
    setIsPlaying(true);
  };
  
  useEffect(() => {
    if (isPlaying) {
      // 视频加载完成后隐藏加载动画
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying]);
  
  // 根据平台获取默认缩略图和嵌入URL
  const getVideoInfo = () => {
    switch (platform) {
      case 'bilibili':
        return {
          defaultThumbnail: `https://pic.rmb.bdstatic.com/bjh/52a33d9773b51fb7ede1e46d3af1b3bd.jpeg`,
          embedUrl: `//player.bilibili.com/player.html?bvid=${videoId}&page=${page}&danmaku=1&high_quality=1&as_wide=1&allowfullscreen=true`,
          platformName: '哔哩哔哩'
        };
      case 'youtube':
        return {
          defaultThumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`,
          platformName: 'YouTube'
        };
      default:
        return {
          defaultThumbnail: '',
          embedUrl: '',
          platformName: ''
        };
    }
  };
  
  const { defaultThumbnail, embedUrl, platformName } = getVideoInfo();
  const actualThumbnail = thumbnailUrl || defaultThumbnail;
  
  return (
    <VideoContainer>
      {!isPlaying ? (
        <Thumbnail 
          onClick={handlePlay} 
          thumbnailUrl={actualThumbnail}
        >
          <PlayButton />
          <VideoLabel>{title}</VideoLabel>
          <PlatformLogo platform={platform}>{platformName}</PlatformLogo>
        </Thumbnail>
      ) : (
        <>
          {isLoading && (
            <LoadingOverlay>
              <Spinner />
              <span>视频加载中...</span>
            </LoadingOverlay>
          )}
          <IframeWrapper 
            src={embedUrl}
            scrolling="no"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen={true}
            sandbox={platform === 'bilibili' ? 
              "allow-top-navigation allow-same-origin allow-forms allow-scripts allow-popups allow-presentation allow-orientation-lock" : 
              "allow-top-navigation allow-same-origin allow-forms allow-scripts allow-popups"}
            onLoad={() => setIsLoading(false)}
          />
        </>
      )}
    </VideoContainer>
  );
};

export default VideoPlayer;
