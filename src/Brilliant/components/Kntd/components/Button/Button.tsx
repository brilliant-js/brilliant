import React, { FC, ReactNode } from 'react';
import Styles from './button.module.scss';

interface ButtonProps {
  type?: string;
  className?: string;
  children: ReactNode;
  [key: string]: any;
}

const Button: FC<ButtonProps> = props => {
  const { type = 'primary', className, children, ...attribute } = props;
  return (
    <button className={`${Styles[type]} ${className}`} {...attribute}>
      {children}
    </button>
  );
};

export default Button;
