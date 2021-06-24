import React from 'react';

import styles from './styles.module.scss';

interface MessageModalProps {
  handleVisibility: React.MouseEventHandler;
  alterStyle?: boolean;
}

const MessageModal: React.FC<MessageModalProps> = ({ handleVisibility, alterStyle, children }) => {
  return (
    <>
      <div onClick={handleVisibility} className={styles.modalBackground} />
      <div className={styles.modalContainer} style={{ backgroundColor: !alterStyle ? 'var(--white)' : 'var(--yellow-300)' }}>
        <button onClick={handleVisibility} type='button'>X</button>
        {children}
      </div>
    </>
  )
}

export default MessageModal;
