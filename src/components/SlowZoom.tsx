import React from "react";

// 慢推镜头已按用户反馈移除：连续亚像素缩放在部分播放环境被取整成文字上下跳动。
// 保留组件壳以维持各场景结构，duration 参数不再产生画面运动。
export const SlowZoom: React.FC<{
  duration: number;
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>{children}</div>
  );
};
