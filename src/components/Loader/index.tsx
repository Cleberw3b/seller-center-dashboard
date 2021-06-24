import React from 'react';

import styles from './styles.module.scss';

export const Loader: React.FC = () => {
  return (
    <div className={styles.loader}>
      <div className={styles.loaderRing}>
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  )
}
