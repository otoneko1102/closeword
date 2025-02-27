const { parentPort, workerData } = require("worker_threads");
const kuromoji = require("kuromoji");
const wanakana = require("wanakana");

const isAlphabetOnly = require('../src/isAlphabetOnly');
const toHepburn = require('../src/toHepburn');

let tokenizer;

async function initializeTokenizer() {
  if (tokenizer) return tokenizer;
  const tokenizerBuilder = kuromoji.builder({ dicPath: workerData.dicPath });
  
  return new Promise((resolve, reject) => {
    tokenizerBuilder.build((err, builtTokenizer) => {
      if (err) return reject(new Error("Failed to initialize tokenizer: " + err));
      tokenizer = builtTokenizer;
      resolve(tokenizer);
    });
  });
}

(async () => {
  const { words } = workerData;

  try {
    const tokenizerInstance = await initializeTokenizer();

    const romajiWords = words.map((word) => {
      try {
        const isWordObject = typeof word === "object";
        if (isWordObject && word.pronounce) {
          const toHepburnString = toHepburn(word.pronounce);
          return toHepburnString;
        };
        if (isAlphabetOnly(word)) return word;
        const targetWord = isWordObject ? word.word : word;
        const tokens = tokenizerInstance.tokenize(targetWord);
        const hiragana = tokens.map((token) => token.reading || token.surface_form).join('');
        const toRomajiString = wanakana.toRomaji(hiragana);
        return toRomajiString;
      } catch (tokenizeErr) {
        throw new Error(`Error processing word "${targetWord}": ${tokenizeErr}`);
      }
    });

    parentPort.postMessage(romajiWords);
  } catch (err) {
    parentPort.postMessage({ error: err });
  }
})();
