import React, { RefObject, useCallback, useState } from 'react';

import styles from './styles.module.scss'

interface CollapsibleProps {
  totalItems?: number;
  toggleRef: undefined | RefObject<HTMLDivElement>;
}

const Collapsible: React.FC<CollapsibleProps> = ({ totalItems, toggleRef, children }) => {
  const [isChecked, setIsChecked] = useState(false);

  const checkHandle = useCallback((state: boolean) => {
    setIsChecked(state);
  }, []);

  return (
    <div className={styles.container} ref={toggleRef}>
      {/* { !!toggleRef ?
        <input id='show_more' className={styles.toggle} type="checkbox" checked={isChecked} onChange={checkHandle} ref={toggleRef} />
        :
        <input id='show_more' className={styles.toggle} type="checkbox" checked={isChecked} onChange={checkHandle} />
      } */}

      <div className={!isChecked ? styles.collapsibleContent : styles.collapsibleContentShow}>
        {children}
      </div>
      <div className={styles.lblToggleContainer}>
        {isChecked ? <span className={styles.lblToggle} onClick={() => checkHandle(false)}>Recolher...</span> : <span className={styles.lblToggle} onClick={() => checkHandle(true)}>Ver todos</span>}
        {!!totalItems && !isChecked && <span className={styles.overflowItems}>(mais {totalItems - 2} itens)</span>}
      </div>
    </div>
  )
}

export default Collapsible;
