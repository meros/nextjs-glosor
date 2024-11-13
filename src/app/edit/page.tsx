'use client';

import { Button, Stack, Text } from '@mantine/core';
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
    const trainingItems = glossary.items.flatMap((item) => [
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

    setItems(trainingItems);
    router.push('/train');
  };

  return (
    <PageContent>
      <Stack>
        <Text size="xl">Ändra glosor</Text>

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

        <Button size="lg" onClick={setTrainingItemsAndNavigate} variant="filled" color="blue">
          Träna glosor
        </Button>
      </Stack>
    </PageContent>
  );
}
