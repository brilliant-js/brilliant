import React, { FC, ReactNode, useState } from 'react';
import { PhotoSlider } from 'react-photo-view';
import 'react-photo-view/dist/index.css';
interface PictureProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  photoImages: string[];
  children?: ReactNode;
}

const Picture: FC<PictureProps> = props => {
  const { photoImages, visible, setVisible, children } = props;
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  return (
    <>
      {children}
      <PhotoSlider
        images={photoImages.map(item => {
          return { src: item };
        })}
        visible={visible}
        onClose={() => setVisible(false)}
        index={photoIndex}
        onIndexChange={setPhotoIndex}
      />
    </>
  );
};

export default Picture;
