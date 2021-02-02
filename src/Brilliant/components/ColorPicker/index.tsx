import React, { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Styles from './style.module.scss';
interface ColorPickerType {
  color: string;
  presetColors: any;
  onChange: (color: string, bool: boolean) => void;
}

const ColorPicker: FC<ColorPickerType> = props => {
  const { color, presetColors, onChange } = props;
  return (
    <div className="bf-colors-wrap">
      <ul className="bf-colors">
        {presetColors.map(item => {
          const className =
            color && item.toLowerCase() === color.toLowerCase()
              ? 'color-item active'
              : 'color-item';

          return (
            <li
              role="presentation"
              key={uuidv4()}
              title={item}
              className={`${Styles[className]}`}
              style={{ color: item }}
              data-color={item.replace('#', '')}
              onClick={e => {
                onChange(e.currentTarget.dataset.color, true);
              }}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default ColorPicker;
