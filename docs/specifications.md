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
      "id": 1,
      "value": "reneged on",
      "options": [
        "遅らせる",
        "参加する",
        "破棄する",
        "忘れる"
      ],
      "correctAnswer": "破棄する",
      "explanation": "「renege」は、約束や契約を破る、履行しないという意味です。特にフォーマルな状況や、道徳的な義務がある場合に用いられます。「renege on」という形で、具体的な約束の内容を伴って使われることが多いです.\n\n例：He reneged on his promise to help her move. (彼は彼女の引っ越しを手伝うという約束を破った。)"
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
