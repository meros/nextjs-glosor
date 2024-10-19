"use client"

import { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa"; // Import the plus and trash icons from react-icons

interface GlossaryItem {
  a: string;
  b: string;
}

const languages = [
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
];

export default function Home() {
  const [glossary, setGlossary] = useState<GlossaryItem[]>([
    { a: "Hus", b: "House" },
    { a: "Bil", b: "Car" },
    // Add more initial terms and definitions as needed
  ]);
  const [newTerm, setNewTerm] = useState<string>("");
  const [newDefinition, setNewDefinition] = useState<string>("");
  const [fromLanguage, setFromLanguage] = useState<string>("en");
  const [toLanguage, setToLanguage] = useState<string>("sv");

  const addGlossaryItem = () => {
    if (newTerm && newDefinition) {
      setGlossary([...glossary, { a: newTerm, b: newDefinition }]);
      setNewTerm("");
      setNewDefinition("");
    }
  };

  const updateGlossaryItem = (index: number, field: 'a' | 'b', value: string) => {
    const updatedGlossary = [...glossary];
    updatedGlossary[index][field] = value;
    setGlossary(updatedGlossary);
  };

  const deleteGlossaryItem = (index: number) => {
    setGlossary(glossary.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Lägg in glosor</h1>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <select
                  value={fromLanguage}
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
                  value={toLanguage}
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
                Åtgärder
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {glossary.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <input
                    type="text"
                    value={item.a}
                    onChange={(e) => updateGlossaryItem(index, 'a', e.target.value)}
                    className="border p-2 w-full"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="text"
                    value={item.b}
                    onChange={(e) => updateGlossaryItem(index, 'b', e.target.value)}
                    className="border p-2 w-full"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button onClick={() => deleteGlossaryItem(index)} className="text-red-500 hover:text-red-700">
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
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  className="border p-2 w-full"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <input
                  type="text"
                  placeholder="Ny definition"
                  value={newDefinition}
                  onChange={(e) => setNewDefinition(e.target.value)}
                  className="border p-2 w-full"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button onClick={addGlossaryItem} className="text-green-500 hover:text-green-700">
                  <FaPlus />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}