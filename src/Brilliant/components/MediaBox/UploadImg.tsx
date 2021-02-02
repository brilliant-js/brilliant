import React, { FC, useRef } from 'react';
import RichIcon from '../RichIcon/RichIcon';
import useBrilliantContriller from '../../../store/useBrilliantController';
import Styles from './image.module.scss';

interface UploadImgProps {
  confirmMedia: (src: string) => void;
  focus: () => void;
  handleImgUpload?: (file: FormData) => Promise<{ url: any; id: any }>;
  callback: Function;
  language: any;
}

const UploadImg: FC<UploadImgProps> = props => {
  const { confirmMedia, focus, handleImgUpload, callback, language } = props;
  const [, controller] = useBrilliantContriller();
  const fileRef = useRef(null);

  const upload = e => {
    if (handleImgUpload) {
      controller.fileUpload(e.target.files[0], handleImgUpload).then(res => {
        confirmMedia(res.url);
        callback();
      });
    } else {
      controller.fileToBase64(e.target.files[0]).then(res => {
        confirmMedia(res as string);
        callback();
      });
    }
  };

  const handleClick = () => {
    focus();
    fileRef.current.click();
  };

  return (
    <>
      <input
        type="file"
        className={Styles.flie}
        ref={fileRef}
        onChange={upload}
      />
      <div className={Styles.uploadBox} onClick={handleClick}>
        <div className={Styles.titleBox}>
          <RichIcon type="icon-jia" className={Styles.icon} />
          <span className={Styles.title}>{language.UploadImage.Text}</span>
        </div>
      </div>
    </>
  );
};

export default UploadImg;
