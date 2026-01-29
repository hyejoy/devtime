import { create } from 'zustand';

interface ModalStore {
  isOpen: boolean;
  actions: {
    openModal: () => void;
    closeModal: () => void;
  };
}

export const useModalStore = create<ModalStore>((set, get) => ({
  isOpen: false,
  actions: {
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
  },
}));

export const useIsModalOpen = () => useModalStore((state) => state.isOpen);
export const useModalActions = () => useModalStore((state) => state.actions);
