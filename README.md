# DevKitto · 小栈

<p align="center">
  <img src="public/tauri.svg" width="120" height="120" alt="DevKitto Logo" />
</p>

<h3 align="center">开发工具百宝箱，一站式管理常用开发工具</h3>

<p align="center">
  <a href="https://github.com/xiaoqiujun/devkitto/stargazers"><img src="https://img.shields.io/github/stars/xiaoqiujun/devkitto" alt="GitHub stars" /></a>
  <a href="https://github.com/xiaoqiujun/devkitto/issues"><img src="https://img.shields.io/github/issues/xiaoqiujun/devkitto" alt="GitHub issues" /></a>
  <a href="https://github.com/xiaoqiujun/devkitto/blob/master/LICENSE"><img src="https://img.shields.io/github/license/xiaoqiujun/devkitto" alt="GitHub license" /></a>
</p>

## 📋 项目简介

DevKitto 是一款专为开发者打造的工具集应用，集成了各种常用的开发工具，让您可以在一个应用中高效完成多种任务，提高开发效率。

## ✅ 功能列表

### 已实现功能
- ✅ **Base64 转换** - 进行 Base64 编码和解码
- ✅ **时间戳转换** - 在时间戳和可读日期之间进行转换
- ✅ **HTML 特殊字符表** - 快速查找和复制 HTML 特殊字符
- ⬜ **JSON 编辑器** - 格式化、验证和编辑 JSON 数据

## 🚀 快速开始

### 安装要求

- Node.js 16.x 或更高版本
- Rust 1.70 或更高版本（用于 Tauri 桌面应用）
- pnpm 包管理器（推荐）

### 开发环境设置

1. 克隆项目

```bash
https://github.com/xiaoqiujun/devkitto.git
cd devkitto
```

2. 安装依赖

```bash
pnpm install
```

3. 启动开发服务器

```bash
# Web 开发模式
pnpm dev

# Tauri 桌面应用开发模式
pnpm tauri:dev
```

### 构建应用

```bash
# 构建 Web 版本
pnpm build

# 构建 Tauri 桌面应用
pnpm tauri:build
```