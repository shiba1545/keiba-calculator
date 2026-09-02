let state = {
  deductionRate: 0.25,
  horses: []
};

// 計算専用の追加21レースデータ（非表示）
const extraRaceHistory = [
  [1, 3, 5, 2, 4, 6], [1, 6, 2, 3, 4, 5], [1, 5, 2, 4, 3, 6], [2, 1, 3, 4, 5, 6],
  [2, 1, 4, 3, 5, 6], [6, 1, 2, 3, 4, 5], [2, 3, 1, 4, 5, 6], [2, 3, 4, 1, 5, 6],
  [1, 3, 2, 4, 5, 6], [2, 4, 3, 1, 5, 6], [2, 5, 1, 3, 4, 6], [3, 2, 1, 4, 5, 6],
  [3, 5, 1, 2, 6, 4], [3, 1, 4, 2, 5, 6], [3, 1, 2, 4, 5, 6], [4, 1, 3, 2, 5, 6],
  [4, 1, 2, 3, 5, 6], [4, 2, 1, 3, 5, 6], [5, 1, 2, 3, 4, 6], [5, 2, 1, 3, 4, 6],
  [2, 1, 5, 3, 4, 6]
];

// 初期表示
window.onload = function() {
  loadData();
  if (document.getElementById("horseTableBody")) {
    renderTable();
  }
};

// データロード
function loadData() {
  const saved = localStorage.getItem("keiba_data");
  if (saved) {
    state = JSON.parse(saved);
    const deductionElem = document.getElementById("deductionRate");
    const countElem = document.getElementById("horseCount");
    if (deductionElem) deductionElem.value = state.deductionRate;
    if (countElem) countElem.value = state.horses.length;
  } else {
    setupHorses();
  }
}

// データ保存
function saveData() {
  const deductionElem = document.getElementById("deductionRate");
  if (deductionElem) {
    state.deductionRate = parseFloat(deductionElem.value) || 0.25;
  }
  localStorage.setItem("keiba_data", JSON.stringify(state));
}

// 初期セットアップ
function setupHorses() {
    const defaultBaseHistory = [
  [1, 2, 3, 4, 5, 6], // 1回目
  [1, 2, 4, 3, 5, 6], // 2回目
  [2, 4, 1, 3, 5, 6], // 3回目
  [1, 3, 4, 2, 5, 6], // 4回目
  [1, 4, 2, 3, 5, 6], // 5回目
  [1, 4, 3, 2, 5, 6], // 6回目
  [1, 5, 2, 3, 4, 6], // 7回目
  [1, 5, 2, 3, 4, 6], // 8回目
  [1, 2, 5, 3, 4, 6], // 9回目
  [1, 3, 5, 2, 4, 6], // 10回目
  [1, 6, 2, 3, 4, 5], // 11回目
  [1, 5, 2, 4, 3, 6], // 12回目
  [2, 1, 3, 4, 5, 6], // 13回目
  [2, 1, 4, 3, 5, 6], // 14回目
  [6, 1, 2, 3, 4, 5], // 15回目
  [2, 3, 1, 4, 5, 6], // 16回目
  [2, 3, 4, 1, 5, 6], // 17回目
  [1, 3, 2, 4, 5, 6], // 18回目
  [2, 4, 3, 1, 5, 6], // 19回目
  [2, 5, 1, 3, 4, 6], // 20回目
  [3, 2, 1, 4, 5, 6], // 21回目
  [3, 5, 1, 2, 6, 4], // 22回目
  [3, 1, 4, 2, 5, 6], // 23回目
  [3, 1, 2, 4, 5, 6], // 24回目
  [4, 1, 3, 2, 5, 6], // 25回目
  [4, 1, 2, 3, 5, 6], // 26回目
  [4, 2, 1, 3, 5, 6], // 27回目
  [5, 1, 2, 3, 4, 6], // 28回目
  [5, 2, 1, 3, 4, 6], // 29回目
  [2, 1, 5, 3, 4, 6]  // 30回目
];
  const count = 6;
  const countElem = document.getElementById("horseCount");
  if (countElem) countElem.value = count;
  
  state.horses = [];

  for (let i = 1; i <= count; i++) {
    const horseHistory = raceHistory.map(race => {
      const rank = race.indexOf(i) + 1;
      return rank > 0 ? rank : "";
    });

    const hiddenHistory = extraRaceHistory.map(race => {
      const rank = race.indexOf(i) + 1;
      return rank > 0 ? rank : "";
    });

    state.horses.push({
      num: i,
      name: `馬番${i}`,
      rank: "---",
      odds: 99.0,
      userRank: "",
      winRate: 0,
      history: horseHistory,
      hiddenHistory: hiddenHistory
    });
  }
  saveData();
  if (document.getElementById("horseTableBody")) {
    renderTable();
  }
}

// テーブル描画 (index.html用)
function renderTable() {
  const tbody = document.getElementById("horseTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  state.horses.forEach((h, index) => {
    const tr = document.createElement("tr");

    let historyTds = h.history.map((val, hIdx) => 
      `<td><input type="text" size="2" value="${val}" onchange="updateHistory(${index}, ${hIdx}, this.value)"></td>`
    ).join("");

    tr.innerHTML = `
      <td>${h.num}</td>
      <td><input type="text" value="${h.name}" onchange="updateName(${index}, this.value)"></td>
      <td>${h.rank}</td>
      <td>${h.odds.toFixed(1)}</td>
      <td><input type="text" size="3" id="userRank_${index}" value="${h.userRank}" onchange="updateUserRank(${index}, this.value)"></td>
      <td>${(h.winRate).toFixed(2)} (${(h.winRate * 100).toFixed(1)}%)</td>
      ${historyTds}
    `;
    tbody.appendChild(tr);
  });
}

function updateName(index, val) { state.horses[index].name = val; saveData(); }
function updateHistory(horseIdx, historyIdx, val) { state.horses[horseIdx].history[historyIdx] = val; saveData(); }
function updateUserRank(index, val) { state.horses[index].userRank = val; saveData(); }

// 計算＆確定
function calculateOddsAndResults() {
  const deductionElem = document.getElementById("deductionRate");
  const deductionRate = deductionElem ? parseFloat(deductionElem.value) : 0.25;
  state.deductionRate = deductionRate;

  let horseStats = [];

  state.horses.forEach((h, index) => {
    let winCount = 0;
    let validRaces = 0;

    (h.hiddenHistory || []).forEach(val => {
      if (val !== "" && !isNaN(val)) {
        validRaces++;
        if (parseInt(val) === 1) winCount++;
      }
    });

    h.history.forEach(val => {
      if (val !== "" && !isNaN(val)) {
        validRaces++;
        if (parseInt(val) === 1) winCount++;
      }
    });

    const winRate = validRaces > 0 ? winCount / validRaces : 0;
    let rawOdds = winRate > 0 ? (1 - deductionRate) / winRate : 999.0;
    let oddsForRanking = Math.floor(rawOdds * 1000) / 1000;

    h.winRate = winRate;
    horseStats.push({ index, winRate, oddsForRanking });
  });

  let sorted = [...horseStats].sort((a, b) => a.oddsForRanking - b.oddsForRanking);
  let currentRank = 1;
  sorted.forEach((item, i) => {
    if (i > 0 && item.oddsForRanking > sorted[i - 1].oddsForRanking) {
      currentRank = i + 1;
    }
    state.horses[item.index].rank = currentRank + "位";
  });

  let winHorse = "", secondHorse = "", thirdHorse = "";

  state.horses.forEach((h) => {
    let calculatedOdds = 99.0;
    if (h.winRate > 0) {
      const rawOdds = (1 - deductionRate) / h.winRate;
      calculatedOdds = Math.floor(rawOdds * 10) / 10;
      if (calculatedOdds < 1.0) calculatedOdds = 1.0;
      if (calculatedOdds > 99.0) calculatedOdds = 99.0;
    }
    h.odds = calculatedOdds;

    if (h.userRank === "1") winHorse = String(h.num);
    if (h.userRank === "2") secondHorse = String(h.num);
    if (h.userRank === "3") thirdHorse = String(h.num);
  });

  if (winHorse !== "") {
    state.horses.forEach(h => {
      h.history.unshift(h.userRank);
      h.history.pop();
      h.userRank = "";
    });

    if (secondHorse !== "") {
      const ex1 = document.getElementById("exacta1");
      const ex2 = document.getElementById("exacta2");
      const tf1 = document.getElementById("trifecta1");
      const tf2 = document.getElementById("trifecta2");
      const tf3 = document.getElementById("trifecta3");

      if (ex1) ex1.value = winHorse;
      if (ex2) ex2.value = secondHorse;
      if (tf1) tf1.value = winHorse;
      if (tf2) tf2.value = secondHorse;
      if (tf3) tf3.value = thirdHorse;
    }
    alert("【結果確定】履歴を更新しました。");
  }

  calculateExactaOdds();
  calculateTrifectaOdds();

  saveData();
  renderTable();
}

// 馬単計算
function calculateExactaOdds() {
  const ex1 = document.getElementById("exacta1");
  const ex2 = document.getElementById("exacta2");
  if (!ex1 || !ex2) return;

  const p1_num = ex1.value;
  const p2_num = ex2.value;
  const h1 = state.horses.find(h => String(h.num) === p1_num);
  const h2 = state.horses.find(h => String(h.num) === p2_num);

  if (!h1 || !h2 || p1_num === p2_num) return;

  const prob = (h1.winRate + h2.winRate) > 0 ? h1.winRate * (h2.winRate / (h1.winRate + h2.winRate)) : 0;
  let odds = prob > 0 ? Math.floor(((1 - state.deductionRate) / prob) * 10) / 10 : 256.0;
  odds = Math.min(Math.max(odds, 1.0), 256.0);

  const oddsTxt = document.getElementById("exactaOddsText");
  const payTxt = document.getElementById("exactaPayoutText");
  if (oddsTxt) oddsTxt.innerText = odds.toFixed(1);
  if (payTxt) payTxt.innerText = Math.floor(odds * 5000).toLocaleString();
}

// 3連単計算
function calculateTrifectaOdds() {
  const ex1 = document.getElementById("exacta1");
  const ex2 = document.getElementById("exacta2");
  const tf3 = document.getElementById("trifecta3");
  if (!ex1 || !ex2 || !tf3) return;

  const p1_num = ex1.value;
  const p2_num = ex2.value;
  const p3_num = tf3.value;

  const h1 = state.horses.find(h => String(h.num) === p1_num);
  const h2 = state.horses.find(h => String(h.num) === p2_num);
  const h3 = state.horses.find(h => String(h.num) === p3_num);

  if (!h1 || !h2 || !h3) return;

  const sum12 = h1.winRate + h2.winRate;
  const sum123 = sum12 + h3.winRate;
  let prob = 0;
  if (sum12 > 0 && sum123 > 0) {
    prob = h1.winRate * (h2.winRate / sum12) * (h3.winRate / sum123);
  }

  let odds = prob > 0 ? Math.floor(((1 - state.deductionRate) / prob) * 10) / 10 : 512.0;
  odds = Math.min(Math.max(odds, 1.0), 512.0);

  const oddsTxt = document.getElementById("trifectaOddsText");
  const payTxt = document.getElementById("trifectaPayoutText");
  if (oddsTxt) oddsTxt.innerText = odds.toFixed(1);
  if (payTxt) payTxt.innerText = Math.floor(odds * 5000).toLocaleString();
}

function assignRandomRanks() {
  let ranks = state.horses.map((_, i) => i + 1);
  for (let i = ranks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
  }
  state.horses.forEach((h, i) => h.userRank = String(ranks[i]));
  renderTable();
}

function resetHistory() {
  if (confirm("全てのデータを初期化しますか？")) {
    localStorage.removeItem("keiba_data");
    setupHorses();
  }
}

// N回目終了時点の切り替え関数 (history.html・index.html 共通)
function showHistoryAtRace(raceIndex) {
  raceIndex = parseInt(raceIndex);
  const targetRaceIdx = raceIndex - 1;
  let horseStats = [];

  state.horses.forEach((h, index) => {
    const sliced = h.history.slice(0, raceIndex);
    let winCount = 0;
    let total = 0;

    // 隠しデータの計算反映
    (h.hiddenHistory || []).forEach(v => {
      if (v !== "" && !isNaN(v)) {
        total++;
        if (parseInt(v) === 1) winCount++;
      }
    });

    // 表示切り替え時点までのデータ反映
    sliced.forEach(v => {
      if (v !== "" && !isNaN(v)) {
        total++;
        if (parseInt(v) === 1) winCount++;
      }
    });

    const winRate = total > 0 ? winCount / total : 0;
    h.winRate = winRate;

    let rawOdds = winRate > 0 ? (1 - state.deductionRate) / winRate : 999.0;
    let oddsForRanking = Math.floor(rawOdds * 1000) / 1000;

    if (winRate > 0) {
      let calculated = Math.floor(rawOdds * 10) / 10;
      if (calculated < 1.0) calculated = 1.0;
      if (calculated > 99.0) calculated = 99.0;
      h.odds = calculated;
    } else {
      h.odds = 99.0;
    }

    horseStats.push({ index, oddsForRanking });
  });

  let sorted = [...horseStats].sort((a, b) => a.oddsForRanking - b.oddsForRanking);
  let currentRank = 1;
  sorted.forEach((item, i) => {
    if (i > 0 && item.oddsForRanking > sorted[i - 1].oddsForRanking) {
      currentRank = i + 1;
    }
    state.horses[item.index].rank = currentRank + "位";
  });

  let rank1Horse = "", rank2Horse = "", rank3Horse = "";
  state.horses.forEach(h => {
    const rankVal = String(h.history[targetRaceIdx]);
    if (rankVal === "1") rank1Horse = String(h.num);
    if (rankVal === "2") rank2Horse = String(h.num);
    if (rankVal === "3") rank3Horse = String(h.num);
  });

  const ex1 = document.getElementById("exacta1");
  const ex2 = document.getElementById("exacta2");
  const tf1 = document.getElementById("trifecta1");
  const tf2 = document.getElementById("trifecta2");
  const tf3 = document.getElementById("trifecta3");

  if (rank1Horse) {
    if (ex1) ex1.value = rank1Horse;
    if (tf1) tf1.value = rank1Horse;
  }
  if (rank2Horse) {
    if (ex2) ex2.value = rank2Horse;
    if (tf2) tf2.value = rank2Horse;
  }
  if (rank3Horse) {
    if (tf3) tf3.value = rank3Horse;
  }

  if (document.getElementById("horseTableBody")) {
    renderTable();
  }

  calculateExactaOdds();
  calculateTrifectaOdds();
}
