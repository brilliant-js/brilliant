import React, {
  FC,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { ContentBlock, ContentState } from 'draft-js';
import RichIcon from '../RichIcon/RichIcon';
import { Picture, Button } from '../Kntd';
import useBrilliantController from '../../../store/useBrilliantController';
import removeBlock from '../../utils/removeBlock';
import {
  COOL_MAPS,
  TOOLBAR_NODE_MAPS,
  IMAGE_SIZE_MAPS,
} from '../../cosntants/mediaMaps';
import Styles from '../../styles/media.module.scss';

interface ImageProps {
  readOnly?: boolean;
  imageProps: {
    src: string;
    width: number;
    maxWidth: number;
    alt: string;
    alignment: string;
  };
  editorRefs;
  imageKey: string;
  contentState: ContentState;
  removeImage: () => void;
}

let callDown = null;
const Image: FC<ImageProps> = props => {
  const {
    readOnly,
    imageProps,
    editorRefs,
    imageKey,
    contentState,
    removeImage,
  } = props;
  const { src, width, maxWidth, alt, alignment } = imageProps;
  const [move, setMove] = useState<boolean>(false);
  const [moveVisible, setMoveVisible] = useState<boolean>(false);
  const [imgWidth, setImgWidth] = useState<number>(width);
  const [pictureVisible, setPictureVisible] = useState<boolean>(false);
  let justifyString = 'center';
  if (alignment) {
    if (alignment === 'left') {
      justifyString = 'flex-start';
    } else if (alignment === 'right') {
      justifyString = 'flex-end';
    } else {
      justifyString = 'center';
    }
  }
  const [containerStyles, setContainerStyles] = useState<{
    justifyContent: string;
    right?: number;
  }>({
    justifyContent: justifyString,
  });
  const [state, controller] = useBrilliantController();
  const { selectionImgKey } = state;
  const { setSelectionImgKey } = controller;

  const imgBoxRefs = useRef(null);
  const imgRefs = useRef(null);

  const actualWidth = useMemo(() => {
    if (imgWidth >= maxWidth) return maxWidth;
    return imgWidth;
  }, [imgWidth, maxWidth]);

  const handleImgLond = e => {
    if (!width) {
      const naturalWidth = imgRefs?.current?.naturalWidth;
      setImgWidth(naturalWidth);
    }
  };

  const handleMove = useCallback(
    e => {
      if (move) {
        const callback = callDown || function b() {};
        callback.call(this, e);
      }
    },
    [move]
  );

  const handleUp = useCallback(() => {
    const posix = {
      w: imgBoxRefs.current.offsetWidth,
      h: imgBoxRefs.current.offsetHeight,
    };
    if (imageKey) {
      contentState.mergeEntityData(imageKey, {
        height: posix.h,
        width: posix.w,
      });
    }

    if (move) {
      setMove(false);
    }
  }, [contentState, imageKey, move]);

  const handleDown = useCallback((e, direction) => {
    e.stopPropagation();
    const posix = {
      w: imgBoxRefs.current.offsetWidth,
      h: imgBoxRefs.current.offsetHeight,
      x: e.pageX,
      y: e.pageY,
    };
    if (direction === 'right') {
      callDown = function a(event) {
        const newWidth = Math.max(50, event?.pageX - posix.x + posix.w);
        setImgWidth(newWidth);
      };
    } else {
      callDown = function a(event) {
        const newWidth = Math.max(50, posix.x - event?.pageX + posix.w);
        setImgWidth(newWidth);
      };
    }
    setMove(true);
    return false;
  }, []);

  const handleClick = useCallback(() => {
    setMoveVisible(false);
  }, []);

  const handleKeyDown = useCallback(
    e => {
      if (moveVisible && e.keyCode === 8) {
        removeImage();
      }
    },
    [moveVisible, removeImage]
  );

  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClick, handleKeyDown, handleMove, handleUp]);

  const handleImgBoxClick = (e, key) => {
    e.stopPropagation();
    editorRefs.current.blur();
    if (!readOnly) {
      setMoveVisible(true);
      setSelectionImgKey(key);
    } else {
      setPictureVisible(true);
    }
  };

  useEffect(() => {
    if (selectionImgKey !== imageKey) setMoveVisible(false);
  }, [imageKey, selectionImgKey]);

  const handleToolBarBtnClick = (e, text) => {
    e.stopPropagation();
    if (text === 'flex-start') {
      setContainerStyles({ justifyContent: text });
      if (imageKey) {
        contentState.mergeEntityData(imageKey, {
          alignment: 'left',
        });
      }
    } else if (text === 'flex-end') {
      setContainerStyles({ justifyContent: text, right: 2 });
      if (imageKey) {
        contentState.mergeEntityData(imageKey, {
          alignment: 'right',
        });
      }
    } else {
      if (imageKey) {
        contentState.mergeEntityData(imageKey, {
          alignment: 'center',
        });
      }
      setContainerStyles({ justifyContent: text });
    }
  };

  const handleRemove = e => {
    e.stopPropagation();
    removeImage();
  };

  const hanleImageSizeCLick = (e, sizeText) => {
    e.stopPropagation();
    const naturalWidth = imgRefs?.current?.naturalWidth || 67;
    const newWidth = naturalWidth * sizeText;
    setImgWidth(newWidth);
  };

  const imgBoxClass = `${Styles.imgBox} ${
    moveVisible ? Styles['img-border'] : null
  }`;

  return (
    <div
      key={imageKey}
      className={Styles.container}
      onClick={e => handleImgBoxClick(e, imageKey)}
      style={containerStyles}
      data-key={imageKey}
    >
      <div
        className={imgBoxClass}
        ref={imgBoxRefs}
        style={{ width: actualWidth }}
      >
        <img src={src} alt={alt} ref={imgRefs} onLoad={handleImgLond} />
        <Picture
          visible={pictureVisible}
          setVisible={setPictureVisible}
          photoImages={[src]}
        />
        {moveVisible && (
          <>
            {COOL_MAPS.map((cool, index) => (
              <span
                key={`${cool.class}_${index}`}
                className={Styles[cool.class]}
                onMouseDown={e => handleDown(e, cool.direction)}
              />
            ))}
            <div className={Styles.toolBox}>
              {IMAGE_SIZE_MAPS.map((sizeObj, index) => (
                <Button
                  type="link"
                  key={`image_size_${index}`}
                  onClick={e => hanleImageSizeCLick(e, sizeObj.proportion)}
                  style={{ background: 'transparent', fontSize: 18 }}
                  className={Styles.toolBtn}
                >
                  <RichIcon type={sizeObj.icon} />
                </Button>
              ))}
              {TOOLBAR_NODE_MAPS.map((node, index) => (
                <Button
                  type="link"
                  key={`${node.iconName}_${index}`}
                  className={Styles.toolBtn}
                  onClick={e => handleToolBarBtnClick(e, node.justifyContent)}
                >
                  <RichIcon type={node.iconName} />
                </Button>
              ))}
              <Button
                type="link"
                className={Styles.toolBtn}
                onClick={() => setPictureVisible(true)}
              >
                <RichIcon type="icon-quanping" />
              </Button>
              <Button
                type="link"
                className={Styles.toolBtn}
                onClick={handleRemove}
              >
                <RichIcon type="icon-shanchu" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export interface MediaBoxProps {
  contentState: ContentState;
  block: ContentBlock;
  blockProps: any;
}

const MediaBox: FC<MediaBoxProps> = props => {
  const { contentState, block, blockProps } = props;
  const {
    readOnly,
    editorRefs,
    editorBoxRefs,
    entityKey,
    getEditorState,
    setEditorState,
  } = blockProps;
  const entity = contentState.getEntity(entityKey);
  const { src, alt } = entity.getData();
  let { width, alignment } = entity.getData();
  if (width && typeof width == 'string') {
    width = Number(width.replace('px', ''));
  }
  let maxWidth = 1200;
  if (editorBoxRefs && editorBoxRefs.current != null) {
    maxWidth = editorBoxRefs?.current.scrollWidth - 50;
  }

  const imageProps = {
    src,
    width,
    maxWidth,
    alignment,
    alt,
  };

  const removeImage = () => {
    const editorState = getEditorState();
    setEditorState(removeBlock(editorState, block));
  };

  return (
    <Image
      readOnly={readOnly}
      imageProps={imageProps}
      editorRefs={editorRefs}
      imageKey={entityKey}
      contentState={contentState}
      removeImage={removeImage}
    />
  );
};

export default MediaBox;
