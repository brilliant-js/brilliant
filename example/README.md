# 使用文档


### 一、零配置快速使用

- 倡导零配置快速上手，只需要引入默认编辑器组件和样式即可

```javascript
import React from 'react';
import Brilliant from 'brilliant-editor';
import 'brilliant-editor/dist/index.css';

const App = () => {
  return (
    <div>
      <Brilliant />
    </div>
  );
};

export default App;
```

### 二、数据管理(导入，导出)

#### 1. 导入

编辑器的 value 的初始值提供四种初始格式,`HTML`,`Markdown`,`Raw`,`EditorState`,您可以通过`createFrom`的方式导入您项目中所需要的默认值。

```javascript
import React, { useRef, useState } from 'react';
import Brilliant, { createFrom } from 'brilliant-editor';
import 'brilliant-editor/dist/index.css';

const App = () => {
  const [editorState, setEditorState] = useState(() =>
    createFrom(`<h1>Brilliant Editor</h1>`, 'HTML')
  );
  return (
    <div>
      <Brilliant value={editorState} />
    </div>
  );
};

export default App;
```

#### 2. 导出

同样编辑器的 value 的提供四种导出格式,`HTML`,`Markdown`,`Raw`,`EditorState`,您可以通过 Hooks 提供的 `useRef()` 的方式导出您项目中所需要保存的值。

```javascript
import React, { useRef, useState } from 'react';
import Brilliant, { createFrom, EditorFunction } from 'brilliant-editor';
import 'brilliant-editor/dist/index.css';

const App = () => {
  const [editorState, setEditorState] = useState(() =>
    createFrom(`<h1>Brilliant Editor</h1>`, 'HTML')
  );

  const editorFC = useRef<EditorFunction>();

  const outValue = () => {
    const editor = editorFC.current
    if (editor) {
      //console.log(editorState); // `EditorState`
      //console.log(editor.getMarkdownValue()); // `Markdown`
      //console.log(editor.getRawValue()); // `Raw`
      console.log(editor.getHtmlValue()); // `HTML`
    }
  };
  return (
    <div>
      <Brilliant editorRef={editorFC} value={editorState} />
      <button onClick={outValue}>输出数据</button>
    </div>
  );
};

export default App;
```

> 由于 Markdow 和 HTML 数据格式适配不完整，可能会导致部分样式的丢失，推荐使用 Raw 或 EditorState 的格式保存数据

### 二、图片上传配置

- 支持剪贴板图片粘贴和手动上传以及 Markdown 语法上传三种方式
- 默认不配置，则采用 base64 本地图片方案
- 如需配置远程图片链接，请传入`handleImgUpload`方法进行管理，按照以下示例，自定义处理图片上传
- [基于 node.js 的图片上传服务项目可供参考](https://github.com/brilliant-editor/pic-upload-server)

```javascript
import React from 'react';
import Brilliant from 'brilliant-editor';
import 'brilliant-editor/dist/index.css';

const App = () => {
  // * 图片上传方法回调
  const handleImgUpload = async (
    data: FormData
  ): Promise<{ url: string, id: any }> => {
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
        handleImgUpload={handle} // * 图片上传方法
        imgControls={true} // * 是否显示图片控件，默认为 true
      />
    </div>
  );
};

export default App;
```

### 三、控件配置

- 秉承零配置方案，控件在默认情况下都会出现
- 分为两种控件
  - 固定控件：`fixedControls`，默认会出现
  - 浮动控件：`floatControls`，鼠标选中会浮出
    ![20210128184756](https://cdn.jsdelivr.net/gh/Orime112/picbed/20210128184756.png)
- 控制显示隐藏属性分别为`disableFixedControls`（固定）和`disableFloatControls`（浮动）
  - 默认为 false，代表不仅用
  - 传入 true 则禁用相关控件
- 配置控件项相关属性为`excludeFixedControls`和`excludeFloatControls`
  - 注意：传入该属性并且指定排除项可以排除一部分控件
  - 如果不配置，默认所有控件项都有
  - 如果是 Typescript 开发环境，建议配置 ControlItems 接口，用以变量提示

```javascript
import React from 'react';
import Brilliant from 'brilliant-editor';
import 'brilliant-editor/dist/index.css';

const App = () => {
  const excludeFixedControls: ControlItems = [
    'BOLD',
    'header-five',
    'header-six',
  ];
  const excludeFloatControls: ControlItems = ['ordered-list-item', 'center'];

  return (
    <div>
      <Brilliant
        excludeFixedControls={excludeFixedControls}
        excludeFloatControls={excludeFloatControls}
        disableFixedControls
        disableFloatControls
      />
    </div>
  );
};

export default App;
```

### 四、自定义修改主题方案

- 支持导入 prism 支持的主题方案
  - 如有需要配置自定义代码主体高亮，请见[prism-themes](https://github.com/PrismJS/prism-themes)
  - 引入`themes`文件夹中相应样式主题即可

```jsx
import React from 'react';
import Brilliant from 'brilliant-editor';
import 'brilliant-editor/dist/index.css';
import '../assets/thems/brilliant-editor.css'; // 这个是从prism-themes仓库中自己下载的 prism 主题

const App = () => {
  return (
    <div>
      <Brilliant />
    </div>
  );
};
```

### 五、国际化配置

- 支持中文/中文繁体/英文三种语言界面切换
  - 更改`language`属性进行切换
  - 默认值为`language="zh"`

| 语言     | 配置项  |
| -------- | ------- |
| 中文     | zh      |
| 中文繁体 | zh-hant |
| 英文     | en      |

```jsx
import React from 'react';
import Brilliant from 'brilliant-editor';

const App = () => {
  return (
    <div>
      <Brilliant language="zh" />
    </div>
  );
};
```
