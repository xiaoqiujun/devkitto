export interface FileInfo {
  file: File;
  name: string;
  size: string;
  type: string;
  dimensions?: string;
  textPreview?: string;
  base64: string;
  dataUri: string;
  sizeIncrease?: string;
}

export interface TextHistory {
  type: "text";
  action: "encode" | "decode";
  input: string;
  output: string;
}

export interface FileHistory {
  type: "file";
  info: FileInfo;
  format: "base64" | "datauri";
}

export type HistoryItem = TextHistory | FileHistory;