import { useState } from 'react'
import { Shield, Lock, Key, HardDrive, ChevronRight, ChevronLeft } from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
}

const steps = [
  {
    icon: <Shield size={48} />,
    title: '欢迎使用 Breeze',
    description: '一款安全、简洁的本地密码管理器，帮助您管理所有密码。',
    detail: '您的数据将使用 AES-256 军事级加密算法保护，所有信息仅存储在您的设备上。'
  },
  {
    icon: <Lock size={48} />,
    title: '主密码是什么？',
    description: '主密码是您访问所有密码的唯一钥匙。',
    detail: '就像保险库的钥匙，只有输入正确的主密码才能查看和管理您的密码。请务必牢记，一旦丢失将无法恢复数据。'
  },
  {
    icon: <Key size={48} />,
    title: '主密码的重要性',
    description: '请认真对待您的主密码设置。',
    detail: [
      '使用容易记住但他人难以猜到的密码',
      '建议使用短语组合，如"我爱吃苹果2024!"',
      '不要使用生日、手机号等容易被猜到的信息',
      '不要与其他网站密码相同',
      '请妥善保管，建议记录在安全的地方'
    ]
  },
  {
    icon: <HardDrive size={48} />,
    title: '数据安全',
    description: '您的数据完全由您掌控。',
    detail: [
      '所有数据仅存储在本地设备',
      '使用 AES-256-GCM 加密算法',
      '主密码经过 600,000 次 PBKDF2 迭代',
      '支持导出备份，方便迁移',
      '不收集任何个人信息'
    ]
  }
]

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = steps[currentStep]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="onboarding">
      <div className="onboarding-bg" />
      <div className="onboarding-card">
        <div className="onboarding-icon">{step.icon}</div>
        <h1 className="onboarding-title">{step.title}</h1>
        <p className="onboarding-description">{step.description}</p>

        <div className="onboarding-detail">
          {Array.isArray(step.detail) ? (
            <ul>
              {step.detail.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>{step.detail}</p>
          )}
        </div>

        <div className="onboarding-dots">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`dot ${i === currentStep ? 'active' : ''}`}
              onClick={() => setCurrentStep(i)}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          {currentStep > 0 ? (
            <button className="btn btn-secondary" onClick={handlePrev}>
              <ChevronLeft size={18} />
              上一步
            </button>
          ) : (
            <div />
          )}
          <button className="btn btn-primary" onClick={handleNext}>
            {currentStep < steps.length - 1 ? (
              <>
                下一步
                <ChevronRight size={18} />
              </>
            ) : (
              '开始创建保险库'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
