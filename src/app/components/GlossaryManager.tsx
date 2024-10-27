import { Glossary } from '../components/GlossaryEditor';

interface GlossaryManagerProps {
  glossaries: Glossary[];
  selectedGlossaryIdx: number;
  onSelectGlossary: (index: number) => void;
  onAddGlossary: () => void;
  onDeleteGlossary: () => void;
  onRenameGlossary: (name: string) => void;
}

export default function GlossaryManager({
  glossaries,
  selectedGlossaryIdx,
  onSelectGlossary,
  onAddGlossary,
  onDeleteGlossary,
  onRenameGlossary,
}: GlossaryManagerProps) {
  return (
    <div className="flex items-center mb-4">
      {/* Dropdown to select or add glossary */}
      <select
        value={selectedGlossaryIdx}
        onChange={(e) => {
          if (e.target.value === 'add-new') {
            onAddGlossary();
            return;
          }

          onSelectGlossary(Number(e.target.value));
        }}
        className="border p-2 rounded mr-2 w-full max-w-xs"
      >
        {glossaries.map((glossary, idx) => (
          <option key={idx} value={idx}>
            {glossary.name}
          </option>
        ))}
        <option value="add-new">+ Add New Glossary</option>
      </select>

      {/* Input field for renaming the glossary */}
      <input
        type="text"
        value={glossaries[selectedGlossaryIdx].name}
        onChange={(e) => onRenameGlossary(e.target.value)}
        className="border p-2 rounded ml-2 w-full max-w-xs"
        placeholder="Glossary Name"
      />

      {/* Delete button */}
      <button
        onClick={onDeleteGlossary}
        className="bg-red-500 text-white px-4 py-2 rounded ml-2 hover:bg-red-700 disabled:bg-gray-300"
      >
        Delete
      </button>
    </div>
  );
}
