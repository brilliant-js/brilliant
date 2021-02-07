import React, { useState, FC, useMemo, useEffect, memo } from 'react';
import { EditorState, EditorBlock, Modifier } from 'draft-js';
import RichIcon from '../RichIcon/RichIcon';
import Styles from './info.module.scss';
import { InfoIconType } from '../../cosntants/constants';
import useBrilliantController from '../../../store/useBrilliantController';

export interface InfoProps {
  block: { getKey: () => any };
  blockProps: {
    setEditorState: any;
    getEditorState: () => EditorState;
    iconType?: { type: string; index: number };
    setIconType?: any;
    infotype: 'info' | 'success' | 'warn' | 'error';
  };
}
const InfoBlock: FC<InfoProps> = (props: InfoProps) => {
  const { blockProps, block } = props;
  const { getEditorState, setEditorState, infotype } = blockProps;
    const editorState = getEditorState();

  const [state] = useBrilliantController();

  const IconTypeMap = {
    info: InfoIconType.INFO,
    warn: InfoIconType.WARN,
    success: InfoIconType.SUCCESS,
    error: InfoIconType.ERROR,
    [InfoIconType.INFO]: 'info',
    [InfoIconType.WARN]: 'warn',
    [InfoIconType.SUCCESS]: 'success',
    [InfoIconType.ERROR]: 'error',
  };
  const [isShow, setIsShow] = useState(true);
  const iconType = IconTypeMap[infotype];

  
  const backColor = useMemo(() => {
    switch (iconType) {
      case InfoIconType.SUCCESS:
        return '#e3f7ea';
      case InfoIconType.ERROR:
        return '#ffe3e3';
      case InfoIconType.WARN:
        return '#fff5df';
      case InfoIconType.INFO:
        return '#dff5ff';
      default:
        return '#e3f7ea';
    }
  }, [iconType]);

          
  const onChangeInfoType = (event: Event, newInfoType: string) => {
    event.preventDefault();
    event.stopPropagation();

    const blockKey = block.getKey();
    const selection = editorState.getSelection();
    
    const blockSelection = selection.merge({
      anchorKey: blockKey,
      focusKey: blockKey,
    });

    
    let content = editorState.getCurrentContent();
    content = Modifier.mergeBlockData(content, selection, {
      infotype: IconTypeMap[newInfoType],
    } as any);

    const newEditorState = EditorState.push(
      editorState,
      content,
      'change-block-data'
    );
    setEditorState(newEditorState);
  };

  const infoControlData = [
    InfoIconType.SUCCESS,
    InfoIconType.ERROR,
    InfoIconType.WARN,
    InfoIconType.INFO,
  ];

  return (
    <div
      className={`${Styles.infoWrap} languag-xxx`}
      style={{ background: backColor }}
    >
      {isShow && (
        <div contentEditable={false} className={Styles.floatTab}>
          {infoControlData.map(type => (
            <RichIcon
              onClick={event => onChangeInfoType(event, type)}
              style={{ cursor: 'pointer' }}
              type={type}
            />
          ))}
          <div style={{ marginTop: '-6px', height: '30px', color: '#ddd' }}>
            |
          </div>
          <RichIcon style={{ cursor: 'pointer' }} type="icon-shanchu" />
        </div>
      )}
      <div className={Styles.icon}>
        <RichIcon
          style={{ fontSize: 22, cursor: 'pointer' }}
          onClick={() => setIsShow(!isShow)}
          type={iconType}
        />
      </div>
      <EditorBlock
        className={Styles.content}
        {...props}
        onInput={e => {
                  }}
      />
    </div>
  );
};

export default memo(InfoBlock);
