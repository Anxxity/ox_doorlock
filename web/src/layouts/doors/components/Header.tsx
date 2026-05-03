import {
  ActionIcon,
  Box,
  Button,
  CloseButton,
  createStyles,
  Group,
  Stack,
  Tooltip,
} from '@mantine/core';
import { TbFilter, TbPlus } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useVisibility } from '../../../store/visibility';
import { fetchNui } from '../../../utils/fetchNui';
import Searchbar from './Search';
import AdvancedSearch from './AdvancedSearch';
import { useStore, defaultState } from '../../../store';
import { useSearch } from '../../../store/search';

const useStyles = createStyles({
  main: {
    padding: 16,
    paddingBottom: 8,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'nowrap',
  },
});

const Header: React.FC = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const setVisible = useVisibility((state) => state.setVisible);
  const advancedOpen = useSearch((s) => s.advancedOpen);
  const setAdvancedOpen = useSearch((s) => s.setAdvancedOpen);

  return (
    <Stack spacing={0} className={classes.main}>
      <Group position="apart" align="flex-start" spacing="sm" noWrap>
        <Group className={classes.row} sx={{ flex: 1, minWidth: 0 }}>
          <Tooltip label="Create a new door" transition="pop">
            <ActionIcon
              variant="light"
              color="blue"
              size="lg"
              onClick={() => {
                useStore.setState(defaultState, true);
                navigate('/settings/general');
              }}
            >
              <TbPlus size={20} />
            </ActionIcon>
          </Tooltip>
          <Box sx={{ flex: '1 1 220px', minWidth: 120 }}>
            <Searchbar />
          </Box>
          <Tooltip label={advancedOpen ? 'Hide advanced search' : 'Filter by folder, zone, group, and more'}>
            <Button
              variant={advancedOpen ? 'filled' : 'light'}
              color="blue"
              size="sm"
              leftIcon={<TbFilter size={18} />}
              onClick={() => setAdvancedOpen(!advancedOpen)}
              styles={{ root: { flexShrink: 0 } }}
            >
              Advanced
            </Button>
          </Tooltip>
        </Group>
        <CloseButton
          iconSize={20}
          size="lg"
          onClick={() => {
            setVisible(false);
            fetchNui('exit');
          }}
        />
      </Group>
      <AdvancedSearch />
    </Stack>
  );
};

export default Header;
