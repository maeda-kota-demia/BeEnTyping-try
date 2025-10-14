document.addEventListener('DOMContentLoaded',function() {
    let timeoutID;
    let startFlag = 0; // 0→開始前、１→開始待機、２→ゲーム中、３→終了
    let startTime;
    let missTypeCount = 0;
    let typeCount = 0;
    let current = 0;
    let letterCount= 0;
    let typedKana;
    let untypedKana;
    let typedEn;
    let untypedEn;

    var wordBox = document.getElementById("word")
    const wordObjList = [];
    const wordLength = 20
    const info = document.getElementById('info');
    const panelContainer = document.getElementById('panel-container');
    const wordCountText = document.getElementById('WordCount');
    const missMountText = document.getElementById("missMount");
    const timeText = document.getElementById("timeText");
    const otherResult = document.getElementById("other-result");
    const resultSection = document.getElementById('results');
    const wordMeanSection = document.getElementById('word-meanings');

    //効果音
    const clearSound = document.getElementById('type_clear')
    const missSound = document.getElementById('type_miss')
    const countSound = document.getElementById('count_down')
    const startSound = document.getElementById('start_sound')

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            // 0からiまでのランダムなインデックスを生成
            const j = Math.floor(Math.random() * (i + 1));

            // array[i] と array[j] を入れ替える
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function displayTime() {
        const currentTime = new Date(Date.now() - startTime + stopTime);
        const s = String(parseInt(currentTime.getMinutes()) * 60 + parseInt(currentTime.getSeconds())).padStart(2, '0');
        const ms = String(currentTime.getMilliseconds()).padStart(3, '0');
        timeText.textContent = `${s}.${ms}`;
        timeoutID = setTimeout(displayTime, 10);
    }

    function wordObjListMake(data){
        const lines = data.split('\n')
        shuffleArray(lines)
        for(let i=0;i<20;i++){
            let word = lines[i].split(',')
            wordObjList.push(
                new Word(word[0],word[1])
            )
        }
    }

    function processEndGame(){
        clearTimeout(timeoutID);
        const scoreText = document.getElementById('score');
        
        const stopTime = (Date.now() - startTime);
        const score = parseInt((letterCount + missTypeCount) / stopTime * 60000 * (letterCount / (letterCount + missTypeCount)) ** 3);
        scoreText.textContent = `SCORE : ${score}`;
        otherResult.textContent = `合計入力文字数（ミスを含む):${typeCount}`;
        // 全パネルのハイライトを消す
        // 全パネルを消すようにする？
        for (let i = 0; i < wordLength; i++) {
            const panel = document.getElementById('panel-' + i);
            if (panel) {
                panel.classList.remove('active','faded');
                panel.style.animation = 'none';
            }    
        }
        startFlag = 3
        resultIndicate();
        window.scrollTo({
            top: 700,      // 縦スクロールの位置
            left: 0,     // 横スクロールの位置（通常は 0 のままでOK）
            behavior: "smooth"
        })
    }

    function resultIndicate(wordObjList){
        const table = document.getElementById("word-table");
        wordObjList.forEach(element => {
            var tableRow = document.createElement("div");
            var tableDataWord = document.createElement("p");
            var tableDataRemarks = document.createElement("p");

            tableDataWord.textContent = element.example;
            tableDataRemarks.textContent = element.kana.all;

            tableRow.classList.add('typed-words')
            tableDataWord.classList.add('words')
            tableDataRemarks.classList.add('words')

            tableRow.appendChild(tableDataWord);
            tableRow.appendChild(tableDataRemarks);
            table.appendChild(tableRow);
        })
        wordMeanSection.style.display = "block";
        resultSection.style.display = "flex";
    }

    // 次inputCheckの修正！
    function inputCheck(key){
        // Wordオブジェクトのtypedメソッド→正しい文字か、その文字が終了したかを判断できる
        const { isMiss, isFinish } = wordObjList[flag].typed(event.key);
        // console.log(wordObjList[flag])
        typeCount += 1;
        if(isMiss){
            missSound.currentTime = 0;
            missSound.play();
            missTypeCount += 1;
            missMountText.innerText = missTypeCount;
        }
        else{
            clearSound.currentTime = 0;
            clearSound.play();
            if(isFinish){
                flag += 1;
                if(flag == wordObjList.length){
                    // ゲームの終了
                    // setTimeoutのキャンセル
                    clearTimeout(timeoutID);
                    // stopTime += (Date.now() - startTime);
                    typedText.innerText = "";
                    // var score = parseInt(typeCount / stopTime * 60000 * ( (typeCount - missTypeCount) / typeCount) ** 3);
                    // wordBox.innerText = `SCORE : ${score}`;
                    typedKana.innerText = "";
                    untypedKana.innerText = "";
                    typedText.innerText = "";
                    untypedText.innerText = "";
                    // otherresult.innerText = "合計入力文字数（ミスを含む）" + typeCount ;
                    // scoreForm.setAttribute("value", String(score));
                    processEndGame()
                }
                else{
                    wordBox.innerText = wordObjList[flag].example;
                    typedKana.innerText = "";
                    untypedKana.innerText = wordObjList[flag].kana.untyped;
                    typedText.innerText = "";
                    untypedText.innerText = wordObjList[flag].roman.untyped;
                }
            }
            else{
                typedKana.innerText = wordObjList[flag].kana.typed;
                untypedKana.innerText = wordObjList[flag].kana.untyped;
                typedText.innerText = wordObjList[flag].roman.typed;
                untypedText.innerText = wordObjList[flag].roman.untyped;
            }
        }
        return [flag, wordObjList, missTypeCount]
    }

    
    window.addEventListener("keydown", async (event) => {
        if(startFlag == 0 && event.key == " "){
            startFlag = 1;
            for (let countDown = 3,j=0; countDown >= 1; countDown--,j++) {
                setTimeout(() => {
                    infoBox.innerText = countDown;
                    countSound.currentTime = 0;
                    countSound.play();
                }, j*1000)
            }
            setTimeout(async ()=> {
                startFlag = 2;
                infoBox.innerText = '';
                startTime = Date.now();
                startSound.currentTime = 0;
                startSound.play();
                await fetch(`word.csv`).then(response => response.text()).then(data => wordObjListMake(data))
                displayTime();
                createPanels();
                typedKana = document.getElementById(`kana_typed-${i}`);
                untypedKana = document.getElementById(`kana_untyped-${i}`);
                typedEn = document.getElementById(`en_typed-${i}`);
                untypedEn = document.getElementById(`en_untyped-${i}`);
                // typedKana.innerText = "";
                // untypedKana.innerText = wordObjList[0].kana.untyped;
                // typedText.innerText = "";
                // untypedText.innerText = wordObjList[0].roman.untyped;
            },3000);
            // displayTime();
            
            // shuffleArray(highlightOrder);
            // createPanels();
            // showCurrentWord();
            // setTimeout(() => {
            //     startFlag = 2;
            // }, 3000);
        }
        
        else if(startFlag == 2 && event.key.length < 2 && event.key.match(/^[a-zA-Z0-9!-/:-@¥[-`{-~\s]*$/)){
            inputCheck(event.key);
        }
        else if(startFlag == 3 && (event.key =='Enter' || event.key == 'Escape')){
            this.location.reload()
        }
    })
    function randomPanelPlacement() {
        // let isPlaceMiss = false;
        const panels = Array.from(panelContainer.getElementsByClassName('panel'));
        const containerWidth = panelContainer.clientWidth;
        const containerHeight = panelContainer.clientHeight;
        const panelSize = panels[0].clientWidth;// 円の直径
        const panelRadius = panelSize / 2; // 円の半径

        // 配置済み円の中心座標を保持する配列
        // const placedCenters = [];
        // const maxAttempts = 1000;

        panels.forEach(panel => {
            // let newPosition = null;
                // パネルのサイズ分を引いて画面からはみ出ないように設定する
                const randomLeft = Math.random() * (containerWidth - panelSize);
                const randomTop = Math.random() * (containerHeight - panelSize);
                
                const newCenter = {
                    x: randomLeft + panelRadius,
                    y: randomTop + panelRadius,
                };
                
                panel.style.left = `${randomLeft}px`;
                panel.style.top = `${randomTop}px`;
                
                // some() を使って、いずれかの既存の円と重なるかチェック
                // const isOverlapping = placedCenters.some(placedCenter => {
                  //     const dx = newCenter.x - placedCenter.x;
                  //     const dy = newCenter.y - placedCenter.y;
                  //     // Math.sqrtを避け（処理の高速化）、距離の2乗で比較する
                  //     return (dx * dx + dy * dy) < (panelSize * panelSize);
                  // });
                  
                  // // 重なっていなければ、その位置を採用してループを抜ける
                  // if (!isOverlapping) {
                    // newPosition = { left: randomLeft, top: randomTop, center: newCenter };
                //     break;
                // }
                // attempts++;
            }

            // if (newPosition) {
            //     panel.style.left = `${newPosition.left}px`;
            //     panel.style.top = `${newPosition.top}px`;
            //     placedCenters.push(newPosition.center);
            // } else {
            //     isPlaceMiss = true
            // }
        )
        // if (isPlaceMiss){
        //     window.alert('うまく単語プレートを配置できませんでした。画面が小さすぎる可能性があります。\n再読込します。')
        //     location.reload()
        // }
    }

function createPanels() {
  panelContainer.innerHTML = '';
  for (let i = 0; i < wordLength ; i++) {
      const panel = document.createElement('div');
      const jpWord = document.createElement('h2')
      const kanaBox = document.createElement('h3')
      const enBox = document.createElement('h3')
      const typedKana = document.createElement('span');
      const untypedKana = document.createElement('span');
      const typedEn = document.createElement('span');
      const untypedEn = document.createElement('span');
      const delay = Math.random() * 2;
      panel.style.animationDelay = `${delay}s`;
      
      jpWord.id = 'jp_word'
      typedKana.id = 'kana_typed-'+i
      untypedKana.id = 'kana_untyped-'+i
      typedEn.id = 'en_typed-'+i
      untypedEn.id = 'en_untyped-'+i
      typedKana.className = 'typed'
      untypedKana.className = 'untyped'
      typedEn.className = 'typed'
      untypedEn.className = 'untyped' 
      panel.className = 'panel';
      panel.id = 'panel-' + i;

      jpWord.textContent = wordObjList[i].example
      untypedKana.textContent = wordObjList[i].kana.untyped;
      untypedEn.textContent = wordObjList[i].roman.untyped
      letterCount += wordObjList[i].example.length;
      console.log(`example:${wordObjList[i].example}`)
      console.log(`letterCount:${letterCount}`)
      //letterCountがしっかり動作するか、調べる
      
      kanaBox.appendChild(typedKana)
      kanaBox.appendChild(untypedKana)

      enBox.appendChild(typedEn)
      enBox.appendChild(untypedEn)

      panel.appendChild(jpWord);
      panel.appendChild(kanaBox);
      panel.appendChild(enBox);

      panelContainer.appendChild(panel);
      //最初のはここで光らせて置く。
      if(i == 0) {
          panel.classList.add('active');
      }
    }
    randomPanelPlacement()
    highlightCurrentPanel();
};

function highlightCurrentPanel() {
        let currentPanel = document.getElementById(`panel-${current-1}`);
        let nextPanel = document.getElementById(`panel-${(current)}`)
        //一番外側のif,elseはなくてもいい。
        if(currentPanel.classList.contains('active')){
            currentPanel.classList.remove('active');
            currentPanel.classList.add('faded');
            if(nextPanel){
                nextPanel.classList.add('active')
            }
        }else{
            currentPanel.classList.add('active');
        }
    }


})


// function showCurrentWord() {
//   // 今回ハイライトされているパネルの単語を中央表示
//   const idx = highlightOrder[current];
//   currentWordDiv.textContent = baseWords[idx];
// //   input.value = "";
// //   input.focus();
//   highlightCurrentPanel();
// }

// function finishGame() {
// //   finished = true;
// //   input.style.display = "none";
// //   restartBtn.style.display = "inline-block";
//   let time = ((Date.now() - startTime)/1000).toFixed(2);
//   info.innerHTML = `<strong>おめでとう！クリア！</strong><br>タイム: ${time}秒<br>ミス: ${miss}回`;
//   // 全パネルのハイライトを消す
// //   for (let i = 0; i < baseWords.length; i++) {
// //     const panel = document.getElementById('panel-' + i);
// //     if (panel) panel.classList.remove('active');
// //   }
//   shuffleArray(highlightOrder)
// }

// input.addEventListener("input", () => {
//   if (!started || finished) return;
//   const idx = highlightOrder[current];
//   if (input.value === baseWords[idx]) {
//     // 正解：パネルをフェードアウト＆ハイライト解除
//     const panel = document.getElementById('panel-' + idx);
//     panel.classList.add('faded');
//     panel.classList.remove('active');
//     current++;
//     if (current === baseWords.length) {
//       finishGame();
//     } else {
//       showCurrentWord();
//     }
//   } else if (!baseWords[idx].startsWith(input.value)) {
//     miss++;
//     input.classList.add("miss");
//     setTimeout(()=>input.classList.remove("miss"), 200);
//   }
// });
