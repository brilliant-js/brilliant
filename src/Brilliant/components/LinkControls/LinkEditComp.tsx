import React, { FC, useState, useRef, useEffect, useCallback } from 'react';
import { EditorState, getVisibleSelectionRect } from 'draft-js';
import RichIcon from '../RichIcon/RichIcon';
import { Button, Input } from '../Kntd';
import Styles from '../../styles/link.module.scss';

interface LinkEditCompProps {
  editorState: EditorState;
  url: string;
  blockKey: string;
  entityKey: string;
  editLinkAfterSelection: (entityKey, url: string) => void;
  removeLink: () => void;
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

const LinkEditComp: FC<LinkEditCompProps> = (props: LinkEditCompProps) => {
  const {
    editorState,
    url,
    blockKey,
    entityKey,
    editLinkAfterSelection,
    removeLink,
  } = props;
  const [position, setPosition] = useState({});
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
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
    setPosition(newPosition);
  }, []);

  useEffect(() => {
    setIsEdit(false);
    calculatePosition();
  }, [calculatePosition, editorState]);
  useEffect(() => {
    setValue(url);
  }, [url]);

  const handleEditClick = e => {
    e.stopPropagation();
    setIsEdit(true);
  };

  const editLink = e => {
    e.preventDefault();
    e.stopPropagation();
    editLinkAfterSelection(entityKey, value);
    setIsEdit(false);
  };

  const handleClose = () => {
    setIsEdit(false);
    setValue(url);
  };

  return (
    <div
      className={Styles['md-editor-toolbar']}
      style={position}
      ref={ToolBarRef}
    >
      {!isEdit && (
        <>
          <a
            href={url}
            title={url}
            target="_blank"
            rel="noopener noreferrer"
            className={Styles.linkTitle}
          >
            {url}
          </a>
          <Button type="ghost" onClick={handleEditClick}>
            <RichIcon type="icon-Edit" />
          </Button>
          <Button type="ghost" onClick={removeLink}>
            <RichIcon type="icon-quxiaochaolianjie" />
          </Button>
        </>
      )}
      {isEdit && (
        <>
          <Input
            value={value}
            onClick={e => e.stopPropagation()}
            onChange={e => setValue(e.target.value.trim())}
            className={Styles.linkInput}
          />
          <Button type="ghost" onClick={editLink}>
            <RichIcon type="icon-Check" />
          </Button>
          <Button type="ghost" onClick={handleClose}>
            <RichIcon type="icon-Close" />
          </Button>
        </>
      )}
    </div>
  );
};

export default LinkEditComp;
