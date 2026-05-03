import { Box, Stack } from '@mantine/core';
import Header from './components/Header';
import DoorTable from './components/DoorTable';

const Doors: React.FC = () => {
  return (
    <Stack spacing={0} sx={{ height: '100%' }}>
      <Header />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <DoorTable />
      </Box>
    </Stack>
  );
};

export default Doors;
