import React, { ButtonHTMLAttributes } from 'react';

import styles from './styles.module.scss';

interface BulletButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

const BulletedButton: React.FC<BulletButtonProps> = ({ isActive, children, ...rest }) => {
  return (
    <button className={isActive ? styles.buttonActive : styles.button} {...rest} >
      <div className={styles.bullet} />
      <div className={styles.content}>
        {children}
      </div>
    </button>
  );
}

export default BulletedButton;
