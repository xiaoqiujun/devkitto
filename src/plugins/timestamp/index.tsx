import { useState } from "react";
import { CurrentTimestamp } from "./current-timestamp";
import { TimestampToDate } from "./timestamp-to-date";
import { DateToTimestamp } from "./date-to-timestamp";

export const Timestamp: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4 text-center">时间戳转换工具</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：当前时间戳 */}
        <div className="lg:col-span-1">
          <CurrentTimestamp />
        </div>

        {/* 右侧：两个互转模块 */}
        <div className="lg:col-span-2 space-y-6">
          <TimestampToDate />
          <DateToTimestamp />
        </div>
      </div>
    </div>
  );
};