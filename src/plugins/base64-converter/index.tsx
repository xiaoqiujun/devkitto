import React, { useState, useRef } from "react";
import { FileInfo, HistoryItem } from "./typed";
import TextMode from "./text-mode";
import FileMode from "./file-mode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";



export const Base64Converter: React.FC = () => {
  const [tab, setTab] = useState<"text" | "file">("text");
  return (
    <div className="flex w-full flex-col p-5 gap-10 font-sans">
      {/* 模式切换 */}
      <Tabs 
        defaultValue={'text'} 
        value={tab} 
        onValueChange={(value) => setTab(value as 'text' | 'file')}
      >
        <TabsList>
          <TabsTrigger value="text" className="text-md">文本模式</TabsTrigger>
          <TabsTrigger value="file" className="text-md">文件模式</TabsTrigger>
        </TabsList>
        {/* 文本模式 */}
        <TabsContent value="text" className="mt-5">
          <TextMode />
        </TabsContent>
        {/* 文件模式 */}
        <TabsContent value="file" className="mt-5">
          <FileMode />
        </TabsContent>
      </Tabs>
    </div>
  );
};
