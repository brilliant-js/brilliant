import { EditorState, ContentBlock } from 'draft-js';
import { Block, Entity } from '../cosntants/constants';
import { BetweenLink } from '../types/brilliant';

export const getCurrentBlock = (editorState: EditorState): ContentBlock => {
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const block = contentState.getBlockForKey(selectionState.getStartKey());
  return block;
};

export const isCursorBetweenLink = (editorState: EditorState): BetweenLink => {
  let ret = null;
  const selection = editorState.getSelection();
  const content = editorState.getCurrentContent();
  const currentBlock = getCurrentBlock(editorState);
  if (!currentBlock) {
    return ret;
  }
  let entityKey = null;
  let blockKey = null;
  if (currentBlock.getType() !== Block.ATOMIC && selection.isCollapsed()) {
    if (currentBlock.getLength() > 0) {
      if (selection.getAnchorOffset() > 0) {
        entityKey = currentBlock.getEntityAt(selection.getAnchorOffset() - 0);
        blockKey = currentBlock.getKey();
        if (entityKey !== null) {
          const entity = content.getEntity(entityKey);
          if (entity.getType() === Entity.LINK) {
            ret = {
              entityKey,
              blockKey,
              url: entity.getData().url,
            };
          }
        }
      }
    }
  }
  return ret;
};
