document.addEventListener('DOMContentLoaded',function() {
    var clearSound = document.getElementById('type_clear')
    var missSound = document.getElementById('type_miss')

    var startTime;
    var stopTime = 0;
    var timeoutID;

    var wordBox = document.getElementById("word")
    var typedText = document.getElementById("typed");
    var untypedText = document.getElementById("untyped");
    var typedKana = document.getElementById("kana_typed");
    var untypedKana = document.getElementById("kana_untyped");
    var missMountText = document.getElementById("missMount");
    var timeText = document.getElementById("timeText");
    // var scoreText = document.getElementById("scoreText");
    // var idForm = document.getElementById("input_objectid");
    // var scoreForm = document.getElementById("input_score");
    var otherresult = document.getElementById("otherresult");

    function displayTime() {
        const currentTime = new Date(Date.now() - startTime + stopTime);
        const s = String(parseInt(currentTime.getMinutes()) * 60 + parseInt(currentTime.getSeconds())).padStart(2, '0');
        const ms = String(currentTime.getMilliseconds()).padStart(3, '0');
        timeText.textContent = `${s}.${ms}`;
        timeoutID = setTimeout(displayTime, 10);
    }

    // function getCookie(name) {
    //     var cookieValue = null;
    //     if (document.cookie && document.cookie !== '') {
    //             var cookies = document.cookie.split(';');
    //             for (var i = 0; i < cookies.length; i++) {
    //             var cookie = cookies[i].trim();
    //             if (cookie.substring(0, name.length + 1) === (name + '=')) {
    //                     cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
    //                     break;
    //                 }
    //             }
    //         }   
    //         return cookieValue;
    //     }
    // const csrftoken = getCookie('csrftoken');

    // function startSend(){
    //     var form = document.getElementById("startform");
    //     var data = new FormData( form );
    //     var url = form.getAttribute("action");
    //     var method = form.getAttribute("method");
    //     const request = new XMLHttpRequest();
    //     request.open(method,url);
    //     request.setRequestHeader("X-CSRFToken", csrftoken);
    //     request.send(data);
    //     request.onreadystatechange = function() {
    //         if( request.readyState === 4 && request.status === 200 ) {
    //             var json = JSON.parse(request.responseText);
    //             idForm.setAttribute("value", String(json["id"]))
    //         }
    //     }
    // }

    // function endSend(){
    //     var form = document.getElementById("endform");
    //     var data = new FormData( form );
    //     var url = form.getAttribute("action");
    //     var method = form.getAttribute("method");
    //     const request = new XMLHttpRequest();
    //     request.open(method,url);
    //     request.setRequestHeader("X-CSRFToken", csrftoken);
    //     request.send(data);
    //     request.onreadystatechange = function() {
    //         if( request.readyState === 4 && request.status === 200 ) {
    //             var json = JSON.parse(request.responseText);
    //         }
    //     }
    // }

    var flag = 0;
    var startFlag = 0;
    var missTypeCount = 0;
    var typeCount = 0;
    
    var wordObjList = [];
    // var word = "";
    fetch('word.csv').then(response => response.text()).then(data => wordObjListMake(data))
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
            let word = lines[i].split(',')
            wordObjList.push(
                new Word(word[0],word[1])
            )
        }
    }
    // {% for word in wordList %}
        // wordObjList.push(
        //     new Word("{{ word.word }}", "{{ word.kana }}")
        // )
    // {% endfor %}

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

    function inputCheck(wordObjList, flag, key, missTypeCount){
        // Wordオブジェクトのtypedメソッド→正しい文字か、終了したかを判断できる
        const { isMiss, isFinish } = wordObjList[flag].typed(event.key);
        console.log(wordObjList[flag])
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
                    clearTimeout(timeoutID);
                    stopTime += (Date.now() - startTime);
                    typedText.innerText = "";
                    var score = parseInt(typeCount / stopTime * 60000 * ( (typeCount - missTypeCount) / typeCount) ** 3);
                    wordBox.innerText = `SCORE : ${score}`;
                    typedKana.innerText = "";
                    untypedKana.innerText = "";
                    typedText.innerText = "";
                    untypedText.innerText = "";
                    otherresult.innerText = "合計入力文字数（ミスを含む）" + typeCount ;
                    scoreForm.setAttribute("value", String(score));
                    // endSend();
                    resultIndicate(wordObjList);
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

    window.addEventListener("keydown", (event) => {
        console.log('key_down')
        if(startFlag == 0 && event.key == " "){
            console.log('space')
            wordBox.innerText = "3";
            startFlag = 1;
            // startSend();
            missSound.currentTime = 0;
            missSound.play();
            setTimeout(() => {
                wordBox.innerText = "2";
                missSound.currentTime = 0;
                missSound.play();
            }, 1000);
            setTimeout(() => {
                wordBox.innerText = "1";
                missSound.currentTime = 0;
                missSound.play();
            }, 2000);
            setTimeout(() => {
                startFlag = 2;
                wordBox.innerText = wordObjList[0].example;
                typedKana.innerText = "";
                untypedKana.innerText = wordObjList[0].kana.untyped;
                typedText.innerText = "";
                untypedText.innerText = wordObjList[0].roman.untyped;
                startTime = Date.now();
                displayTime();
            }, 3000);
        }
        
        else if(startFlag == 2 && event.key.length < 2 && event.key.match(/^[a-zA-Z0-9!-/:-@¥[-`{-~\s]*$/)){
            [flag, wordObjList, missTypeCount] = inputCheck(wordObjList, flag, event.key, missTypeCount);
        }
    })

})
