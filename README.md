# react-code-editor-library

A powerful, lightweight, and customizable code editor component built in React. This editor supports syntax highlighting, indentation, undo/redo functionality, and more for a smooth coding experience.

## Features
- **Syntax Highlighting**:  
  Leveraging the [Highlight.js](https://highlightjs.org/) library, this component includes real-time syntax highlighting for code, enhancing readability and user experience.

- **Auto-Indentation**:  
  Customizable indentation for various coding styles with support for spaces or tabs.

- **Undo/Redo History**:  
  Built-in undo/redo functionality to easily navigate through changes.

- **Cross-Platform Keybindings**:  
  Keybindings for common actions that work across different platforms (Windows, Mac, Linux).

## Installation

<!-- 1. Install the necessary dependencies:

   ```bash
   npm install highlight.js
   ```

2. Copy the `CodeEditor` component and its dependencies into your project structure.

3. Import the `CodeEditor` component wherever you'd like to use it:

   ```javascript
   import CodeEditor from './path-to-CodeEditor';
   ``` -->



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