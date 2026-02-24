// ゲーム変数
let lastDrawnNumber = null; // 最後に引いた数字
let lock = false; // カード操作をロックするフラグ
let selectedLevel = 10; // デフォルトレベル
let drawnCards = []; // 引いたカードを記録
let xCardCounts = {}; // 各×カードの引いた回数を記録
let timerInterval = null; // タイマーインターバル
let timeRemaining = 60; // 残り時間（秒）
let bgmAudio = null; // BGMオーディオオブジェクト
let isGameOverSoundPlaying = false; // ゲームオーバー効果音の重複再生を防止するフラグ

// 音量設定
let bgmVolume = 0.5; // BGM音量 (50%)
let sfxVolume = 0.5; // 効果音音量 (50%)

// チュートリアル画面を表示する関数
function showTutorial() {
  // 直接チュートリアルゲームを開始
  document.getElementById('level-selection-screen').style.display = 'none';
  selectedLevel = 'tutorial';
  document.getElementById('game-container').style.display = 'flex';
  
  // ゲームを初期化
  initializeGame();
}

// チュートリアル画面を非表示にする関数
function hideTutorial() {
  document.getElementById('tutorial-screen').style.display = 'none';
  document.getElementById('level-selection-screen').style.display = 'flex';
}

// チュートリアルゲームを開始する関数
function startTutorial() {
  document.getElementById('tutorial-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  
  // チュートリアル用のレベルを設定
  selectedLevel = 'tutorial';
  
  // ゲームを初期化
  initializeGame();
}

// レベル選択関数
function selectLevel(level) {
  selectedLevel = level;
  
  // 全てのレベルボタンからselectedクラスを削除
  const allButtons = document.querySelectorAll('.level-btn');
  allButtons.forEach(btn => btn.classList.remove('selected'));
  
  // 選択されたボタンにselectedクラスを追加（安全な方法）
  const clickedButton = Array.from(allButtons).find(btn => btn.textContent.includes(level));
  if (clickedButton) {
    clickedButton.classList.add('selected');
  }
}

// レベル選択関数（クリックイベント対応版）
function selectLevelWithEvent(level, element) {
  selectedLevel = level;
  
  // 全てのレベルボタンからselectedクラスを削除
  const allButtons = document.querySelectorAll('.level-btn');
  allButtons.forEach(btn => btn.classList.remove('selected'));
  
  // 選択されたボタンにselectedクラスを追加
  element.classList.add('selected');
  
  // レベル選択画面を非表示にしてゲーム画面を表示
  document.getElementById('level-selection-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  
  // ゲームを初期化
  initializeGame();
}

// カード配置：選択されたレベルに応じて数字カード＋赤×＋青×＋緑×
function getCardsForLevel(level) {
  const cards = [];
  
  // チュートリアル用：1〜4の数字カードと2枚の×カード
  if (level === 'tutorial') {
    for (let i = 1; i <= 4; i++) {
      cards.push(i); // 1〜4の数字カードを1枚ずつ
    }
    cards.push('red-x', 'blue-x'); // 2枚の×カード
  } else {
    // 通常のレベル設定
    for (let i = 1; i <= level; i++) {
      cards.push(i);
    }
    cards.push('red-x', 'blue-x');
    
    // 11〜13レベルでは緑の×を追加
    if (level >= 11) {
      cards.push('green-x');
    }
  }
  
  cards.sort(() => Math.random() - 0.5);
  return cards;
}

// スタートゲーム関数
function startGame(event) {
  if (event) event.stopPropagation();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  initializeGame();
}

// タイマー開始関数
function startTimer() {
  // スタートボタンを非表示
  const startContainer = document.getElementById("game-start-container");
  if (startContainer) {
    startContainer.style.display = "none";
  }
  
  // タイマーをリセット
  timeRemaining = 60;
  updateTimerDisplay();
  
  // カード操作を有効化
  lock = false;
  
  // BGMを再生
  playBGM();
  
  // タイマーを開始
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      gameOver();
    }
  }, 1000);
}

// BGM再生関数
function playBGM() {
  try {
    bgmAudio = new Audio('bgm/chare.mp3');
    bgmAudio.loop = true; // ループ再生
    bgmAudio.volume = bgmVolume * 0.3; // 設定された音量の30%を使用（50%設定で15%になる）
    
    // ユーザーインタラクションで再生を試みる
    const playPromise = bgmAudio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('BGM再生開始');
      }).catch(error => {
        console.log('BGMの再生に失敗しました:', error);
      });
    } else {
      // 古いブラウザ対応
      bgmAudio.play();
      console.log('BGM再生開始（古いブラウザ）');
    }
  } catch (error) {
    console.log('BGMの作成に失敗しました:', error);
  }
}

// BGM停止関数
function stopBGM() {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
    console.log('BGM停止');
  }
}

// タイマー表示更新関数
function updateTimerDisplay() {
  const timerText = document.getElementById("timer-text");
  if (timerText) {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    // 残り10秒になったら背景を黒く変化させる
    if (timeRemaining === 10) {
      // 背景色を10秒かけて黒に変化させる（CSSトランジションで滑らかに）
      document.body.style.backgroundColor = 'black';
      console.log('背景色の10秒間の黒への変化を開始');
    }
    
    // 残り13秒になったらBGMの音量を徐々に下げる
    if (timeRemaining === 13) {
      // BGM音量調整開始
      if (bgmAudio) {
        console.log('BGM音量調整を開始します（13秒から）');
      }
    }
    
    // 残り13秒〜1秒の間、BGM音量を毎秒調整
    if (timeRemaining <= 13 && timeRemaining > 0 && bgmAudio) {
      const targetVolume = 0; // 0%
      const initialVolume = 0.5 * 0.3; // 50%設定の30% = 15%
      const volumeRange = initialVolume - targetVolume;
      const fadeProgress = (13 - timeRemaining) / 13; // 13秒間で0から1へ
      bgmAudio.volume = initialVolume - (volumeRange * fadeProgress);
      console.log('BGM音量を調整:', bgmAudio.volume);
    }
    
    // 0:00になったら止めて時間切れとして認識
    if (timeRemaining === 0 && minutes === 0 && seconds === 0) {
      timerText.textContent = "0:00";
      console.log('時間切れ：0:00 - 止めて時間切れ');
      
      // 背景は既に黒色になっているはず
      console.log('背景は完全に黒色です');
      
      // BGMを停止
      stopBGM();
      console.log('0:00 - chareを停止しました');
      
      // ゲームオーバー処理
      setTimeout(() => {
        gameOver();
      }, 100); // 100ms後にゲームオーバー
    } else {
      timerText.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // タイマーが10秒以下になったらBGMを停止
      if (timeRemaining === 0) {
        setTimeout(() => {
          stopBGM();
          console.log('時間切れ：0:00 - BGM停止');
        }, 0); // 即時実行
      }
    }
  }
}

// ゲームオーバー関数
function gameOver() {
  // チュートリアルの場合はゲームオーバー処理をしない
  if (selectedLevel === 'tutorial') {
    return;
  }
  
  // タイマーを停止
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // カード操作をロック
  lock = true;
  
  // 効果音を再生
  playGameOverSound();
  
  // ゲームオーバーメッセージを表示
  const messageDiv = document.createElement("div");
  messageDiv.className = "game-over-message";
  messageDiv.textContent = "ゲームオーバー";
  document.body.appendChild(messageDiv);
  
  // 「out」画像を永続表示
  showGameOverImage();
  
  // 自動で戻らない（コメントアウト）
  // setTimeout(() => {
  //   if (messageDiv.parentNode) {
  //     messageDiv.remove();
  //   }
  //   backToStart();
  // }, 3000);
}

// クリア効果音再生関数
function playClearSound() {
  try {
    console.log('クリア効果音の再生を試みます...');
    
    // 絶対パスで直接MP3ファイルを指定
    const audio = new Audio();
    
    // デスクトップの絶対パスを直接設定
    const desktopPath = 'file:///C:/Users/伊藤　楓/OneDrive/ドキュメント/デスクトップ/coingame.mp3';
    
    console.log('デスクトップの絶対パスを設定:', desktopPath);
    
    audio.src = desktopPath;
    audio.type = 'audio/mpeg';
    audio.volume = 0.8;
    
    // 音声ファイルの読み込みを待機
    audio.addEventListener('canplaythrough', function() {
      console.log('クリア効果音の読み込み完了、再生を開始します');
      console.log('音声タイプ:', audio.type);
      console.log('音声ソース:', audio.src);
      console.log('音声の現在時刻:', audio.currentTime);
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('クリア効果音再生成功');
        }).catch(error => {
          console.log('クリア効果音の再生に失敗しました:', error);
          console.log('失敗時の音声ソース:', audio.src);
          
          // 少し遅延して再試みる
          setTimeout(() => {
            audio.play();
          }, 200);
        });
      } else {
        // 古いブラウザ対応
        audio.play();
        console.log('クリア効果音再生成功（古いブラウザ）');
      }
    });
    
    // 読み込みエラーの場合
    audio.addEventListener('error', function(error) {
      console.log('クリア効果音の読み込みエラー:', error);
      console.log('エラーオブジェクト:', error.target.error);
      console.log('失敗時の音声ソース:', audio.src);
      
      // 少し遅延して再試みる
      setTimeout(() => {
        audio.play();
      }, 300);
    });
    
  } catch (error) {
    console.log('クリア効果音の作成に失敗しました:', error);
  }
}

// 代替再生方法
function tryAlternativePlay() {
  try {
    console.log('代替方法でクリア効果音を再生します...');
    const altAudio = new Audio('coingame.mp3');
    altAudio.volume = 0.8;
    altAudio.play().then(() => {
      console.log('代替方法でのクリア効果音再生成功');
    }).catch(error => {
      console.log('代替方法でも再生に失敗しました:', error);
    });
  } catch (error) {
    console.log('代替方法の作成に失敗しました:', error);
  }
}

// ゲームオーバー効果音再生関数
function playGameOverSound() {
  // 重複再生を防止
  if (isGameOverSoundPlaying) {
    console.log('ゲームオーバー効果音は既に再生中です');
    return;
  }
  
  isGameOverSoundPlaying = true;
  
  try {
    const audio = new Audio('sounds/batu.mp3');
    audio.volume = sfxVolume; // 設定された効果音音量を使用
    
    // 再生完了時にフラグをリセット
    audio.onended = () => {
      isGameOverSoundPlaying = false;
      console.log('ゲームオーバー効果音の再生完了');
    };
    
    audio.play().then(() => {
      console.log('ゲームオーバー効果音再生成功');
    }).catch(error => {
      console.log('ゲームオーバー効果音の再生に失敗しました:', error);
      // エラー時もフラグをリセット
      isGameOverSoundPlaying = false;
      
      // 少し遅延して再試みる
      setTimeout(() => {
        if (!isGameOverSoundPlaying) { // 再度チェック
          audio.play();
        }
      }, 200);
    });
  } catch (error) {
    console.log('ゲームオーバー効果音の作成に失敗しました:', error);
    isGameOverSoundPlaying = false;
  }
}

// レベル選択画面を表示
function showLevelSelection() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('level-selection-screen').style.display = 'flex';
}

// スタート画面に戻る
function backToStartScreen() {
  document.getElementById('level-selection-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
}

// スタート画面に戻る関数
function backToStart() {
  // 全ての画面要素を非表示にする
  document.getElementById('level-selection-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
  
  // 全ての動的要素を一度に削除（効率化）
  const dynamicElements = document.querySelectorAll('div[style*="game-over-message"], div[style*="bottom: 5%"], #game-over-image, #x-message, #shuffle-image, .game-over-message');
  dynamicElements.forEach(elem => elem.remove());
  
  // 背景を白に戻す
  document.body.style.backgroundColor = 'white';
  
  // BGMを停止
  stopBGM();
  
  // ゲーム状態をリセット
  resetGame();
  
  // タイマーが残っていれば停止
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // ロック状態を解除
  lock = false;
}

// ゲーム初期化関数
function initializeGame() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  
  // グローバル変数をリセット
  lastDrawnNumber = null;
  drawnCards = [];
  xCardCounts = {};
  lock = true; // タイマー開始までカード操作をロック
  
  // タイマーをリセット
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timeRemaining = 60;
  updateTimerDisplay();
  
  // チュートリアルの場合はタイマーを非表示
  if (selectedLevel === 'tutorial') {
    document.getElementById('timer-display').style.display = 'none';
  } else {
    document.getElementById('timer-display').style.display = 'block';
  }
  
  // レベルに応じてクラスを設定
  board.className = "";
  if (selectedLevel === 'tutorial') {
    board.classList.add("tutorial");
    // チュートリアル時のみ画像を表示
    document.querySelector('.game-side-images').classList.add('show');
  } else {
    // 通常レベル時は画像を非表示
    document.querySelector('.game-side-images').classList.remove('show');
  }
  
  if (selectedLevel >= 5 && selectedLevel <= 10) {
    board.classList.add("level-" + selectedLevel);
  }
  
  const cards = getCardsForLevel(selectedLevel);
  let totalSlots;
  
  if (selectedLevel === 'tutorial') {
    totalSlots = 6; // 2×3
  } else if (selectedLevel >= 5 && selectedLevel <= 6) {
    totalSlots = 8; // 2×4
  } else if (selectedLevel === 7) {
    totalSlots = 9; // 3×3
  } else if (selectedLevel >= 8 && selectedLevel <= 10) {
    totalSlots = 12; // 3×4
  } else if (selectedLevel >= 11 && selectedLevel <= 13) {
    totalSlots = 16; // 4×4
  } else {
    totalSlots = 12; // 4×3（デフォルト）
  }
  
  cards.forEach((cardValue, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.value = cardValue;
    card.dataset.position = index + 1;
    
    const cardFront = document.createElement("div");
    cardFront.className = "card-face card-front position-number";
    cardFront.textContent = String.fromCharCode(65 + index);
    
    const cardBack = document.createElement("div");
    cardBack.className = "card-face card-back";
    
    if (cardValue === 'red-x') {
      cardBack.textContent = "×";
      cardBack.style.color = "#ff0000";
    } else if (cardValue === 'blue-x') {
      cardBack.textContent = "×";
      cardBack.style.color = "#0000ff";
    } else if (cardValue === 'green-x') {
      cardBack.textContent = "×";
      cardBack.style.color = "#32cd32";
    } else {
      cardBack.textContent = cardValue;
      cardBack.setAttribute('data-number', cardValue);
    }
    
    card.appendChild(cardFront);
    card.appendChild(cardBack);

    // イベントリスナーを一度だけ登録
    card.addEventListener('click', function handleClick(e) {
      console.log('カードクリック:', cardValue, 'lock:', lock, 'open:', card.classList.contains("open"));
      if (lock || card.classList.contains("open")) {
        console.log('クリック無効: lock=' + lock + ', open=' + card.classList.contains("open"));
        return;
      }
      lock = true;
      card.classList.add("open");
      console.log('カードめくり実行:', cardValue);

      if (cardValue === 'red-x' || cardValue === 'blue-x' || cardValue === 'green-x') {
        // ×カードの引いた回数を記録
        xCardCounts[cardValue] = (xCardCounts[cardValue] || 0) + 1;
        
        // 数字の昇順をリセット
        lastDrawnNumber = null;
        drawnCards = [];
        
        if (selectedLevel === 'tutorial') {
          // チュートリアルの場合：常に「アクマにご注意！」のみ表示
          showXCardMessage("アクマにご注意！");
          setTimeout(() => {
            flipAllCardsBack(); // 全てのカードを裏に戻す
            lock = false;
          }, 1000);
        } else {
          // 通常のレベル設定
          if (xCardCounts[cardValue] === 1) {
            // 1回目：警告メッセージ
            showXCardMessage("アクマにご注意！");
            setTimeout(() => {
              flipAllCardsBack(); // 全てのカードを裏に戻す
              lock = false;
            }, 1000);
          } else if (xCardCounts[cardValue] === 2) {
            // 2回目：シャッフルメッセージと画像
            showXCardMessage(getShuffleMessage());
            showShuffleImage();
            setTimeout(() => {
              flipAllCardsBack(); // 全てのカードを裏に戻す
              shuffleCards();
              // 全ての×カードのカウントをリセット
              xCardCounts = {};
              lock = false;
            }, 1000);
          } else {
            // 3回目以降：通常のリセット
            setTimeout(() => {
              flipAllCardsBack(); // 全てのカードを裏に戻す
              resetGame();
              lock = false;
            }, 1000);
          }
        }
        return;
      }

      if (lastDrawnNumber === null) {
        // 最初のカード
        lastDrawnNumber = cardValue;
        drawnCards.push(cardValue); // 引いたカードを記録
        lock = false;
      } else {
        if (cardValue === lastDrawnNumber + 1) {
          // 昇順が続いている場合
          lastDrawnNumber = cardValue;
          drawnCards.push(cardValue); // 引いたカードを記録
          lock = false;
          
          // クリア条件のチェック：1から始まって全ての数字カードが表になっているか
          const allNumbersDrawn = drawnCards.filter(card => typeof card === 'number');
          
          let requiredNumbers;
          let isCompleteClear;
          
          if (selectedLevel === 'tutorial') {
            // チュートリアルの場合：1〜4の数字カードがすべて引かれたらクリア
            requiredNumbers = [1, 2, 3, 4];
            isCompleteClear = allNumbersDrawn.length === requiredNumbers.length &&
                            requiredNumbers.every(num => allNumbersDrawn.includes(num));
          } else {
            // 通常のレベル設定
            requiredNumbers = Array.from({length: selectedLevel}, (_, i) => i + 1);
            isCompleteClear = allNumbersDrawn.length === requiredNumbers.length &&
                            requiredNumbers.every(num => allNumbersDrawn.includes(num)) &&
                            allNumbersDrawn[0] === 1;
          }
          
          if (isCompleteClear) {
            showClearMessage();
            lock = false;
          } else {
            lock = false;
          }
        } else {
          // 昇順が途切れた場合
          setTimeout(() => {
            flipAllCardsBack(); // 全てのカードを裏に戻す
            lastDrawnNumber = null;
            drawnCards = [];
            // xCardCountsはリセットしない（×カードの進行状況を維持）
            lock = false;
          }, 1000);
        }
      }
    });

    board.appendChild(card);
  });
  
  // 空きスロットを追加
  for (let i = cards.length; i < totalSlots; i++) {
    const emptySlot = document.createElement("div");
    emptySlot.className = "empty-slot";
    board.appendChild(emptySlot);
  }
}

// ゲームをリセット
function resetGame() {
  lastDrawnNumber = null;
  drawnCards = []; // 引いたカード記録もリセット
  xCardCounts = {}; // ×カードの引いた回数もリセット
  const allCards = document.querySelectorAll(".card");
  allCards.forEach(card => {
    card.classList.remove("open");
  });
  // メッセージをクリア
  const messageDiv = document.getElementById("message");
  if (messageDiv) {
    messageDiv.textContent = "";
  }
}

// ×カードのメッセージ表示
function showXCardMessage(message) {
  // 既存のメッセージを削除
  const existingMessage = document.getElementById("x-message");
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // 新しいメッセージを作成
  const messageDiv = document.createElement("div");
  messageDiv.id = "x-message";
  messageDiv.style.cssText = `
    position: fixed;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1.5vw 3vw;
    border-radius: 1vw;
    font-size: 2.5vw;
    z-index: 1000;
    font-family: 'JF-Dot-Kaname12', monospace;
  `;
  messageDiv.textContent = message;
  document.body.appendChild(messageDiv);
  
  // 「シャッフルします♪」の場合は画像も表示
  if (message.includes("シャッフル")) {
    showShuffleImage();
  }
  
  // 1.0秒後にメッセージを削除
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 1000);
}

// ゲームオーバー画像を表示
function showGameOverImage() {
  // 既存の画像を削除
  const existingImage = document.getElementById("game-over-image");
  if (existingImage) {
    existingImage.remove();
  }
  
  // 新しい画像を作成
  const imageDiv = document.createElement("div");
  imageDiv.id = "game-over-image";
  imageDiv.style.cssText = `
    position: fixed;
    top: 52%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
    pointer-events: none;
  `;
  
  const img = document.createElement("img");
  img.src = "images/out.png";
  img.style.cssText = `
    width: 30vw;
    height: auto;
  `;
  
  imageDiv.appendChild(img);
  document.body.appendChild(imageDiv);
  
  // 永続表示（削除しない）
}

// シャッフルメッセージの候補をランダムに選択
function getShuffleMessage() {
  const messages = [
    "シャッフルします♪",
    "シャッフル～♪",
    "まぜまぜ～♪",
    "シャッフルタイム！",
    "シャッフル！",
    "まぜまぜタイム！",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// 全てのカードを裏に戻す
function flipAllCardsBack() {
  const allCards = document.querySelectorAll(".card");
  allCards.forEach(card => {
    card.classList.remove("open");
  });
}

// シャッフル画像を表示
function showShuffleImage() {
  // 既存の画像を削除
  const existingImage = document.getElementById("shuffle-image");
  if (existingImage) {
    existingImage.remove();
  }
  
  // 新しい画像を作成
  const imageDiv = document.createElement("div");
  imageDiv.id = "shuffle-image";
  imageDiv.style.cssText = `
    position: fixed;
    top: 52%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1001;
    pointer-events: none;
  `;
  
  const img = document.createElement("img");
  img.src = "images/mazeru.png";
  img.style.cssText = `
    width: 30vw;
    height: auto;
  `;
  
  imageDiv.appendChild(img);
  document.body.appendChild(imageDiv);
  
  // 1.0秒後に画像を削除
  setTimeout(() => {
    if (imageDiv.parentNode) {
      imageDiv.remove();
    }
  }, 1000);
}

// カードをシャッフル
function shuffleCards() {
  const board = document.getElementById("board");
  const allChildren = Array.from(board.children);
  
  // 空きスロットの位置を記録
  const emptySlots = [];
  const cardElements = [];
  
  allChildren.forEach((child, index) => {
    if (child.classList.contains("empty-slot")) {
      emptySlots.push({element: child, index: index});
    } else {
      cardElements.push(child);
    }
  });
  
  // カードのみをシャッフル
  cardElements.sort(() => Math.random() - 0.5);
  
  // ボードをクリア
  board.innerHTML = "";
  
  // 元の位置に空きスロットを配置
  const totalElements = emptySlots.length + cardElements.length;
  for (let i = 0; i < totalElements; i++) {
    const isEmptySlot = emptySlots.some(slot => slot.index === i);
    if (isEmptySlot) {
      const emptySlot = emptySlots.find(slot => slot.index === i);
      board.appendChild(emptySlot.element);
    } else {
      const card = cardElements.shift();
      if (card) {
        board.appendChild(card);
        // イベントリスナーを再設定
        setupCardEventListeners(card);
      }
    }
  }
}

// カードのイベントリスナーを設定する関数
function setupCardEventListeners(card) {
  const cardValue = card.dataset.value;
  
  // 既存のイベントリスナーを削除して再設定
  card.removeEventListener('click', card.handleClick);
  
  card.handleClick = function(e) {
    console.log('カードクリック:', cardValue, 'lock:', lock, 'open:', card.classList.contains("open"));
    if (lock || card.classList.contains("open")) {
      console.log('クリック無効: lock=' + lock + ', open=' + card.classList.contains("open"));
      return;
    }
    lock = true;
    card.classList.add("open");
    console.log('カードめくり実行:', cardValue);

    if (cardValue === 'red-x' || cardValue === 'blue-x' || cardValue === 'green-x') {
      // ×カードの引いた回数を記録
      xCardCounts[cardValue] = (xCardCounts[cardValue] || 0) + 1;
      
      // 数字の昇順をリセット
      lastDrawnNumber = null;
      drawnCards = [];
      
      if (xCardCounts[cardValue] === 1) {
        // 1回目：警告メッセージ
        showXCardMessage("アクマにご注意！");
        setTimeout(() => {
          flipAllCardsBack(); // 全てのカードを裏に戻す
          lock = false;
        }, 1000);
      } else if (xCardCounts[cardValue] === 2) {
        // 2回目：シャッフルメッセージと画像
        showXCardMessage(getShuffleMessage());
        showShuffleImage();
        setTimeout(() => {
          flipAllCardsBack(); // 全てのカードを裏に戻す
          shuffleCards();
          // 全ての×カードのカウントをリセット
          xCardCounts = {};
          lock = false;
        }, 1000);
      } else {
        // 3回目以降：通常のリセット
        setTimeout(() => {
          flipAllCardsBack(); // 全てのカードを裏に戻す
          resetGame();
          lock = false;
        }, 1000);
      }
      return;
    }

    if (lastDrawnNumber === null) {
      // 最初のカード
      lastDrawnNumber = cardValue;
      drawnCards.push(cardValue); // 引いたカードを記録
      lock = false;
    } else {
      // 2枚目以降のカード
      if (cardValue > lastDrawnNumber) {
        // 昇順の場合
        lastDrawnNumber = cardValue;
        drawnCards.push(cardValue); // 引いたカードを記録
        
        // クリア条件のチェック：1から始まって全ての数字カードが表になっているか
        const allNumbersDrawn = drawnCards.filter(card => typeof card === 'number');
        const requiredNumbers = Array.from({length: selectedLevel}, (_, i) => i + 1);
        
        const isCompleteClear = allNumbersDrawn.length === requiredNumbers.length &&
                                requiredNumbers.every(num => allNumbersDrawn.includes(num)) &&
                                allNumbersDrawn[0] === 1;
        
        if (isCompleteClear) {
          showClearMessage();
          lock = false;
        } else {
          lock = false;
        }
      } else {
        // 昇順が途切れた場合
        setTimeout(() => {
          flipAllCardsBack(); // 全てのカードを裏に戻す
          lastDrawnNumber = null;
          drawnCards = [];
          // xCardCountsはリセットしない（×カードの進行状況を維持）
          lock = false;
        }, 1000);
      }
    }
  };
  
  card.addEventListener('click', card.handleClick);
}

function showClearMessage() {
  console.log('=== ゲームクリア処理開始 ===');
  console.log('現在時刻:', new Date().toLocaleTimeString());
  
  // カード操作をロック（チュートリアルも含む）
  lock = true;
  
  const messageDiv = document.createElement("div");
  messageDiv.style.cssText = `
    position: fixed;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
    background: black;
    padding: 1.5vw 3vw;
    border-radius: 1vw;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 1002;
    font-size: 2.5vw;
    font-weight: bold;
    font-family: 'JF-Dot-Kaname12', monospace;
    color: yellow;
    text-align: center;
    border: 3px solid yellow;
    white-space: pre-line;
  `;
  messageDiv.textContent = `ゲームクリア！`;
  
  console.log('クリアメッセージを作成しました');
  document.body.appendChild(messageDiv);
  console.log('クリアメッセージを画面に追加しました');
  
  // 「ゲームクリア！」のテキストが表示されたら各処理を実行
  setTimeout(() => {
    // 全てのカードのクリックイベントを無効化
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
      card.style.pointerEvents = 'none';
      card.style.cursor = 'default';
    });
    
    // タイマーを停止
    if (timerInterval) {
      clearInterval(timerInterval);
      console.log('タイマーを停止しました');
    }
    
    // BGMを停止
    console.log('BGM停止を開始します...');
    stopBGM();
    console.log('BGM停止完了');
    
    // 背景を白に戻し、トランジションを即時適用
    document.body.style.transition = 'none';
    document.body.style.backgroundColor = 'white';
    console.log('背景を白色に戻しました');
    
    // 少し遅延してトランジションを元に戻す
    setTimeout(() => {
      document.body.style.transition = 'background-color 13s ease-in-out';
    }, 100);
    
    // 効果音を再生（chare、batuと同じ実装方法）
    console.log('クリア効果音再生を開始します...');
    playClearSound();
  }, 100); // メッセージ表示から100ms後に実行
  
  // 永久表示のため、削除処理をコメントアウト
  // setTimeout(() => {
  //   document.body.removeChild(messageDiv);
  // }, 5000);
}

// クリア効果音再生関数
function playClearSound() {
  try {
    console.log('クリア効果音の再生を試みます...');
    
    // chare、batuと同じ実装方法でcoingameを実装
    const audio = new Audio();
    audio.src = 'sounds/coingame.mp3';
    audio.type = 'audio/mpeg';
    audio.volume = sfxVolume; // 設定された効果音音量を使用
    
    // 音声ファイルの読み込みを待機
    audio.addEventListener('canplaythrough', function() {
      console.log('クリア効果音の読み込み完了、再生を開始します');
      console.log('音声タイプ:', audio.type);
      console.log('音声ソース:', audio.src);
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('クリア効果音再生成功');
        }).catch(error => {
          console.log('クリア効果音の再生に失敗しました:', error);
          // 少し遅延して再試みる
          setTimeout(() => {
            audio.play();
          }, 200);
        });
      } else {
        // 古いブラウザ対応
        audio.play();
        console.log('クリア効果音再生成功（古いブラウザ）');
      }
    });
    
    // 読み込みエラーの場合
    audio.addEventListener('error', function(error) {
      console.log('クリア効果音の読み込みエラー:', error);
      console.log('エラーオブジェクト:', error.target.error);
      
      // 少し遅延して再試みる
      setTimeout(() => {
        audio.play();
      }, 300);
    });
    
  } catch (error) {
    console.log('クリア効果音の作成に失敗しました:', error);
  }
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', function() {
  // ホームボタン
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', function() {
      document.getElementById('home-confirm-dialog').style.display = 'block';
    });
  }
  
  // ホーム確認ダイアログのボタン
  const confirmHome = document.getElementById('confirm-home');
  if (confirmHome) {
    confirmHome.addEventListener('click', function() {
      // 全てのリセットと初期画面に戻る
      backToStart();
      document.getElementById('home-confirm-dialog').style.display = 'none';
      
      // ページを更新して完全に初期状態に戻す
      setTimeout(() => {
        location.reload();
      }, 100);
    });
  }
  
  const cancelHome = document.getElementById('cancel-home');
  if (cancelHome) {
    cancelHome.addEventListener('click', function() {
      document.getElementById('home-confirm-dialog').style.display = 'none';
    });
  }
  
  // 音量ボタン
  const volumeBtn = document.getElementById('volume-btn');
  if (volumeBtn) {
    volumeBtn.addEventListener('click', function() {
      document.getElementById('volume-panel').style.display = 'block';
    });
  }
  
  // 音量パネルの閉じるボタン
  const closeVolumePanel = document.getElementById('close-volume-panel');
  if (closeVolumePanel) {
    closeVolumePanel.addEventListener('click', function() {
      document.getElementById('volume-panel').style.display = 'none';
    });
  }
  
  // BGM音量スライダー
  const bgmVolumeSlider = document.getElementById('bgm-volume');
  const bgmVolumeValue = document.getElementById('bgm-volume-value');
  if (bgmVolumeSlider && bgmVolumeValue) {
    bgmVolumeSlider.addEventListener('input', function() {
      bgmVolume = this.value / 100;
      bgmVolumeValue.textContent = this.value + '%';
      
      // 再生中のBGM音量を更新
      if (bgmAudio) {
        bgmAudio.volume = bgmVolume * 0.3; // 設定された音量の30%を適用
      }
    });
  }
  
  // 効果音音量スライダー
  const sfxVolumeSlider = document.getElementById('sfx-volume');
  const sfxVolumeValue = document.getElementById('sfx-volume-value');
  if (sfxVolumeSlider && sfxVolumeValue) {
    sfxVolumeSlider.addEventListener('input', function() {
      sfxVolume = this.value / 100;
      sfxVolumeValue.textContent = this.value + '%';
    });
  }
});
