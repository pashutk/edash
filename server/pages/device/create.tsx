import { DeviceForm } from '../../ui/components/DeviceForm';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Header, Heading, Button, Box, Main } from 'grommet';
import { LinkPrevious } from 'grommet-icons';

export default () => {
  const router = useRouter();
  return (
    <Box width={{ max: 'xlarge' }} margin="auto" pad={{ horizontal: 'medium' }}>
      <Box margin={{ top: 'large' }} direction="row">
        <Link href="/device">
          <Button icon={<LinkPrevious />} label="My devices" />
        </Link>
      </Box>
      <Header margin={{ top: 'small' }}>
        <Heading>Create a new device</Heading>
      </Header>
      <Main>
        <DeviceForm
          onSubmit={(data) =>
            fetch('/api/device', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            }).then((res) => {
              if (res.ok) {
                router.push('/device');
              }
            })
          }
        />
      </Main>
    </Box>
  );
};
