# hangul-japanese
A new Japanese writing culture using Hangul as an additional script.


# Hangul Japanese
ハングル日本語
漢字 × かな × 한글


# Same Language. New Script.

言葉はそのまま、文字はもっと自由に。

언어는 그대로, 문자는 더 자유롭게.

## 日本語で学ぶハングル

身近な日本語を読みながら、ハングルの文字と組み合わせを学ぶウェブアプリです。

- 基本子音14字と基本母音10字の学習カード
- 子音と母音を組み合わせる140通りの文字づくり
- ハングルの読み方クイズと日常表現30件
- 日常表現を1日1つ学ぶ30日間のコース。日本語の音声再生と学習の再開に対応
- 閲覧した学習カードとクイズの最高得点をブラウザーに保存

ハングルで表した日本語の音は近似です。対応する音がない場合はその旨を表示します。
音声再生には、ブラウザーと端末が日本語の読み上げに対応している必要があります。

## ローカルで実行

Node.js 24 を使用します。

```sh
npm ci
npm run dev
```

テストと本番ビルドを確認できます。

```sh
npm test
npm run build
npm run preview
```

## GitHub Pages

リポジトリの **Settings → Pages → Build and deployment** で **GitHub Actions** を選びます。`main` への push または Actions タブでの手動実行により、テストとビルドが通過した成果物を公開します。

## ドキュメント

- [プロジェクト企画](docs/PROJECT.md)
- [学習カリキュラム](docs/CURRICULUM.md)
- [ハングル表記ルール（草案）](docs/TRANSCRIPTION_RULES.md)
- [MIT License](LICENSE)
