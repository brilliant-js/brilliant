import React, { FC, useState, useRef, useEffect, useCallback } from 'react';
import { EditorState, getVisibleSelectionRect } from 'draft-js';
import Styles from '../../styles/link.module.scss';

interface InlineControlsProps {
  editorState: EditorState;
  url: string;
  blockKey: string;
  entityKey: string;
  editLinkAfterSelection: (entityKey, url: string) => void;
  removeLink: () => void;
  children: any;
}

const getRelativeParent = element => {
  if (!element) {
    return null;
  }

  const position = window
    .getComputedStyle(element)
    .getPropertyValue('position');
  if (position !== 'static') {
    return element;
  }

  return getRelativeParent(element.parentElement);
};

const InlineControls: FC<InlineControlsProps> = (
  props: InlineControlsProps
) => {
  const { editorState, children } = props;
  const [position, setPosition] = useState({});
  const [arrowPosition, setArrowPosition] = useState({});
  const ToolBarRef = useRef(null);
  const calculatePosition = useCallback(() => {
    if (!ToolBarRef && !ToolBarRef.current) {
      return;
    }
    const relativeParent = getRelativeParent(ToolBarRef.current.parentElement);
    const relativeRect = relativeParent
      ? relativeParent.getBoundingClientRect()
      : window.document.body.getBoundingClientRect();
    const selectionRect = getVisibleSelectionRect(window);
    if (!selectionRect) return;

    const float = () => {
      const position: { [key: string]: string | number } = {};
      const width = ToolBarRef.current.scrollWidth;
      const now = selectionRect.left - relativeRect.left;

      if (width + 20 > relativeRect.width) {
        position.maxWidth = relativeRect.width;
        position.flexWrap = 'wrap';
      }

      if (now <= width / 2) {
        position.left = 10;
      } else if (relativeRect.right - now <= width / 2) {
        position.right = 10;
      } else {
        position.left = now;
        position.transform = 'translate(-50%) scale(1)';
      }

      return position;
    };

    const top = () => {
      const now = selectionRect.bottom - relativeRect.top;
      return now + 10;
    };

    const newPosition = () => {
      let position: { [key: string]: string | number } = {};
      position = float();
      position.top = top();
      return position;
    };

    setPosition(newPosition());
  }, []);

  useEffect(() => {
    calculatePosition();
  }, [calculatePosition, editorState]);

  return (
    <div
      className={Styles['md-editor-toolbar']}
      style={position}
      ref={ToolBarRef}
    >
      {children}
    </div>
  );
};

export default InlineControls;
