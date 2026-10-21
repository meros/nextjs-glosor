'use client';

import { ActionIcon, Button, Group, Menu, Modal, Select, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDotsVertical, IconPencil, IconPlus, IconShare, IconTrash } from '@tabler/icons-react';
import { FormEvent, useState } from 'react';
import { sv } from '@/i18n/sv';
import { Glossary } from '@/lib/glossary';
import { GlossaryAction } from '@/lib/glossaryReducer';
import { shareUrl } from '@/lib/share';

interface GlossaryPickerProps {
  glossaries: Glossary[];
  selected: Glossary | null;
  dispatch: (action: GlossaryAction) => void;
}

type Dialog = 'create' | 'rename' | 'delete' | null;

export async function shareGlossary(glossary: Glossary): Promise<void> {
  const url = shareUrl(window.location.origin, glossary);
  const isTouch = window.matchMedia?.('(pointer: coarse)').matches;
  try {
    if (isTouch && typeof navigator.share === 'function') {
      await navigator.share({ title: sv.lists.shareTitle(glossary.name), url });
      return;
    }
    await navigator.clipboard.writeText(url);
    notifications.show({ message: sv.lists.shareCopied, color: 'teal', autoClose: 3000 });
  } catch (error) {
    // The user closing the share sheet is not an error.
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }
    notifications.show({ message: sv.lists.shareFailed, color: 'red' });
  }
}

export default function GlossaryPicker({ glossaries, selected, dispatch }: GlossaryPickerProps) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [name, setName] = useState('');

  const open = (next: Exclude<Dialog, null>) => {
    setName(next === 'rename' ? (selected?.name ?? '') : '');
    setDialog(next);
  };
  const close = () => setDialog(null);

  const nameTaken = glossaries.some(
    (glossary) => glossary.name.toLowerCase() === name.trim().toLowerCase() && glossary.id !== selected?.id,
  );
  const canSubmit = name.trim() !== '' && !(dialog === 'create' && nameTaken);

  const submitName = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    if (dialog === 'create') {
      dispatch({ type: 'create', name });
    } else if (dialog === 'rename' && selected) {
      dispatch({ type: 'rename', id: selected.id, name });
    }
    close();
  };

  return (
    <>
      <Group gap="xs" align="flex-end" wrap="nowrap">
        {glossaries.length > 0 && (
          <Select
            style={{ flex: 1, minWidth: 0 }}
            label={sv.lists.pickList}
            value={selected?.id ?? null}
            data={glossaries.map((glossary) => ({ value: glossary.id, label: glossary.name }))}
            onChange={(value) => value && dispatch({ type: 'select', id: value })}
          />
        )}
        <Button variant="default" leftSection={<IconPlus size={18} />} onClick={() => open('create')}>
          {sv.lists.newList}
        </Button>
        {selected && (
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="default" size={42} aria-label={sv.lists.more}>
                <IconDotsVertical size={20} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconShare size={18} />} onClick={() => void shareGlossary(selected)}>
                {sv.lists.share}
              </Menu.Item>
              <Menu.Item leftSection={<IconPencil size={18} />} onClick={() => open('rename')}>
                {sv.lists.rename}
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={18} color="var(--mantine-color-red-7)" />}
                onClick={() => open('delete')}
              >
                {sv.lists.delete}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>

      <Modal
        opened={dialog === 'create' || dialog === 'rename'}
        onClose={close}
        closeButtonProps={{ 'aria-label': sv.lists.close }}
        title={dialog === 'rename' ? sv.lists.renameTitle : sv.lists.newList}
      >
        <form onSubmit={submitName}>
          <Stack>
            <TextInput
              label={sv.lists.listName}
              value={name}
              data-autofocus
              error={dialog === 'create' && nameTaken ? sv.lists.nameTaken : undefined}
              onChange={(event) => setName(event.currentTarget.value)}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={close}>
                {sv.lists.cancel}
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {dialog === 'rename' ? sv.lists.save : sv.lists.create}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={dialog === 'delete'}
        onClose={close}
        closeButtonProps={{ 'aria-label': sv.lists.close }}
        title={sv.lists.deleteTitle}
      >
        <Stack>
          <Text>{selected && sv.lists.deleteBody(selected.name, selected.items.length)}</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={close} data-autofocus>
              {sv.lists.cancel}
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (selected) {
                  dispatch({ type: 'remove', id: selected.id });
                }
                close();
              }}
            >
              {sv.lists.deleteConfirm}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
