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
  const [factWidth, setFactWidth] = useState<number>(imgWidth);
  const [pictureVisible, setPictureVisible] = useState<boolean>(false);
  const [toolBoxStyle, setToolBoxStyle] = useState({})
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
  const imgFactRefs = useRef(null);
  const imgVirtualRefs = useRef(null);
  const imgToolBar = useRef(null);

  const virtualWidth = useMemo(() => {
    if (imgWidth >= maxWidth) return maxWidth;
    return imgWidth;
  }, [imgWidth, maxWidth]);

  const handleMove = useCallback(e => {
    if (move) {
      const callback = callDown || function b() { };
      callback.call(this, e);
    }
  }, [move]);

  const handleUp = useCallback((e) => {
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

    if (virtualWidth) setFactWidth(virtualWidth);

    if (move) {
      editorRefs.current.blur();
      if (imgToolBar.current.offsetWidth > virtualWidth) {
        setToolBoxStyle({ bottom: -50, left: 0, transform: "none" })
      } else {
        setToolBoxStyle({})
      }
      setMove(false);
    }

  }, [virtualWidth, imageKey, move]);

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

  const handleKeyDown = useCallback(
    e => {
      if (moveVisible && e.keyCode === 8) {
        removeImage();
      }
    },
    [moveVisible, removeImage]
  );

  useEffect(() => {
    const handleClick = () => {
      if (!move) setMoveVisible(false);
    }
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMove);
    return () => {
      document.removeEventListener('mousemove', handleMove);
    };
  }, [handleMove]);

  useEffect(() => {
    document.addEventListener('mouseup', handleUp, true);
    return () => {
      document.removeEventListener('mouseup', handleUp, true);
    };
  }, [handleUp])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown])

  useEffect(() => {
    if (selectionImgKey !== imageKey) setMoveVisible(false);
  }, [imageKey, selectionImgKey]);

  useEffect(() => {
    const width = imgFactRefs.current.offsetWidth;
    setImgWidth(width)
  }, [factWidth])

  const handleImgLond = e => {
    if (!width) {
      const naturalWidth = imgFactRefs?.current?.naturalWidth;
      setImgWidth(naturalWidth);
    }
  };

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

  const handleImgDobleClick = () => {
    if (!readOnly) setPictureVisible(true)
  }

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
    const naturalWidth = imgFactRefs?.current?.naturalWidth || 67;
    const newWidth = naturalWidth * sizeText;
    setFactWidth(newWidth);
  };

  const virtualBoxClass = `${Styles.virtualBox} ${moveVisible ? Styles['img-border'] : null}`;

  return (
    <div
      key={imageKey}
      className={Styles.container}
      onClick={e => handleImgBoxClick(e, imageKey)}
      style={containerStyles}
      data-key={imageKey}
    >
      <div className={Styles.imgBox} style={{ width: factWidth }}>
        <img src={src} alt={alt} ref={imgFactRefs} className={Styles.fact} onLoad={handleImgLond} />

        <div ref={imgBoxRefs} className={Styles.virtual} style={{ width: virtualWidth }}>
          <div className={virtualBoxClass} onDoubleClick={handleImgDobleClick}>
            <img src={src} ref={imgVirtualRefs} style={{ visibility: move ? "visible" : "hidden" }} />
            {moveVisible && COOL_MAPS.map((cool, index) => (
              <span
                key={`${cool.class}_${index}`}
                className={Styles[cool.class]}
                onMouseDown={e => handleDown(e, cool.direction)}
              />
            ))}
          </div>
        </div>

        {moveVisible && (
          <div className={Styles.toolBox} ref={imgToolBar} style={toolBoxStyle}>
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
        )}

      </div>
      <Picture
        visible={pictureVisible}
        setVisible={setPictureVisible}
        photoImages={[src]}
      />
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
