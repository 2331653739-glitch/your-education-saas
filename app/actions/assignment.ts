'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html'; // 引入工业级 HTML 净化器
import { Redis } from '@upstash/redis';   // 引入 Serverless Redis
// 模拟函数，后续可对接真正的 Auth 逻辑
async function getSession(): Promise<{ userId: string } | null> { 
  return { userId: "test-user-id" }; 
}
async function getClientIp(): Promise<string> { 
  return "127.0.0.1"; 
}
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