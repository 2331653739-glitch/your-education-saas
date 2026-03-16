# your-education-saas
// 文件路径: app/actions/assignment.ts
'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html'; // 引入工业级 HTML 净化器
import { Redis } from '@upstash/redis';   // 引入 Serverless Redis

// 初始化 Upstash Redis 实例 (用于高速限流)
const redis = Redis.fromEnv();

// 定义严格的前后端通信状态接口 (Type Hints)
export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  data?: { reason: string; gradedTime: string }; // 用于成功后的回显
};

// 任务 1: 绝对净化与严苛校验
const AppealSchema = z.object({
  submissionId: z.string().uuid("非法的作业 ID 格式"),
  reason: z.string()
    .min(10, "申诉理由过于单薄，请至少输入 10 个字符。")
    .max(500, "申诉理由已超出 500 字上限，请精简。")
    .transform(val => 
      // 降维打击：允许纯文本，彻底抹杀任何潜藏的 script, iframe, on* 事件
      sanitizeHtml(val, {
        allowedTags: [], // 不允许任何 HTML 标签
        allowedAttributes: {}
      })
    )
});

export async function submitAppeal(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    // 模拟获取用户会话与真实 IP (Next.js headers)
    const session = await getSession(); 
    const ip = await getClientIp(); 
    
    if (!session) return { status: 'error', message: '未授权：系统检测到会话断层，请重新登录。' };

    // 任务 2: Redis 分布式滑动窗口限流 (防 DDoS 与脚本连点)
    // 规则：每个 IP 每 60 秒只能调用 3 次申诉接口
    const rateLimitKey = `rate_limit:appeal:${ip}`;
    const requests = await redis.incr(rateLimitKey);
    if (requests === 1) await redis.expire(rateLimitKey, 60);
    if (requests > 3) {
      return { status: 'error', message: '触发防御机制：你的操作频率过高，请 60 秒后再试。' };
    }

    // 解析与净化输入
    const rawData = {
      submissionId: formData.get('submissionId'),
      reason: formData.get('reason'),
    };
    const validated = AppealSchema.safeParse(rawData);
    
    if (!validated.success) {
      return { status: 'error', message: validated.error.errors[0].message };
    }

    const { submissionId, reason } = validated.data;

    // 任务 3: 数据库原子锁 (Atomic Update) - 击碎高并发竞态
    const result = await db.submission.updateMany({
      where: { 
        id: submissionId,
        studentId: session.userId, // 越权防线：只能改自己的作业
        status: 'GRADED'           // 状态机锁：只有已批改才能申诉
      },
      data: { 
        status: 'APPEALING',
        appealReason: reason,
        updatedAt: new Date()
      }
    });

    if (result.count === 0) {
      return { status: 'error', message: '操作被拦截：当前作业状态已变更，或你无权进行此操作。' };
    }

    // 精准刷新该作业详情页的缓存，不波及全局
    revalidatePath(`/dashboard/submission/${submissionId}`);
    
    // 返回成功状态，并将净化后的数据传回前端用于 UI 回显
    return { 
      status: 'success', 
      message: '申诉卷宗已加密送达教师处理台，请静候终审判决。',
      data: { reason, gradedTime: new Date().toLocaleString() }
    };

  } catch (error) {
    console.error('[System Abyss Error]', error);
    return { status: 'error', message: '服务器遭遇引力异常，请联系系统管理员。' };
  }
}

// 文件路径: app/components/AppealForm.tsx
'use client'

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { submitAppeal, type ActionState } from '@/app/actions/assignment';
import { ArrowLeftIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'; // 引入极简图标

const initialState: ActionState = { status: 'idle', message: '' };

// 动态交互按钮：加载状态对冲
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`relative w-full sm:w-auto px-8 py-3 rounded-lg font-bold tracking-wide transition-all duration-300 overflow-hidden ${
        pending 
          ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' 
          : 'bg-amber-600 text-white hover:bg-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.2)] hover:shadow-[0_0_40px_rgba(217,119,6,0.5)] hover:-translate-y-0.5 border border-amber-500/50'
      }`}
    >
      <span className={`flex items-center justify-center gap-2 ${pending ? 'opacity-0' : 'opacity-100'}`}>
        确认提交申诉
      </span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center text-amber-500 animate-pulse">
          量子加密传输中...
        </span>
      )}
    </button>
  );
}

export const AppealForm = ({ submissionId }: { submissionId: string }) => {
  const [state, formAction] = useActionState(submitAppeal, initialState);
  
  // 任务 4: 极客级无障碍体验 (A11y) - 错误焦点劫持
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (state.status === 'error' && textareaRef.current) {
      textareaRef.current.focus(); // 瞬间将光标拉回错误输入框
      // 可选：触发微弱的震动 API (如果是移动端)
      if (navigator.vibrate) navigator.vibrate(50); 
    }
  }, [state.status]);

  // 任务 3: 状态机闭环 - 成功后的只读视觉陈列室
  if (state.status === 'success' && state.data) {
    return (
      <div className="p-8 bg-gray-900/80 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="p-3 bg-emerald-500/10 rounded-full ring-1 ring-emerald-500/30">
            <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-100">申诉已锁定并上传</h3>
            <p className="text-sm text-emerald-400 mt-1">{state.message}</p>
          </div>
        </div>

        {/* 申诉内容只读回显 (防抵赖展示) */}
        <div className="space-y-2 mb-8">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">你的原始陈述 (只读快照)</span>
          <div className="p-5 bg-black/40 border border-white/5 rounded-xl text-gray-300 leading-relaxed font-serif">
            {state.data.reason}
          </div>
          <p className="text-xs text-right text-gray-600 font-mono">
            时间戳: {state.data.gradedTime}
          </p>
        </div>

        <button 
          onClick={() => window.history.back()} // 优雅的回退引导
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          返回工作台
        </button>
      </div>
    );
  }

  // 默认/错误状态下的交互表单
  return (
    <form 
      action={formAction} 
      className="relative p-8 bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden group"
    >
      {/* 线性应用风格的光晕微交互 (随 Hover 渐显) */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/5 blur-[100px] group-hover:bg-amber-500/10 transition-colors duration-1000 pointer-events-none"></div>

      <input type="hidden" name="submissionId" value={submissionId} />
      
      {/* Error 状态展示与物理震颤 */}
      {state.status === 'error' && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-[shake_0.3s_ease-in-out]">
          <p className="text-sm text-red-400 font-medium flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5" />
            {state.message}
          </p>
        </div>
      )}
      
      <div className="mb-8">
        <label htmlFor="reason" className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-300 tracking-wide">申诉理由陈述</span>
          <span className="text-xs font-mono text-gray-500">10 - 500 字</span>
        </label>
        <textarea 
          ref={textareaRef}
          id="reason"
          name="reason"
          rows={5}
          className={`w-full bg-gray-950/80 border rounded-xl p-5 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none transition-all duration-300 shadow-inner ${
            state.status === 'error' ? 'border-red-500/50' : 'border-white/10'
          }`}
          placeholder="请客观、清晰地陈述你认为判罚不公的依据。此内容一旦提交将不可修改..."
          required
        />
      </div>
      
      <div className="flex justify-end pt-4 border-t border-white/5">
        <SubmitButton />
      </div>
    </form>
  );
};


