import { useState, useMemo } from 'react';
import stateController from 'state-controller';
import { Message } from '../Brilliant/components/Kntd';
import { IMAGE_TYPES } from '../Brilliant/cosntants/mediaMaps';

const useValue = () => {
  const [selectionImgKey, setSelectionImgKey] = useState<string>('');
  const [currentKey, setCurrentKey] = useState<string>('');
  const controller = useMemo(() => {
    return {
      setSelectionImgKey,
      setCurrentKey,

      async fileUpload(
        file: Blob,
        handleImgUpload: (data: FormData) => Promise<{ url: any; id: any }>
      ) {
        if (IMAGE_TYPES.findIndex(v => v === (file as any).type) < 0) {
          Message('图片格式错误!');
          return Promise.reject();
        }
        const data = new FormData();
        data.append('file', file);
        const res = await handleImgUpload(data);
        if (typeof res !== 'object' || !res.url || !res.id) {
          Message('返回格式不正确！');
        }
        if (res.id) {
          const localPic = localStorage.pic ? JSON.parse(localStorage.pic) : [];
          localPic.push({ url: res.url, id: res.id });
          localStorage.pic = JSON.stringify(localPic);
        }

        return Promise.resolve(res);
      },

      fileToBase64(file) {
        return new Promise((resolve, reject) => {
          if (IMAGE_TYPES.findIndex(v => v === file.type) < 0) {
            Message('图片格式错误!');
            return reject();
          }
          const reader = new window.FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const Base64Data = reader.result;
            return resolve(Base64Data);
          };
        });
      },
    };
  }, []);

  const states = { selectionImgKey, currentKey };

  return [states, controller] as const;
};

const useBrilliantController = stateController.create(
  useValue,
  'useBrilliantController'
);

export default useBrilliantController;
