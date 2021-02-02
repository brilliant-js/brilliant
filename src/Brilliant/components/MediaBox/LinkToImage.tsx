import React, { FC, useEffect, useState } from 'react';
import { Input, Button } from '../Kntd';
import Styles from './image.module.scss';

interface LinkToImageProps {
  confirmMedia: (src: string) => void;
  callback: Function;
  language: any;
}

const LinkToImage: FC<LinkToImageProps> = props => {
  const { confirmMedia, callback, language } = props;
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    setUrl('');
  }, []);

  const handleClick = () => {
    confirmMedia(url);
    callback();
  };

  return (
    <div style={{ position: 'relative' }} className={Styles.linkToImgBox}>
      <Input
        style={{ width: 250 }}
        placeholder={language.LinkToImage.Placeholder}
        value={url}
        onChange={e => setUrl(e.target.value.trim())}
      />
      <Button
        onClick={handleClick}
        style={{ marginLeft: 10, padding: '3px 15px' }}
      >
        {language.LinkToImage.ButtonText}
      </Button>
    </div>
  );
};

export default LinkToImage;
