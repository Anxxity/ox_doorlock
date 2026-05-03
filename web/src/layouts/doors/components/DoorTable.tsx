import {
  Accordion,
  ActionIcon,
  Center,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton,
  Button,
} from '@mantine/core';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import {
  TbChevronDown,
  TbChevronUp,
  TbEdit,
  TbFolder,
  TbSearch,
  TbSelector,
} from 'react-icons/tb';
import { useSearch, type AdvancedSearchFilters } from '../../../store/search';
import { useDoors, type DoorColumn } from '../../../store/doors';
import ActionsMenu from './ActionsMenu';
import {
  UNGROUPED_FOLDER_KEY,
  folderKeyFromDoor,
  folderListTitle,
} from '../../../utils/doorFolders';
import { renameFolderGroupOnServer } from '../../../utils/persistDoor';
import { fetchNui } from '../../../utils/fetchNui';

function matchesQuickSearch(door: DoorColumn, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  const parts = [door.name, door.zone, door.folder, String(door.id)].map((x) =>
    (x == null ? '' : String(x)).toLowerCase()
  );
  return parts.some((p) => p.includes(s));
}

function matchesAdvanced(door: DoorColumn, a: AdvancedSearchFilters): boolean {
  if (a.name && !(door.name || '').toLowerCase().includes(a.name.toLowerCase())) return false;
  if (a.zone && !(door.zone || '').toLowerCase().includes(a.zone.toLowerCase())) return false;
  if (a.folder && !(door.folder || '').toLowerCase().includes(a.folder.toLowerCase())) return false;
  if (a.id.trim() && !String(door.id).includes(a.id.trim())) return false;
  if (a.group) {
    const needle = a.group.toLowerCase();
    const g = door.groups || {};
    if (!Object.keys(g).some((k) => k.toLowerCase().includes(needle))) return false;
  }
  return true;
}

/** Stable Accordion value; avoids clashing with a real folder named `__ungrouped__`. */
function accordionItemValue(folderGroupKey: string): string {
  return folderGroupKey === UNGROUPED_FOLDER_KEY ? '__ungrouped__' : `folder:${folderGroupKey}`;
}

const columns: ColumnDef<DoorColumn>[] = [
  {
    id: 'id',
    header: 'ID',
    accessorKey: 'id',
    cell: (info) => info.getValue(),
    enableHiding: false,
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cell: (info) => info.getValue(),
    enableHiding: false,
  },
  {
    id: 'zone',
    header: 'Zone',
    accessorKey: 'zone',
    cell: (info) => info.getValue(),
    enableHiding: false,
  },
  {
    id: 'options-menu',
    cell: (data) => <ActionsMenu data={data} />,
  },
];

const GroupTable: React.FC<{ rows: DoorColumn[] }> = ({ rows }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table verticalSpacing="xs" fontSize="sm">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                <UnstyledButton onClick={header.column.getToggleSortingHandler()}>
                  <Group spacing={6} noWrap>
                    <Text size="sm" weight={500}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Text>
                    {header.column.getIsSorted() === 'desc' ? (
                      <TbChevronDown size={14} />
                    ) : header.column.getIsSorted() === 'asc' ? (
                      <TbChevronUp size={14} />
                    ) : !header.column.getCanHide() ? (
                      <TbSelector size={14} />
                    ) : null}
                  </Group>
                </UnstyledButton>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const DoorTable: React.FC = () => {
  const quickFilter = useSearch((state) => state.debouncedValue);
  const advanced = useSearch((state) => state.advanced);
  const data = useDoors((state) => state.doors);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameKey, setRenameKey] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  useEffect(() => {
    if (renameOpen && renameKey !== null) {
      setRenameDraft(renameKey);
    }
  }, [renameOpen, renameKey]);

  const filteredDoors = useMemo(() => {
    return data.filter(
      (door) => matchesQuickSearch(door, quickFilter) && matchesAdvanced(door, advanced)
    );
  }, [data, quickFilter, advanced]);

  const grouped = useMemo(() => {
    const map: Record<string, DoorColumn[]> = {};
    for (const door of filteredDoors) {
      const k = folderKeyFromDoor(door);
      if (!map[k]) map[k] = [];
      map[k].push(door);
    }
    const entries = Object.entries(map);
    entries.sort(([a], [b]) => {
      const aUn = a === UNGROUPED_FOLDER_KEY;
      const bUn = b === UNGROUPED_FOLDER_KEY;
      if (aUn && !bUn) return 1;
      if (!aUn && bUn) return -1;
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
    return entries;
  }, [filteredDoors]);

  const defaultOpen = useMemo(
    () => grouped.map(([key]) => accordionItemValue(key)),
    [grouped]
  );

  const accordionResetKey = useMemo(
    () =>
      [...filteredDoors]
        .sort((a, b) => a.id - b.id)
        .map((d) => d.id)
        .join(','),
    [filteredDoors]
  );

  const startRename = (key: string) => {
    setRenameKey(key);
    setRenameOpen(true);
  };

  const confirmRename = async () => {
    if (renameKey === null) {
      setRenameOpen(false);
      return;
    }
    const next = renameDraft.trim();
    if (next === renameKey) {
      setRenameOpen(false);
      return;
    }
    await renameFolderGroupOnServer(renameKey, renameDraft, data);
    await fetchNui('notify', 'Folder updated');
    setRenameOpen(false);
    setRenameKey(null);
  };

  return (
    <>
      <ScrollArea sx={{ flex: 1, minHeight: 0, width: '100%' }} type="auto" offsetScrollbars>
        <Stack spacing="sm" sx={{ padding: '0 16px 16px' }}>
          {filteredDoors.length > 0 ? (
            <Accordion
              multiple
              variant="separated"
              radius="sm"
              defaultValue={defaultOpen}
              key={accordionResetKey}
            >
              {grouped.map(([key, rows]) => {
                const itemValue = accordionItemValue(key);
                return (
                  <Accordion.Item value={itemValue} key={itemValue}>
                    <Accordion.Control icon={<TbFolder size={18} />}>
                      <Group position="apart" pr="xs" sx={{ flex: 1 }} noWrap>
                        <Text weight={600}>{folderListTitle(key)}</Text>
                        <Group spacing={6} noWrap>
                          <Text size="sm" color="dimmed">
                            {rows.length} door{rows.length === 1 ? '' : 's'}
                          </Text>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="gray"
                            aria-label="Rename folder"
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(key);
                            }}
                          >
                            <TbEdit size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel sx={{ padding: 0 }}>
                      <GroupTable rows={rows} />
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          ) : (
            <Center sx={{ minHeight: 220 }}>
              <Stack align="center" spacing="sm">
                <TbSearch size={48} />
                <Text size="lg">No doors match your search</Text>
                <Text size="sm" color="dimmed" align="center" maw={320}>
                  Try the search bar, open Advanced search for filters, or set a List folder on a door in settings.
                </Text>
              </Stack>
            </Center>
          )}
        </Stack>
      </ScrollArea>

      <Modal
        opened={renameOpen}
        onClose={() => {
          setRenameOpen(false);
          setRenameKey(null);
        }}
        title="Rename folder"
        centered
        size="sm"
      >
        <Stack spacing="md">
          <Text size="sm" color="dimmed">
            Updates every door in this group. Leave the name empty to move a named folder into Ungrouped. For a single
            door, use ⋮ → Move to folder.
          </Text>
          <TextInput
            label="Folder name"
            placeholder={renameKey === UNGROUPED_FOLDER_KEY ? 'e.g. police' : 'New name, or empty for Ungrouped'}
            value={renameDraft}
            onChange={(e) => setRenameDraft(e.target.value)}
            autoFocus
          />
          <Group position="right">
            <Button
              variant="default"
              onClick={() => {
                setRenameOpen(false);
                setRenameKey(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                void confirmRename();
              }}
            >
              Rename all
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default DoorTable;
