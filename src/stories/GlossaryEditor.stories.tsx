import GlossaryEditor from '@/app/components/GlossaryEditor';
import '@/app/globals.css';
import { Meta, StoryFn } from '@storybook/react';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/GlossaryEditor',
  component: GlossaryEditor,
  argTypes: {
    data: {
      glossary: { control: 'object' },
      newGlossary: { control: 'object' },
      setGlossary: { action: 'setGlossary' },
      setNewGlossary: { action: 'setNewTerm' },
      setFromLanguage: { action: 'setFromLanguage' },
      setToLanguage: { action: 'setToLanguage' },
    },
  },
} as Meta<typeof GlossaryEditor>;

const Template: StoryFn<typeof GlossaryEditor> = ({ data, onHandlers }) => (
  <GlossaryEditor data={data} onHandlers={onHandlers} />
);

export const Default = Template.bind({});
Default.args = {
  data: {
    glossary: {
      name: 'English to Swedish',
      fromLanguage: 'en',
      toLanguage: 'se',
      items: [
        { a: 'Hus', b: 'House' },
        { a: 'Bil', b: 'Car' },
      ],
    },
    newGlossary: { a: '', b: '' },
  },
  onHandlers: {
    setGlossary: action('setGlossary'),
    setNewGlossary: action('setNewGlossary'),
  },
};
