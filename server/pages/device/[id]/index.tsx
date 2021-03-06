import { useRouter } from 'next/router';
import { useSWRAndRouterWithAuthRedirect } from '../../../ui/hooks/swr';
import Link from 'next/link';
import { Device as DbDevice } from '../../../db';
import { Header, Button, Heading, Main, Paragraph, Box } from 'grommet';
import { LinkPrevious, Configure } from 'grommet-icons';

type Device = DbDevice | null;

export default () => {
  const {
    query: { id },
  } = useRouter();

  const { data, error } = useSWRAndRouterWithAuthRedirect<Device>(`/api/device/${id}`, id ? undefined : null);

  if (error) return <div>failed to load</div>;
  if (data === undefined) return <div>loading...</div>;
  if (data === null) return <div>Device with id {id} not found</div>;

  return (
    <Box width={{ max: 'xlarge' }} margin="auto" pad={{ horizontal: 'medium' }}>
      <Box margin={{ top: 'large' }} direction="row">
        <Link href="/device">
          <Button icon={<LinkPrevious />} label="My devices" />
        </Link>
      </Box>
      <Header margin={{ top: 'small' }}>
        <Heading>Device: {data.name}</Heading>
      </Header>
      <Main>
        <Paragraph size="large">Device uid: {data.uid}</Paragraph>
        <Paragraph>
          <Link href="/device/[id]/configure" as={`/device/${data._id}/configure`}>
            <Button primary icon={<Configure />} label="Configure" />
          </Link>
        </Paragraph>
      </Main>
    </Box>
  );
};
