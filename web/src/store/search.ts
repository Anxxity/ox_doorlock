import create from 'zustand';

export interface AdvancedSearchFilters {
  name: string;
  zone: string;
  folder: string;
  id: string;
  group: string;
}

const defaultAdvanced: AdvancedSearchFilters = {
  name: '',
  zone: '',
  folder: '',
  id: '',
  group: '',
};

interface Store {
  value: string;
  debouncedValue: string;
  setDebouncedValue: (value: string) => void;
  setValue: (value: string) => void;
  advancedOpen: boolean;
  setAdvancedOpen: (value: boolean) => void;
  advanced: AdvancedSearchFilters;
  setAdvancedField: <K extends keyof AdvancedSearchFilters>(key: K, value: AdvancedSearchFilters[K]) => void;
  resetAdvanced: () => void;
}

export const useSearch = create<Store>((set) => ({
  value: '',
  debouncedValue: '',
  setDebouncedValue: (value: string) => set({ debouncedValue: value }),
  setValue: (value: string) => set({ value: value }),
  advancedOpen: false,
  setAdvancedOpen: (advancedOpen: boolean) => set({ advancedOpen }),
  advanced: { ...defaultAdvanced },
  setAdvancedField: (key, value) =>
    set((state) => ({
      advanced: { ...state.advanced, [key]: value },
    })),
  resetAdvanced: () => set({ advanced: { ...defaultAdvanced } }),
}));
