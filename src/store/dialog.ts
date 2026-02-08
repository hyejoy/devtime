import { create } from 'zustand';

interface DialogStore {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  isOpen: false,
  type: 'alert',
  openDialog: () => set({ isOpen: true }),
  closeDialog: () => set({ isOpen: false }),
}));
