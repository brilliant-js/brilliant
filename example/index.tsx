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

  const [editorState, setEditorState] = useState<EditorState>(() =>
    createFrom(
      `<h1><a href="https://github.com/brilliant-js/brilliant" target="_self">Brilliant Editor</a></h1>
<h3>✨支持 Markdown 快捷语法所见即所得的开源 React 编辑器</h3>
<div style="text-align:left;"><img src="https://cdn.jsdelivr.net/gh/Orime112/picbed/img/20210126174038.png" alt="undefined" style="height: 0px;width: 457px;text-align:left"/></div>
<ul>
<li>支持常见Markdown语法</li>
<li>所见即所得编辑模式</li>
<li>二十多种快捷键提高输入效率</li>
</ul>
<blockquote>代码编辑器支持括号数量识别和换行自动缩进，并且支持括号和引号的识别自动补全</blockquote>
<pre style="language:js;">const a = 12<br>const b = 34<br>function c(a, b) {<br>  return a + b<br>}</pre>
<p>还有<strong>更多</strong>出色<code>功能</code><em>等您探索。。。</em></p>
<h2>文档</h2>
<ul>
<li>详细用法请参考<a href="https://github.com/brilliant-js/brilliant/tree/master/example" target="_self"><strong>使用文档</strong></a></li>
</ul>`,
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
    const editor = editorFC.current;
    if (editor) {
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
    <div style={{ height: '99vh' }}>
      <Brilliant
        language="zh"
        value={editorState}
        editorRef={editorFC}
        // excludeFixedControls={excludeFixedControls}
        // excludeFloatControls={excludeFloatControls}
        handleImgUpload={handleImgUpload}
        imgControls={true}
      />
      {/* <button onClick={outValue}>输出</button> */}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
