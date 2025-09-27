const words = [
  "apple", "banana", "cat", "dog", "egg", "fish", "grape", "hat", "ice", "juice",
  "kite", "lion", "moon", "nose", "orange", "pig", "queen", "rose", "star", "tree"
];

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

function createPanels() {
  panelContainer.innerHTML = '';
  for (let i = 0; i < words.length; i++) {
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = 'panel-' + i;
    panel.textContent = words[i];
    panelContainer.appendChild(panel);
  }
}

function showCurrentWord() {
  currentWordDiv.textContent = words[current];
  input.value = "";
  input.focus();
}

function finishGame() {
  finished = true;
  input.style.display = "none";
  restartBtn.style.display = "inline-block";
  let time = ((Date.now() - startTime)/1000).toFixed(2);
  info.innerHTML = `<strong>おめでとう！クリア！</strong><br>タイム: ${time}秒<br>ミス: ${miss}回`;
}

input.addEventListener("input", () => {
  if (!started || finished) return;
  if (input.value === words[current]) {
    // 正解：パネルをフェードアウト
    const panel = document.getElementById('panel-' + current);
    panel.classList.add('faded');
    current++;
    if (current === words.length) {
      finishGame();
    } else {
      showCurrentWord();
    }
  } else if (!words[current].startsWith(input.value)) {
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
  createPanels();
};
