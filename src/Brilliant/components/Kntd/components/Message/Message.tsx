import React, { FC, useState, useEffect, useCallback } from 'react';
import ReactDom from 'react-dom';
import Styles from './message.module.scss';
import RichIcon from '../../../RichIcon/RichIcon';

interface MessageProps {
  text: string;
}

let l1, l2;

const MessageFC: FC<MessageProps> = props => {
  const { text } = props;
  const [hideStyle, setHideStyle] = useState<any>({});

  const domRemove = useCallback(() => {
    const messageDom = document.getElementById('my-message');
    messageDom?.remove();
  }, []);
  const messageHide = useCallback(() => {
    setHideStyle({ animationName: Styles.messageHide });
  }, []);
  useEffect(() => {
    l1 = window.setTimeout(messageHide, 2500);
    l2 = window.setTimeout(domRemove, 2900);
  }, [domRemove, messageHide]);

  return (
    <div className={Styles.message} style={hideStyle}>
      <RichIcon type="icon-Error" className={Styles.icon} />
      <span>{text}</span>
    </div>
  );
};

const Message = (text: string) => {
  const messageDom = document.getElementById('my-message');
  if (messageDom) {
    window.clearTimeout(l2);
    window.clearTimeout(l1);
    messageDom.remove();
  }
  const dom = document.createElement('div');
  dom.id = 'my-message';
  document.getElementById('root').appendChild(dom);
  ReactDom.render(
    <MessageFC text={text} />,
    document.getElementById('my-message')
  );
};

export default Message;
