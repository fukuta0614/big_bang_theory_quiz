# Big Bang Theory Quiz Web Application 仕様書

## 概要

このWebアプリケーションは、人気ドラマ「ビッグバン★セオリー」の各エピソードに登場する英単語のクイズを提供するものです。
スマートフォンでの利用を想定しており、ドラマを楽しみながら語彙力を向上させることを目的としています。

## 機能

### 1. ホーム画面

*   シーズンとエピソードを選択するドロップダウンメニュー
*   「開始」ボタン

### 2. クイズ出題

*   選択されたエピソードに基づいて、順番に英単語クイズを出題
*   各クイズでは、以下の要素を表示
    *   英単語
    *   ヒント：その単語がスクリプト上のどの文章で登場したかを表示

### 3. 回答

*   4択の選択式

### 4. 結果表示

*   回答後、以下の情報を表示
    *   正解/不正解
    *   英単語の解説
    *   該当スクリプトの翻訳

### 5. クイズ進行

*   「次のクイズへ」ボタンで次の問題へ進む

### 6. 問題管理

*   問題数は50問程度を想定
*   間違えた問題をLocal Storageに保存
*   問題一覧から間違えた問題を確認可能
*   間違えた問題のみを出題する機能

## データ

### 1. スクリプト

*   スクレイピングにより全話分のスクリプトをダウンロード
*   txt形式でリポジトリに保管

### 2. クイズデータ

*   LLMによって英単語クイズを作成
*   json形式で各話ごとに保存

## 技術スタック

*   React
*   Vite

## 環境構築

*   React + Viteで環境構築済み
*   空のプロジェクト作成済み
*   Netlifyでのデプロイ設定済み
*   URL: [https://bigbangtheory-quiz.netlify.app/](https://bigbangtheory-quiz.netlify.app/)

## ディレクトリ構成

```
big_bang_theory_quiz/
├── docs/                  # 仕様書
├── public/                # 静的アセット
├── src/                   # ソースコード
│   ├── components/        # Reactコンポーネント
│   ├── pages/             # ページコンポーネント
│   ├── styles/            # スタイルシート
│   ├── App.tsx            # メインコンポーネント
│   ├── main.tsx           # エントリーポイント
│   └── ...
├── .gitignore             # Git管理対象外ファイル
├── .prettierrc.js         # Prettier設定
├── eslint.config.js       # ESLint設定
├── index.html             # HTMLファイル
├── package-lock.json      # パッケージロックファイル
├── package.json           # パッケージ定義ファイル
├── README.md              # README
├── tsconfig.json          # TypeScript設定
├── vite.config.ts         # Vite設定
└── ...
```

## data/ディレクトリ構成

```
data/
├── season01/
│   ├── episode01/
│   │   ├── scripts.txt
│   │   ├── quiz.json
│   │   └── title.txt
│   ├── episode02/
│   │   ├── scripts.txt
│   │   ├── quiz.json
│   │   └── title.txt
│   └── ...
├── season02/
│   ├── episode01/
│   │   ├── scripts.txt
│   │   ├── quiz.json
│   │   └── title.txt
│   ├── episode02/
│   │   ├── scripts.txt
│   │   ├── quiz.json
│   │   └── title.txt
│   └── ...
└── ...
```

## quiz.json形式

```json
{
  "questions": [
    {
      "type": "word",
      "value": "serendipity",
      "definition": "幸運な偶然",
      "scriptContext": "It was serendipity that we met.",
      "translation": "私たちが会ったのは幸運な偶然でした。",
      "options": [
        "計画",
        "偶然",
        "運命",
        "必然"
      ],
      "correctAnswer": "偶然"
    },
    {
      "type": "idiom",
      "value": "break a leg",
      "definition": "幸運を祈る",
      "scriptContext": "You are going on stage? Break a leg!",
      "translation": "ステージに上がるの？頑張って！",
      "options": [
        "足を折る",
        "頑張って",
        "休憩する",
        "あきらめる"
      ],
      "correctAnswer": "頑張って"
    },
    ...
  ]
}
```

## 今後の開発

*   UI/UXデザイン
*   クイズロジックの実装
*   API連携
*   テスト
*   詳細なドキュメントの作成
