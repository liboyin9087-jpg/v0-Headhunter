export interface MarqueeLine {
  id: string;
  text: string;
  direction: 'forward' | 'reverse';
}

export const marqueeLines: MarqueeLine[] = [
  {
    id: 'marquee-1',
    text: '徵才',
    direction: 'forward',
  },
  {
    id: 'marquee-2',
    text: '連結人才',
    direction: 'reverse',
  },
  {
    id: 'marquee-3',
    text: '成就未來',
    direction: 'forward',
  },
];
