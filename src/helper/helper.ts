export const isWindows = 
  typeof window !== 'undefined' && 'navigator' in window &&
  (('userAgentData' in navigator && (navigator?.userAgentData as NavigatorID).platform === 'Windows') ||
  /Win/i.test(navigator.userAgent));

export const isMac =
  typeof window !== 'undefined' &&
  (('userAgentData' in navigator && /(Mac|iPhone|iPod|iPad)/i.test((navigator.userAgentData as NavigatorID).platform)) ||
  /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));

export  const getLines = (text: string, position: number) =>
    text.substring(0, position).split('\n');

export const  getCommentCharacter = (language: string): string =>  {
  if(!language){
    return "//"
  }
  const singleLineDoubleSlash = [
    "javascript", "typescript", "java", "c", "cpp", "swift", "kotlin", "php", "rust", "go"
  ];
  
  const singleLineHash = [
    "python", "ruby", "perl", "shell", "bash", "r", "powershell", "yaml", "dockerfile"
  ];
  


  const lowerLang = language.toLowerCase();

  if (singleLineDoubleSlash.includes(lowerLang)) {
    return "//";
  }
  if (singleLineHash.includes(lowerLang)) {
    return "#";
  }
  

  return "//"; //Default 
}

