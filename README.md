<div align="center">

# Breeze

**一款简洁、安全的本地密码管理器**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20|%2011-lightgrey.svg)]()
[![Electron](https://img.shields.io/badge/Electron-33-47848F.svg)]()
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)]()

[功能特性](#功能特性) · [截图预览](#截图预览) · [安装使用](#安装使用) · [安全说明](#安全说明) · [技术架构](#技术架构) · [开发指南](#开发指南)

</div>

---

## 简介

Breeze 是一款基于 Electron + React + TypeScript 构建的本地密码管理器桌面应用。所有数据均使用 AES-256-GCM 加密后存储在本地设备上，**不依赖任何云服务**，确保您的隐私数据始终掌握在自己手中。

## 功能特性

### 安全加密
- **AES-256-GCM 认证加密** — 军事级加密标准，同时保证数据机密性与完整性
- **PBKDF2-SHA512 密钥派生** — 600,000 次迭代，有效抵御暴力破解
- **主密码机制** — 单一主密码加密整个保险库，主密码本身从不存储
- **内存安全** — 锁定时立即清除内存中的解密数据

### 密码管理
- **完整的增删改查** — 支持标题、用户名、密码、URL、分类、备注等字段
- **密码生成器** — 可配置 8-64 位长度，支持大小写字母、数字、符号组合
- **密码强度检测** — 实时显示密码强度等级（弱 / 中 / 强 / 极强）
- **一键复制** — 快速复制用户名和密码到系统剪贴板

### 分类与搜索
- **分类系统** — 6 个预设分类（社交媒体、邮箱、金融、工作、购物、其他），支持自定义
- **全局搜索** — 跨标题、用户名、URL、备注进行模糊搜索
- **收藏夹** — 标记常用密码条目，快速访问

### 数据管理
- **导入 / 导出** — 导出加密的保险库文件进行备份，导入已有备份进行恢复
- **保险库重置** — 二次确认机制（需输入"重置保险库"），防止误删数据

### 用户体验
- **新手引导** — 4 步引导流程，帮助首次使用的用户了解主密码概念和安全模型
- **自定义无边框窗口** — 精美的自定义标题栏，支持最小化、最大化、关闭
- **暗色主题** — 现代化深色界面设计，使用 Inter 字体

## 截图预览

<div align="center">

### 新手引导
> 首次使用时，Breeze 会通过 4 步引导介绍主密码的概念和重要性
<img width="3292" height="2152" alt="image" src="https://github.com/user-attachments/assets/4ff3beb3-a2a5-47ac-8ff7-c7ea98a46357" />


### 登录界面
> 简洁的登录/创建保险库界面，支持显示/隐藏密码
<img width="823" height="538" alt="Breeze-7" src="https://github.com/user-attachments/assets/8d2bb9d7-3cb6-4c66-b447-ea354a48f51a" />



### 主界面
> 三栏布局：分类导航 | 密码列表 | 详情面板
<img width="1646" height="1076" alt="image" src="https://github.com/user-attachments/assets/f2667131-8b55-41d0-9e61-ac0508cbd2d9" />


</div>

## 安装使用

### 环境要求

- **Node.js** 18+
- **npm** 或 **yarn**
- **Windows** 10 / 11 (x64)

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/your-username/breeze.git
cd breeze

# 安装依赖
npm install

# 启动开发模式（支持热重载）
npm run dev
```

### 构建打包

```bash
# 构建生产版本
npm run build

# 打包 Windows 安装程序（NSIS .exe）
npm run electron:build
```

打包后的安装程序输出到 `release/` 目录，支持自定义安装路径，自动创建桌面和开始菜单快捷方式。

## 安全说明

### 加密算法

| 组件 | 算法 | 说明 |
|------|------|------|
| 保险库加密 | AES-256-GCM | 认证加密，防篡改 |
| 密钥派生 | PBKDF2-SHA512 | 600,000 次迭代 |
| 随机数生成 | crypto.getRandomValues() | 加密安全随机数 |

### 安全架构

```
┌───────────────────────────────────────────────────────────┐
│                     渲染进程 (React)                        │
│   ┌──────────┐   ┌──────────┐   ┌─────────────────────┐  │
│   │  登录界面  │   │  主界面   │   │  密码生成器 / 表单   │  │
│   └──────────┘   └──────────┘   └─────────────────────┘  │
│                          │                                 │
│                electronAPI (contextBridge)                 │
├───────────────────────────────────────────────────────────┤
│                    预加载脚本 (Preload)                      │
│            contextIsolation: true, nodeIntegration: false  │
├───────────────────────────────────────────────────────────┤
│                    主进程 (Main Process)                    │
│   ┌──────────┐   ┌──────────┐   ┌─────────────────────┐  │
│   │ 加密/解密 │   │ 文件 I/O  │   │  剪贴板 / 对话框    │  │
│   └──────────┘   └──────────┘   └─────────────────────┘  │
│                                                           │
│   保险库存储路径: %APPDATA%/breeze/vault/vault.enc         │
└───────────────────────────────────────────────────────────┘
```

### 安全特性

- **零知识架构** — 主密码不存储，仅用于派生加密密钥
- **随机盐值** — 每次加密使用独立的 32 字节随机盐
- **认证加密** — GCM 模式提供数据完整性验证
- **本地存储** — 数据不离开您的设备

### 主密码安全建议

> **请认真对待主密码设置，这是您数据安全的唯一保障！**

- 长度至少 12 位以上
- 使用字母、数字、符号组合
- 避免使用生日、手机号等个人信息
- 不要与其他网站密码相同
- 建议使用容易记忆的短语组合，如 `我爱吃苹果2024!`
- 请妥善保管，建议记录在安全的地方

### 已知限制

- 主密码丢失无法恢复（这是设计决定，非缺陷）
- 弱主密码可能被暴力破解
- 本地文件可能被恶意软件访问

## 技术架构

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Electron | 33 | 桌面应用框架 |
| React | 18 | 用户界面库 |
| TypeScript | 5.7 | 类型安全 |
| Vite | 6.0 | 构建工具与开发服务器 |
| Lucide React | 0.468 | 图标库 |
| electron-builder | 25 | 应用打包与分发 |

### 项目结构

```
breeze/
├── electron/                    # Electron 主进程
│   ├── main.ts                  # 主进程：窗口管理、IPC、加密引擎
│   ├── preload.ts               # 预加载脚本：安全暴露 API
│   └── types.ts                 # 共享 TypeScript 类型定义
├── src/                         # React 前端
│   ├── components/
│   │   ├── Login.tsx            # 登录 / 创建保险库
│   │   ├── Onboarding.tsx       # 新手引导（4 步）
│   │   ├── Sidebar.tsx          # 侧边栏：分类、搜索、导入导出
│   │   ├── EntryList.tsx        # 密码条目列表
│   │   ├── EntryDetail.tsx      # 条目详情面板
│   │   ├── EntryFormModal.tsx   # 新增/编辑条目弹窗（含密码生成器）
│   │   ├── ImportModal.tsx      # 导入确认弹窗
│   │   ├── ResetModal.tsx       # 重置保险库确认弹窗
│   │   └── Titlebar.tsx         # 自定义无边框标题栏
│   ├── utils/
│   │   ├── encryption.ts        # 前端加密工具（Web Crypto API）
│   │   ├── ipc.ts               # IPC 类型声明与封装
│   │   └── password.ts          # 密码生成器与强度检测
│   ├── App.tsx                  # 根组件与状态管理
│   ├── main.tsx                 # React 入口
│   └── styles.css               # 全局样式（暗色主题）
├── index.html                   # HTML 入口
├── package.json                 # 项目配置
├── tsconfig.json                # TypeScript 配置（渲染进程）
├── tsconfig.electron.json       # TypeScript 配置（主进程）
├── vite.config.ts               # Vite 构建配置
├── icon.ico                     # 应用图标
└── LICENSE                      # MIT 许可证
```

### 数据结构

```typescript
interface Entry {
  id: string           // 唯一标识（16 字节随机十六进制）
  title: string        // 标题
  username: string     // 用户名
  password: string     // 密码（运行时明文，内存中）
  url: string          // 网址
  categoryId: string   // 分类 ID
  notes: string        // 备注
  favorite: boolean    // 是否收藏
  createdAt: number    // 创建时间戳
  updatedAt: number    // 更新时间戳
}
```

### IPC 通信

主进程与渲染进程通过 `contextBridge` 安全通信：

```
渲染进程                     主进程
   │                          │
   ├── vault:create ─────────►├── 创建保险库
   ├── vault:verify ─────────►├── 验证主密码
   ├── vault:unlock ─────────►├── 解锁保险库
   ├── vault:addEntry ───────►├── 添加条目
   ├── vault:updateEntry ────►├── 更新条目
   ├── vault:deleteEntry ────►├── 删除条目
   ├── vault:save ───────────►├── 加密保存到文件
   └── clipboard:copy ───────►└── 复制到剪贴板
```

## 开发指南

### 开发模式

```bash
npm run dev
```

启动 Vite 开发服务器 + Electron 应用，支持前端热重载。

### 代码规范

- TypeScript 严格模式
- 函数式组件 + Hooks
- CSS 变量实现主题切换
- IPC 通信统一封装在 `utils/ipc.ts`

### 添加新功能

1. 在 `electron/types.ts` 中定义数据类型
2. 在 `electron/main.ts` 中添加 IPC 处理器
3. 在 `electron/preload.ts` 中暴露 API
4. 在 `src/utils/ipc.ts` 中添加类型声明
5. 创建 React 组件实现 UI

### 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add your feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 致谢

- [Electron](https://www.electronjs.org/) — 跨平台桌面应用框架
- [React](https://react.dev/) — 用户界面库
- [Vite](https://vitejs.dev/) — 下一代前端构建工具
- [Lucide](https://lucide.dev/) — 精美开源图标库

---

<div align="center">

**如果这个项目对您有帮助，请给一个 Star 支持一下！**

</div>
