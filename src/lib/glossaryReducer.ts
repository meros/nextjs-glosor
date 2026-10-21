import { createGlossary, Glossary, isCompletePair, newId, sameContent } from './glossary';

export interface GlossaryState {
  glossaries: Glossary[];
  selectedId: string | null;
  /** False until the saved lists are read, so server and first client render match. */
  hydrated: boolean;
}

export type GlossaryAction =
  | { type: 'create'; name: string; id?: string }
  | { type: 'rename'; id: string; name: string }
  | { type: 'remove'; id: string }
  | { type: 'select'; id: string }
  | { type: 'setLanguages'; id: string; fromLanguage?: string; toLanguage?: string }
  | { type: 'addWord'; id: string; a: string; b: string }
  | { type: 'updateWord'; id: string; wordId: string; field: 'a' | 'b'; value: string }
  | { type: 'removeWord'; id: string; wordId: string }
  | { type: 'import'; glossary: Glossary }
  | { type: 'hydrate'; state: Omit<GlossaryState, 'hydrated'> };

function mapGlossary(state: GlossaryState, id: string, change: (glossary: Glossary) => Glossary): GlossaryState {
  return {
    ...state,
    glossaries: state.glossaries.map((glossary) => (glossary.id === id ? change(glossary) : glossary)),
  };
}

/** The selection must always point at an existing list, or at none when there are no lists. */
export function ensureSelection(state: GlossaryState): GlossaryState {
  if (state.glossaries.length === 0) {
    return state.selectedId === null ? state : { ...state, selectedId: null };
  }
  if (state.glossaries.some((glossary) => glossary.id === state.selectedId)) {
    return state;
  }
  return { ...state, selectedId: state.glossaries[0].id };
}

export function glossaryReducer(state: GlossaryState, action: GlossaryAction): GlossaryState {
  switch (action.type) {
    case 'hydrate':
      return ensureSelection({ ...action.state, hydrated: true });
    case 'create': {
      const name = action.name.trim();
      if (name === '') {
        return state;
      }
      const glossary = { ...createGlossary(name), id: action.id ?? newId() };
      return { ...state, glossaries: [...state.glossaries, glossary], selectedId: glossary.id };
    }
    case 'rename': {
      const name = action.name.trim();
      return name === '' ? state : mapGlossary(state, action.id, (glossary) => ({ ...glossary, name }));
    }
    case 'remove':
      return ensureSelection({
        ...state,
        glossaries: state.glossaries.filter((glossary) => glossary.id !== action.id),
      });
    case 'select':
      return state.glossaries.some((glossary) => glossary.id === action.id)
        ? { ...state, selectedId: action.id }
        : state;
    case 'setLanguages':
      return mapGlossary(state, action.id, (glossary) => ({
        ...glossary,
        fromLanguage: action.fromLanguage ?? glossary.fromLanguage,
        toLanguage: action.toLanguage ?? glossary.toLanguage,
      }));
    case 'addWord':
      if (!isCompletePair(action)) {
        return state;
      }
      return mapGlossary(state, action.id, (glossary) => ({
        ...glossary,
        items: [...glossary.items, { id: newId(), a: action.a.trim(), b: action.b.trim() }],
      }));
    case 'updateWord':
      return mapGlossary(state, action.id, (glossary) => ({
        ...glossary,
        items: glossary.items.map((item) =>
          item.id === action.wordId ? { ...item, [action.field]: action.value } : item,
        ),
      }));
    case 'removeWord':
      return mapGlossary(state, action.id, (glossary) => ({
        ...glossary,
        items: glossary.items.filter((item) => item.id !== action.wordId),
      }));
    case 'import': {
      const existing = state.glossaries.find((glossary) => sameContent(glossary, action.glossary));
      if (existing) {
        return { ...state, selectedId: existing.id };
      }
      return { ...state, glossaries: [...state.glossaries, action.glossary], selectedId: action.glossary.id };
    }
  }
}
