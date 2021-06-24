import React, { createContext, useState, useCallback, useContext } from 'react';

import { ModalMessage } from 'src/shared/types/modalMessage';

interface ModalMessageContextData {
  showModalMessage: boolean;
  modalMessage: ModalMessage;
  handleModalMessage(show: boolean, modal?: ModalMessage): void;
}

const MessageContext = createContext<ModalMessageContextData>({} as ModalMessageContextData);

const ModalMessageProvider: React.FC = ({ children }) => {
  const [showModalMessage, setShowingModalMessage] = useState(false);
  const [modalMessage, setModalMessage] = useState<ModalMessage>({ type: 'error', title: '', message: '' });

  const handleMessage = useCallback((show: boolean, modal?: ModalMessage) => {
    setShowingModalMessage(show);

    if (!!modal)
      setModalMessage(modal);
    else
      setModalMessage({ type: 'error', title: '', message: '' });
  }, [])


  return (
    <MessageContext.Provider
      value={{ showModalMessage, modalMessage, handleModalMessage: handleMessage }}
    >
      {children}
    </MessageContext.Provider>
  )
}

function useModalMessage(): ModalMessageContextData {
  const context = useContext(MessageContext);

  if (!context)
    throw new Error('useMessage must be used within an ModalMessageProvider');

  return context;
}

export { ModalMessageProvider, useModalMessage }
