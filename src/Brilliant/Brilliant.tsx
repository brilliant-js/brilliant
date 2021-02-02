import React, { FC } from 'react';
import BrilliantEditor from './BrilliantEditor/BrilliantEditor';
import store from '../store';
import { BrilliantProps } from './types/brilliant';

const Brilliant: FC<BrilliantProps> = (props: BrilliantProps) => (
  <store.Provider>
    <BrilliantEditor {...props} />
  </store.Provider>
);

export default Brilliant;
