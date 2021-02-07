import React, { useState } from 'react';
import RichIcon from '../RichIcon/RichIcon';
import { Popover, Button } from '../Kntd';
import LinkToImage from './LinkToImage';
import UploadImg from './UploadImg';

const ImageControls = props => {
  const { confirmMedia, focus, handleImgUpload, language } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLink, setIsLink] = useState<boolean>(false);
  const callback = () => setIsOpen(false);

  const Body = (
    <div style={{ padding: '12px 16px' }}>
      <div>
        {isLink ? (
          <LinkToImage
            language={language}
            confirmMedia={confirmMedia}
            callback={callback}
          />
        ) : (
            <UploadImg
              language={language}
              confirmMedia={confirmMedia}
              focus={focus}
              handleImgUpload={handleImgUpload}
              callback={callback}
            />
          )}
      </div>
      <Button
        type="link"
        onClick={() => setIsLink(bool => !bool)}
        style={{ marginTop: 10, color: 'gray' }}
      >
        {isLink
          ? language.ImageControls.Local
          : language.ImageControls.Internet}
      </Button>
    </div>
  );

  return (
    <Popover isOpen={isOpen} setIsOpen={setIsOpen} body={Body}>
      <Button type="text" onClick={() => setIsOpen(true)}>
        <RichIcon type="icon-thumb" />
      </Button>
    </Popover>
  );
};

export default ImageControls;
