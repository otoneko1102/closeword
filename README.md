# closewords
A library for finding the most similar word from a list of words, supporting Japanese (including kanji).<br>
最も似た単語を単語群から検索する日本語(漢字含む)対応のライブラリ

> Note: it may be a little slow because it uses morphological analysis. By adopting `worker_threads`, the processing speed is slightly improved compared to the standard.<br>
> 注意: 形態素解析を利用しているため多少遅い可能性があります。`worker_threads` を採用しているため、標準より少しは処理速度は改善されています。

##### Teams
<a href="https://oto.pet/"><img src="https://www.otoneko.cat/img/logo.png" alt="OTONEKO.CAT" style="display: block; width: auto; height: 100px;"/></a>
<a href="https://www.otoho.me/"><img src="https://www.otoho.me/img/logo.png" alt="Oto Home" style="display: block; width: auto; height: 100px;"/></a>

## Usage
##### **closeWords(word: string | { word: string, pronounce?: string }, candidates: Array\<string | { word: string, pronounce?: string }\>, raw?:boolean(default: false)): Promise\<string[] | Array\<{ word: string, score: number }\>\>**
The highest score is 1 (the lowest is 0).<br>
A score of 1 means a perfect character-by-character match.<br>
スコアの最高値は1です(最低値は0です)。<br>
スコアが1の場合、文字列が完全に一致していることを示します。

### Example
```js
const { closeWords } = require('closewords');

(async () => {
  const word = '東京';
  const candidates = ['東京', 'とっこう', '東きょう', 'とう京', 'とうきょう', 'とーきょー'];

  try {
    const result = await closeWords(word, candidates);
    console.log('結果:', result);

    // raw: true
    const resultWithScores = await closeWords(word, candidates, true);
    console.log('スコアを含む結果:', resultWithScores);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

### Result
```
結果: [ '東京' ]
スコアを含む結果: [
  { word: '東京', score: 1 },
  { word: 'とう京', score: 0.6933333333333332 },
  { word: 'とうきょう', score: 0.48999999999999994 },
  { word: '東きょう', score: 0.468560606060606 },
  { word: 'とっこう', score: 0.4308888888888888 },
  { word: 'とーきょー', score: 0.41533333333333333 }
]
```

## Change Log
### 2.1.4 --> 2.2.0
`word.pronounce` and `pronounce` in `candidates[]` are completed Hepburn-style.
`word.pronounce` と `candidates[]` 内の `pronounce` をヘボン式で補完するようにしました。
### 2.1.3 --> 2.1.4
Fixed bugs.<br>
バグを修正しました。
### 2.1.2 --> 2.1.3
Fixed score calculation.<br>
スコア計算方法を修正しました。
### 2.1.1 --> 2.1.2
Fixed score calculation.<br>
スコア計算方法を修正しました。
### 2.1.0 --> 2.1.1
Fixed `README`.<br>
Fixed the issue that only a string could be specified in `word`.<br>
Fixed the issue that `word.pronounce` was ignored.<br>
Fixed the issue that non-alphabet could be specified for `word.pronounce` and `pronounce` in `candidates[]`.<br>
`word.pronounce` and `pronounce` in `candidates[]` are now optional.<br>
Fixed a few pther bugs.<br>
`README` を修正しました。<br>
`word` に文字列以外指定できない問題を修正しました。<br>
`word.pronounce` が無視される問題を修正しました。<br>
`word.pronounce` と `candidates[]` 内の `pronounce` にアルファベット以外を指定できる問題を修正しました。<br>
`word.pronounce` と `candidates[]` 内の `pronounce` を任意にしました。<br>
その他数件のバグを修正しました。
### 2.0.0 --> 2.1.0
Added a way to specify the pronunciation of words.<br>
単語の発音を指定する方法を追加しました。
### 1.0.2 --> 2.0.0
Introduced `fast-levenshtein` and fixed score calculation. The similarity of the original strings is also evaluated.<br>
`fast-levenshtein` を導入し、スコア計算方法を修正しました。元の文字列の一致度も評価されるようになりました。
### 1.0.1 --> 1.0.2
Introduced `jaro-winkler` and optimized.<br>
`jaro-winkler` を導入し、最適化しました。
### 1.0.0 --> 1.0.1
Fixed score calculation.<br>
スコア計算方法を修正しました。
### 0.x --> 1.0.0
Package released! Introducing morphological analysis.<br>
パッケージをリリース！ 形態素解析を導入しました。
## Get Support
<a href="https://discord.gg/yKW8wWKCnS"><img src="https://discordapp.com/api/guilds/1005287561582878800/widget.png?style=banner4" alt="Discord Banner"/></a>
