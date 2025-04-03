# Webアプリケーション設計

## コンポーネント構成

*   **App**: アプリケーション全体の構造を管理。ルーティングを制御。
*   **Home**: シーズンとエピソードを選択する画面。
*   **QuizScreen**: クイズを表示し、ユーザーの回答を受け付ける画面。
*   **Result**: 回答結果を表示する画面。
*   **Question**: 個々のクイズの質問と選択肢を表示するコンポーネント。
*   **Header**: アプリケーションのヘッダー。
*   **Footer**: アプリケーションのフッター。

## ディレクトリ構成

```
src/
├── components/
│   ├── Home.tsx
│   ├── QuizScreen.tsx
│   ├── Result.tsx
│   ├── Question.tsx
│   ├── Header.tsx
│   └── Footer.tsx
├── App.tsx
└── main.tsx
