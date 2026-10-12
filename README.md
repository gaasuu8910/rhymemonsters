# RHYME MONSTERS / ライム・モンスターズ

ライバルMCのディスに、韻を踏んで言い返すスマホ向けラップゲーム。

## 遊ぶ
`index.html` をブラウザで開くだけで遊べます（1ファイル完結）。

## 開発
ソースは `src/` にあります。`worker.js` は配信＋匿名のプレイ回数カウント（Durable Object）、数字は `/stats?k=<STATS_KEY>` で見られます。編集後に以下でビルドすると `index.html` が更新されます。

```
python3 src/build.py
```
