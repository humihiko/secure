const initialBudget = 30000000;
let currentBudget = initialBudget;
let currentIntroIndex = 0;
let currentEventIndex = 0;
let currentEndingIndex = 0;
let endingScenesData = [];

let gameData = {};

const startButton = document.getElementById('startButton');
const titleScreen = document.getElementById('title-screen');
const introScene = document.getElementById('intro-scene');
const introImage = document.getElementById('intro-image');
const introMessage = document.getElementById('intro-message');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const mainGame = document.getElementById('main-game');
const quitButton = document.getElementById('quitButton');
const budgetDisplay = document.getElementById('budget-display');
const eventImage = document.getElementById('event-image');
const eventText = document.getElementById('event-text');
const choicesContainer = document.getElementById('choices-container');
const resultText = document.getElementById('result-text');

// エンディング画面の新しいUI要素
const endingScene = document.getElementById('ending-scene');
const endingImage = document.getElementById('ending-image');
const endingMessage = document.getElementById('ending-message');
const endingPrevButton = document.getElementById('endingPrevButton');
const endingNextButton = document.getElementById('endingNextButton');

// BGM要素の取得と制御関数
const mainBGM = document.getElementById('mainBGM');
const endingBGM = document.getElementById('endingBGM');
const failSFX = document.getElementById('failSFX'); // 効果音要素

// BGM再生関数
const playBGM = (audioElement) => {
    audioElement.volume = 0.5; // 音量を調整
    audioElement.play().catch(error => {
        console.warn("BGMの自動再生がブロックされました。", error);
    });
};

// BGM停止関数
const stopBGM = (audioElement) => {
    audioElement.pause();
    audioElement.currentTime = 0; // 曲の再生位置を最初に戻す
};

// 効果音再生関数
const playSFX = (audioElement) => {
    audioElement.currentTime = 0; // 再生位置をリセット
    audioElement.play().catch(error => {
        console.warn("効果音の再生がブロックされました。", error);
    });
};


const updateBudgetDisplay = () => {
    budgetDisplay.textContent = currentBudget.toLocaleString();
};

const showIntro = () => {
    titleScreen.style.display = 'none';
    introScene.style.display = 'flex';
    updateIntroScene();
};

const updateIntroScene = () => {
    const scene = gameData.intro_scenes[currentIntroIndex];
    introImage.src = scene.image;

    const formattedMessage = scene.message.replace(/\n/g, '<br>');
    introMessage.innerHTML = formattedMessage;

    prevButton.style.display = currentIntroIndex > 0 ? 'block' : 'none';
    if (currentIntroIndex === gameData.intro_scenes.length - 1) {
        nextButton.textContent = 'ゲームへ';
    } else {
        nextButton.textContent = '→';
    }
};

const startGame = () => {
    introScene.style.display = 'none';
    mainGame.style.display = 'block';
    updateBudgetDisplay();
    // 最初のイベントID (event_1_0) を直接指定して開始
    const firstEvent = gameData.game_events.find(event => event.id === "event_1_0");
    if (firstEvent) {
        showEvent(firstEvent);
    } else {
        console.error("最初のゲームイベントが見つかりません (event_1_0)。");
        // エラー処理
    }
};

const showEvent = (event) => {
    eventImage.src = event.image;
    // .textContent ではなく .innerHTML を使用し、改行コードを <br> タグとして反映させる
    const formattedText = event.text.replace(/\n/g, '<br>');
    eventText.innerHTML = formattedText;

    choicesContainer.innerHTML = '';
    event.choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.textContent = choice.text;
        button.addEventListener('click', () => handleChoice(choice));
        choicesContainer.appendChild(button);
    });

    resultText.textContent = '';
};

const handleChoice = (choice) => {
    // 選択ミスかどうかを判定 (HPが減少する場合)
    const isMistake = choice.hp_change < 0;

    currentBudget += choice.hp_change;
    updateBudgetDisplay();
    resultText.textContent = choice.result;

    const buttons = document.querySelectorAll('.choice-button');
    buttons.forEach(button => button.disabled = true);

    setTimeout(() => {
        // ★シーン遷移のロジック開始直前に効果音を再生★
        if (isMistake) {
            playSFX(failSFX);
        }

        const nextEventId = choice.next_event;

        // エンディング分岐ロジック
        if (nextEventId === "ending_screen") {
            stopBGM(mainBGM);
            showEnding();
        } else {
            const nextEvent = gameData.game_events.find(event => event.id === nextEventId);
            if (nextEvent) {
                showEvent(nextEvent);
            } else if (nextEventId) {
                console.error("次のイベントが見つかりません:", nextEventId);
                stopBGM(mainBGM);
                showEnding();
            } else { // nextEventIdが空で、イベント連鎖の終了と判断
                stopBGM(mainBGM);
                showEnding();
            }
        }
    }, 100);
};

// showEnding関数を修正
const showEnding = () => {
    mainGame.style.display = 'none';
    endingScene.style.display = 'flex';
    currentEndingIndex = 0;

    playBGM(endingBGM); // エンディングBGMを再生

    // 予算に応じてエンディングを分岐
    if (currentBudget >= 30000000) {
        endingScenesData = gameData.ending_scenes.diamond;
    } else if (currentBudget >= 20000000) {
        endingScenesData = gameData.ending_scenes.ruby;
    } else if (currentBudget >= 10000000) {
        endingScenesData = gameData.ending_scenes.sapphire;
    } else {
        endingScenesData = gameData.ending_scenes.toy;
    }

    updateEndingScene();
};

const updateEndingScene = () => {
    const scene = endingScenesData[currentEndingIndex];
    endingImage.src = scene.image;

    const formattedMessage = scene.message.replace(/\n/g, '<br>');
    endingMessage.innerHTML = formattedMessage;

    endingPrevButton.style.display = currentEndingIndex > 0 ? 'block' : 'none';
    if (currentEndingIndex === endingScenesData.length - 1) {
        endingNextButton.textContent = 'もう一度遊ぶ';
    } else {
        endingNextButton.textContent = '→';
    }
};

const restartGame = () => {
    currentBudget = initialBudget;
    currentIntroIndex = 0;
    currentEventIndex = 0;

    stopBGM(endingBGM); // エンディングBGMを停止

    endingScene.style.display = 'none';
    titleScreen.style.display = 'flex';
};

document.addEventListener('DOMContentLoaded', () => {
    startButton.addEventListener('click', () => {
        playBGM(mainBGM); // メインBGMを再生
        showIntro();
    });

    quitButton.addEventListener('click', () => {
        if (confirm('ゲームを終了しますか？')) {
            window.close();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentIntroIndex > 0) {
            currentIntroIndex--;
            updateIntroScene();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIntroIndex < gameData.intro_scenes.length - 1) {
            currentIntroIndex++;
            updateIntroScene();
        } else {
            // 最後のイントロシーンからゲームを開始
            startGame();
        }
    });

    // エンディング画面のボタンイベント
    endingPrevButton.addEventListener('click', () => {
        if (currentEndingIndex > 0) {
            currentEndingIndex--;
            updateEndingScene();
        }
    });

    endingNextButton.addEventListener('click', () => {
        if (currentEndingIndex < endingScenesData.length - 1) {
            currentEndingIndex++;
            updateEndingScene();
        } else {
            restartGame();
        }
    });

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            gameData = data;
            titleScreen.style.display = 'flex';
        })
        .catch(error => console.error("Failed to load game data:", error));
});