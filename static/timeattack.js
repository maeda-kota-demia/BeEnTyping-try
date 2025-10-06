document.addEventListener('DOMContentLoaded',function() {
    var clearSound = document.getElementById('type_clear')
    var missSound = document.getElementById('type_miss')
    var countSound = document.getElementById('count_down')
    var startSound = document.getElementById('start_sound')
    
    var startTime;
    var stopTime = 0;
    var timeoutID;
    
    let typedText;
    let untypedText;
    var wordBox = document.getElementById("word")
    var missMountText = document.getElementById("missMount");
    var timeText = document.getElementById("timeText");
    let wordCountText = document.getElementById('WordCount');
    var otherresult = document.getElementById("otherresult");
    const scoreText = document.getElementById('score')
    const resultSection = document.getElementById('result')


    function displayTime() {
        const currentTime = new Date(Date.now() - startTime + stopTime);
        // console.log(currentTime)
        const s = String(parseInt(currentTime.getMinutes()) * 60 + parseInt(currentTime.getSeconds())).padStart(2, '0');
        const ms = String(currentTime.getMilliseconds()).padStart(3, '0');
        timeText.textContent = `${s}.${ms}`;
        timeoutID = setTimeout(displayTime, 10);
    }    

    // var flag = 0;
    var startFlag = 0;
    var missTypeCount = 0;
    var typeCount = 0;
    // let idx;
    
    var wordObjList = [];
    var genre = document.getElementById('genre')
    const genreBtns = document.querySelectorAll('.genre_btn');
    let radioInput = document.querySelector('input[name="genre"]');
    let newRadioInput;

    genreBtns.forEach(element => {
        element.querySelector('input').addEventListener('click',(event) => {
            console.log('クリックされました。')
            newRadioInput = event.target;
            if(radioInput !== newRadioInput){
                genre.value = newRadioInput.value;
                newRadioInput.parentElement.classList.add('active-genre');
                radioInput.parentElement.classList.remove('active-genre');
            }
            newRadioInput.blur();
            radioInput = newRadioInput;
        });
    });

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
        // console.log(lines)

        for(let i=0;i<20;i++){
            let word = lines[i].split(',');
            wordObjList.push({
                "is_finish": false,
                "untyped": word[0],
                "typed": "",
                "word": word[0],
                "remarks": word[1],
                "letterLength":word[0].length,
            });
        };
    }


    // 調整する
    function resultIndicate(wordObjList){
        var table = document.getElementById("result__table");
        wordObjList.forEach(element => {
            var tableRow = document.createElement("div");
            var tableDataWord = document.createElement("p");
            var tableDataRemarks = document.createElement("p");
            tableDataWord.appendChild(document.createTextNode(element["word"]));
            tableDataRemarks.appendChild(document.createTextNode(element["remarks"]));
            tableRow.appendChild(tableDataWord);
            tableRow.appendChild(tableDataRemarks);
            table.appendChild(tableRow);
        })
        resultSection.appendChild(table);
        resultSection.style.display = "block";
        // setTimeout(()=> {
        //     document.getElementById("result__link").classList.add("active");
        // }, 500)
        // setTimeout(()=> {
        //     document.getElementById("result__link").classList.add("done");
        // }, 1000)
    }

    // インプットタグ：始まってない、終了済み→return
    // idx→現在何単語目か（current)とその順番のhighlightOrderを代入
    // 正解：パネルをフェードアウト＆ハイライト解除＋最後の単語→終了関数、最後じゃない→現在の単語表示(showCurrentWord)
    // 不正解：missのカウントアップ、＋ミスしたら色変わる
    // タイピング認識ロジック
    
    function inputCheck(wordObjList, idx, key, missTypeCount){
        typeCount += 1;

        // 正解のキーをタイプしたら
        if(key == wordObjList[idx]["untyped"].charAt(0)){
            clearSound.currentTime = 0;
            clearSound.play();
            // wordObjList[idx]["inputNum"] += 1;

            // ラスト1文字→次のワードへ
            if(wordObjList[idx]["untyped"].length == 1){
                wordObjList[idx]["typed"] = wordObjList[idx]["typed"] + wordObjList[idx]["untyped"].charAt(0);
                wordObjList[idx]["untyped"] = "";
                typedText.textContent = wordObjList[idx]['typed']
                untypedText.textContent = wordObjList[idx]['untyped']
                current += 1;
                // idxが、現在の単語のwordObjListの番号を示す。それを用いて、typed,untypedを特定し、その中の単語を変える。
                highlightCurrentPanel(idx,current);
                idx = highlightOrder[current]
                wordCountText.textContent = current;
                typedText = document.getElementById(`typed-${idx}`)
                untypedText = document.getElementById(`untyped-${idx}`)
                console.log(`inputCheckで変更後の${idx}`)

                // ゲームの最終単語→ゲーム終了
                // 開発用：wordLength → 1にしている
                if(current == 5){
                    clearTimeout(timeoutID);
                    stopTime += (Date.now() - startTime);
                    typedText.textContent = "";
                    var score = parseInt((letterCount + missTypeCount) / stopTime * 60000 * (letterCount / (letterCount + missTypeCount)) ** 3);
                    scoreText.innerText = `SCORE : ${score}`;
                    otherresult.innerText = `合計入力文字数（ミスを含む${typeCount}）`;
                    // 全パネルのハイライトを消す
                    for (let i = 0; i < wordLength; i++) {
                        const panel = document.getElementById('panel-' + i);
                        if (panel) {
                            panel.classList.remove('active','faded');
                            // panel.classList.remove('')
                        }    
                    }
                    startFlag = 3
                    // console.log('終了')
                    resultIndicate(wordObjList);
                }
                else{
                    typedText.innerText = "";
                    untypedText.innerText = wordObjList[idx]["untyped"];
                }
            }
            else{
                wordObjList[idx]["typed"] = wordObjList[idx]["typed"] + wordObjList[idx]["untyped"].charAt(0);
                wordObjList[idx]["untyped"] = wordObjList[idx]["untyped"].substr(1);
                // console.log(`typed:${typedText}`)
                // console.log(`untyped:${untypedText}`)
                
                typedText.textContent = wordObjList[idx]["typed"];
                untypedText.textContent = wordObjList[idx]["untyped"];
            }
        }
        else{
            missSound.currentTime = 0;
            missSound.play();
            missTypeCount += 1;
            missMountText.innerText = missTypeCount;
        }
        return [idx, wordObjList, missTypeCount]
    }
    
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
                // console.log(`word-${genre.value}.csv`)
                await fetch(`word-${genre.value}.csv`).then(response => response.text()).then(data => wordObjListMake(data))
                // console.log(typeof(wordObjList))
                // console.log(wordObjList)
                displayTime();
                shuffleArray(highlightOrder);
                let current = 0;
                idx = highlightOrder[current]
                console.log(`最初にセットする${idx}`)
                createPanels(idx);
                highlightCurrentPanel(idx,current);
                // showCurrentWord();
            },3000);
            // setTimeout(() => {
            //     startFlag = 2;
            // }, 3000);
        }
        
        else if(startFlag == 2 && event.key.length < 2 && event.key.match(/^[a-zA-Z0-9!-/:-@¥[-`{-~\s]*$/)){
            [idx, wordObjList, missTypeCount] = inputCheck(wordObjList, idx, event.key, missTypeCount);
        }
        else if(startFlag == 3 && (event.key =='Enter' || event.key == 'Escape')){
            this.location.reload()
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
    const info = document.getElementById('info');
    // const startBtn = document.getElementById('start');
    const restartBtn = document.getElementById('restart');
    let letterCount = 0;

    function createPanels() {
        panelContainer.innerHTML = '';
        for (let i = 0; i < wordLength ; i++) {
            const panel = document.createElement('div');
            const typedSpan = document.createElement('span');
            const untypedSpan = document.createElement('span');
            
            typedSpan.id = 'typed-'+i
            untypedSpan.id = 'untyped-'+i 
            typedSpan.className = 'typed'
            untypedSpan.className = 'untyped' 
            // console.log('どうよ')
            panel.className = 'panel';
            panel.id = 'panel-' + i;
            // console.log(wordObjList[  i].kana)
            // console.log(wor dObjList[i]);
            untypedSpan.textContent = wordObjList[i]['untyped'];
            letterCount += wordObjList[i]['letterLength'];
            // console.log(typedSpan.textContent)
            panel.appendChild(typedSpan);
            panel.appendChild(untypedSpan);
            panelContainer.appendChild(panel);
            panel.addEventListener('mouseenter',(event) => {
                if (startFlag == 3) {
                    event.target.firstElementChild.textContent = ''
                    event.target.lastElementChild.textContent = wordObjList[i]['remarks']
                }
            })
            panel.addEventListener('mouseleave',(event) =>{
                if(startFlag == 3){
                    event.target.firstElementChild.textContent = wordObjList[i]['typed']
                    event.target.lastElementChild.textContent = wordObjList[i]['untyped']
                }
            })
            panel.addEventListener
            randomPanelPlacement()
        }
        if (placeMiss){
            window.alert('うまく単語プレートを配置できませんでした。再読込します。')
            location.reload()
        }
        typedText = document.getElementById(`typed-${idx}`);
        untypedText = document.getElementById(`untyped-${idx}`);
    }

    // 重なりなし
    let placeMiss = false;
    function randomPanelPlacement() {
        const container = document.getElementById('panel-container');
        // HTMLCollectionを配列に変換してforEachを使えるようにする
        const panels = Array.from(container.getElementsByClassName('panel'));
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        // console.log(`containerWidth:${containerWidth},containerHeight:${containerHeight}`)
        const panelSize = panels[0].clientWidth;// 円の直径
        const panelRadius = panelSize / 2; // 円の半径

        // 配置済み円の中心座標を保持する配列
        const placedCenters = [];

        panels.forEach(panel => {
            let newPosition = null;
            let attempts = 0;
            const maxAttempts = 1000; // 無限ループを避けるための試行回数上限

            while (attempts < maxAttempts) {
                // パネルのサイズ分を引いて画面からはみ出ないように設定する
                const randomLeft = Math.random() * (containerWidth - panelSize);
                const randomTop = Math.random() * (containerHeight - panelSize);
                
                const newCenter = {
                    x: randomLeft + panelRadius,
                    y: randomTop + panelRadius,
                };

                // some() を使って、いずれかの既存の円と重なるかチェック
                const isOverlapping = placedCenters.some(placedCenter => {
                    const dx = newCenter.x - placedCenter.x;
                    const dy = newCenter.y - placedCenter.y;
                    // Math.sqrtを避け（処理の高速化）、距離の2乗で比較する
                    return (dx * dx + dy * dy) < (panelSize * panelSize);
                });

                // 重なっていなければ、その位置を採用してループを抜ける
                if (!isOverlapping) {
                    newPosition = { left: randomLeft, top: randomTop, center: newCenter };
                    break;
                }
                attempts++;
            }

            if (newPosition) {
                panel.style.left = `${newPosition.left}px`;
                panel.style.top = `${newPosition.top}px`;
                placedCenters.push(newPosition.center);
            } else {
                console.log('変更')
                placeMiss = true
            }
        });
        // console.log(placedCenters)
    }
    let currentPanel;
    let nextPanel;
    function highlightCurrentPanel(idx,current) {
        // この時点でのidxはすでに終わった分
        console.log(`higilightCurrentPanelに渡された${idx}`)
        currentPanel = document.getElementById(`panel-${idx}`);
        console.log(currentPanel)
        // console.log(`nextPanel-${}`)
        nextPanel = document.getElementById(`panel-${highlightOrder[current]}`)
        console.log(`highlightCurrentPanelに渡されるidxの次のやつ${highlightOrder[current]}`)
        if(currentPanel.classList.contains('active')){
            currentPanel.classList.remove('active');
            currentPanel.classList.add('faded');
            if(nextPanel){
                nextPanel.classList.add('active')
            }
        }else{
            currentPanel.classList.add('active');
        }
        
    //   for (let i = 0; i < wordLength; i++) {
    //     const panel = document.getElementById('panel-' + i);
    //     if (panel) {
    //       panel.classList.remove('active');
    //       if (i === highlightOrder[current] && !panel.classList.contains('faded')) {
    //         panel.classList.add('active');
    //       }
    //     }
    //   }
    }
    
    // function showCurrentWord() {
    //   // 今回ハイライトされているパネルの単語を中央表示
    // //   const idx = highlightOrder[current];
    // //   currentWordDiv.textContent = wordObjList[idx];
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
    // //   const idx = highlightOrder[current];
    //   if (input.value === wordObjList[idx]) {
    //     // 正解：パネルをフェードアウト＆ハイライト解除
    //     const panel = document.getElementById('panel-' + idx);
    //     panel.classList.add('faded');
    //     panel.classList.remove('active');
    //     current++;
    //     if (current === wordLength) {
    //       finishGame();
    //     } else {
    //       showCurrentWord();
    //     }
    //   } else if (!wordObjList[idx].startsWith(input.value)) {
    //     miss++;
    //     input.classList.add("miss");
    //     setTimeout(()=>input.classList.remove("miss"), 200);
    //   }
    // });
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


