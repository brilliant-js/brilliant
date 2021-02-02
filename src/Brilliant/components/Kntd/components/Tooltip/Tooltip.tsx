import React, { FC, ReactNode } from 'react';
import ReactTooltip from 'react-tooltip';
import Styles from './tooltip.module.scss';

type Place = 'top' | 'right' | 'bottom' | 'left';
interface TooltipProps {
  title: ReactNode;
  tooltipId: string;
  place?: Place;
  control?: boolean;
  children: ReactNode;
  [key: string]: any;
}

const Tooltip: FC<TooltipProps> = props => {
  const {
    title,
    tooltipId,
    place = 'top',
    control = true,
    children,
    ...attribute
  } = props;
  return (
    <div data-tip data-for={tooltipId}>
      {children}
      {control && (
        <ReactTooltip
          id={tooltipId}
          effect="solid"
          place={place}
          className={Styles.container}
          {...attribute}
        >
          {title}
        </ReactTooltip>
      )}
    </div>
  );
};

export default Tooltip;
