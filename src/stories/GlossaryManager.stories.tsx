import GlossaryManager from '@/app/components/GlossaryManager';
import { Meta, StoryFn } from '@storybook/react';

export default {
  title: 'Components/GlossaryManager',
  component: GlossaryManager,
  argTypes: {
    glossaries: { control: 'object' },
    selectedGlossaryIdx: { control: 'number' },
    onSelectGlossary: { action: 'onSelectGlossary' },
    onAddGlossary: { action: 'onAddGlossary' },
    onDeleteGlossary: { action: 'onDeleteGlossary' },
    onRenameGlossary: { action: 'onRenameGlossary' },
  },
} as Meta<typeof GlossaryManager>;

const Template: StoryFn<typeof GlossaryManager> = ({
  glossaries,
  selectedGlossaryIdx,
  onSelectGlossary,
  onAddGlossary,
  onDeleteGlossary,
  onRenameGlossary,
}) => (
  <GlossaryManager
    glossaries={glossaries}
    selectedGlossaryIdx={selectedGlossaryIdx}
    onSelectGlossary={onSelectGlossary}
    onAddGlossary={onAddGlossary}
    onDeleteGlossary={onDeleteGlossary}
    onRenameGlossary={onRenameGlossary}
  />
);

export const Default = Template.bind({});
Default.args = {
  glossaries: [
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
  ],
  selectedGlossaryIdx: 0,
};
