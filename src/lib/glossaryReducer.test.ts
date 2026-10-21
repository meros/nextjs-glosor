import { describe, expect, it } from 'vitest';
import { ensureSelection, glossaryReducer, GlossaryState } from './glossaryReducer';
import { createGlossary } from './glossary';

const empty: GlossaryState = { glossaries: [], selectedId: null, hydrated: true };

function withList(name = 'A'): { state: GlossaryState; id: string } {
  const state = glossaryReducer(empty, { type: 'create', name, id: 'g1' });
  return { state, id: 'g1' };
}

describe('glossaryReducer', () => {
  it('create adds a list and selects it', () => {
    const { state } = withList('  Veckans glosor ');
    expect(state.glossaries).toHaveLength(1);
    expect(state.glossaries[0].name).toBe('Veckans glosor');
    expect(state.selectedId).toBe('g1');
  });

  it('create ignores an empty name', () => {
    expect(glossaryReducer(empty, { type: 'create', name: '   ' })).toBe(empty);
  });

  it('rename changes only the chosen list and does not mutate', () => {
    const { state, id } = withList('A');
    const second = glossaryReducer(state, { type: 'create', name: 'B', id: 'g2' });
    const renamed = glossaryReducer(second, { type: 'rename', id, name: 'C' });
    expect(renamed.glossaries.map((g) => g.name)).toEqual(['C', 'B']);
    expect(second.glossaries[0].name).toBe('A');
  });

  it('rename ignores an empty name', () => {
    const { state, id } = withList('A');
    expect(glossaryReducer(state, { type: 'rename', id, name: ' ' })).toBe(state);
  });

  it('remove selects the first remaining list, and none when the last one goes', () => {
    const one = withList('A').state;
    const two = glossaryReducer(one, { type: 'create', name: 'B', id: 'g2' });
    const afterFirst = glossaryReducer(two, { type: 'remove', id: 'g2' });
    expect(afterFirst.selectedId).toBe('g1');
    const afterLast = glossaryReducer(afterFirst, { type: 'remove', id: 'g1' });
    expect(afterLast.glossaries).toEqual([]);
    expect(afterLast.selectedId).toBeNull();
  });

  it('removing an unselected list keeps the selection', () => {
    const two = glossaryReducer(withList('A').state, { type: 'create', name: 'B', id: 'g2' });
    const selectedA = glossaryReducer(two, { type: 'select', id: 'g1' });
    expect(glossaryReducer(selectedA, { type: 'remove', id: 'g2' }).selectedId).toBe('g1');
  });

  it('select ignores an unknown id', () => {
    const { state } = withList();
    expect(glossaryReducer(state, { type: 'select', id: 'nope' })).toBe(state);
  });

  it('setLanguages changes one side at a time', () => {
    const { state, id } = withList();
    const next = glossaryReducer(state, { type: 'setLanguages', id, toLanguage: 'de' });
    expect(next.glossaries[0]).toMatchObject({ fromLanguage: 'se', toLanguage: 'de' });
  });

  it('addWord trims, appends and skips incomplete pairs', () => {
    const { state, id } = withList();
    const added = glossaryReducer(state, { type: 'addWord', id, a: ' Hus ', b: 'Haus' });
    expect(added.glossaries[0].items).toMatchObject([{ a: 'Hus', b: 'Haus' }]);
    expect(glossaryReducer(added, { type: 'addWord', id, a: 'x', b: ' ' })).toBe(added);
  });

  it('updateWord and removeWord work by word id, not by position', () => {
    const { state, id } = withList();
    let next = glossaryReducer(state, { type: 'addWord', id, a: 'a', b: 'b' });
    next = glossaryReducer(next, { type: 'addWord', id, a: 'c', b: 'd' });
    const [first, second] = next.glossaries[0].items;
    next = glossaryReducer(next, { type: 'updateWord', id, wordId: second.id, field: 'b', value: 'D' });
    expect(next.glossaries[0].items[1].b).toBe('D');
    next = glossaryReducer(next, { type: 'removeWord', id, wordId: first.id });
    expect(next.glossaries[0].items).toHaveLength(1);
    expect(next.glossaries[0].items[0].id).toBe(second.id);
  });

  it('updateWord allows a temporarily empty field while editing', () => {
    const { state, id } = withList();
    const next = glossaryReducer(state, { type: 'addWord', id, a: 'a', b: 'b' });
    const wordId = next.glossaries[0].items[0].id;
    expect(
      glossaryReducer(next, { type: 'updateWord', id, wordId, field: 'a', value: '' }).glossaries[0].items[0].a,
    ).toBe('');
  });

  it('import adds a new list, and selects the existing one when the content is identical', () => {
    const incoming = { ...createGlossary('Delad'), items: [{ id: 'w', a: 'a', b: 'b' }] };
    const imported = glossaryReducer(empty, { type: 'import', glossary: incoming });
    expect(imported.glossaries).toHaveLength(1);
    const again = glossaryReducer(imported, { type: 'import', glossary: { ...incoming, id: 'different' } });
    expect(again.glossaries).toHaveLength(1);
    expect(again.selectedId).toBe(incoming.id);
  });

  it('hydrate marks the state as ready and repairs a dangling selection', () => {
    const glossary = createGlossary('A');
    const next = glossaryReducer(empty, {
      type: 'hydrate',
      state: { glossaries: [glossary], selectedId: 'gone' },
    });
    expect(next).toMatchObject({ hydrated: true, selectedId: glossary.id });
  });

  it('ensureSelection returns the same object when nothing needs repair', () => {
    expect(ensureSelection(empty)).toBe(empty);
  });
});
