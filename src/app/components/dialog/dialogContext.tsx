'use client';
import { createContext, ReactNode, useContext, useState } from 'react';

type ModalType = 'alert' | 'confirm' | 'no-title-confirm' | 'custom-style';
type ModalState = null | ModalType;

type DialogContextValue = {
  modalState: ModalState;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
};

export const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>(null);
  const openModal = (type: ModalType) => {
    setModalState(type);
  };

  const closeModal = () => {
    setModalState(null);
  };

  return (
    <DialogContext.Provider
      value={{
        modalState,
        openModal,
        closeModal,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  return useContext(DialogContext);
}
