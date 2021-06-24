import React, { HTMLAttributes } from 'react';
import { IconType } from 'react-icons';
import { FaUserTie } from 'react-icons/fa';

import styles from './styles.module.scss';

type UserTypeButtonProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  subtitle: string;
  icon: IconType;
}

const UserTypeButton: React.FC<UserTypeButtonProps> = ({ title, subtitle, icon: Icon, onClick }) => {
  // console.log(`${title} - ${isActive}`)
  return (
    <div onClick={onClick} className={styles.container} >
      <Icon />
      <span className={styles.title}>{title}</span>
      <p>
        {subtitle}
      </p>

      {/* <div className={styles.link} onClick={onClick}>
        <a>Ver mais</a>
        <FiChevronRight />
      </div> */}
    </div>
  );
}

export default UserTypeButton;
