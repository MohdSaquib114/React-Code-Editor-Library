import React, { useCallback, useEffect, useRef, useState } from "react";
import useResizeTextArea from "../hooks/useResizeTextArea";
import useHighLightCode from "../hooks/useHighLightCode";
import { History,props,Record } from "../types/types";
import { KeyCodes } from "../const/const";
import { getCommentCharacter, getLines,isMac,isWindows } from "../helper/helper";



const className = 'npm__react-simple-code-editor__textarea';

const cssText = /* CSS */ `
/**
 * Reset the text fill color so that placeholder is visible
 */
.${className}:empty {
  -webkit-text-fill-color: inherit !important;
}

/**
 * Hack to apply on some CSS on IE10 and IE11
 */
@media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
  /**
    * IE doesn't support '-webkit-text-fill-color'
    * So we use 'color: transparent' to make the text transparent on IE
    * Unlike other browsers, it doesn't affect caret color in IE
    */
  .${className} {
    color: transparent !important;
  }

  .${className}::selection {
    background-color: #accef7 !important;
    color: transparent !important;
  }
}
`;



export   const  CodeEditor = (props:props) => {


  const {value,
        onValueChange,
        style,
        padding, 
        maxLength, 
        minLength, 
        insertSpaces = true, 
        tabSize = 2,
        textareaClassName,
        onBlur,
        onClick,
        onFocus,
        onKeyUp,
        autoFocus,
        disabled,
        language
      } = props

  const [, setCapture] = useState(true);

  //For tracking history of code
  const historyRef = useRef<History>({
    stack: [],
    offset: -1,
  });

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const contentStyle = {
    paddingTop: typeof padding === 'object' ? padding.top : padding,
    paddingRight: typeof padding === 'object' ? padding.right : padding,
    paddingBottom: typeof padding === 'object' ? padding.bottom : padding,
    paddingLeft: typeof padding === 'object' ? padding.left : padding,
  };

 


  const recordChange = useCallback((record:Record,overwrite:boolean = false) => {
     const {stack, offset } = historyRef.current;
     if(stack.length && offset > -1){

        //Drop any redo in stack
        historyRef.current.stack = stack.slice(0,offset+1)

        const count = historyRef.current.stack.length

        if(count > KeyCodes.HISTORY_LIMIT){
          const extras = count - KeyCodes.HISTORY_LIMIT;
          historyRef.current.stack = stack.slice(extras,count)
          historyRef.current.offset = Math.max(
            historyRef.current.offset - extras,0
          )
        }

     }

     const timestamp = Date.now()
     
     if (overwrite) {
        const last = historyRef.current.stack[historyRef.current.offset];

        if (last && timestamp - last.timestamp < KeyCodes.HISTORY_TIME_GAP) {
          // A previous entry exists and was in short interval

          // Match the last word in the line
          const re = /[^a-z0-9]([a-z0-9]+)$/i;

          // Get the previous line
          const previous = getLines(last.value, last.selectionStart)
            .pop()
            ?.match(re);

          // Get the current line
          const current = getLines(record.value, record.selectionStart)
            .pop()
            ?.match(re);

          if (previous?.[1] && current?.[1]?.startsWith(previous[1])) {
            // The last word of the previous line and current line match
            // Overwrite previous entry so that undo will remove whole word
            historyRef.current.stack[historyRef.current.offset] = {
              ...record,
              timestamp,
            };

            return;
          }
        }
      }
  
  historyRef.current.stack.push({...record,timestamp})
  historyRef.current.offset++;
  // console.log(historyRef.current.stack[historyRef.current.offset-1])
  }
  ,[])

  const updateInput = (record: Record) => {
    const input = inputRef.current;

    if (!input) return;

    // Update values and selection state
    input.value = record.value;
    input.selectionStart = record.selectionStart;
    input.selectionEnd = record.selectionEnd;

    onValueChange?.(record.value);
  };

  const applyEdits = (record: Record) => {
    // Save last selection state
    const input = inputRef.current;
    const last = historyRef.current.stack[historyRef.current.offset];

    if (last && input) {
      historyRef.current.stack[historyRef.current.offset] = {
        ...last,
        selectionStart: input.selectionStart,
        selectionEnd: input.selectionEnd,
      };
    }

    // Save the changes
    recordChange(record);
    updateInput(record);
  };

  const undoEdit = () => {
    const { stack, offset } = historyRef.current;

    // Get the previous edit
    const record = stack[offset - 1];

    if (record) {
      // Apply the changes and update the offset
      updateInput(record);
      historyRef.current.offset = Math.max(offset - 1, 0);
    }
  };

  const redoEdit = () => {
    const { stack, offset } = historyRef.current;

    // Get the next edit
    const record = stack[offset + 1];

    if (record) {
      // Apply the changes and update the offset
      updateInput(record);
      historyRef.current.offset = Math.min(offset + 1, stack.length - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

    if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
    const { value, selectionStart, selectionEnd } = e.currentTarget;

    const tabCharacter = (insertSpaces ? ' ' : '\t').repeat(tabSize);

if(e.key === 'Tab'){
      //prevent focus of textarea
      e.preventDefault();

      //combination of shift + tab key to remove any tab character at the start
      if(e.shiftKey){
        //Get all the lines from starting to caret positon
        const linesBeforeCaret = getLines(value, selectionStart);
        const startLine = linesBeforeCaret.length - 1;
        const endLine = getLines(value, selectionEnd).length - 1;

        //remove tab characters from starting of the line where caret is
        const nextValue = value
        .split('\n')
        .map((line, i) => {
          if (
            i >= startLine &&
            i <= endLine &&
            line.startsWith(tabCharacter)
          ) {
            //remove the tab char from starting 
            return line.substring(tabCharacter.length);
          }

          return line;
        })
        .join('\n');
      
      if (value !== nextValue) {
        const startLineText = linesBeforeCaret[startLine];
        //update the state 
        applyEdits({
          value: nextValue,
      
          selectionStart: startLineText?.startsWith(tabCharacter)
            ? selectionStart - tabCharacter.length
            : selectionStart,
   
          selectionEnd: selectionEnd - (value.length - nextValue.length),
        });
      }
   
      //Work when a text is selected
     }else if(selectionStart !== selectionEnd){

      const linesBeforeCaret = getLines(value, selectionStart);
      const startLine = linesBeforeCaret.length - 1;
      const endLine = getLines(value, selectionEnd).length - 1;
      const startLineText = linesBeforeCaret[startLine];

      applyEdits({
        //add tab char at the starting of all the selected lines
        value: value
          .split('\n')
          .map((line, i) => {
            if (i >= startLine && i <= endLine) {
              return tabCharacter + line;
            }

            return line;
          })
          .join('\n'),
        // Move the start cursor by number of characters added in first line of selection
        // Don't move it if it there was no text before cursor
        selectionStart:
          startLineText && /\S/.test(startLineText)
            ? selectionStart + tabCharacter.length
            : selectionStart,
        // Move the end cursor by total number of characters added
        selectionEnd:
          selectionEnd + tabCharacter.length * (endLine - startLine + 1),
      });
     }else{
      const updatedSelection = selectionStart + tabCharacter.length;

      applyEdits({
        // Insert tab character at caret
        value:
          value.substring(0, selectionStart) +
          tabCharacter +
          value.substring(selectionEnd),
        // Update caret position
        selectionStart: updatedSelection,
        selectionEnd: updatedSelection,
      });
    }
  }else if(e.key === 'Backspace'){
     const hasSelect = selectionStart !== selectionEnd
     const textBeforeCaret = value.substring(0,selectionStart)

     if(textBeforeCaret.endsWith(tabCharacter) && !hasSelect){
      //prevent default backspace behaviour
      e.preventDefault()

      const updatedSelection = selectionStart - tabCharacter.length;

      applyEdits({
        // Remove tab character at caret
        value:
          value.substring(0, selectionStart - tabCharacter.length) +
          value.substring(selectionEnd),
        // Update caret position
        selectionStart: updatedSelection,
        selectionEnd: updatedSelection,
      });
     }
  
  }else if(e.key === 'Enter'){
    //ignore selection
    if(selectionEnd === selectionStart){
      const lineBeforeCaret = getLines(value,selectionStart).pop()
      const matches = lineBeforeCaret?.match(/^\s+/)
     if(matches?.[0]){
        e.preventDefault()
        const indent = '\n' + matches[0]
        const updateSelection  = selectionStart + indent.length
        applyEdits({
          // Insert indentation character at caret
          value:
            value.substring(0, selectionStart) +
            indent +
            value.substring(selectionEnd),
          
          selectionStart: updateSelection,
          selectionEnd: updateSelection,
        });
     }
    }
  }else if (
    e.keyCode === KeyCodes.KEYCODE_PARENS ||
    e.keyCode === KeyCodes.KEYCODE_BRACKETS ||
    e.keyCode === KeyCodes.KEYCODE_QUOTE ||
    e.keyCode === KeyCodes.KEYCODE_BACK_QUOTE
  ){
    let chars;

    if (e.keyCode === KeyCodes.KEYCODE_PARENS && e.shiftKey) {
      chars = ['(', ')'];
    } else if (e.keyCode === KeyCodes.KEYCODE_BRACKETS) {
      if (e.shiftKey) {
        chars = ['{', '}'];
      } else {
        chars = ['[', ']'];
      }
    } else if (e.keyCode === KeyCodes.KEYCODE_QUOTE) {
      if (e.shiftKey) {
        chars = ['"', '"'];
      } else {
        chars = ["'", "'"];
      }
    } else if (e.keyCode === KeyCodes.KEYCODE_BACK_QUOTE && !e.shiftKey) {
      chars = ['`', '`'];
    }

    if (selectionStart !== selectionEnd && chars) {
      e.preventDefault();

      applyEdits({
        value:
          value.substring(0, selectionStart) +
          chars[0] +
          value.substring(selectionStart, selectionEnd) +
          chars[1] +
          value.substring(selectionEnd),
        // Update caret position
        selectionStart,
        selectionEnd: selectionEnd + 2,
      });
    }
  }else if(e.altKey && !e.shiftKey){
    e.preventDefault()
    
    const linesBeforeCaret = getLines(value, selectionStart);
    const startLine = linesBeforeCaret.length - 1;
    const endLine = getLines(value, selectionEnd).length - 1;
    const lines = getLines(value,value.length);
    if (startLine < 1 || lines.length <= 1) {
      return;
  }



  const lineLengths = lines.map((line:string) => line.length + 1);
      if(e.key === KeyCodes.ARROW_DOWN){
       
          const temp = lines[endLine + 1]

          for(let i = endLine ; i >= startLine; i--){
                lines[i +1] = lines[i]

          }
          lines[startLine] = temp

          const updatedSelectionStart = selectionStart + lineLengths[endLine + 1];
          const updatedSelectionEnd = selectionEnd + lineLengths[endLine + 1];
        
          applyEdits({
            value:lines.join('\n'),
            selectionStart:updatedSelectionStart,
            selectionEnd:updatedSelectionEnd
          })
        }else if(e.key === KeyCodes.ARROW_UP){
          
          const temp = lines[startLine - 1]

          for(let i = startLine ; i <= endLine; i++){
            if(i > 0){

              lines[i - 1] = lines[i]
            }

          }
          lines[endLine] = temp
          
          const updatedSelectionStart = selectionStart - lineLengths[startLine - 1];
          const updatedSelectionEnd = selectionEnd  - lineLengths[startLine - 1];

          applyEdits({
            value:lines.join('\n'),
            selectionStart:updatedSelectionStart,
            selectionEnd:updatedSelectionEnd
          })
      }

 
  
    }else if (e.shiftKey && e.altKey) {
      e.preventDefault();
      
      if (e.key === KeyCodes.ARROW_DOWN || e.key === KeyCodes.ARROW_UP) {
        const linesBeforeCaret = value.substring(0, selectionStart).split('\n');
   
        const startLine = linesBeforeCaret.length - 1;
        const endLine = getLines(value, selectionEnd).length - 1;
     
        
        const lines = value.split('\n');
        const linesToCopy = lines.slice(startLine, endLine + 1);
        const copiedLines = linesToCopy.join('\n');

       
       
            lines.splice(endLine + 1, 0, ...linesToCopy);
            let updateSelectionStart = selectionStart +  copiedLines.length + 1
            if(selectionStart === selectionEnd){
                updateSelectionStart  = selectionEnd + copiedLines.length + 1
            }
            applyEdits({
                value: lines.join('\n'),
                selectionStart: updateSelectionStart,
                selectionEnd: selectionEnd + copiedLines.length + 1, 
            });
        
    }
}else if(e.ctrlKey && e.key === '/'){
    const allLines = getLines(value,value.length)
  
    const startLine = getLines(value,selectionStart).length - 1;
    const endLine = getLines(value,selectionEnd).length - 1;
    let updatedValue= ''
    const commentChar = getCommentCharacter(language as string)
    if(allLines[startLine].startsWith(commentChar) && allLines[endLine].startsWith(commentChar)){
        for(let i = startLine ; i<= endLine; i++){
            const line = allLines[i]?.replace(/^\/\/\s?/, "")
           allLines[i] = line; 
        }
        updatedValue = allLines.join('\n')
   
    }else{
        updatedValue = allLines.map((line:string,i:number)=>{
          if(i >= startLine && i <= endLine)
            return commentChar + " " + line
          else 
            return line
        }).join('\n')
    }
   
    
    applyEdits({
        value: updatedValue,
        selectionStart: selectionStart,
        selectionEnd: selectionEnd, 
    });

}
else if (
    (isMac
      ? // Trigger undo with ⌘+Z on Mac
        e.metaKey && e.keyCode === KeyCodes.KEYCODE_Z
      : // Trigger undo with Ctrl+Z on other platforms
        e.ctrlKey && e.keyCode === KeyCodes.KEYCODE_Z) &&
    !e.shiftKey &&
    !e.altKey
  ) {
    e.preventDefault();

    undoEdit();
  } else if (
    (isMac
      ? // Trigger redo with ⌘+Shift+Z on Mac
        e.metaKey && e.keyCode === KeyCodes.KEYCODE_Z && e.shiftKey
      : isWindows
      ? // Trigger redo with Ctrl+Y on Windows
        e.ctrlKey && e.keyCode === KeyCodes.KEYCODE_Y
      : // Trigger redo with Ctrl+Shift+Z on other platforms
        e.ctrlKey && e.keyCode === KeyCodes.KEYCODE_Z && e.shiftKey) &&
    !e.altKey
  ) {
    e.preventDefault();

    redoEdit();
  } else if (
    e.keyCode === KeyCodes.KEYCODE_M &&
    e.ctrlKey &&
    (isMac ? e.shiftKey : true)
  ) {
    e.preventDefault();

    // Toggle capturing tab key so users can focus away
    setCapture((prev) => !prev);
  }

  }


  const recordCurrentState = useCallback(() => {
    const input = inputRef.current;

    if (!input) return;

    // Save current state of the input
    const { value, selectionStart, selectionEnd } = input;
 
    recordChange({
      value,
      selectionStart,
      selectionEnd,
    });
  }, [recordChange]);



  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, selectionStart, selectionEnd }: Record = e.currentTarget;
    recordChange({
      value,
      selectionStart,
      selectionEnd,
    },true);
    onValueChange(value);
  }

  useEffect(() => {

    recordCurrentState();
  
  }, [recordCurrentState]);

 

  const highlightedCode = useHighLightCode(value);
  useResizeTextArea(inputRef.current,value)



  return (
           <div
                onClick={
                    () => {
                        if(inputRef.current){
                            inputRef.current.focus()
                        }
                }}

              
                style={{ ...styles.container,...style, ...contentStyle }}
                >
 
                        <div
                             style={{...styles.lineContainer}}
                           >
                                {value?.split('\n')?.map((_, i) => (
                                    <p style={{...styles.number}}  key={i}>{i + 1}</p>
                                ))}
                        </div>

                        <div style={{position:'relative'}} >
                            <pre
                                aria-hidden="true"
                                style={{...styles.editor,...styles.highlight}}
                                {...(typeof highlightedCode === 'string'
                                ? { dangerouslySetInnerHTML: { __html: highlightedCode + '<br />' } }
                                : { children: highlightedCode })}
                            />
                            
                            <textarea
                                ref={(c) => (inputRef.current = c)}
                                className={`${textareaClassName}`}
                                style={{...styles.textarea,...styles.editor,}}
                                rows={1}
                                value={value}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                onClick={onClick}
                                onKeyUp={onKeyUp}
                                onFocus={onFocus}
                                onBlur={onBlur}
                                disabled={disabled}
                                autoFocus={autoFocus}
                                title="code-editor"
                                autoCapitalize="off"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                                aria-autocomplete="none"
                                maxLength={maxLength}
                                minLength={minLength}
                            />
                            <style dangerouslySetInnerHTML={{ __html: cssText }} />
                        </div>
                        <div style={{...styles.blurOverlay}} ></div>
         </div>

  )
}

const styles = {
  textarea: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    color: "inherit",
    overflow: "hidden",
    resize: "none",
    MozOsxFontSmoothing: "grayscale",
    WebkitFontSmoothing: "antialiased",
    WebkitTextFillColor: "transparent",
    outline: "none",
  },
  lineContainer: {
    paddingRight: "20px",
    textAlign: "right",
    position: "relative",
    height: "100%",
  },
  highlight: {
    position: "relative",
    pointerEvents: "none",
  },
  container: {
    display: "flex",
    alignItems: "stretch",
    overflowY: "scroll",
    width: "100%",
    position: "relative",
    textAlign: "left",
    boxSizing: "border-box",
    padding: 0,
    scrollbarWidth:'none'
  },
  editor: {
    margin: 0,
    border: 0,
    background: "none",
    boxSizing: "inherit",
    display: "inherit",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontStyle: "inherit",
    fontVariantLigatures: "inherit",
    fontWeight: "inherit",
    letterSpacing: "inherit",
    lineHeight: "inherit",
    tabSize: "inherit",
    textIndent: "inherit",
    textRendering: "inherit",
    textTransform: "inherit",
    whiteSpace: "pre-wrap",
    wordBreak: "keep-all",
    overflowWrap: "break-word",
  },
  number: {
    margin: 0,
  },
  containerScrollbar: {
    WebkitScrollbar: {
      width: "10px",
    },
    WebkitScrollbarTrack: {
      background: "transparent",
    },
    WebkitScrollbarThumb: {
      backgroundColor: "#888",
      borderRadius: "8px",
    },
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "10px",
    background: "rgba(255, 255, 255, 0.7)",
    display: "none",
    pointerEvents: "none",
  },
} as const

