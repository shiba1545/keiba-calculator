let state = {
  deductionRate: 0.25,
  horses: []
};

// 初期表示
window.onload = function() {
  loadData();
  renderTable();
};

// データロード（ブラウザ保存領域から）
function loadData() {
  const saved = localStorage.getItem("keiba_data");
  if (saved) {
    state = JSON.parse(saved);
    document.getElementById("deductionRate").value = state.deductionRate;
    document.getElementById("horseCount").value = state.horses.length;
  } else {
    setupHorses();
  }
}

// データ保存
function saveData() {
  state.deductionRate = parseFloat(document.getElementById("deductionRate").value) || 0.25;
  localStorage.setItem("keiba_data", JSON.stringify(state));
}

// 頭数変更・初期化（指定された30パターンの着順データ）
function setupHorses() {
  // 指定の30レース着順データ（1着〜6着）
  const raceHistory = [
    [1, 2, 3, 4, 5, 6], [1, 2, 4, 3, 5, 6], [2, 4, 1, 3, 5, 6], [1, 3, 4, 2, 5, 6], [1, 4, 2, 3, 5, 6],
    [1, 4, 3, 2, 5, 6], [1, 5, 2, 3, 4, 6], [1, 5, 2, 3, 4, 6], [1, 2, 5, 3, 4, 6], [1, 3, 5, 2, 4, 6],
    [1, 6, 2, 3, 4, 5], [1, 5, 2, 4, 3, 6], [2, 1, 3, 4, 5, 6], [2, 1, 4, 3, 5, 6], [6, 1, 2, 3, 4, 5],
    [2, 3, 1, 4, 5, 6], [2, 3, 4, 1, 5, 6], [1, 3, 2, 4, 5, 6], [2, 4, 3, 1, 5, 6], [2, 5, 1, 3, 4, 6],
    [3, 2, 1, 4, 5, 6], [3, 5, 1, 2, 6, 4], [3, 1, 4, 2, 5, 6], [3, 1, 2, 4, 5, 6], [4, 1, 3, 2, 5, 6],
    [4, 1, 2, 3, 5, 6], [4, 2, 1, 3, 5, 6], [5, 1, 2, 3, 4, 6], [5, 2, 1, 3, 4, 6], [2, 1, 5, 3, 4, 6]
  ];

  const count = 6; // 出走頭数を6頭に設定
  document.getElementById("horseCount").value = count;
  state.horses = [];

  for (let i = 1; i <= count; i++) {
    // 各レースから「馬番i」の着順を抽出
    const horseHistory = raceHistory.map(race => {
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
      history: horseHistory
    });
  }
  saveData();
  renderTable();
}

// テーブル描画
function renderTable() {
  const tbody = document.getElementById("horseTableBody");
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

// メイン計算＆結果確定処理
function calculateOddsAndResults() {
  const deductionRate = parseFloat(document.getElementById("deductionRate").value);
  state.deductionRate = deductionRate;

  let horseStats = [];

  // 全馬の過去勝率と生オッズ計算
  state.horses.forEach((h, index) => {
    let winCount = 0;
    let validRaces = 0;

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

  // 人気順位計算
  let sorted = [...horseStats].sort((a, b) => a.oddsForRanking - b.oddsForRanking);
  let currentRank = 1;
  sorted.forEach((item, i) => {
    if (i > 0 && item.oddsForRanking > sorted[i - 1].oddsForRanking) {
      currentRank = i + 1;
    }
    state.horses[item.index].rank = currentRank + "位";
  });

  // オッズ計算
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

    // 着順確認
    if (h.userRank === "1") winHorse = String(h.num);
    if (h.userRank === "2") secondHorse = String(h.num);
    if (h.userRank === "3") thirdHorse = String(h.num);
  });

  // 1着入力がある場合の履歴スライド更新
  if (winHorse !== "") {
    state.horses.forEach(h => {
      h.history.unshift(h.userRank);
      h.history.pop();
      h.userRank = "";
    });

    // 馬単・3連単枠に自動セット
    if (secondHorse !== "") {
      document.getElementById("exacta1").value = winHorse;
      document.getElementById("exacta2").value = secondHorse;
      document.getElementById("trifecta1").value = winHorse;
      document.getElementById("trifecta2").value = secondHorse;
      document.getElementById("trifecta3").value = thirdHorse;
    }
    alert("【結果確定】履歴を更新しました。");
  }

  // 入力枠に値がない場合はデフォルト（1・2・3番）を設定して再計算
  const e1 = document.getElementById("exacta1");
  const e2 = document.getElementById("exacta2");
  const t1 = document.getElementById("trifecta1");
  const t2 = document.getElementById("trifecta2");
  const t3 = document.getElementById("trifecta3");

  if (e1 && !e1.value) e1.value = "1";
  if (e2 && !e2.value) e2.value = "2";
  if (t1 && !t1.value) t1.value = "1";
  if (t2 && !t2.value) t2.value = "2";
  if (t3 && !t3.value) t3.value = "3";

  calculateExactaOdds();
  calculateTrifectaOdds();

  saveData();
  renderTable();
}

// 馬単計算
function calculateExactaOdds() {
  const p1_num = document.getElementById("exacta1").value;
  const p2_num = document.getElementById("exacta2").value;
  const h1 = state.horses.find(h => String(h.num) === p1_num);
  const h2 = state.horses.find(h => String(h.num) === p2_num);

  if (!h1 || !h2 || p1_num === p2_num) return;

  const prob = (h1.winRate + h2.winRate) > 0 ? h1.winRate * (h2.winRate / (h1.winRate + h2.winRate)) : 0;
  let odds = prob > 0 ? Math.floor(((1 - state.deductionRate) / prob) * 10) / 10 : 256.0;
  odds = Math.min(Math.max(odds, 1.0), 256.0);

  document.getElementById("exactaOddsText").innerText = odds.toFixed(1);
  document.getElementById("exactaPayoutText").innerText = Math.floor(odds * 5000).toLocaleString();
}

// 3連単計算
function calculateTrifectaOdds() {
  const p1_num = document.getElementById("trifecta1").value;
  const p2_num = document.getElementById("trifecta2").value;
  const p3_num = document.getElementById("trifecta3").value;

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

  document.getElementById("trifectaOddsText").innerText = odds.toFixed(1);
  document.getElementById("trifectaPayoutText").innerText = Math.floor(odds * 5000).toLocaleString();
}

// ランダム着順設定
function assignRandomRanks() {
  let ranks = state.horses.map((_, i) => i + 1);
  for (let i = ranks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
  }
  state.horses.forEach((h, i) => h.userRank = String(ranks[i]));
  renderTable();
}

// リセット
function resetHistory() {
  if (confirm("全てのデータを初期化しますか？")) {
    localStorage.removeItem("keiba_data");
    setupHorses();
  }
}

// レース時点（1〜30回目）を指定して勝率・オッズを切り替える関数
function showHistoryAtRace(raceIndex) {
  raceIndex = parseInt(raceIndex);
  
  state.horses.forEach(h => {
    // 0回目からraceIndex回目までの履歴を取得
    const sliced = h.history.slice(0, raceIndex);
    let winCount = 0;
    let total = 0;
    
    sliced.forEach(v => {
      if (v !== "" && !isNaN(v)) {
        total++;
        if (parseInt(v) === 1) winCount++;
      }
    });

    // 勝率の再計算
    const winRate = total > 0 ? winCount / total : 0;
    h.winRate = winRate;

    // オッズの再計算
    if (winRate > 0) {
      const rawOdds = (1 - state.deductionRate) / winRate;
      let calculated = Math.floor(rawOdds * 10) / 10;
      if (calculated < 1.0) calculated = 1.0;
      if (calculated > 99.0) calculated = 99.0;
      h.odds = calculated;
    } else {
      h.odds = 99.0;
    }
  });

  renderTable();

  // 馬単・3連単の入力枠にデフォルト（1番・2番・3番）を設定して再計算
  const e1 = document.getElementById("exacta1");
  const e2 = document.getElementById("exacta2");
  const t1 = document.getElementById("trifecta1");
  const t2 = document.getElementById("trifecta2");
  const t3 = document.getElementById("trifecta3");

  if (e1 && !e1.value) e1.value = "1";
  if (e2 && !e2.value) e2.value = "2";
  if (t1 && !t1.value) t1.value = "1";
  if (t2 && !t2.value) t2.value = "2";
  if (t3 && !t3.value) t3.value = "3";

  calculateExactaOdds();
  calculateTrifectaOdds();
}

// ページ読み込み時にドロップダウンの選択肢（1〜30回目）を自動生成する
window.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("raceSelector");
  if (!select) return;
  select.innerHTML = "";
  for (let i = 30; i >= 1; i--) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${i}回目終了時点`;
    select.appendChild(opt);
  }
  select.value = 30;
});
