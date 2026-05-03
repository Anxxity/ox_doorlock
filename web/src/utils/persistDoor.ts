import type { DoorColumn } from '../store/doors';
import { fetchNui } from './fetchNui';
import { folderKeyFromDoor } from './doorFolders';

export function normalizeFolderForSave(folder: string | null | undefined): string | null {
  if (folder == null || folder === '') return null;
  const t = String(folder).trim();
  return t === '' ? null : t;
}

/** Update an existing door on the server without closing NUI focus. */
export async function saveDoorToServer(door: DoorColumn): Promise<void> {
  await fetchNui('saveDoor', door);
}

export async function setDoorFolderOnServer(door: DoorColumn, folder: string | null): Promise<void> {
  await saveDoorToServer({
    ...door,
    folder: normalizeFolderForSave(folder),
  });
}

/** Rename or reassign every door in a list group. `oldKey` '' = Ungrouped. Empty `newName` moves doors to Ungrouped. */
export async function renameFolderGroupOnServer(
  oldKey: string,
  newName: string,
  allDoors: DoorColumn[]
): Promise<void> {
  const trimmed = newName.trim();
  const targets = allDoors.filter((d) => folderKeyFromDoor(d) === oldKey);
  if (targets.length === 0) return;

  const sameLabel = oldKey === trimmed;
  if (sameLabel) return;

  const newFolder = trimmed === '' ? null : trimmed;
  for (const d of targets) {
    await setDoorFolderOnServer(d, newFolder);
  }
}
