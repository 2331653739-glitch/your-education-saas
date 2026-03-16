import React from 'react';
import { AppealForm } from './components/AppealForm'; // 引入你写的那个表单组件

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-white tracking-tighter">
          教育 SaaS <span className="text-amber-500">极客版</span>
        </h1>
        <p className="text-gray-400 text-lg">系统已点火成功，底层安全矩阵与 Redis 防御已就绪。</p>
        
        {/* 核心功能区：把申诉表单挂载到首页 */}
        <div className="mt-12 w-full max-w-md mx-auto">
          <AppealForm submissionId="test-id-123" /> 
        </div>
      </div>
    </div>
  )
}
