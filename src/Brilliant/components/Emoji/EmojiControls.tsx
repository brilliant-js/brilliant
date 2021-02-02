import React, { FC, useState } from 'react';
import RichIcon from '../RichIcon/RichIcon';
import { Popover, Button } from '../Kntd';
import { emojis } from '../../cosntants/emojis';
import Styles from '../../styles/emoji.module.scss';

interface EmojiControlsProps {
  confirmEmoji: (emoji: string, callback: Function) => void;
}

const EmojiControls: FC<EmojiControlsProps> = props => {
  const { confirmEmoji } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const callback = () => {
    setIsOpen(false);
  };
  const Body = (
    <div className={Styles.emojiBox}>
      {emojis.map((emojiIcon, index) => (
        <span
          key={`emoji_icon_${index}`}
          className={Styles.emojiIcon}
          onClick={e => {
            confirmEmoji(emojiIcon, callback);
          }}
        >
          {emojiIcon}
        </span>
      ))}
    </div>
  );

  return (
    <Popover isOpen={isOpen} setIsOpen={setIsOpen} body={Body}>
      <Button type="text" onClick={() => setIsOpen(true)}>
        <RichIcon type="icon-emoji" />
      </Button>
    </Popover>
  );
};

export default EmojiControls;
