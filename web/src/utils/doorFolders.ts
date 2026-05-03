/** Empty / missing folder groups doors under Ungrouped in the UI. */
export const UNGROUPED_FOLDER_KEY = '';

export function folderKeyFromDoor(door: { folder?: string | null }): string {
  const f = door.folder;
  if (f == null || f === '') return UNGROUPED_FOLDER_KEY;
  const t = String(f).trim();
  return t === '' ? UNGROUPED_FOLDER_KEY : t;
}

export function folderListTitle(key: string): string {
  return key === UNGROUPED_FOLDER_KEY ? 'Ungrouped' : key;
}
