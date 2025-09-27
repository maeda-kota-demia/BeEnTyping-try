const baseWords = [
  "apple", "banana", "cat", "dog", "egg", "fish", "grape", "hat", "ice", "juice",
  "kite", "lion", "moon", "nose", "orange", "pig", "queen", "rose", "star", "tree"
];

let highlightOrder = []; // どのパネルが次にハイライトされるかのランダム順
let current = 0;
let miss = 0;
let started = false;
let startTime = null;
let finished = false;

const panelContainer = document.getElementById('panel-container');
const currentWordDiv = document.getElementById('current-word');
const input = document.getElementById('input');
const info = document.getElementById('info');
const startBtn = document.getElementById('start');
const restartBtn = document.getElementById('restart');

// Fisher-Yatesシャッフル
function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createPanels() {
  panelContainer.innerHTML = '';
  for (let i = 0; i < baseWords.length; i++) {
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = 'panel-' + i;
    panel.textContent = baseWords[i];
    panelContainer.appendChild(panel);
  }
  highlightCurrentPanel();
}

function highlightCurrentPanel() {
  for (let i = 0; i < baseWords.length; i++) {
    const panel = document.getElementById('panel-' + i);
    if (panel) {
      panel.classList.remove('active');
      if (i === highlightOrder[current] && !panel.classList.contains('faded')) {
        panel.classList.add('active');
      }
    }
  }
}

function showCurrentWord() {
  // 今回ハイライトされているパネルの単語を中央表示
  const idx = highlightOrder[current];
  currentWordDiv.textContent = baseWords[idx];
  input.value = "";
  input.focus();
  highlightCurrentPanel();
}

function finishGame() {
  finished = true;
  input.style.display = "none";
  restartBtn.style.display = "inline-block";
  let time = ((Date.now() - startTime)/1000).toFixed(2);
  info.innerHTML = `<strong>おめでとう！クリア！</strong><br>タイム: ${time}秒<br>ミス: ${miss}回`;
  // 全パネルのハイライトを消す
  for (let i = 0; i < baseWords.length; i++) {
    const panel = document.getElementById('panel-' + i);
    if (panel) panel.classList.remove('active');
  }
}

input.addEventListener("input", () => {
  if (!started || finished) return;
  const idx = highlightOrder[current];
  if (input.value === baseWords[idx]) {
    // 正解：パネルをフェードアウト＆ハイライト解除
    const panel = document.getElementById('panel-' + idx);
    panel.classList.add('faded');
    panel.classList.remove('active');
    current++;
    if (current === baseWords.length) {
      finishGame();
    } else {
      showCurrentWord();
    }
  } else if (!baseWords[idx].startsWith(input.value)) {
    miss++;
    input.classList.add("miss");
    setTimeout(()=>input.classList.remove("miss"), 200);
  }
});

startBtn.addEventListener("click", () => {
  started = true;
  finished = false;
  current = 0;
  miss = 0;
  info.textContent = "";
  startBtn.style.display = "none";
  restartBtn.style.display = "none";
  input.style.display = "";
  highlightOrder = shuffle([...Array(baseWords.length).keys()]);
  createPanels();
  showCurrentWord();
  startTime = Date.now();
});

restartBtn.addEventListener("click", () => {
  started = true;
  finished = false;
  current = 0;
  miss = 0;
  info.textContent = "";
  restartBtn.style.display = "none";
  input.style.display = "";
  highlightOrder = shuffle([...Array(baseWords.length).keys()]);
  createPanels();
  showCurrentWord();
  startTime = Date.now();
});

window.onload = () => {
  input.style.display = "none";
  startBtn.style.display = "inline-block";
  restartBtn.style.display = "none";
  currentWordDiv.textContent = "";
  info.textContent = "";
  highlightOrder = shuffle([...Array(baseWords.length).keys()]);
  createPanels();
};
