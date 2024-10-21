'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import GlossaryEditor, { GlossaryEditorProps, GlossaryItem } from '../components/GlossaryEditor';
import { useGlossary } from '../context/GlossaryContext';

export default function EditPage() {
  const glossaryContext = useGlossary();

  const [newGlossary, setNewGlossary] = useState<GlossaryItem>({ a: '', b: '' });

  const data = {
    glossary: glossaryContext.glossary,
    newGlossary,
  } satisfies GlossaryEditorProps['data'];

  const onHandlers = {
    setGlossary: glossaryContext.setGlossary,
    setNewGlossary,
  } satisfies GlossaryEditorProps['onHandlers'];

  const router = useRouter();

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="bg-white rounded-lg w-full max-w-4xl ">
        <header className="text-black text-2xl p-6 font-bold py-4 w-full">Lägg till glosor</header>
        <GlossaryEditor data={data} onHandlers={onHandlers} />
      </div>
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
        <div className="flex justify-center">
          <button
            className="bg-blue-500 text-white text-lg font-bold py-3 px-6 rounded hover:bg-blue-700"
            onClick={() => {
              router.push('/train');
            }}
          >
            Träna glosor
          </button>
        </div>
      </footer>
    </div>
  );
}
