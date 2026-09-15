export interface HistoryItem {
  courseId: string;
  partId: string;
  title: string;
  timestamp: number;
}

const HISTORY_KEY = 'cppgamedev_history';
const BOOKMARKS_KEY = 'cppgamedev_bookmarks';
const MAX_HISTORY_ITEMS = 10;

// 读取本地存储里的列表。数据被改坏（不是数组、条目缺字段）时按空列表处理，
// 否则后续的 filter / some 调用会让页面崩溃。
const readList = (key: string): HistoryItem[] => {
  const json = localStorage.getItem(key);
  if (!json) return [];
  const value: unknown = JSON.parse(json);
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item: any): item is HistoryItem =>
      !!item && typeof item.courseId === 'string' && typeof item.partId === 'string'
  );
};

// Reading History
export const saveReadingProgress = (courseId: string, partId: string, title: string) => {
  try {
    let history = readList(HISTORY_KEY);

    // Remove existing entry for this chapter if it exists (to move it to top)
    history = history.filter(item => !(item.courseId === courseId && item.partId === partId));

    // Add new entry
    history.unshift({
      courseId,
      partId,
      title,
      timestamp: Date.now()
    });

    // Limit size
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save reading history', e);
  }
};

export const getReadingHistory = (): HistoryItem[] => {
  try {
    return readList(HISTORY_KEY);
  } catch (e) {
    console.warn('Failed to get reading history', e);
    return [];
  }
};

// Bookmarks
export const toggleBookmark = (courseId: string, partId: string, title: string) => {
  try {
    const bookmarks = readList(BOOKMARKS_KEY);

    const existingIndex = bookmarks.findIndex(item => item.courseId === courseId && item.partId === partId);

    if (existingIndex > -1) {
      // Remove
      bookmarks.splice(existingIndex, 1);
    } else {
      // Add
      bookmarks.unshift({
        courseId,
        partId,
        title,
        timestamp: Date.now()
      });
    }

    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return existingIndex === -1; // returns true if added, false if removed
  } catch (e) {
    console.warn('Failed to toggle bookmark', e);
    return false;
  }
};

export const getBookmarks = (): HistoryItem[] => {
  try {
    return readList(BOOKMARKS_KEY);
  } catch (e) {
    console.warn('Failed to get bookmarks', e);
    return [];
  }
};

export const isBookmarked = (courseId: string, partId: string): boolean => {
  try {
    const bookmarks = getBookmarks();
    return bookmarks.some(item => item.courseId === courseId && item.partId === partId);
  } catch (e) {
    return false;
  }
};
