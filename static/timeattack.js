document.addEventListener('DOMContentLoaded',function() {
    var clearSound = document.getElementById('type_clear')
    var missSound = document.getElementById('type_miss')
    var countSound = document.getElementById('count_down')
    var startSound = document.getElementById('start_sound')

    var startTime;
    var stopTime = 0;
    var timeoutID;

    var wordBox = document.getElementById("word")
    var typedText = document.getElementById("typed");
    var untypedText = document.getElementById("untyped");
    // var typedKana = document.getElementById("kana_typed");
    // var untypedKana = document.getElementById("kana_untyped");
    var missMountText = document.getElementById("missMount");
    var timeText = document.getElementById("timeText");
    // var scoreText = document.getElementById("scoreText");
    // var idForm = document.getElementById("input_objectid");
    // var scoreForm = document.getElementById("input_score");
    var otherresult = document.getElementById("otherresult");


    function displayTime() {
        const currentTime = new Date(Date.now() - startTime + stopTime);
        // console.log(currentTime)
        const s = String(parseInt(currentTime.getMinutes()) * 60 + parseInt(currentTime.getSeconds())).padStart(2, '0');
        const ms = String(currentTime.getMilliseconds()).padStart(3, '0');
        timeText.textContent = `${s}.${ms}`;
        timeoutID = setTimeout(displayTime, 10);
    }


    var flag = 0;
    var startFlag = 0;
    var missTypeCount = 0;
    var typeCount = 0;
    
    var wordObjList = [];
    // var word = "";
    var mode = document.getElementById('mode')
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            // 0からiまでのランダムなインデックスを生成
            const j = Math.floor(Math.random() * (i + 1));

            // array[i] と array[j] を入れ替える
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function wordObjListMake(data){
        const lines = data.split('\n')
        shuffleArray(lines)
        console.log(lines)

        for(let i=0;i<20;i++){
            let word = lines[i].split(',');
            wordObjList.push({
                "is_finish": false,
                "untyped": word[0],
                "typed": "",
                "word": word[0],
                "remarks": word[1],
            });
        };
    }

    function resultIndicate(wordObjList){
        var table = document.getElementById("result__table");
        wordObjList.forEach(element => {
            var tableRow = document.createElement("div");
            var tableDataWord = document.createElement("p");
            var tableDataRemarks = document.createElement("p");
            tableDataWord.appendChild(document.createTextNode(element.example));
            tableDataRemarks.appendChild(document.createTextNode(element.kana.all));
            tableRow.appendChild(tableDataWord);
            tableRow.appendChild(tableDataRemarks);
            table.appendChild(tableRow);
        })
        document.getElementById("result").appendChild(table);
        document.getElementById("result").style.display = "block";
        setTimeout(()=> {
            document.getElementById("result__link").classList.add("active");
        }, 500)
        setTimeout(()=> {
            document.getElementById("result__link").classList.add("done");
        }, 1000)
    }
    // タイピング認識ロジック
    function inputCheck(wordObjList, flag, key, missTypeCount){
        typeCount += 1;

        // 正解のキーをタイプしたら
        if(key == wordObjList[flag]["untyped"].charAt(0)){
            clearSound.currentTime = 0;
            clearSound.play();
            // wordObjList[flag]["inputNum"] += 1;

            // ラスト1文字→次のワードへ
            if(wordObjList[flag]["untyped"].length == 1){
                wordObjList[flag]["typed"] = wordObjList[flag]["typed"] + wordObjList[flag]["untyped"].charAt(0);
                wordObjList[flag]["untyped"] = "";
                flag += 1;

                // ゲームの最終単語→ゲーム終了
                if(flag == wordObjList.length){
                    clearTimeout(timeoutID);
                    stopTime += (Date.now() - startTime);
                    typedText.innerText = "";
                    var score = parseInt((letterCount + missTypeCount) / stopTime * 60000 * (letterCount / (letterCount + missTypeCount)) ** 3);
                    untypedText.innerText = `SCORE : ${score}`;
                    otherresult.innerText = "合計入力文字数（ミスを含む）" + typeCount ;
                    scoreForm.setAttribute("value", String(score));
                    endSend();
                    resultIndicate(wordObjList);
                }
                else{
                    typedText.innerText = "";
                    untypedText.innerText = wordObjList[flag]["untyped"];
                }
            }
            else{
                wordObjList[flag]["typed"] = wordObjList[flag]["typed"] + wordObjList[flag]["untyped"].charAt(0);
                wordObjList[flag]["untyped"] = wordObjList[flag]["untyped"].substr(1);
                typedText.innerText = wordObjList[flag]["typed"];
                untypedText.innerText = wordObjList[flag]["untyped"];
            }
        }
        else{
            missSound.currentTime = 0;
            missSound.play();
            missTypeCount += 1;
            missMountText.innerText = missTypeCount;
        }
        return [flag, wordObjList, missTypeCount]
    }
    // function inputCheck(wordObjList, flag, key, missTypeCount){
    //     // Wordオブジェクトのtypedメソッド→正しい文字か、その文字が終了したかを判断できる
    //     const { isMiss, isFinish } = wordObjList[flag].typed(event.key);
    //     // console.log(wordObjList[flag])
    //     typeCount += 1;
    //     if(isMiss){
    //         missSound.currentTime = 0;
    //         missSound.play();
    //         missTypeCount += 1;
    //         missMountText.innerText = missTypeCount;
    //     }
    //     else{
    //         clearSound.currentTime = 0;
    //         clearSound.play();
    //         if(isFinish){
    //             flag += 1;
    //             if(flag == wordObjList.length){
    //                 // ゲームの終了
    //                 // setTimeoutのキャンセル
    //                 clearTimeout(timeoutID);
    //                 stopTime += (Date.now() - startTime);
    //                 typedText.innerText = "";
    //                 var score = parseInt(typeCount / stopTime * 60000 * ( (typeCount - missTypeCount) / typeCount) ** 3);
    //                 wordBox.innerText = `SCORE : ${score}`;
    //                 typedKana.innerText = "";
    //                 untypedKana.innerText = "";
    //                 typedText.innerText = "";
    //                 untypedText.innerText = "";
    //                 otherresult.innerText = "合計入力文字数（ミスを含む）" + typeCount ;
    //                 scoreForm.setAttribute("value", String(score));
    //                 finishGame()
    //                 // endSend();
    //                 // resultIndicate(wordObjList);
    //             }
    //             else{
    //                 wordBox.innerText = wordObjList[flag].example;
    //                 typedKana.innerText = "";
    //                 untypedKana.innerText = wordObjList[flag].kana.untyped;
    //                 typedText.innerText = "";
    //                 untypedText.innerText = wordObjList[flag].roman.untyped;
    //             }
    //         }
    //         else{
    //             typedKana.innerText = wordObjList[flag].kana.typed;
    //             untypedKana.innerText = wordObjList[flag].kana.untyped;
    //             typedText.innerText = wordObjList[flag].roman.typed;
    //             untypedText.innerText = wordObjList[flag].roman.untyped;
    //         }
    //     }
    //     return [flag, wordObjList, missTypeCount]
    // }

    
    window.addEventListener("keydown", (event) => {
        // console.log('key_down')
        if(startFlag == 0 && event.key == " "){
            // console.log('space')
            for (let i = 3,j=0; i >= 1; i--,j++) {
                setTimeout(() => {
                    wordBox.innerText = i;
                    startFlag = 1;
                    countSound.currentTime = 0;
                    countSound.play();
                    // console.log('１秒')
                }, j*1000)
            }
            setTimeout(async ()=> {
                startFlag = 2;
                wordBox.innerText = '';
                // typedText.innerText = "";
                // untypedText.innerText = wordObjList[0].roman.untyped;
                startTime = Date.now();
                startSound.currentTime = 0;
                startSound.play();
                console.log(`word-${mode.value}.csv`)
                await fetch(`word-${mode.value}.csv`).then(response => response.text()).then(data => wordObjListMake(data))
                // console.log(typeof(wordObjList))
                // console.log(wordObjList)
                displayTime();
                shuffleArray(highlightOrder);
                createPanels();
                showCurrentWord();
            },3000);
            // setTimeout(() => {
            //     startFlag = 2;
            // }, 3000);
        }
        
        else if(startFlag == 2 && event.key.length < 2 && event.key.match(/^[a-zA-Z0-9!-/:-@¥[-`{-~\s]*$/)){
            [flag, wordObjList, missTypeCount] = inputCheck(wordObjList, flag, event.key, missTypeCount);
        }
    })
    
    const wordLength = 20
    let highlightOrder = []; // どのパネルが次にハイライトされるかのランダム順
    for (let i = 0;i < wordLength;i++){
        highlightOrder.push(i);
    }
    let current = 0;
    let miss = 0;
    let started = false;
    // let startTime = null;
    let finished = false;
    
    const panelContainer = document.getElementById('panel-container');
    const currentWordDiv = document.getElementById('current-word');
    const input = document.getElementById('input');
    const info = document.getElementById('info');
    // const startBtn = document.getElementById('start');
    const restartBtn = document.getElementById('restart');
    
    // Fisher-Yatesシャッフル
    // function shuffle(array) {
    //   let arr = array.slice();
    //   for (let i = arr.length - 1; i > 0; i--) {
    //     const j = Math.floor(Math.random() * (i + 1));
    //     [arr[i], arr[j]] = [arr[j], arr[i]];
    //   }
    //   return arr;
    // }
    
    function createPanels() {
        panelContainer.innerHTML = '';
        for (let i = 0; i < wordLength ; i++) {
            const panel = document.createElement('div');
            const typedSpan = document.createElement('span');
            const untypedSpan = document.createElement('span');
            
            typedSpan.id = 'typed'
            untypedSpan.id = 'untyped' 
            // console.log('どうよ')
            panel.className = 'panel';
            panel.id = 'panel-' + i;
            // console.log(wordObjList[  i].kana)
            console.log(wordObjList[i]);
            typedSpan.textContent = wordObjList[i]['untyped'];
            console.log(typedSpan.textContent)
            panel.appendChild(typedSpan);
            panel.appendChild(untypedSpan);
            panelContainer.appendChild(panel);
        }
        highlightCurrentPanel();
    }
    
    function highlightCurrentPanel() {
      for (let i = 0; i < wordLength; i++) {
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
    //   currentWordDiv.textContent = wordObjList[idx];
    //   input.value = "";
    //   input.focus();
      highlightCurrentPanel();
    }
    
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
    

// インプットタグ：始まってない、終了済み→return
// idx→現在何単語目か（current)とその順番のhighlightOrderを代入
// 正解：パネルをフェードアウト＆ハイライト解除＋最後の単語→終了関数、最後じゃない→現在の単語表示(showCurrentWord)
// 不正解：missのカウントアップ、＋ミスしたら色変わる


    input.addEventListener("input", () => {
      if (!started || finished) return;
      const idx = highlightOrder[current];
      if (input.value === wordObjList[idx]) {
        // 正解：パネルをフェードアウト＆ハイライト解除
        const panel = document.getElementById('panel-' + idx);
        panel.classList.add('faded');
        panel.classList.remove('active');
        current++;
        if (current === wordLength) {
          finishGame();
        } else {
          showCurrentWord();
        }
      } else if (!wordObjList[idx].startsWith(input.value)) {
        miss++;
        input.classList.add("miss");
        setTimeout(()=>input.classList.remove("miss"), 200);
      }
    });
    window.onload = () => {
      input.style.display = "none";
    //   startBtn.style.display = "inline-block";
      restartBtn.style.display = "none";
    //   currentWordDiv.textContent = "";
    //   info.textContent = "";
      shuffleArray(highlightOrder);
      
    };
})






// const baseWords = [
//   "apple", "banana", "cat", "dog", "egg", "fish", "grape", "hat", "ice", "juice",
//   "kite", "lion", "moon", "nose", "orange", "pig", "queen", "rose", "star", "tree"
// ];

// startBtn.addEventListener("click", () => {
//   started = true;
//   finished = false;
//   current = 0;
//   miss = 0;
//   info.textContent = "";
//   startBtn.style.display = "none";
//   restartBtn.style.display = "none";
//   input.style.display = "";
//   shuffleArray(highlightOrder);
//   createPanels();
//   startTime = Date.now();
// });

// restartBtn.addEventListener("click", () => {
//   started = true;
//   finished = false;
//   current = 0;
//   miss = 0;
//   info.textContent = "";
//   restartBtn.style.display = "none";
//   input.style.display = "";
//   highlightOrder = shuffleArray([...Array(baseWords.length).keys()]);
//   createPanels();
//   showCurrentWord();
//   startTime = Date.now();
// });


