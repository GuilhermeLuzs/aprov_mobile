type StockVideo = { id: string; file: string; cover: string; durationSeconds: number };

const VIDEO_FILES = 'https://videos.pexels.com/video-files';
const VIDEO_COVERS = 'https://images.pexels.com/videos';

const STOCK_VIDEOS: Record<string, StockVideo> = {
  'aprov-r01-v': { id: '10374892', file: '10374892-sd_540_960_24fps.mp4', cover: 'pexels-photo-10374892.jpeg', durationSeconds: 9 },
  'aprov-r03-v': { id: '853935', file: '853935-sd_960_540_25fps.mp4', cover: 'free-video-853935.jpg', durationSeconds: 12 },
  'aprov-p01-v': { id: '7252685', file: '7252685-sd_960_540_25fps.mp4', cover: 'pexels-photo-7252685.jpeg', durationSeconds: 11 },
  'aprov-r06-v': { id: '7047271', file: '7047271-sd_960_540_25fps.mp4', cover: 'pexels-photo-7047271.jpeg', durationSeconds: 22 },
  'aprov-p04-v': { id: '11503689', file: '11503689-sd_540_960_30fps.mp4', cover: 'design-fengshui-flower-green-11503689.jpeg', durationSeconds: 13 },
  'aprov-r12-v': { id: '6162079', file: '6162079-sd_960_540_30fps.mp4', cover: 'pexels-photo-6162079.jpeg', durationSeconds: 12 },
  'aprov-r14-v': { id: '11487648', file: '11487648-sd_540_960_25fps.mp4', cover: 'lasagne-alla-bolognese-11487648.jpeg', durationSeconds: 7 },
  'aprov-r19-v': { id: '6894121', file: '6894121-sd_960_540_25fps.mp4', cover: 'altruism-black-care-charity-6894121.jpeg', durationSeconds: 8 },
  'aprov-r21-v': { id: '6801666', file: '6801666-sd_540_960_30fps.mp4', cover: '4k-4k-resolution-4k-video-aromatherapy-6801666.jpeg', durationSeconds: 9 },
  'aprov-r22-v': { id: '8131891', file: '8131891-sd_506_960_25fps.mp4', cover: 'pexels-photo-8131891.jpeg', durationSeconds: 26 },
  'aprov-r26-v': { id: '12322654', file: '12322654-sd_540_960_30fps.mp4', cover: 'adult-beautiful-brunette-cute-12322654.jpeg', durationSeconds: 10 },
  'aprov-r30-v': { id: '7614406', file: '7614406-sd_960_540_30fps.mp4', cover: 'pexels-photo-7614406.jpeg', durationSeconds: 13 },
  'aprov-p16-v': { id: '7239160', file: '7239160-sd_960_540_25fps.mp4', cover: 'apartment-chair-comfort-contemporary-7239160.jpeg', durationSeconds: 19 },
  'aprov-p25-v': { id: '6132710', file: '6132710-sd_540_960_25fps.mp4', cover: 'pexels-photo-6132710.jpeg', durationSeconds: 14 },
  'aprov-p30-v': { id: '5848304', file: '5848304-sd_960_540_24fps.mp4', cover: 'pexels-photo-5848304.jpeg', durationSeconds: 12 },
};

export function stockVideo(key: string, coverWidth: number, coverHeight: number) {
  const { id, file, cover, durationSeconds } = STOCK_VIDEOS[key];
  return {
    uri: `${VIDEO_FILES}/${id}/${file}`,
    thumbnailUri: `${VIDEO_COVERS}/${id}/${cover}?auto=compress&cs=tinysrgb&w=${coverWidth}&h=${coverHeight}&fit=crop`,
    durationSeconds,
  };
}
