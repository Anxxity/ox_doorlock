import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Modal,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { TbDots, TbFolderSymlink, TbSettings, TbTrash } from 'react-icons/tb';
import { HiOutlineClipboardCopy } from 'react-icons/hi';
import { GiTeleport } from 'react-icons/gi';
import { DoorColumn } from '../../../store/doors';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store';
import { convertData } from '../../../utils/convertData';
import { useClipboard } from '../../../store/clipboard';
import { fetchNui } from '../../../utils/fetchNui';
import { openConfirmModal } from '@mantine/modals';
import { CellContext } from '@tanstack/react-table';
import { useVisibility } from '../../../store/visibility';
import { folderKeyFromDoor } from '../../../utils/doorFolders';
import { setDoorFolderOnServer } from '../../../utils/persistDoor';
import { useState } from 'react';

const ActionsMenu: React.FC<{ data: CellContext<DoorColumn, unknown> }> = ({ data }) => {
  const navigate = useNavigate();
  const setClipboard = useClipboard((state) => state.setClipboard);
  const setVisible = useVisibility((state) => state.setVisible);
  const door = data.row.original;
  const [moveOpened, { open: openMove, close: closeMove }] = useDisclosure(false);
  const [folderDraft, setFolderDraft] = useState('');

  const openMoveModal = () => {
    const key = folderKeyFromDoor(door);
    setFolderDraft(key === '' ? '' : String(door.folder ?? '').trim());
    openMove();
  };

  const confirmMove = async () => {
    const next = folderDraft.trim();
    await setDoorFolderOnServer(door, next === '' ? null : next);
    await fetchNui('notify', 'Door moved to folder');
    closeMove();
  };

  return (
    <>
      <Menu position="right-start" width={220} withinPortal zIndex={10000}>
        <Menu.Target>
          <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <Tooltip label="Door actions">
              <ActionIcon
                color="blue.4"
                variant="transparent"
                onClick={(e) => e.stopPropagation()}
              >
                <TbDots size={24} />
              </ActionIcon>
            </Tooltip>
          </div>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            icon={<TbSettings size={18} />}
            onClick={() => {
              useStore.setState(convertData(door), true);
              navigate('/settings/general');
            }}
          >
            Settings
          </Menu.Item>
          <Menu.Item
            icon={<TbFolderSymlink size={18} />}
            onClick={() => openMoveModal()}
          >
            Move to folder…
          </Menu.Item>
          <Menu.Item
            icon={<HiOutlineClipboardCopy size={18} />}
            onClick={() => {
              setClipboard(convertData(door));
              fetchNui('notify', 'Settings copied');
            }}
          >
            Copy settings
          </Menu.Item>
          <Menu.Item
            icon={<GiTeleport size={18} />}
            onClick={() => {
              setVisible(false);
              fetchNui('teleportToDoor', data.row.getValue('id'));
            }}
          >
            Teleport to door
          </Menu.Item>
          <Menu.Item
            color="red"
            icon={<TbTrash size={18} />}
            onClick={() =>
              openConfirmModal({
                title: 'Confirm deletion',
                centered: true,
                withCloseButton: false,
                children: (
                  <Text>
                    Are you sure you want to delete
                    <Text component="span" weight={700}>{` ${data.row.getValue('name')}`}</Text>?
                  </Text>
                ),
                labels: { confirm: 'Confirm', cancel: 'Cancel' },
                confirmProps: { color: 'red' },
                onConfirm: () => {
                  fetchNui('deleteDoor', data.row.getValue('id'));
                },
              })
            }
          >
            Delete door
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal opened={moveOpened} onClose={closeMove} title="Move to folder" centered size="sm">
        <Stack spacing="md">
          <TextInput
            label="List folder"
            description="Leave empty for Ungrouped. Matches the folder field in door settings."
            placeholder="e.g. police"
            value={folderDraft}
            onChange={(e) => setFolderDraft(e.target.value)}
            autoFocus
          />
          <Group position="right">
            <Button variant="default" onClick={closeMove}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                void confirmMove();
              }}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ActionsMenu;
