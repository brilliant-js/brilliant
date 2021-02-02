import React, { FC } from 'react';
import Styles from './richIcon.module.scss';
import './iconfont';

interface IconFontProps {
  type: string;
  [key: string]: any;
}

const RichIcon: FC<IconFontProps> = props => {
  const { type, ...attribute } = props;
  return (
    <span className={Styles.iconBox} {...attribute}>
      <svg aria-hidden="true" className={Styles.icon}>
        <use xlinkHref={`#${type}`} />
      </svg>
    </span>
  );
};

export default RichIcon;
