import { htmlCompletionSource } from '@codemirror/lang-html';
import { cssCompletionSource } from '@codemirror/lang-css';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import { bracketMatching } from '@codemirror/language';//括号匹配高亮
import { autocompletion, CompletionContext, CompletionSource, snippetCompletion } from '@codemirror/autocomplete';
import { keymap } from '@codemirror/view';

// 常用 HTML5 标签（用于标签补全）
const htmlTags = [
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
  'form', 'input', 'button', 'textarea', 'select', 'option', 'label', 'fieldset', 'legend', 'section', 'article',
  'header', 'footer', 'nav', 'aside', 'main', 'figure', 'figcaption', 'blockquote', 'code', 'pre', 'em', 'strong',
  'b', 'i', 'u', 'br', 'hr', 'iframe', 'video', 'audio', 'canvas', 'svg', 'path', 'circle', 'rect', 'line', 'text'
];

// 自闭合标签列表
const selfClosingTags = [
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
];

// HTML 标签补全源（支持输入部分标签名补全）
export const htmlTagCompletionSource: CompletionSource = (context: CompletionContext) => {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from == word.to && !context.explicit)) return null;

  const line = context.state.doc.lineAt(context.pos);
  const beforeCursor = line.text.slice(0, context.pos - line.from);

  // 检查是否在注释中
  const inComment = /<!--.*-->$/.test(beforeCursor);

  if (inComment) {
    return null; // 在注释中不提供补全
  }

  // 检查是否在标签内（<tag> 或 <tag attr>）
  const inTag = /<[^>]*$/.test(beforeCursor);

  if (inTag) {
    // 在标签内提供属性补全，自动添加 ="" 
    const commonAttributes = [
      'class', 'id', 'style', 'title', 'alt', 'src', 'href', 'type', 'name', 'value',
      'placeholder', 'required', 'disabled', 'readonly', 'maxlength', 'minlength',
      'pattern', 'autocomplete', 'autofocus', 'form', 'list', 'multiple', 'size',
      'step', 'min', 'max', 'checked', 'selected', 'hidden', 'target', 'rel',
      'download', 'hreflang', 'media', 'sizes', 'integrity', 'crossorigin',
      'async', 'defer', 'charset', 'content', 'http-equiv', 'name', 'property',
      'data-', 'aria-', 'role', 'tabindex', 'accesskey', 'draggable', 'spellcheck',
      'contenteditable', 'translate', 'dir', 'lang', 'xml:lang', 'xml:space'
    ];

    const attributeSnippets = commonAttributes.map(attr => {
      if (attr === 'data-' || attr === 'aria-') {
        // 对于data-和aria-属性，提供模板
        return snippetCompletion(`${attr}\${1:attribute}="\${2:value}"`, { label: attr });
      } else {
        // 普通属性，自动添加 =""
        return snippetCompletion(`${attr}="\${1}"`, { label: attr });
      }
    });
    //返回补全结果，from: word.from 表示补全结果的起始位置，options: attributeSnippets 表示补全选项，validFor: /\w*/ 表示补全的正则表达式
    return {
      from: word.from,
      options: attributeSnippets,
      validFor: /\w*/
    };
  }

  // 提供标签补全（使用snippetCompletion）
  const tagSnippets = htmlTags.map(tag => {
    if (selfClosingTags.includes(tag)) {
      // 自闭合标签，光标定位在属性位置
      return snippetCompletion(`<${tag} \${1} />`, { label: tag });
    } else {
      // 普通标签，光标定位在内容内
      return snippetCompletion(`<${tag}>\${1}</${tag}>`, { label: tag });
    }
  });

  // 只提供一些常用的HTML代码片段（CodeMirror原生没有的）
  const htmlSnippets = [
    // 常用的HTML结构片段
    snippetCompletion('<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${1:Document}</title>\n</head>\n<body>\n\t${2}\n</body>\n</html>', { label: 'html5' }),
    snippetCompletion('<meta charset="UTF-8">', { label: 'meta charset' }),
    snippetCompletion('<meta name="viewport" content="width=device-width, initial-scale=1.0">', { label: 'meta viewport' }),
    snippetCompletion('<link rel="stylesheet" href="${1:style.css}">', { label: 'link css' }),
    snippetCompletion('<script src="${1:script.js}"></script>', { label: 'script src' }),
    // 常用的表单结构
    snippetCompletion('<form action="${1}" method="${2:post}">\n\t${3}\n</form>', { label: 'form' }),
    snippetCompletion('<fieldset>\n\t<legend>${1:Legend}</legend>\n\t${2}\n</fieldset>', { label: 'fieldset' }),
    // 常用的列表结构
    snippetCompletion('<ul>\n\t<li>${1}</li>\n\t<li>${2}</li>\n</ul>', { label: 'ul list' }),
    snippetCompletion('<ol>\n\t<li>${1}</li>\n\t<li>${2}</li>\n</ol>', { label: 'ol list' }),
    // 常用的表格结构
    snippetCompletion('<table>\n\t<thead>\n\t\t<tr>\n\t\t\t<th>${1}</th>\n\t\t</tr>\n\t</thead>\n\t<tbody>\n\t\t<tr>\n\t\t\t<td>${2}</td>\n\t\t</tr>\n\t</tbody>\n</table>', { label: 'table' }),
    // 常用的语义化结构
    snippetCompletion('<header>\n\t${1}\n</header>\n<main>\n\t${2}\n</main>\n<footer>\n\t${3}\n</footer>', { label: 'semantic layout' }),
    // 常用的媒体元素
    snippetCompletion('<figure>\n\t<img src="${1}" alt="${2}">\n\t<figcaption>${3}</figcaption>\n</figure>', { label: 'figure' }),
    // 常用的数据属性
    snippetCompletion('data-${1:attribute}="${2:value}"', { label: 'data attribute' }),
    snippetCompletion('aria-${1:label}="${2:value}"', { label: 'aria attribute' })
  ];

  return {
    from: word.from,
    options: tagSnippets,
    validFor: /\w*/
  };
};

// HTML 自动补全（使用标签补全 + 代码片段 + CodeMirror原生）
export const htmlAutocomplete = autocompletion({
  override: [htmlTagCompletionSource, htmlCompletionSource],
  defaultKeymap: true,
  maxRenderedOptions: 50
});


// CSS 代码片段补全源（增强的CSS补全功能）
export const cssSnippetCompletionSource: CompletionSource = (context: CompletionContext) => {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from == word.to && !context.explicit)) return null;

  const line = context.state.doc.lineAt(context.pos);
  const beforeCursor = line.text.slice(0, context.pos - line.from);

  // 检查是否在注释中
  const inComment = /\/\*.*\*\/$/.test(beforeCursor) || /\/\/.*$/.test(beforeCursor);

  if (inComment) {
    return null; // 在注释中不提供补全
  }

  // 检查是否在字符串中
  const inString = /["'][^"']*$/.test(beforeCursor);

  if (inString) {
    return null; // 在字符串中不提供补全
  }

  // 检查是否在属性值中（冒号后面）
  const inPropertyValue = /:\s*[^;]*$/.test(beforeCursor);

  // 如果在属性值中，优先提供单位补全和属性值补全
  if (inPropertyValue) {
    // 改进的数字匹配逻辑，避免重复触发
    const numberMatch = beforeCursor.match(/(\d+(?:\.\d+)?)\s*$/);
    if (numberMatch) {
      const number = numberMatch[1];
      // 检查光标后是否已经有单位，避免重复补全
      const afterCursor = line.text.slice(context.pos - line.from);
      const hasUnitAfter = /^[a-zA-Z%]+/.test(afterCursor);
      
      if (hasUnitAfter) {
        return null; // 已经有单位了，不需要补全
      }

      const units = [
        { label: `${number}px`, insert: 'px', type: 'unit' },
        { label: `${number}rem`, insert: 'rem', type: 'unit' },
        { label: `${number}em`, insert: 'em', type: 'unit' },
        { label: `${number}%`, insert: '%', type: 'unit' },
        { label: `${number}vw`, insert: 'vw', type: 'unit' },
        { label: `${number}vh`, insert: 'vh', type: 'unit' },
        { label: `${number}pt`, insert: 'pt', type: 'unit' },
        { label: `${number}deg`, insert: 'deg', type: 'unit' },
        { label: `${number}s`, insert: 's', type: 'unit' },
        { label: `${number}ms`, insert: 'ms', type: 'unit' }
      ];

      return {
        from: context.pos,
        options: units.map(unit => ({
          label: unit.label,
          apply: unit.insert,
          type: unit.type,
          boost: 99 // 提高优先级
        })),
        validFor: /^$/ // 只在没有后续字符时有效
      };
    }

    // 在属性值中提供常见属性值补全（不带分号）
    // 获取当前属性名以提供相关的属性值
    const propertyMatch = beforeCursor.match(/(\w+)\s*:\s*[^;]*$/);
    let propertyName = '';
    if (propertyMatch) {
      propertyName = propertyMatch[1];
    }

    // 根据属性名提供相应的属性值
    const getPropertyValues = (prop: string) => {
      const commonValues: { [key: string]: string[] } = {
        'display': ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'table', 'table-cell', 'none'],
        'position': ['static', 'relative', 'absolute', 'fixed', 'sticky'],
        'text-align': ['left', 'right', 'center', 'justify', 'start', 'end'],
        'font-weight': ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
        'font-style': ['normal', 'italic', 'oblique'],
        'text-decoration': ['none', 'underline', 'overline', 'line-through'],
        'text-transform': ['none', 'uppercase', 'lowercase', 'capitalize'],
        'color': ['red', 'blue', 'green', 'black', 'white', 'gray', 'transparent', 'inherit', 'currentColor'],
        'background-color': ['transparent', 'white', 'black', 'red', 'blue', 'green', 'gray', 'inherit'],
        'border-style': ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'],
        'overflow': ['visible', 'hidden', 'scroll', 'auto'],
        'white-space': ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line'],
        'vertical-align': ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom'],
        'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
        'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
        'align-items': ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'],
        'background-repeat': ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'],
        'background-size': ['auto', 'cover', 'contain'],
        'background-position': ['left', 'center', 'right', 'top', 'bottom'],
        'cursor': ['auto', 'pointer', 'text', 'move', 'not-allowed', 'grab', 'grabbing'],
        'visibility': ['visible', 'hidden', 'collapse']
      };

      return commonValues[prop] || [];
    };

    // 通用常见属性值（适用于多个属性）
    const commonPropertyValues = [
      'auto', 'none', 'inherit', 'initial', 'unset', 'normal', 'bold', 'center', 'left', 'right',
      'top', 'bottom', 'middle', 'block', 'inline', 'flex', 'grid', 'absolute', 'relative',
      'fixed', 'static', 'hidden', 'visible', 'transparent', 'solid', 'pointer', 'text'
    ];

    // 获取特定属性的值和通用值
    const specificValues = getPropertyValues(propertyName);
    const allValues = [...specificValues, ...commonPropertyValues.filter(v => !specificValues.includes(v))];

    // 过滤匹配的值
    const matchedValues = allValues.filter(value => 
      value.toLowerCase().startsWith(word.text.toLowerCase())
    );

    if (matchedValues.length > 0) {
      return {
        from: word.from,
        options: matchedValues.map(value => ({
          label: value,
          apply: value, // 属性值不带分号
          type: 'value',
          boost: specificValues.includes(value) ? 10 : 0 // 特定属性值优先级更高
        })),
        validFor: /\w*/
      };
    }
  }

  // 改进的CSS属性补全，确保所有属性都有分号
  const cssProperties = [
    // Font相关
    'font-size', 'font-weight', 'font-family', 'font-style', 'font-variant',
    'font-stretch', 'font-size-adjust', 'line-height', 'text-align', 
    'text-decoration', 'text-transform', 'letter-spacing', 'word-spacing',
    
    // Layout相关
    'display', 'position', 'top', 'right', 'bottom', 'left',
    'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
    'box-sizing', 'overflow', 'overflow-x', 'overflow-y', 'z-index',
    
    // Margin和Padding
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    
    // Border相关
    'border', 'border-width', 'border-style', 'border-color', 'border-radius',
    'border-top', 'border-right', 'border-bottom', 'border-left',
    
    // Background相关
    'background', 'background-color', 'background-image', 'background-size',
    'background-position', 'background-repeat', 'background-attachment',
    
    // Flexbox
    'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'justify-content',
    'align-items', 'align-content', 'align-self', 'flex-grow', 'flex-shrink',
    
    // Grid
    'grid', 'grid-template', 'grid-template-columns', 'grid-template-rows',
    'grid-gap', 'grid-column', 'grid-row', 'grid-area',
    
    // Transform和Animation
    'transform', 'transform-origin', 'transition', 'transition-property',
    'transition-duration', 'transition-timing-function', 'transition-delay',
    'animation', 'animation-name', 'animation-duration', 'animation-timing-function',
    'opacity', 'visibility', 'cursor'
  ];

  // 根据输入的字符进行过滤和补全
  const filteredProperties = cssProperties.filter(prop => 
    prop.toLowerCase().includes(word.text.toLowerCase())
  );

  const cssSnippets = filteredProperties.map(prop => 
    snippetCompletion(`${prop}: \${1};`, { 
      label: prop,
      type: 'property',
      boost: prop.startsWith(word.text) ? 10 : 0 // 前缀匹配优先级更高
    })
  );

  // 常用CSS值补全
  const cssValues = [];
  
  // 根据属性上下文提供特定值
  const propertyContext = beforeCursor.match(/(\w+(?:-\w+)*)\s*:\s*[^;]*$/);
  if (propertyContext) {
    const property: string = propertyContext[1];
    
    // 为特定属性提供常用值
    const propertyValues: Record<string, string[]> = {
      'display': ['block', 'inline', 'inline-block', 'flex', 'grid', 'none'],
      'position': ['static', 'relative', 'absolute', 'fixed', 'sticky'],
      'text-align': ['left', 'center', 'right', 'justify'],
      'font-weight': ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
      'cursor': ['pointer', 'default', 'text', 'wait', 'help', 'not-allowed'],
      'overflow': ['visible', 'hidden', 'scroll', 'auto'],
      'flex-direction': ['row', 'column', 'row-reverse', 'column-reverse'],
      'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
      'align-items': ['stretch', 'flex-start', 'flex-end', 'center', 'baseline']
    };

    if (propertyValues[property]) {
      cssValues.push(...propertyValues[property].map((value: string) => 
        snippetCompletion(`${value};`, { 
          label: value, 
          type: 'value',
          boost: 5
        })
      ));
    }
  }

  return {
    from: word.from,
    options: [...cssSnippets, ...cssValues],
    validFor: /^[\w-]*$/
  };
};

// CSS 自动补全（使用CodeMirror原生 + 自定义代码片段）
export const cssAutocomplete = autocompletion({
  override: [cssSnippetCompletionSource, cssCompletionSource],
  defaultKeymap: true,
  maxRenderedOptions: 50
});

// JavaScript 代码片段补全源（增强版）
export const jsSnippetCompletionSource: CompletionSource = (context: CompletionContext) => {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from == word.to && !context.explicit)) return null;

  const line = context.state.doc.lineAt(context.pos);
  const beforeCursor = line.text.slice(0, context.pos - line.from);

  // 检查是否在字符串中
  const inString = /["'`][^"'`]*$/.test(beforeCursor);

  // 检查是否在注释中
  const inComment = /\/\/.*$/.test(beforeCursor) || /\/\*.*\*\/$/.test(beforeCursor);

  if (inComment || inString) {
    return null; // 在注释或字符串中不提供补全
  }

  // 现代JavaScript代码片段
  const modernJsSnippets = [
    // ES6+ 语法
    snippetCompletion('const ${1:name} = ${2:value};', { label: 'const', type: 'keyword' }),
    snippetCompletion('let ${1:name} = ${2:value};', { label: 'let', type: 'keyword' }),
    snippetCompletion('const [${1:first}, ${2:second}] = ${3:array};', { label: 'destructuring array', type: 'snippet' }),
    snippetCompletion('const {${1:prop}} = ${2:object};', { label: 'destructuring object', type: 'snippet' }),
    snippetCompletion('const {${1:prop}: ${2:alias}} = ${3:object};', { label: 'destructuring with alias', type: 'snippet' }),
    
    // Arrow Functions
    snippetCompletion('(${1:params}) => ${2:expression}', { label: 'arrow function', type: 'snippet' }),
    snippetCompletion('(${1:params}) => {\n\t${2}\n}', { label: 'arrow function block', type: 'snippet' }),
    snippetCompletion('async (${1:params}) => {\n\t${2}\n}', { label: 'async arrow', type: 'snippet' }),
    
    // Promise & Async/Await
    snippetCompletion('new Promise((resolve, reject) => {\n\t${1}\n});', { label: 'new Promise', type: 'snippet' }),
    snippetCompletion('Promise.all([${1}]);', { label: 'Promise.all', type: 'method' }),
    snippetCompletion('Promise.race([${1}]);', { label: 'Promise.race', type: 'method' }),
    snippetCompletion('Promise.allSettled([${1}]);', { label: 'Promise.allSettled', type: 'method' }),
    snippetCompletion('async function ${1:name}(${2:params}) {\n\ttry {\n\t\t${3}\n\t} catch (error) {\n\t\t${4}\n\t}\n}', { label: 'async function with try/catch', type: 'snippet' }),
    snippetCompletion('await ${1:promise};', { label: 'await', type: 'keyword' }),
    
    // Array Methods (ES5+)
    snippetCompletion('${1:array}.map(${2:item} => ${3:item});', { label: 'array.map', type: 'method' }),
    snippetCompletion('${1:array}.filter(${2:item} => ${3:condition});', { label: 'array.filter', type: 'method' }),
    snippetCompletion('${1:array}.reduce((${2:acc}, ${3:item}) => ${4:acc}, ${5:initial});', { label: 'array.reduce', type: 'method' }),
    snippetCompletion('${1:array}.find(${2:item} => ${3:condition});', { label: 'array.find', type: 'method' }),
    snippetCompletion('${1:array}.findIndex(${2:item} => ${3:condition});', { label: 'array.findIndex', type: 'method' }),
    snippetCompletion('${1:array}.some(${2:item} => ${3:condition});', { label: 'array.some', type: 'method' }),
    snippetCompletion('${1:array}.every(${2:item} => ${3:condition});', { label: 'array.every', type: 'method' }),
    snippetCompletion('${1:array}.forEach(${2:item} => {\n\t${3}\n});', { label: 'array.forEach', type: 'method' }),
    snippetCompletion('${1:array}.includes(${2:item});', { label: 'array.includes', type: 'method' }),
    snippetCompletion('${1:array}.flat(${2:depth});', { label: 'array.flat', type: 'method' }),
    snippetCompletion('${1:array}.flatMap(${2:item} => ${3:item});', { label: 'array.flatMap', type: 'method' }),
    
    // Object Methods
    snippetCompletion('Object.keys(${1:object});', { label: 'Object.keys', type: 'method' }),
    snippetCompletion('Object.values(${1:object});', { label: 'Object.values', type: 'method' }),
    snippetCompletion('Object.entries(${1:object});', { label: 'Object.entries', type: 'method' }),
    snippetCompletion('Object.assign({}, ${1:source});', { label: 'Object.assign', type: 'method' }),
    snippetCompletion('Object.freeze(${1:object});', { label: 'Object.freeze', type: 'method' }),
    snippetCompletion('Object.seal(${1:object});', { label: 'Object.seal', type: 'method' }),
    snippetCompletion('Object.hasOwnProperty.call(${1:object}, "${2:property}");', { label: 'hasOwnProperty', type: 'method' }),
    
    // Modern DOM API
    snippetCompletion('document.querySelector("${1:selector}");', { label: 'querySelector', type: 'method' }),
    snippetCompletion('document.querySelectorAll("${1:selector}");', { label: 'querySelectorAll', type: 'method' }),
    snippetCompletion('document.getElementById("${1:id}");', { label: 'getElementById', type: 'method' }),
    snippetCompletion('document.createElement("${1:tagName}");', { label: 'createElement', type: 'method' }),
    snippetCompletion('${1:element}.addEventListener("${2:event}", ${3:handler});', { label: 'addEventListener', type: 'method' }),
    snippetCompletion('${1:element}.removeEventListener("${2:event}", ${3:handler});', { label: 'removeEventListener', type: 'method' }),
    snippetCompletion('${1:element}.classList.add("${2:className}");', { label: 'classList.add', type: 'method' }),
    snippetCompletion('${1:element}.classList.remove("${2:className}");', { label: 'classList.remove', type: 'method' }),
    snippetCompletion('${1:element}.classList.toggle("${2:className}");', { label: 'classList.toggle', type: 'method' }),
    snippetCompletion('${1:element}.classList.contains("${2:className}");', { label: 'classList.contains', type: 'method' }),
    
    // Fetch API
    snippetCompletion('fetch("${1:url}")\n\t.then(response => response.json())\n\t.then(data => {\n\t\t${2}\n\t})\n\t.catch(error => {\n\t\t${3}\n\t});', { label: 'fetch basic', type: 'snippet' }),
    snippetCompletion('const response = await fetch("${1:url}");\nconst data = await response.json();\n${2}', { label: 'fetch async/await', type: 'snippet' }),
    snippetCompletion('fetch("${1:url}", {\n\tmethod: "${2:POST}",\n\theaders: {\n\t\t"Content-Type": "application/json"\n\t},\n\tbody: JSON.stringify(${3:data})\n});', { label: 'fetch POST', type: 'snippet' }),
    
    // Error Handling
    snippetCompletion('try {\n\t${1}\n} catch (error) {\n\tconsole.error("${2:Error message}:", error);\n\t${3}\n}', { label: 'try/catch with logging', type: 'snippet' }),
    snippetCompletion('try {\n\t${1}\n} catch (error) {\n\t${2}\n} finally {\n\t${3}\n}', { label: 'try/catch/finally', type: 'snippet' }),
    
    // Modules
    snippetCompletion('import ${1:module} from "${2:path}";', { label: 'import default', type: 'snippet' }),
    snippetCompletion('import { ${1:named} } from "${2:path}";', { label: 'import named', type: 'snippet' }),
    snippetCompletion('import * as ${1:alias} from "${2:path}";', { label: 'import namespace', type: 'snippet' }),
    snippetCompletion('export default ${1:value};', { label: 'export default', type: 'snippet' }),
    snippetCompletion('export { ${1:name} };', { label: 'export named', type: 'snippet' }),
    snippetCompletion('export const ${1:name} = ${2:value};', { label: 'export const', type: 'snippet' }),
    
    // Classes (ES6+)
    snippetCompletion('class ${1:ClassName} {\n\tconstructor(${2:params}) {\n\t\t${3}\n\t}\n\n\t${4:methodName}() {\n\t\t${5}\n\t}\n}', { label: 'class', type: 'snippet' }),
    snippetCompletion('class ${1:ClassName} extends ${2:ParentClass} {\n\tconstructor(${3:params}) {\n\t\tsuper(${4});\n\t\t${5}\n\t}\n}', { label: 'class extends', type: 'snippet' }),
    snippetCompletion('static ${1:methodName}(${2:params}) {\n\t${3}\n}', { label: 'static method', type: 'snippet' }),
    
    // Template Literals
    snippetCompletion('`${1:string} \\${${2:expression}}`', { label: 'template literal', type: 'snippet' }),
    
    // JSON
    snippetCompletion('JSON.stringify(${1:object}, null, 2);', { label: 'JSON.stringify formatted', type: 'method' }),
    snippetCompletion('JSON.parse(${1:jsonString});', { label: 'JSON.parse', type: 'method' }),
    
    // Regular Expressions
    snippetCompletion('/${1:pattern}/${2:flags}', { label: 'regex literal', type: 'snippet' }),
    snippetCompletion('new RegExp("${1:pattern}", "${2:flags}");', { label: 'RegExp constructor', type: 'snippet' }),
    snippetCompletion('${1:string}.match(/${2:pattern}/${3:flags});', { label: 'string.match', type: 'method' }),
    snippetCompletion('${1:string}.replace(/${2:pattern}/${3:flags}, "${4:replacement}");', { label: 'string.replace', type: 'method' }),
    
    // Console methods
    snippetCompletion('console.log(${1});', { label: 'console.log', type: 'method' }),
    snippetCompletion('console.error(${1});', { label: 'console.error', type: 'method' }),
    snippetCompletion('console.warn(${1});', { label: 'console.warn', type: 'method' }),
    snippetCompletion('console.info(${1});', { label: 'console.info', type: 'method' }),
    snippetCompletion('console.table(${1});', { label: 'console.table', type: 'method' }),
    snippetCompletion('console.group("${1:label}");', { label: 'console.group', type: 'method' }),
    snippetCompletion('console.time("${1:label}");', { label: 'console.time', type: 'method' }),
    snippetCompletion('console.timeEnd("${1:label}");', { label: 'console.timeEnd', type: 'method' }),
    
    // Storage API
    snippetCompletion('localStorage.setItem("${1:key}", ${2:value});', { label: 'localStorage.setItem', type: 'method' }),
    snippetCompletion('localStorage.getItem("${1:key}");', { label: 'localStorage.getItem', type: 'method' }),
    snippetCompletion('localStorage.removeItem("${1:key}");', { label: 'localStorage.removeItem', type: 'method' }),
    snippetCompletion('sessionStorage.setItem("${1:key}", ${2:value});', { label: 'sessionStorage.setItem', type: 'method' }),
    
    // Date
    snippetCompletion('new Date();', { label: 'new Date', type: 'snippet' }),
    snippetCompletion('Date.now();', { label: 'Date.now', type: 'method' }),
    snippetCompletion('new Date().toISOString();', { label: 'date to ISO string', type: 'snippet' }),
    
    // Math
    snippetCompletion('Math.max(${1:values});', { label: 'Math.max', type: 'method' }),
    snippetCompletion('Math.min(${1:values});', { label: 'Math.min', type: 'method' }),
    snippetCompletion('Math.random();', { label: 'Math.random', type: 'method' }),
    snippetCompletion('Math.floor(${1:number});', { label: 'Math.floor', type: 'method' }),
    snippetCompletion('Math.ceil(${1:number});', { label: 'Math.ceil', type: 'method' }),
    snippetCompletion('Math.round(${1:number});', { label: 'Math.round', type: 'method' }),
    
    // Set and Map
    snippetCompletion('new Set([${1:values}]);', { label: 'new Set', type: 'snippet' }),
    snippetCompletion('new Map([${1:entries}]);', { label: 'new Map', type: 'snippet' }),
    snippetCompletion('${1:set}.has(${2:value});', { label: 'set.has', type: 'method' }),
    snippetCompletion('${1:map}.set(${2:key}, ${3:value});', { label: 'map.set', type: 'method' }),
    snippetCompletion('${1:map}.get(${2:key});', { label: 'map.get', type: 'method' }),
    
    // Debugging
    snippetCompletion('debugger;', { label: 'debugger', type: 'keyword' })
  ];

  // 根据输入进行智能过滤
  const filteredSnippets = modernJsSnippets.filter(snippet => {
    const label = snippet.label?.toLowerCase() || '';
    const searchText = word.text.toLowerCase();
    
    // 优先级：前缀匹配 > 包含匹配 > 模糊匹配
    if (label.startsWith(searchText)) {
      snippet.boost = 10;
      return true;
    } else if (label.includes(searchText)) {
      snippet.boost = 5;
      return true;
    } else if (searchText.length > 2) {
      // 模糊匹配（至少输入3个字符）
      const fuzzyMatch = searchText.split('').every((char: string) => label.includes(char));
      if (fuzzyMatch) {
        snippet.boost = 1;
        return true;
      }
    }
    return false;
  });

  return {
    from: word.from,
    options: filteredSnippets,
    validFor: /^[\w$]*$/
  };
};

// JavaScript 自动补全（使用CodeMirror原生 + 自定义代码片段）
export const jsAutocomplete = autocompletion({
  override: [jsSnippetCompletionSource],
  defaultKeymap: true,
  maxRenderedOptions: 100
});

// 获取JavaScript语言的补全源，包含原生JavaScript补全和自定义代码片段
export const jsCompletionSource = javascriptLanguage.data.of({
  autocomplete: jsAutocomplete
});

// 导出括号高亮匹配扩展
export const bracketMatchingExtension = bracketMatching();

// 自动括号补全扩展
export const closeBracketsExtension = keymap.of([
  {
    key: "(",
    run: (view) => {
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: [{ from, insert: "()" }],
        selection: { anchor: from + 1, head: from + 1 }
      });
      return true;
    }
  },
  {
    key: "[",
    run: (view) => {
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: [{ from, insert: "[]" }],
        selection: { anchor: from + 1, head: from + 1 }
      });
      return true;
    }
  },
  {
    key: "{",
    run: (view) => {
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: [{ from, insert: "{}" }],
        selection: { anchor: from + 1, head: from + 1 }
      });
      return true;
    }
  }
]); 