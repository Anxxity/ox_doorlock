import { Button, Collapse, Grid, Group, TextInput } from '@mantine/core';
import { TbFilterOff } from 'react-icons/tb';
import { useSearch } from '../../../store/search';

const AdvancedSearch: React.FC = () => {
  const advancedOpen = useSearch((s) => s.advancedOpen);
  const advanced = useSearch((s) => s.advanced);
  const setAdvancedField = useSearch((s) => s.setAdvancedField);
  const resetAdvanced = useSearch((s) => s.resetAdvanced);

  return (
    <Collapse in={advancedOpen}>
      <Grid gutter="xs" sx={{ paddingTop: 8 }}>
        <Grid.Col span={6}>
          <TextInput
            label="Name contains"
            placeholder="Any door name"
            size="sm"
            value={advanced.name}
            onChange={(e) => setAdvancedField('name', e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Zone contains"
            placeholder="Map zone label"
            size="sm"
            value={advanced.zone}
            onChange={(e) => setAdvancedField('zone', e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Folder contains"
            placeholder="e.g. police"
            size="sm"
            value={advanced.folder}
            onChange={(e) => setAdvancedField('folder', e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Door ID"
            placeholder="Exact or partial id"
            size="sm"
            value={advanced.id}
            onChange={(e) => setAdvancedField('id', e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label="Job / group name contains"
            placeholder="Matches authorized group keys"
            size="sm"
            value={advanced.group}
            onChange={(e) => setAdvancedField('group', e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Group position="right">
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              leftIcon={<TbFilterOff size={16} />}
              onClick={() => resetAdvanced()}
            >
              Clear filters
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </Collapse>
  );
};

export default AdvancedSearch;
