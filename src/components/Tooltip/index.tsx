import React from 'react';
import { FiX } from 'react-icons/fi';

import styles from './styles.module.scss'

interface TooltipProps {
  title: string;
  offsetY: number;
  className?: string;
  closeTooltip: React.MouseEventHandler<HTMLDivElement | SVGElement>;
}

const Tooltip: React.FC<TooltipProps> = ({ title, offsetY, closeTooltip, className, children }) => {

  return (
    <>
      <div onClick={closeTooltip} className={styles.outside} />
      <div className={styles.container} style={{ top: offsetY }}>
        <div className={styles.header}>
          <span>{title}</span>
          <FiX onClick={closeTooltip} />
        </div>
        {children}
      </div>
    </>
  );
};

export default Tooltip;
