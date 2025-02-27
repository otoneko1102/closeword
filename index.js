const jaroWinkler = require("jaro-winkler");
const levenshtein = require("fast-levenshtein");
const { Worker } = require("worker_threads");
const path = require("path");

const isAlphabetOnly = require('./src/isAlphabetOnly');

function convertToRomajiMultiThread(words) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, "./src/worker.js"), {
      workerData: { words, dicPath: path.resolve(__dirname, "./lib/dict") },
    });

    worker.on("message", (message) => {
      if (message.error) {
        reject(new Error(message.error));
      } else {
        resolve(message);
      }
    });

    worker.on("error", (err) => {
      reject(err);
    });

    worker.on("exit", (code) => {
      reject(new Error(`Worker stopped unexpectedly with exit code ${code}`));
    });
  });
}

/**
 * A candidate object with an optional pronounce property.
 * pronounce は任意で、アルファベット文字列のみを受け入れます。
 * 
 * @typedef {Object} Candidate
 * @property {string} word - Candidate word. / 候補単語
 * @property {string} [pronounce] - Optional alphabetic string. / 任意のアルファベット文字列
 */

/**
 * The result of a similarity comparison.
 * 類似度比較の結果を表します。
 * 
 * @typedef {Object} closeWordsResult
 * @property {string} word - Candidate word. / 候補単語
 * @property {number} score - Similarity score. / 類似度スコア
 */

/**
 * Finds the closest strings in an array to the given word.
 * 与えられた単語に最も近い単語を候補リストから探します。
 * 
 * @async
 * @function closeWords
 * @param {string | Candidate} word - The reference word or object. / 比較対象の単語またはオブジェクト
 * @param {Array<string | Candidate>} candidates - Candidate words or objects. / 候補リスト
 * @param {boolean} [raw=false] - Whether to include similarity scores. / 類似度スコアを含むか
 * @returns {Promise<string[] | closeWordsResult[]>} The closest word(s) or detailed scores. / 最も類似した単語または詳細なスコア
 */
async function closeWords(word, candidates, raw = false) {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        typeof word !== "string" &&
        (
          typeof word !== "object" ||
          !word.word
        )
      ) throw new Error("word must be a string or an object with 'word'.");

      if (
        typeof word === 'object' &&
        word.pronounce &&
        !isAlphabetOnly(word.pronounce)
      ) throw new Error("word.pronounce must be an alphabetic string.")

      if (
        !Array.isArray(candidates) ||
        !candidates.every(
          (item) => typeof item === "string" || 
          (
            typeof item === "object" &&
            item.word
          )
        )
      ) throw new Error("Candidates must be an array of strings or objects with 'word'.");

      if (
        !candidates.filter((c) => typeof c === "object" && c.pronounce).every((item) => isAlphabetOnly(item.pronounce))
      ) throw new Error("pronounces within candidates must be alphabetic strings.");

      if (typeof raw !== "boolean") throw new Error("raw must be boolean.");

      const romajiWords = await convertToRomajiMultiThread([word, ...candidates]);

      const romajiWord = romajiWords[0];
      const romajiCandidates = romajiWords.slice(1);

      const searchWord = typeof word === "string" ? word : word.word;

      const baseLength = searchWord.length;

      const scores = candidates.map((candidate, index) => {
        const candidateWord = typeof candidate === "string" ? candidate : candidate.word;
        const candidateLength = candidateWord.length;

        const romajiScore = jaroWinkler(romajiWord, romajiCandidates[index]);

        const stringScore = 1 - levenshtein.get(searchWord, candidateWord) / Math.max(baseLength, candidateLength);

        // 部分一致
        const commonSubstringLength = Math.min(
          searchWord.length,
          candidateWord.length,
          [...searchWord].filter((char, i) => char === candidateWord[i]).length
        );
        const substringRatio = commonSubstringLength / Math.max(searchWord.length, candidateWord.length);

        // 漢字の一致率
        const kanjiMatchCount = [...searchWord].filter((char) => candidateWord.includes(char)).length;
        const kanjiRatio = kanjiMatchCount / Math.max(searchWord.length, candidateWord.length);

        // 特定の漢字一致
        const exactKanjiBonus = searchWord === candidateWord ? 0.3 : kanjiRatio * 0.4;

        // 長さペナルティ
        const lengthPenalty = Math.max(0.7, 1 - Math.abs(baseLength - candidateLength) / baseLength);

        // 部分一致
        const substringBonus = substringRatio > 0.5 ? substringRatio * 0.05 : 0;

        // スコア算出
        const combinedScore =
          (romajiScore * 0.7 + stringScore * 0.2 + kanjiRatio * 0.1) * lengthPenalty +
          exactKanjiBonus +
          substringBonus;

        const finalScore = Math.min(combinedScore, 1);

        return {
          word: candidateWord,
          score: finalScore,
        };
      });

      scores.sort((a, b) => b.score - a.score);

      if (!raw) {
        const maxScore = scores[0]?.score;
        const result = scores
          .filter((item) => item.score === maxScore)
          .map((item) => item.word);
        resolve(result);
      } else {
        resolve(scores);
      }
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { closeWords };
