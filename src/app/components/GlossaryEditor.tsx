import { FaPlus, FaTrash } from 'react-icons/fa'; // Import the plus and trash icons from react-icons
import { languages } from '../constants';
import { useMemo } from 'react';

export interface Glossary {
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
    glossary: Glossary;
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

  const disableAddGlossaryButton = useMemo(() => !Boolean(newGlossary.a && newGlossary.b), [newGlossary]);

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

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <select
                value={glossary.fromLanguage}
                onChange={(e) => setFromLanguage(e.target.value)}
                className="border p-2"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <select
                value={glossary.toLanguage}
                onChange={(e) => setToLanguage(e.target.value)}
                className="border p-2"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              &nbsp;
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {glossary.items.map((item, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <input
                  type="text"
                  value={item.a}
                  onChange={(e) => updateGlossaryItem(index, 'a', e.target.value)}
                  className="border p-2 w-full"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <input
                  type="text"
                  value={item.b}
                  onChange={(e) => updateGlossaryItem(index, 'b', e.target.value)}
                  className="border p-2 w-full"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onClick={() => deleteGlossaryItem(index)} className="text-gray-500 hover:text-red-500">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              <input
                type="text"
                placeholder="Nytt ord"
                value={newGlossary.a}
                onChange={(e) => setNewGlossary({ ...newGlossary, a: e.target.value })}
                className="border p-2 w-full"
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <input
                type="text"
                placeholder="Ny definition"
                value={newGlossary.b}
                onChange={(e) => setNewGlossary({ ...newGlossary, b: e.target.value })}
                className="border p-2 w-full"
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button
                disabled={disableAddGlossaryButton}
                onClick={addGlossaryItem}
                className={`hover:text-green-500 ${disableAddGlossaryButton ? 'text-gray-300' : 'text-green-500'}`}
              >
                <FaPlus />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
