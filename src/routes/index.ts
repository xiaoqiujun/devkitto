import { Ampersand, Calendar, Clock, FileJson, LucideProps, SquareCode } from "lucide-react";
import { Base64Converter } from "@/plugins/base64-converter";
import { Timestamp } from "@/plugins/timestamp";
import { HTMLSpecialChars } from "@/plugins/html-special-chars";
import { JSONEditor } from "@/plugins/json-editor";

export type Route = {
  label: string;
  path: string;
  icon: React.FC<LucideProps>
  element: React.FC;
}
export const routes:Route[] = [
  {
    label: "Base64 转换",
    path: "/base64-converter",
    icon: Ampersand,
    element: Base64Converter,
  },
  {
    label: "时间戳转换",
    path: "/timestamp",
    icon: Clock,
    element: Timestamp,
  },
  {
    label: "HTML 特殊字符表",
    path: "/html-special-chars",
    icon: SquareCode,
    element: HTMLSpecialChars,
  }
];

