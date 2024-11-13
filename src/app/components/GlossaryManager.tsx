import { Button, Combobox, Group, InputBase, useCombobox } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Glossary } from '../components/GlossaryEditor';
import { useLocale } from '../hooks/useLocale';

interface GlossaryManagerProps {
  glossaries: Glossary[];
  selectedGlossaryIdx: number;
  onSelectGlossary: (index: number) => void;
  onAddGlossary: (name: string) => void;
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
  const locale = useLocale();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [data, setData] = useState(glossaries.map((g) => g.name));
  const [search, setSearch] = useState('');
  const [value, setValue] = useState(glossaries[selectedGlossaryIdx]?.name || '');

  useEffect(() => {
    setData(glossaries.map((g) => g.name));
    setValue(glossaries[selectedGlossaryIdx]?.name || '');
  }, [glossaries, selectedGlossaryIdx]);

  const exactOptionMatch = data.some((item) => item === search);
  const filteredOptions = exactOptionMatch
    ? data
    : data.filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()));

  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item} key={item}>
      📚 {item}
    </Combobox.Option>
  ));

  const handleOptionSubmit = (val: string) => {
    if (val === '$create') {
      onAddGlossary(search);
      setData((current) => [...current, search]);
      setValue(search);
      onSelectGlossary(data.length);
    } else if (val === '$rename') {
      onRenameGlossary(search);
      setData((current) => [...current.filter((item) => item !== value), search]);
      setValue(search);
    } else {
      const index = glossaries.findIndex((g) => g.name === val);
      if (index !== -1) {
        onSelectGlossary(index);
        setValue(val);
        setSearch(val);
      } else {
        onRenameGlossary(val);
      }
    }
    combobox.closeDropdown();
  };

  return (
    <Group>
      <Combobox store={combobox} onOptionSubmit={handleOptionSubmit}>
        <Combobox.Target>
          <InputBase
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              combobox.openDropdown();
              combobox.updateSelectedOptionIndex();
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => {
              combobox.closeDropdown();
              setSearch(value);
            }}
            placeholder={locale.edit.glossaries.select}
            rightSection={<Combobox.Chevron />}
            rightSectionPointerEvents="none"
          />
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>
            {options}
            {!exactOptionMatch && search.trim().length > 0 && selectedGlossaryIdx !== -1 && (
              <Combobox.Option value="$rename">
                ✏️ {locale.edit.glossaries.rename} <strong>{value}</strong> {locale.edit.glossaries.to}{' '}
                <strong>{search}</strong>
              </Combobox.Option>
            )}
            {!exactOptionMatch && search.trim().length > 0 && (
              <Combobox.Option value="$create">
                ✨ {locale.edit.glossaries.create} <strong>{search}</strong>
              </Combobox.Option>
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>

      <Button onClick={onDeleteGlossary} color="red">
        {locale.edit.glossaries.delete}
      </Button>
    </Group>
  );
}
