English | [简体中文](./README.zh-CN.md)

# Brilliant Editor-EN

Brilliant is a WYSIWYG markdown editor with live preview support, based on Draft-js and React, implemented in TypeScript. It's compatible with popular browsers.


- [Online Demo](https://brilliant-js.com)

![usage demo](https://cdn.jsdelivr.net/gh/brilliant-js/brilliant/screenshots/editor.gif)


## Installation

```bash
# Install using yarn
yarn add brilliant-editor
# Install using npm
npm install brilliant-editor --save
```

### Example Usage

```javascript
import React from 'react';
import Brilliant from 'brilliant-editor';
import 'brilliant-editor/dist/index.css';

const App = () => {
  return (
    <div>
      <Brilliant language="en"/>
    </div>
  );
};

export default App;
```

## Browsers support

Modern browsers.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera |
| --------- | --------- | --------- | --------- | --------- | 
|Edge| last 2 versions| last 2 versions| last 2 versions| last 2 versions

## Thanks

- [Draftjs-utils](https://github.com/jpuri/draftjs-utils) 
- [react-draft-wysiwyg](https://github.com/jpuri/react-draft-wysiwyg)
- [draft-js-plugins-editor](https://github.com/mediasilo/draft-js-plugins-editor) 
- [draft-js-prism](https://github.com/SamyPesse/draft-js-prism) 
