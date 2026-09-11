# react-code-editor-library

A lightweight, controlled code editor component for React. Syntax highlighting via
[highlight.js](https://highlightjs.org/), auto-indentation, undo/redo history, and
cross-platform keybindings — all through a single component with no configuration file.

**[Live demo →]([https://github.com/MohdSaquib114/React-Code-Editor-Library](https://react-code-editor-phi.vercel.app/))** 

## Features
- **Syntax highlighting** — real-time, powered by [highlight.js](https://highlightjs.org/).
- **Auto-indentation** — customizable, with support for spaces or tabs.
- **Undo/redo history** — keystrokes are grouped intelligently, so undo steps back
  through intent rather than individual characters.
- **Cross-platform keybindings** — Tab/Shift+Tab to indent or outdent, Alt+↑/↓ to move a
  line, Shift+Alt+↑/↓ to duplicate it, Ctrl+/ (⌘+/ on Mac) to toggle a line comment, and
  auto-closing pairs for `()`, `[]`, `{}`, `""`, `''`, and `` `` ``.
- **Fully controlled** — `value` and `onValueChange` are the entire contract, so state,
  validation, and persistence stay in your app.
- **React 18 and 19** — works with either.

## Installation

## Installation
 
```bash
npm install @msm_saq/react-code-editor
```



## Usage

```javascript
import React, { useState } from 'react';
import CodeEditor from './CodeEditor';

const MyComponent = () => {
  const [code, setCode] = useState('// Start coding here!');

  return (
    <CodeEditor
      value={code}
      onValueChange={setCode}
      padding={10}
      tabSize={2}
      insertSpaces={true}
    />
  );
};

export default MyComponent;
```

## Props

| Prop               | Type                         | Default       | Description |
|--------------------|------------------------------|---------------|-------------|
| `value`            | `string`                     | Required      | Code content to display in the editor. |
| `onValueChange`    | `(value: string) => void`    | Required      | Callback function that receives updated code content. |
| `style`            | `React.CSSProperties`        | `{}`          | Inline styles for the editor container. |
| `padding`          | `number | { top, right, bottom, left }` | `0` | Padding inside the editor, either as a single value or an object specifying individual sides. |
| `maxLength`        | `number`                     | `undefined`   | Maximum number of characters allowed in the editor. |
| `minLength`        | `number`                     | `undefined`   | Minimum number of characters allowed in the editor. |
| `insertSpaces`     | `boolean`                    | `true`        | Whether to insert spaces instead of tabs. |
| `tabSize`          | `number`                     | `2`           | Number of spaces or tabs inserted for each tab press. |
| `textareaClassName`| `string`                     | `''`          | Custom class name for the textarea element. |
| `onBlur`           | `() => void`                 | `undefined`   | Callback triggered on textarea blur. |
| `onClick`          | `() => void`                 | `undefined`   | Callback triggered on textarea click. |
| `onFocus`          | `() => void`                 | `undefined`   | Callback triggered on textarea focus. |
| `onKeyUp`          | `() => void`                 | `undefined`   | Callback triggered on key up event. |
| `autoFocus`        | `boolean`                    | `false`       | Automatically focuses the textarea on render if set to true. |
| `disabled`         | `boolean`                    | `false`       | Disables the editor if set to true. |
| `language`         | `string`                    | `null`       | Specifiy the comment character. |



---
