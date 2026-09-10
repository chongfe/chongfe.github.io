export interface Friend {
  name: string;
  url: string;
  description: string;
  avatar?: string; // 可选：本地图片路径或 HTTPS 图片地址，未填写时显示名字首字。
}

// 在数组内添加对象即可，卡片会自动生成。示例见 README。
export const friends: Friend[] = [];

// 单向收藏与已确认友链分开维护。
export const bookmarks: Friend[] = [
  { name: 'Yaossg’s Site', url: 'https://yaossg.com/site/', description: 'Blog & Docs · 本站的设计灵感来源' },
  { name: 'GitHub', url: 'https://github.com/', description: '探索开源项目，分享代码与想法' },
];
