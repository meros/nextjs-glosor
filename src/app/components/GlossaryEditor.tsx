import { ActionIcon, Select, Table, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useMemo, useRef } from 'react';
import { languages } from '../constants';
import { useLocale } from '../hooks/useLocale';

export interface Glossary {
  name: string;
  fromLanguage: string;
  toLanguage: string;
  items: GlossaryItem[];
}

export interface GlossaryItem {
  a: string;
  b: string;
}

export interface GlossaryEditorProps {
  data: {
    glossary: Glossary | null;
    newGlossary: GlossaryItem;
  };
  onHandlers: {
    setGlossary: (glossary: Glossary) => void;
    setNewGlossary: (glossary: GlossaryItem) => void;
  };
}

export default function GlossaryEditor({ data, onHandlers }: GlossaryEditorProps) {
  const { glossary, newGlossary } = data;
  const { setGlossary, setNewGlossary } = onHandlers;
  const locale = useLocale();

  const disableAddGlossaryButton = useMemo(() => !(newGlossary.a && newGlossary.b), [newGlossary]);
  const ref = useRef<HTMLInputElement>(null);

  // If no glossary is selected, show a message
  if (!glossary) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>No glossary selected. Please create a new glossary or select an existing one.</p>
      </div>
    );
  }

  const addGlossaryItem = () => {
    setGlossary({
      ...glossary,
      items: [...glossary.items, newGlossary],
    });
    setNewGlossary({ a: '', b: '' });
  };

  const updateGlossaryItem = (index: number, field: 'a' | 'b', value: string) => {
    setGlossary({
      ...glossary,
      items: glossary.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    });
  };

  const deleteGlossaryItem = (index: number) => {
    setGlossary({
      ...glossary,
      items: glossary.items.filter((_, i) => i !== index),
    });
  };

  const setFromLanguage = (value: string) => {
    setGlossary({ ...glossary, fromLanguage: value });
  };

  const setToLanguage = (value: string) => {
    setGlossary({ ...glossary, toLanguage: value });
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !disableAddGlossaryButton) {
      addGlossaryItem();
      ref.current?.focus();
    }
  };

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Select
              label={locale.edit.fromLanguage}
              value={glossary.fromLanguage}
              onChange={(value) => value && setFromLanguage(value)}
              data={languages.map((lang) => ({
                value: lang.code,
                label: `${lang.flag} ${lang.name}`,
              }))}
            />
          </Table.Th>
          <Table.Th>
            <Select
              label={locale.edit.toLanguage}
              value={glossary.toLanguage}
              onChange={(value) => value && setToLanguage(value)}
              data={languages.map((lang) => ({
                value: lang.code,
                label: `${lang.flag} ${lang.name}`,
              }))}
            />
          </Table.Th>
          <Table.Th>&nbsp;</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {glossary.items.map((item, index) => (
          <Table.Tr key={index}>
            <Table.Td>
              <TextInput value={item.a} onChange={(e) => updateGlossaryItem(index, 'a', e.target.value)} />
            </Table.Td>
            <Table.Td>
              <TextInput value={item.b} onChange={(e) => updateGlossaryItem(index, 'b', e.target.value)} />
            </Table.Td>
            <Table.Td>
              <ActionIcon onClick={() => deleteGlossaryItem(index)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Table.Td>
          </Table.Tr>
        ))}
        <Table.Tr>
          <Table.Td>
            <TextInput
              ref={ref}
              placeholder={locale.edit.wordPairs.from}
              value={newGlossary.a}
              onChange={(e) => setNewGlossary({ ...newGlossary, a: e.target.value })}
              onKeyPress={handleKeyPress}
            />
          </Table.Td>
          <Table.Td>
            <TextInput
              placeholder={locale.edit.wordPairs.to}
              value={newGlossary.b}
              onChange={(e) => setNewGlossary({ ...newGlossary, b: e.target.value })}
              onKeyPress={handleKeyPress}
            />
          </Table.Td>
          <Table.Td>
            <ActionIcon
              disabled={disableAddGlossaryButton}
              onClick={addGlossaryItem}
              color={disableAddGlossaryButton ? 'gray' : 'green'}
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    </Table>
  );
}
