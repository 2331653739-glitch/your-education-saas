export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-white tracking-tighter">
          教育 SaaS <span className="text-amber-500">极客版</span>
        </h1>
        <p className="text-gray-400 text-lg">系统已点火成功，底层安全矩阵与 Redis 防御已就绪。</p>
        <div className="pt-8">
          <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all">
            进入学生工作台
          </button>
        </div>
      </div>
    </div>
  )
}