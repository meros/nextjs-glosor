import VocabularyTest from '@/app/components/VocabularyTest';
import '@/app/globals.css';
import { action } from '@storybook/addon-actions';
import { Meta, StoryFn } from '@storybook/react';

export default {
  title: 'Components/VocabularyTest',
  component: VocabularyTest,
  argTypes: {
    data: {
      fromLanguage: { control: 'text' },
      toLanguage: { control: 'text' },
      fromVocabulary: { control: 'text' },
      toVocabulary: { control: 'text' },
    },
  },
} as Meta<typeof VocabularyTest>;

const Template: StoryFn<typeof VocabularyTest> = ({ data, onHandlers }) => (
  <VocabularyTest data={data} onHandlers={onHandlers} />
);

export const Default = Template.bind({});
Default.args = {
  data: {
    fromLanguage: 'en',
    toLanguage: 'se',
    fromVocabulary: 'House',
    userInput: 'Hus',
  },
  onHandlers: {
    onCheckAnswer: action('onCheckAnswer'),
    setUserInput: action('setUserInput'),
  },
};
