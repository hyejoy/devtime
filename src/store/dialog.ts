import { create } from 'zustand';

type modalType = 'custom' | 'alert';

interface DialogStore {
  isOpen: boolean;
  type: modalType;
  actions: {
    openDialog: () => void;
    closeDialog: () => void;
    changeType: (type: modalType) => void;
  };
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  isOpen: false,
  type: 'alert',
  actions: {
    openDialog: () => set({ isOpen: true }),
    closeDialog: () => set({ isOpen: false }),
    changeType: (type: modalType) => set({ type: type }),
  },
}));

export const useIsDialogOpen = () => useDialogStore((state) => state.isOpen);
export const useDialogType = () => useDialogStore((state) => state.type);
export const useDialogActions = () => useDialogStore((state) => state.actions);
