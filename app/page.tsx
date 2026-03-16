import React from 'react';
import { AppealForm } from './components/AppealForm';

/**
 * 通天代注：
 * 这里的 MOCK_SUBMISSION_ID 必须是一个标准的 UUID 格式（8-4-4-4-12 位）。
 * 这样才能通过你后端 assignment.ts 中 Zod 的 .uuid() 强力校验。
 */
export default function Home() {
  const MOCK_SUBMISSION_ID = "550e8400-e29b-41d4-a716-446655440000";

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 text-center">
        
        {/* 1. 英雄头部区 */}
        <div className="space-y-3">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter">
            教育 SaaS <span className="text-amber-500 underline decoration-amber-500/30 underline-offset-8">申诉中心</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            底层安全矩阵已点火成功，Redis 防御与后端 Zod 校验逻辑已全面对齐。
          </p>
        </div>

        {/* 2. 核心交互区（申诉表单） */}
        <div className="bg-gray-900/40 p-1 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-xl">
          <div className="bg-gray-900/80 p-8 rounded-[2.2rem] border border-white/10">
            <div className="mb-8 text-left border-b border-white/5 pb-4">
              <h2 className="text-xl font-semibold text-amber-500">提交作业重审</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-gray-500 font-mono tracking-wider uppercase">
                  Valid UUID: {MOCK_SUBMISSION_ID}
                </p>
              </div>
            </div>
            
            {/* 挂载你的表单组件 */}
            <AppealForm submissionId={MOCK_SUBMISSION_ID} />
          </div>
        </div>

        {/* 3. 页脚状态 */}
        <div className="pt-4">
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] font-medium">
            Secure Infrastructure Powered by Gemini 3 Flash
          </p>
        </div>

      </div>
    </main>
  );
}