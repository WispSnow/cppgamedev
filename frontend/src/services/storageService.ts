export interface HistoryItem {
  courseId: string;
  partId: string;
  title: string;
  timestamp: number;
}

const HISTORY_KEY = 'cppgamedev_history';
const BOOKMARKS_KEY = 'cppgamedev_bookmarks';
const MAX_HISTORY_ITEMS = 10;

// Reading History
export const saveReadingProgress = (courseId: string, partId: string, title: string) => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    let history: HistoryItem[] = historyJson ? JSON.parse(historyJson) : [];

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
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (e) {
    console.warn('Failed to get reading history', e);
    return [];
  }
};

// Bookmarks
export const toggleBookmark = (courseId: string, partId: string, title: string) => {
  try {
    const bookmarksJson = localStorage.getItem(BOOKMARKS_KEY);
    let bookmarks: HistoryItem[] = bookmarksJson ? JSON.parse(bookmarksJson) : [];

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
    const bookmarksJson = localStorage.getItem(BOOKMARKS_KEY);
    return bookmarksJson ? JSON.parse(bookmarksJson) : [];
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
