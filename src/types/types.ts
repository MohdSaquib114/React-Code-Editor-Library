export type Padding<T> = T | { top?: T; right?: T; bottom?: T; left?: T };

export type props  = React.HTMLAttributes<HTMLDivElement> & {
  //vanilla css for root component
  style: React.CSSProperties;
  language?:string;

  //props for textarea
  value:string;
  onValueChange: (value: string) => void;
  padding?:Padding<number | string>;
  maxLength?: number;
  minLength?: number;
  ignoreTabKey?: boolean;
  insertSpaces?: boolean;
  tabSize?: number;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  onClick?: React.MouseEventHandler<HTMLTextAreaElement>;
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  textareaClassName?: string;
  textareaId?: string;
  autoFocus?: boolean;
  disabled?: boolean;

   // Props for the hightlighted code’s pre element
   preClassName?: string;
}

export type Record = {
  value:string;
  selectionStart:number;
  selectionEnd:number;
}

export type History = {
   stack : (Record & {timestamp:number})[];
   offset: number;
}
