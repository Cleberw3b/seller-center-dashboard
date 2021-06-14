import React, { ButtonHTMLAttributes } from 'react';

import { IconBaseProps } from 'react-icons';

import styles from './styles.module.scss';

interface Button extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  icon?: React.ComponentType<IconBaseProps>;
  customStyle?: {
    className: string;
    activeClassName?: string;
  };
}

const Button: React.FC<Button> = ({ isActive, customStyle, icon: Icon, children, onClick, ...rest }) => {
  return (!!customStyle ?
    <button className={isActive && !!customStyle.activeClassName ? customStyle.activeClassName : customStyle.className} onClick={onClick} {...rest}>
      {!!Icon && <Icon />}
      {children}
    </button>
    :
    <button className={isActive ? styles.buttonActive : styles.button} {...rest} onClick={onClick} {...rest}>
      {!!Icon && <Icon />}
      {children}
    </button>
  );
}

export default Button;
