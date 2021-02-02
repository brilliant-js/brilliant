import React, { FC } from 'react';
import Styles from './input.module.scss';

interface InputProps {
  type?: string;
  className?: string;
  [key: string]: any;
}

const Input: FC<InputProps> = props => {
  const { type = 'primary', className, ...attribute } = props;
  return <input className={`${Styles[type]} ${className}`} {...attribute} />;
};

export default Input;
