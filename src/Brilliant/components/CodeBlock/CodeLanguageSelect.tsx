import React, { FC } from 'react';

type Option = {
  label: string | number;
  value: string | number;
};
export interface CodeLanguageSelectProps {
  options: Array<Option>;
  onChange: (ev: any) => void;
  selectedValue: string | number | readonly string[];
}

export const CodeLanguageSelect: FC<CodeLanguageSelectProps> = ({
  options,
  onChange,
  selectedValue,
}) => (
  <select value={selectedValue} onChange={onChange}>
    {options.map(({ label, value }) => (
      <option key={value} value={value}>
        {label}
      </option>
    ))}
  </select>
);
