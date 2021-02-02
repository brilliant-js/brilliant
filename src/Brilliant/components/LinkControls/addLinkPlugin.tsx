import React, { FC } from 'react';
import { ContentBlock, ContentState } from 'draft-js';
import Styles from '../../styles/link.module.scss';

export const linkStrategy = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
): void => {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === 'LINK'
    );
  }, callback);
};

interface LinkProps {
  contentState: ContentState;
  entityKey: string;
  children;
}

export const Link: FC<LinkProps> = (props: LinkProps) => {
  const { contentState, entityKey, children } = props;
  const { url } = contentState.getEntity(entityKey).getData();
  return (
    <a
      href={url}
      rel="noopener noreferrer"
      target="_blank"
      aria-label={url}
      className={Styles.link}
    >
      {children}
    </a>
  );
};

const addLinkPlugin = {
  decorators: [
    {
      strategy: linkStrategy,
      component: Link,
    },
  ],
};

export default addLinkPlugin;
