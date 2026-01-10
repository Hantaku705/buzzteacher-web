'use client'

export interface ProgressStep {
  id: string
  label: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  detail?: string
}

interface AnalysisProgressProps {
  stage: string
  percent?: number | null
  current?: number
  total?: number
  steps?: ProgressStep[]
}

export function AnalysisProgress({ stage, percent, steps }: AnalysisProgressProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-800/50 rounded-lg max-w-md">
      {/* ヘッダー */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-emerald-400 font-medium">アカウント分析中...</span>
      </div>

      {/* ステップリスト */}
      {steps && steps.length > 0 && (
        <div className="flex flex-col gap-1.5 pl-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2 text-sm">
              {step.status === 'completed' && (
                <span className="text-emerald-400 w-4 text-center">✓</span>
              )}
              {step.status === 'in_progress' && (
                <span className="text-yellow-400 w-4 text-center animate-pulse">●</span>
              )}
              {step.status === 'pending' && (
                <span className="text-gray-500 w-4 text-center">○</span>
              )}
              {step.status === 'error' && (
                <span className="text-red-400 w-4 text-center">✗</span>
              )}
              <span className={step.status === 'completed' ? 'text-gray-400' : 'text-white'}>
                {step.label}
                {step.detail && (
                  <span className="text-gray-500 ml-1">({step.detail})</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* プログレスバー */}
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent ?? 0}%` }}
        />
      </div>

      {/* パーセント & 詳細 */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{stage}</span>
        <span>{percent ?? 0}%</span>
      </div>
    </div>
  )
}
