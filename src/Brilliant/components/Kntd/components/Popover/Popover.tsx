import React, { FC, ReactNode } from 'react';
import ReactPopover from 'react-popover';
import Styles from './popover.module.scss';

interface PopoverProps {
  isOpen: boolean;
  setIsOpen: (item: boolean) => void;
  body: ReactNode;
  children: ReactNode;
}
const Popover: FC<PopoverProps> = props => {
  const { isOpen, setIsOpen, body, children } = props;
  const nowBody = <div className={Styles.popoverBody}>{body}</div>;
  return (
    <ReactPopover
      isOpen={isOpen}
      onOuterAction={() => setIsOpen(false)}
      preferPlace="below"
      body={nowBody}
      className={Styles.popover}
      enterExitTransitionDurationMs={300}
    >
      {children}
    </ReactPopover>
  );
};

export default Popover;
