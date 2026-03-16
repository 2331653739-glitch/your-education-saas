'use server'

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db'; // 确保这里带花括号
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { Redis } from '@upstash/redis';

// 1. 初始化 Redis (只在这里定义一次，千万不要在后面再 import)
const redis = Redis.fromEnv();

// 2. 模拟 Auth 逻辑
async function getSession(): Promise<{ userId: string } | null> { 
  return { userId: "test-user-id" }; 
}

async function getClientIp(): Promise<string> { 
  return "127.0.0.1"; 
}

// 3. 定义通信状态接口
export type ActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  data?: { reason: string; gradedTime: string };
};

// 4. 严苛校验模式
const AppealSchema = z.object({
  submissionId: z.string().uuid("非法的作业 ID 格式"),
  reason: z.string()
    .min(10, "申诉理由过于单薄，请至少输入 10 个字符。")
    .max(500, "申诉理由已超出 500 字上限，请精简。")
});

export async function submitAppeal(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const session = await getSession(); 
    const ip = await getClientIp(); 
    
    if (!session) return { status: 'error', message: '未授权：系统检测到会话断层，请重新登录。' };

    // Redis 限流逻辑
    const rateLimitKey = `rate_limit:appeal:${ip}`;
    const requests = await redis.incr(rateLimitKey);
    if (requests === 1) await redis.expire(rateLimitKey, 60);
    if (requests > 3) {
      return { status: 'error', message: '触发防御机制：你的操作频率过高，请 60 秒后再试。' };
    }

    // 解析输入
    const rawData = {
      submissionId: formData.get('submissionId'),
      reason: formData.get('reason'),
    };
    
    const validated = AppealSchema.safeParse(rawData);
    if (!validated.success) {
      return { status: 'error', message: validated.error.errors[0].message };
    }

    // 5. 净化 HTML（在校验通过后处理）
    const submissionId = validated.data.submissionId;
    const cleanReason = sanitizeHtml(validated.data.reason as string, {
      allowedTags: [],
      allowedAttributes: {}
    });

    // 6. 数据库操作 (注意：Prisma 的模型名通常是小写的 submission)
    const result = await db.submission.updateMany({
      where: { 
        id: submissionId,
        studentId: session.userId,
        status: 'GRADED'
      },
      data: { 
        status: 'APPEALING',
        appealReason: cleanReason,
        updatedAt: new Date()
      }
    });

    if (result.count === 0) {
      return { status: 'error', message: '操作被拦截：当前作业状态已变更，或你无权进行此操作。' };
    }

    revalidatePath(`/dashboard/submission/${submissionId}`);
    
    return { 
      status: 'success', 
      message: '申诉卷宗已加密送达教师处理台，请静候终审判决。',
      data: { reason: cleanReason, gradedTime: new Date().toLocaleString() }
    };

  } catch (error) {
    console.error('[System Abyss Error]', error);
    return { status: 'error', message: '服务器遭遇引力异常，请联系系统管理员。' };
  }
}