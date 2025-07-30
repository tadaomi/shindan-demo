# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

診断アプリのデモ - Vercelにデプロイ可能な採用診断アプリケーション。求職者向けの性格・適職診断にゲーミフィケーション要素を加えたMVPです。

## 現在の実装状況 (2025年1月)

### ✅ 完成済み機能

#### フェーズ1-3: 基本機能 (MVP)
- ✅ 適職診断システム (10問の質問形式)
- ✅ LocalStorage での永続化
- ✅ 基本的なUI/UX (Tailwind CSS + Framer Motion)
- ✅ 自動進行機能 (回答選択後500ms遅延で次の質問へ)

#### フェーズ4: エンゲージメント機能
- ✅ 診断履歴管理 (/history)
- ✅ 結果比較機能 (/compare)
- ✅ ガチャシステム (/gacha) - ポイント消費で報酬獲得
- ✅ 共有機能 (Web Share API + フォールバック)

#### 追加実装済み機能
- ✅ 履歴削除機能 (単体・複数選択削除)
- ✅ デバッグ・メンテナンス機能 (/debug)
- ✅ データ整合性チェック・自動修復
- ✅ 診断重複作成の修正
- ✅ ガチャ重複キーエラーの修正

## Tech Stack

- **Next.js 15** (App Router) - React フレームワーク
- **TypeScript 5.x** - 型安全性
- **Tailwind CSS v3** - スタイリング
- **Zustand** - 状態管理 + LocalStorage 永続化
- **Framer Motion** - アニメーション
- **Lucide React** - アイコン
- **UUID** - 一意ID生成

## Project Structure

```
/app                    # Next.js App Router pages
├── page.tsx           # ホームページ
├── diagnosis/[type]/  # 診断実行ページ
├── results/[id]/      # 診断結果表示
├── history/           # 診断履歴
├── compare/           # 結果比較
├── gacha/             # ガチャシステム
└── debug/             # デバッグ・メンテナンス

/components
├── ui/                # UI コンポーネント
├── diagnosis/         # 診断関連コンポーネント
└── gacha/             # ガチャ関連コンポーネント

/lib
├── store/             # Zustand ストア
├── storage/           # LocalStorage 管理
├── diagnosis-logic/   # 診断ロジック
└── types.ts          # 型定義

/data                  # 静的データ
├── questions.json     # 診断質問
└── rewards.json      # ガチャ報酬
```

## 重要な実装詳細

### データ永続化
LocalStorageを使用 (バックエンド不要):
- ユーザーID (UUID)
- 診断結果履歴
- ポイント・報酬データ
- ユーザー設定

### 診断フロー
1. **診断開始時**: 一意のIDを生成 (UUID)
2. **質問回答**: 自動進行 (500ms遅延)
3. **結果計算**: リアルタイム適性スコア算出
4. **結果保存**: 重複チェック付きでLocalStorageに保存

### 状態管理
- **diagnosisStore**: 診断中の一時状態
- **userStore**: ユーザーデータ・履歴管理

### エラーハンドリング
- データ整合性チェック
- 自動データ修復
- 重複登録防止
- ストレージ容量管理

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check

# リント
npm run lint
```

## デバッグ機能

開発環境で `/debug` にアクセス:
- 全データクリア
- データ状態確認
- LocalStorageの内容表示
- データエクスポート

## 修正済みの主要バグ

1. **診断重複作成**: useEffect依存関係とsaved状態管理を修正
2. **ガチャ重複キー**: 報酬アイテムに一意のキー生成を実装
3. **データ破損**: 自動検出・修復機能を追加

## 今後の拡張可能性

- 他の診断タイプの追加
- より詳細な分析レポート
- SNS連携強化
- パフォーマンス最適化

## 重要な考慮事項

- Vercelへのゼロコンフィグデプロイ対応
- クライアントサイドのみ (LocalStorage)
- 5MB ストレージ制限対応
- 日本の就職市場に特化したコンテンツ
- レスポンシブデザイン対応