import { useEffect, useState } from "react";
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

const useHighLightCode = (
   value:string,

) => {
    const [highlightedCode, setHighlightedCode] = useState('');
    useEffect(() => {
        const highlighted = hljs.highlightAuto(value).value;
        setHighlightedCode(highlighted);
      }, [value]);
      return highlightedCode
}

export default useHighLightCode;