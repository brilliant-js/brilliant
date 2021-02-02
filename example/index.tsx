import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Brilliant, {
  createFrom,
  EditorState,
  ControlItems,
  EditorFunction,
} from '../dist';
import '../dist/index.css';
import { useRef, useState } from 'react';
import axios from 'axios';

const App = () => {
  const editorFC = useRef<EditorFunction>();

  const curImgStr = `<img src="https://cdn.jsdelivr.net/gh/Orime112/picbed/img/20210126174038.png" alt="" style="height: 100px;width: 356px;text-align:left"/>`;

  const [editorState, setEditorState] = useState<EditorState>(() =>
    createFrom(
      `<h1>Brilliant Editor</h1> <h3>支持 Markdown 快捷语法所见即所得的开源 React 编辑器</h3> <p></p> ${curImgStr} <p></p> <ul> <li>支持常见Markdown语法</li> <li>所见即所得编辑模式</li> <li>二十多种快捷键提高输入效率</li> </ul> <blockquote>代码编辑器支持括号数量识别并自动换行缩进，贴近 IDEA 编辑体验</blockquote> <pre style="language:javascript;">const a = 12<br>const b = 34<br>function c(a, b) {<br> return a + b<br>}</pre> <p>还有<strong>更多</strong><span style="background-color: rgb(247, 145, 48);">出色</span><code>功能</code><em>等您探索。。。</em></p>`,
      'HTML'
    )
  );

  const excludeFixedControls: ControlItems = [
    'BOLD',
    'header-five',
    'header-six',
  ];

  const excludeFloatControls: ControlItems = ['ordered-list-item', 'center'];

  const outValue = () => {
    const editor = editorFC.current
    if (editor) {
      //console.log(editorState); // `EditorState`
      //console.log(editor.getMarkdownValue()); // `Markdown`
      //console.log(editor.getRawValue()); // `Raw`
      console.log(editor.getHtmlValue()); // `HTML`
    }
  };

  const handleImgUpload = async (
    data: FormData
  ): Promise<{ url: string; id: any }> => {
    const url = 'http://orime.top:3232/upload';
    let res: any = {};
    try {
      res = await axios.post(url, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      alert('图片接口请求失败');
    }
    return { url: res.data.url, id: res.data.id };
  };
  
  return (
    <div>
      <Brilliant
        language="zh"
        value={editorState}
        editorRef={editorFC}
        excludeFixedControls={excludeFixedControls}
        excludeFloatControls={excludeFloatControls}
        handleImgUpload={handleImgUpload}
        imgControls={true}
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
