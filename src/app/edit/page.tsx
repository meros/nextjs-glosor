'use client';

import { Button, Stack, Text, ActionIcon, Tooltip, Group, Select } from '@mantine/core';
import { IconShare } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import GlossaryEditor, { Glossary, GlossaryEditorProps, GlossaryItem } from '../components/GlossaryEditor';
import GlossaryManager from '../components/GlossaryManager';
import PageContent from '../components/PageContent';
import { useGlossary } from '../context/GlossaryContext';
import { useTraining } from '../context/TrainingContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

const initialGlossaries: Glossary[] = [
  {
    name: 'Easy German',
    fromLanguage: 'se',
    toLanguage: 'de',
    items: [
      { a: 'Hus', b: 'Haus' },
      { a: 'Bil', b: 'Auto' },
    ],
  },
  {
    name: 'Medium English',
    fromLanguage: 'se',
    toLanguage: 'en',
    items: [
      { a: 'Hund', b: 'Dog' },
      { a: 'Katt', b: 'Cat' },
    ],
  },
  {
    name: 'Svenska Bokstaveringsalfabetet',
    fromLanguage: 'sv',
    toLanguage: 'sv',
    items: [
      { a: 'a', b: 'Adam' },
      { a: 'b', b: 'Bertil' },
      { a: 'c', b: 'Cesar' },
      { a: 'd', b: 'David' },
      { a: 'e', b: 'Erik' },
      { a: 'f', b: 'Filip' },
      { a: 'g', b: 'Gustav' },
      { a: 'h', b: 'Helge' },
      { a: 'i', b: 'Ivar' },
      { a: 'j', b: 'Johan' },
      { a: 'k', b: 'Kalle' },
      { a: 'l', b: 'Ludvig' },
      { a: 'm', b: 'Martin' },
      { a: 'n', b: 'Niklas' },
      { a: 'o', b: 'Olof' },
      { a: 'p', b: 'Petter' },
      { a: 'q', b: 'Qvintus' },
      { a: 'r', b: 'Rudolf' },
      { a: 's', b: 'Sigurd' },
      { a: 't', b: 'Tore' },
      { a: 'u', b: 'Urban' },
      { a: 'v', b: 'Viktor' },
      { a: 'w', b: 'Wilhelm' },
      { a: 'x', b: 'Xerxes' },
      { a: 'y', b: 'Yngve' },
      { a: 'z', b: 'Zäta' },
      { a: 'å', b: 'Åke' },
      { a: 'ä', b: 'Ärlig' },
      { a: 'ö', b: 'Östen' },
    ],
  },
];

export default function EditPage() {
  const { setGlossary, glossary } = useGlossary();
  const { setItems } = useTraining();
  const router = useRouter();

  const [glossaries, setGlossaries] = useLocalStorage<Glossary[]>('glossaries', initialGlossaries);
  const [selectedGlossaryIdx, setSelectedGlossaryIdx] = useState(0);
  const [newGlossaryItem, setNewGlossaryItem] = useState<GlossaryItem>({ a: '', b: '' });
  const [direction, setDirection] = useState<'both' | 'forward' | 'backward'>('both');

  useEffect(() => {
    setGlossary(glossaries[selectedGlossaryIdx]);
  }, [glossaries, selectedGlossaryIdx, setGlossary]);

  const addGlossary = useCallback(
    (name: string) => {
      setGlossaries((prev) => [...prev, { name, fromLanguage: 'se', toLanguage: 'en', items: [] }]);
      setSelectedGlossaryIdx(glossaries.length);
    },
    [glossaries.length],
  );

  const deleteGlossary = useCallback(() => {
    setGlossaries((prevGlossaries) => prevGlossaries.filter((_, idx) => idx !== selectedGlossaryIdx));
    setSelectedGlossaryIdx(0);
  }, [selectedGlossaryIdx]);

  const renameGlossary = (name: string) => {
    setGlossaries((prevGlossaries) => {
      const updatedGlossaries = [...prevGlossaries];
      updatedGlossaries[selectedGlossaryIdx].name = name;
      return updatedGlossaries;
    });
  };

  const data: GlossaryEditorProps['data'] = {
    glossary: glossaries[selectedGlossaryIdx],
    newGlossary: newGlossaryItem,
  };

  const onHandlers: GlossaryEditorProps['onHandlers'] = useMemo(
    () => ({
      setGlossary: (updatedGlossary) => {
        setGlossaries((prevGlossaries) => {
          const updatedGlossaries = [...prevGlossaries];
          updatedGlossaries[selectedGlossaryIdx] = updatedGlossary;
          return updatedGlossaries;
        });
      },
      setNewGlossary: setNewGlossaryItem,
    }),
    [selectedGlossaryIdx],
  );

  const setTrainingItemsAndNavigate = () => {
    let trainingItems = [];

    if (direction === 'both') {
      trainingItems = glossary.items.flatMap((item) => [
        {
          from: item.a,
          to: item.b,
          correct: 0,
          total: 0,
          lastReviewed: Date.now(),
          confidence: 0,
          fromLanguage: glossary.fromLanguage,
          toLanguage: glossary.toLanguage,
        },
        {
          from: item.b,
          to: item.a,
          correct: 0,
          total: 0,
          lastReviewed: Date.now(),
          confidence: 0,
          fromLanguage: glossary.toLanguage,
          toLanguage: glossary.fromLanguage,
        },
      ]);
    } else if (direction === 'forward') {
      trainingItems = glossary.items.map((item) => ({
        from: item.a,
        to: item.b,
        correct: 0,
        total: 0,
        lastReviewed: Date.now(),
        confidence: 0,
        fromLanguage: glossary.fromLanguage,
        toLanguage: glossary.toLanguage,
      }));
    } else if (direction === 'backward') {
      trainingItems = glossary.items.map((item) => ({
        from: item.b,
        to: item.a,
        correct: 0,
        total: 0,
        lastReviewed: Date.now(),
        confidence: 0,
        fromLanguage: glossary.toLanguage,
        toLanguage: glossary.fromLanguage,
      }));
    }

    setItems(trainingItems);
    router.push('/train');
  };

  const handleShare = () => {
    const shareData = {
      name: glossary.name,
      fromLanguage: glossary.fromLanguage,
      toLanguage: glossary.toLanguage,
      items: glossary.items,
    };

    const encoded = btoa(JSON.stringify(shareData));
    const url = `${window.location.origin}/train?share=${encoded}`;

    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      // You might want to add a toast notification here
      alert('Share link copied to clipboard!');
    });
  };

  return (
    <PageContent>
      <Stack>
        <Group justify="space-between">
          <Text size="xl">Ändra glosor</Text>
          <Tooltip label="Share">
            <ActionIcon onClick={handleShare} variant="light" color="blue" size="lg">
              <IconShare size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Glossary Management */}
        <GlossaryManager
          glossaries={glossaries}
          selectedGlossaryIdx={selectedGlossaryIdx}
          onSelectGlossary={setSelectedGlossaryIdx}
          onAddGlossary={addGlossary}
          onDeleteGlossary={deleteGlossary}
          onRenameGlossary={renameGlossary}
        />

        {/* Glossary Editing */}
        <GlossaryEditor data={data} onHandlers={onHandlers} />

        <Select
          label="Övningsriktning"
          value={direction}
          onChange={(value) => setDirection(value as 'both' | 'forward' | 'backward')}
          data={[
            { value: 'both', label: 'Båda riktningarna' },
            { value: 'forward', label: 'Från språk A till språk B' },
            { value: 'backward', label: 'Från språk B till språk A' },
          ]}
        />

        <Button size="lg" onClick={setTrainingItemsAndNavigate} variant="filled" color="blue">
          Träna glosor
        </Button>
      </Stack>
    </PageContent>
  );
}
