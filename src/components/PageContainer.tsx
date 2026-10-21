import { Container, ContainerProps } from '@mantine/core';

/** One width and one set of gutters for every page. */
export default function PageContainer(props: ContainerProps) {
  return <Container size="sm" px="md" pt="md" pb="xl" {...props} />;
}
