export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface DifficultyInfo {
  label: string;
  color: string;
  bgColor: string;
}

export const getDifficultyInfo = (level: number): DifficultyInfo => {
  switch (level) {
    case 1:
      return { label: '入门级', color: '#2e7d32', bgColor: '#e8f5e9' }; // Green
    case 2:
      return { label: '初级', color: '#1565c0', bgColor: '#e3f2fd' };   // Blue
    case 3:
      return { label: '进阶级', color: '#00838f', bgColor: '#e0f7fa' }; // Cyan/Teal
    case 4:
      return { label: '中级', color: '#ef6c00', bgColor: '#fff3e0' };   // Orange
    case 5:
      return { label: '高级', color: '#c62828', bgColor: '#ffebee' };   // Red
    default:
      return { label: '未知', color: '#616161', bgColor: '#f5f5f5' };   // Grey
  }
};
