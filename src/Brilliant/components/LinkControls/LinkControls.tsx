import React, { FC, useState, useEffect } from 'react';
import { EditorState } from 'draft-js';
import RichIcon from '../RichIcon/RichIcon';
import { Popover, Button, Input } from '../Kntd';
import Styles from '../../styles/link.module.scss';
import { getContentSelectionAmbient } from '../../../Brilliant/utils/shortcutUtils';

interface ChildrenProps {
  language: any;
  defaultTitle: string;
  setIsOpen: (item: boolean) => void;
  confirmLink: (title: string, src: string) => void;
}

const Children: FC<ChildrenProps> = ({
  language,
  defaultTitle,
  setIsOpen,
  confirmLink,
}: ChildrenProps) => {
  const [title, setTitle] = useState<string>('');
  const [linkText, setLlinkText] = useState<string>('');

  useEffect(() => {
    setTitle(defaultTitle || language.LinkControls.Title);
  }, [defaultTitle]);

  const handleClick = () => {
    confirmLink(title, linkText);
    setIsOpen(false);
    setLlinkText('');
  };

  return (
    <div className={Styles.container}>
      <div>{language.LinkControls.Text}</div>
      <Input
        className={Styles.m10}
        placeholder={language.LinkControls.Placehoder}
        value={title}
        onChange={e => setTitle(e.target.value.trim())}
      />
      <div className={Styles.m10}>{language.LinkControls.TextLink}</div>
      <Input
        className={Styles.m10}
        placeholder={language.LinkControls.PlacehoderLink}
        value={linkText}
        onChange={e => setLlinkText(e.target.value.trim())}
      />
      <Button onClick={handleClick} style={{ display: 'block', marginTop: 20 }}>
        {language.LinkControls.ButtonText}
      </Button>
    </div>
  );
};

interface LinkControlsProps {
  language: any;
  editorState: EditorState;
  confirmLink: (title: string, src: string) => void;
}

const LinkControls: FC<LinkControlsProps> = ({
  language,
  editorState,
  confirmLink,
}: LinkControlsProps) => {
  const [defaultTitle, setDefaultTitle] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleClick = (e) => {
    e.preventDefault()
    const { selectedText } = getContentSelectionAmbient(editorState);
    setDefaultTitle(selectedText);
    setIsOpen(true);
  };
  const Body = (
    <Children
      language={language}
      defaultTitle={defaultTitle}
      setIsOpen={setIsOpen}
      confirmLink={confirmLink}
    />
  );
  return (
    <Popover isOpen={isOpen} setIsOpen={setIsOpen} body={Body}>
      <Button
        type="text"
        style={{ display: 'inline-block' }}
        onClick={handleClick}
      >
        <RichIcon type="icon-chaolianjie" />
      </Button>
    </Popover>
  );
};

export default LinkControls;
