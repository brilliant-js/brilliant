import React, { FC, useMemo, useState } from 'react';
import {
  BLOCK_STYLES,
  INLINE_STYLES,
  COLORS,
  EventStyleMap,
  BlockStyleMap,
  InlineStyleMap,
  MULTIMEDIA_STYLES,
} from '../../cosntants/typeMaps';
import LinkControls from '../LinkControls/LinkControls';
import EmojiControls from '../Emoji/EmojiControls';
import ImageControls from '../MediaBox/ImageControls';
import RichIcon from '../RichIcon/RichIcon';
import { Button, Tooltip } from '../Kntd';
import Styles from './controls.module.scss';

interface StyleButtonProps {
  onToggle: (arg: any) => void;
  style: any;
  active: any;
  label: string;
  icon?: string;
  tipInfo?: JSX.Element;
  control?: boolean;
}

const StyleButton: FC<StyleButtonProps> = props => {
  const { active, label, icon, tipInfo, control } = props;
  const [isSpan, setIsSpan] = useState(false);
  const onToggle = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    props.onToggle(props.style);
  };
  return (
    <Tooltip title={tipInfo} tooltipId={label} control={control}>
      <Button
        type="text"
        onMouseDown={e => {
          onToggle(e);
          setIsSpan(true);
        }}
        onMouseUp={() => setIsSpan(false)}
      >
        <RichIcon type={icon} style={{ color: active ? '#89bf37' : '' }} />
      </Button>
    </Tooltip>
  );
};

const Controls = props => {
  const {
    editorState,
    myToggleInlineStyle,
    myToggleBlockType,
    confirmLink,
    confirmEmoji,
    confirmMedia,
    focus,
    excludeItemMap,
    handleImgUpload,
    imgControls,
    children,
    language,
  } = props;
  const allControls = useMemo(() => {
    const allItems = [...INLINE_STYLES, ...BLOCK_STYLES, ...MULTIMEDIA_STYLES];
    return !excludeItemMap
      ? allItems
      : allItems.filter(item => !excludeItemMap[item.style]);
  }, [excludeItemMap]);

  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
  const blockAlignType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getData()
    .get('text-align');
  const currentStyle = editorState.getCurrentInlineStyle();
  return (
    <>
      {allControls.map((item, index) => {
        if (BlockStyleMap[item.style]) {
          return (
            <StyleButton
              key={item.label}
              active={
                (item.style === blockType || item.style === blockAlignType) &&
                item.style !== EventStyleMap.UNSTYLED.TYPE
              }
              label={item.label}
              onToggle={myToggleBlockType}
              style={item.style}
              icon={item.icon}
              tipInfo={item.tipInfo(language)}
            />
          );
        } else if (InlineStyleMap[item.style]) {
          return (
            <StyleButton
              key={item.label}
              active={
                currentStyle.has(item.style) &&
                item.style !== EventStyleMap.CLEARSTYLE.TYPE
              }
              label={item.label}
              onToggle={myToggleInlineStyle}
              style={item.style}
              icon={item.icon}
              tipInfo={item.tipInfo(language)}
            />
          );
        } else if (item.style === 'set-link') {
          return (
            <Tooltip
              key={item.label}
              title={item.tipInfo(language)}
              tooltipId={item.label}
            >
              <LinkControls
                language={language}
                editorState={editorState}
                confirmLink={confirmLink}
              />
            </Tooltip>
          );
        } else if (item.style === 'upload-pic' && imgControls) {
          return (
            <Tooltip
              key={item.label}
              title={item.tipInfo(language)}
              tooltipId={item.label}
            >
              <ImageControls
                language={language}
                confirmMedia={confirmMedia}
                focus={focus}
                handleImgUpload={handleImgUpload}
              />
            </Tooltip>
          );
        } else if (item.style === 'set-emoji') {
          return (
            <Tooltip
              key={item.label}
              title={item.tipInfo(language)}
              tooltipId={item.label}
            >
              <EmojiControls confirmEmoji={confirmEmoji} />
            </Tooltip>
          );
        }
      })}
    </>
  );
};

export { Controls };
