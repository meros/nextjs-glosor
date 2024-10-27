'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import GlossaryEditor, { Glossary, GlossaryEditorProps, GlossaryItem } from '../components/GlossaryEditor';
import { useGlossary } from '../context/GlossaryContext';
import GlossaryManager from '../components/GlossaryManager';

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
];

export default function EditPage() {
  const { setGlossary } = useGlossary();
  const router = useRouter();

  const [glossaries, setGlossaries] = useState<Glossary[]>(initialGlossaries);
  const [selectedGlossaryIdx, setSelectedGlossaryIdx] = useState(0);
  const [newGlossaryItem, setNewGlossaryItem] = useState<GlossaryItem>({ a: '', b: '' });

  useEffect(() => {
    setGlossary(glossaries[selectedGlossaryIdx]);
  }, [glossaries, selectedGlossaryIdx, setGlossary]);

  const addGlossary = useCallback(() => {
    setGlossaries((prev) => [
      ...prev,
      { name: `Glossary ${prev.length + 1}`, fromLanguage: 'se', toLanguage: 'en', items: [] },
    ]);
    setSelectedGlossaryIdx(glossaries.length);
  }, [glossaries.length]);

  const deleteGlossary = useCallback(() => {
    setGlossaries((prevGlossaries) => [
      ...prevGlossaries.filter((_, idx) => idx !== selectedGlossaryIdx),
      ...(prevGlossaries.length === 1 ? [{ name: 'Anonymous', fromLanguage: 'se', toLanguage: 'en', items: [] }] : []),
    ]);
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

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6">
        <header className="text-black text-2xl font-bold pb-4">Lägg till glosor</header>

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
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
        <div className="flex justify-center">
          <button
            className="bg-blue-500 text-white text-lg font-bold py-3 px-6 rounded hover:bg-blue-700"
            onClick={() => router.push('/train')}
          >
            Träna glosor
          </button>
        </div>
      </footer>
    </div>
  );
}
