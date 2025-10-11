export interface HtmlChar {
  entity: string
  char: string
  description: string
}

// 常用 HTML 实体表
export const HTML_CHARS: HtmlChar[] = [
  { char: "<", entity: "&lt;", description: "小于号" },
  { char: ">", entity: "&gt;", description: "大于号" },
  { char: "&", entity: "&amp;", description: "和号" },
  { char: '"', entity: "&quot;", description: "双引号" },
  { char: "'", entity: "&apos;", description: "单引号" },
  { char: "\u00A0", entity: "&nbsp;", description: "不换行空格" },
  { char: "©", entity: "&copy;", description: "版权符号" },
  { char: "®", entity: "&reg;", description: "注册商标" },
  { char: "€", entity: "&euro;", description: "欧元符号" },
  { char: "¥", entity: "&yen;", description: "日元符号" },
  { char: "¢", entity: "&cent;", description: "分符号" },
  { char: "§", entity: "&sect;", description: "节符号" },
  { char: "™", entity: "&trade;", description: "商标符号" },
  { char: "±", entity: "&plusmn;", description: "正负号" },
  { char: "×", entity: "&times;", description: "乘号" },
  { char: "÷", entity: "&divide;", description: "除号" },
  { char: "°", entity: "&deg;", description: "度数符号" },
  { char: "µ", entity: "&micro;", description: "微符号" },
  { char: "¶", entity: "&para;", description: "段落符号" },
  { char: "·", entity: "&middot;", description: "中点" },
  { char: "…", entity: "&hellip;", description: "省略号" },
  { char: "«", entity: "&laquo;", description: "左双引号" },
  { char: "»", entity: "&raquo;", description: "右双引号" },
  { char: "‘", entity: "&lsquo;", description: "左单引号" },
  { char: "’", entity: "&rsquo;", description: "右单引号" },
  { char: "“", entity: "&ldquo;", description: "左双引号" },
  { char: "”", entity: "&rdquo;", description: "右双引号" },
  { char: "–", entity: "&ndash;", description: "短横线" },
  { char: "—", entity: "&mdash;", description: "长横线" },
]