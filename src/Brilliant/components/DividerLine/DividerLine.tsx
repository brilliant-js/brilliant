import React from 'react';

import Styles from './info.module.scss';

const DividerLine = (props: any) => (
  <div className={Styles.divider} contentEditable={false}></div>
);

export default DividerLine;
