const { useState, useEffect, useRef, useCallback } = React;

// ── Constants ─────────────────────────────────────────────────────────────
const CR = 24;
const BOARD_W = 1110;
const BOARD_H = 680;
const MAX_TURNS = 30;

const VS_GAMES = [
  { name: '묵찌빠', img: './game_descriptions/vs게임/묵찌빠.png' },
  { name: '병뚜껑컬링', img: './game_descriptions/vs게임/병뚜껑컬링.png' },
  { name: '참참참', img: './game_descriptions/vs게임/참참참.png' },
  { name: '초성스피드', img: './game_descriptions/vs게임/초성스피드.png' },
  { name: '칭찬공격', img: './game_descriptions/vs게임/칭찬공격.png' },
  { name: '표정따라하기', img: './game_descriptions/vs게임/표정따라하기.png' },
  { name: '표정뽑기', img: './game_descriptions/vs게임/표정뽑기.png' },
  { name: '휴지불기', img: './game_descriptions/vs게임/휴지불기.png' },
];

const MINI_GAMES = [
  // 1v2 (one vs two)
  { name: '그림자지우기', img: './game_descriptions/미니게임/1v2/그림자지우기.png', type: '1v2' },
  { name: '눈치게임', img: './game_descriptions/미니게임/1v2/눈치게임.png', type: '1v2' },
  { name: '꼬리잡기', img: './game_descriptions/미니게임/1v2/꼬리잡기.png', type: '1v2' },
  { name: '가짜리액션', img: './game_descriptions/미니게임/1v2/가짜리액션.png', type: '1v2' },
  { name: '침묵의스파이', img: './game_descriptions/미니게임/1v2/침묵의스파이.png', type: '1v2' },
  { name: '팀전야바위', img: './game_descriptions/미니게임/1v2/팀전야바위.png', type: '1v2' },
  // 1:1:1 win (one winner)
  { name: '술믈리에', img: './game_descriptions/미니게임/111/win/술믈리에.png', type: '111_win' },
  { name: '지석진게임', img: './game_descriptions/미니게임/111/win/지석진게임.png', type: '111_win' },
  { name: '제로게임', img: './game_descriptions/미니게임/111/win/제로게임.png', type: '111_win' },
  { name: '스피드퀴즈', img: './game_descriptions/미니게임/111/win/스피드퀴즈.png', type: '111_win' },
  { name: '35게임', img: './game_descriptions/미니게임/111/win/35게임.png', type: '111_win' },
  // 1:1:1 lose (one loser)
  { name: '초간단미션', img: './game_descriptions/미니게임/111/lose/초간단미션.png', type: '111_lose' },
  { name: '리듬게임', img: './game_descriptions/미니게임/111/lose/리듬게임.png', type: '111_lose' },
  { name: '가사제시어', img: './game_descriptions/미니게임/111/lose/가사제시어.png', type: '111_lose' },
  { name: '이중모션', img: './game_descriptions/미니게임/111/lose/이중모션.png', type: '111_lose' },
];

const SPECIAL_EVENTS = [
  { id: 'steal', emoji: '🦊', name: '코인 훔치기', desc: '한 팀에게서 코인 5개를 훔칩니다', needsTeam: true, needsCell: false },
  { id: 'drink', emoji: '🍺', name: '음주 선고', desc: '한 팀을 지목해 술을 마시게 합니다', needsTeam: true, needsCell: false },
  { id: 'switch', emoji: '🔄', name: '위치 교환', desc: '한 팀과 보드 위치를 교환합니다', needsTeam: true, needsCell: false },
  { id: 'donate', emoji: '🎁', name: '코인 기부', desc: '한 팀에게 코인 5개를 줍니다', needsTeam: true, needsCell: false },
  { id: 'random', emoji: '🎲', name: '랜덤 이동', desc: '보드의 랜덤 위치로 이동합니다', needsTeam: false, needsCell: false },
  { id: 'double', emoji: '✨', name: '2배 코인', desc: '다음 코인 획득량이 2배가 됩니다', needsTeam: false, needsCell: false },
  { id: 'send', emoji: '📍', name: '강제 이동', desc: '한 팀을 지정된 칸으로 강제 이동시킵니다', needsTeam: true, needsCell: true },
];

const MONSTER_EVENTS = [
  { id: 'loseCoin', emoji: '👹', name: '코인 강탈', desc: '몬스터가 코인 20개를 빼앗아 갑니다!' },
  { id: 'redistribute', emoji: '⚖️', name: '코인 균등 분배', desc: '모든 팀의 코인을 합산하여 균등하게 나눕니다 (소수점 버림)' },
  { id: 'richPoor', emoji: '💸', name: '빈부격차 해소', desc: '코인이 가장 많은 팀이 가장 적은 팀에게 코인 10개를 줍니다' },
  { id: 'perform', emoji: '🎤', name: '공연 소환', desc: '이 팀에서 한 명이 노래나 춤을 선보여야 합니다!' },
];

const KO = {
  title: 'GH 술먹어',
  subtitle: 'Growth Hackers 파티 보드게임',
  reset: '↺ 초기화',
  mapView: '전체 지도',
  pieceView: '말 보기',
  teams: '팀',
  rollDice: '주사위 굴리기',
  rolling: '굴리는 중…',
  moving: '이동 중…',
  playAgain: '다시 하기',
  editCell: (id) => `${id}번 칸 편집`,
  save: '저장',
  cancel: '취소',
  editTeam: '팀 편집',
  teamName: '팀 이름',
  changePhoto: '📷 사진 변경',
  turn: (name) => `🎲 ${name}의 차례`,
  legendStart: '출발 / 도착',
  legendBlue: '코인 획득 💰',
  legendGreen: '중립',
  legendRed: '코인 감소',
  legendVs: 'VS 게임 ⚡',
  legendMarket: '상점 🛒',
  legendDrink: '마시기 🍺',
  statCell: (pos) => `${pos}번 칸`,
  turnsOf: (n, max) => `${n}/${max}턴`,
  gameOverBanner: '게임 종료 🎲',
  tieWinName: '공동 우승',
};

// ── Cell styles ───────────────────────────────────────────────────────────
const CELL_STYLES = {
  start: { bg: '#FFD700', border: '#F9A825' },
  finish: { bg: '#EF5350', border: '#B71C1C' },
  blue: { bg: '#4FC3F7', border: '#0277BD' },
  green: { bg: '#66BB6A', border: '#2E7D32' },
  red: { bg: '#EF5350', border: '#B71C1C' },
  vs: { bg: '#66BB6A', border: '#1B5E20' },
  market: { bg: '#FF9800', border: '#E65100' },
  drink: { bg: '#81C784', border: '#388E3C' },
  monster: { bg: '#CE93D8', border: '#6A1B9A' },
};

const CELL_EMOJI = { start: '🏁', finish: '🏆', vs: '⚡', market: '✨', drink: '🍺', monster: '👹' };

const DICE_DOTS = {
  1: [[50, 50]],
  2: [[30, 30], [70, 70]],
  3: [[30, 30], [50, 50], [70, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
  5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
  6: [[30, 22], [70, 22], [30, 50], [70, 50], [30, 78], [70, 78]],
};

// ── Arc-length parameterized GH path ──────────────────────────────────────
function buildGHPath() {
  const pts = [];
  // G outer arc: 291 samples from θ=35° to θ=325° CCW
  const cx = 0.2658 * BOARD_W, cy = 0.5662 * BOARD_H, R = 0.2117 * BOARD_W;
  for (let d = 35; d <= 325; d++) {
    const t = d * Math.PI / 180;
    pts.push([cx + R * Math.cos(t), cy - R * Math.sin(t)]);
  }
  // G inner curve → inner tip
  [[0.4414, 0.6765], [0.4324, 0.6176], [0.4144, 0.5809], [0.3874, 0.5662], [0.3378, 0.5618], [0.3243, 0.5267]]
    .forEach(([nx, ny]) => pts.push([nx * BOARD_W, ny * BOARD_H]));
  // G crossbar (inner tip → H entry)
  [[0.4234, 0.5221], [0.4910, 0.5147], [0.5495, 0.5294]]
    .forEach(([nx, ny]) => pts.push([nx * BOARD_W, ny * BOARD_H]));
  // G→H connector + H left bar
  [[0.5946, 0.9485], [0.5883, 0.1912]]
    .forEach(([nx, ny]) => pts.push([nx * BOARD_W, ny * BOARD_H]));
  // H top junction
  [[0.6423, 0.1912], [0.6423, 0.5632]]
    .forEach(([nx, ny]) => pts.push([nx * BOARD_W, ny * BOARD_H]));
  // H crossbar end + outer right bottom + inner right bottom + inner right top
  [[0.9126, 0.5676], [0.9315, 0.9485], [0.8784, 0.8706], [0.8631, 0.1912]]
    .forEach(([nx, ny]) => pts.push([nx * BOARD_W, ny * BOARD_H]));
  return pts;
}

function samplePath(pts, n) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
    cum.push(cum[i - 1] + Math.hypot(dx, dy));
  }
  const L = cum[cum.length - 1], step = L / (n - 1);
  const result = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const d = k * step;
    while (j < cum.length - 2 && cum[j + 1] < d) j++;
    const seg = cum[j + 1] - cum[j];
    const t = seg > 0 ? (d - cum[j]) / seg : 0;
    result.push([pts[j][0] + t * (pts[j + 1][0] - pts[j][0]), pts[j][1] + t * (pts[j + 1][1] - pts[j][1])]);
  }
  return result;
}

// Manually tuned overrides (normalized to BOARD_W / BOARD_H)
const POSITION_OVERRIDES = {
  22: [0.3405, 0.5779],
  23: [0.2982, 0.5221],
  24: [0.3739, 0.5132],
  25: [0.4423, 0.5074],
  26: [0.5009, 0.5265],
  27: [0.5351, 0.5956],
  28: [0.5405, 0.6897],
  29: [0.5450, 0.7838],
  30: [0.5523, 0.8853],
  32: [0.5964, 0.8265],
  39: [0.6081, 0.1691],
  44: [0.6802, 0.5794],
  45: [0.7315, 0.5647],
  46: [0.7883, 0.5662],
  47: [0.8378, 0.5647],
  48: [0.9117, 0.5706],
  50: [0.9225, 0.7632],
  51: [0.9252, 0.8574],
  52: [0.9252, 0.9426],
  53: [0.8793, 0.9000],
  54: [0.8766, 0.8221],
  55: [0.8739, 0.7265],
  56: [0.8721, 0.6309],
};

function defaultPositions() {
  const sampled = samplePath(buildGHPath(), 60);
  const p = {};
  sampled.forEach(([x, y], i) => { p[i + 1] = { x: Math.round(x), y: Math.round(y) }; });
  Object.entries(POSITION_OVERRIDES).forEach(([id, [rx, ry]]) => {
    p[Number(id)] = { x: Math.round(rx * BOARD_W), y: Math.round(ry * BOARD_H) };
  });
  return p;
}

function defaultPos(id) { return POSITIONS[id] || { x: CR, y: CR }; }

const POSITIONS = defaultPositions();

// ── Dice ──────────────────────────────────────────────────────────────────
function Dice({ value, rolling }) {
  const dots = DICE_DOTS[value] || DICE_DOTS[1];
  return (
    <div className={`dice${rolling ? ' rolling' : ''}`}>
      {dots.map(([x, y], i) => (
        <span key={i} className="dot" style={{ left: `${x}%`, top: `${y}%` }} />
      ))}
    </div>
  );
}

// ── PathLines SVG — no 60→1 loop ──────────────────────────────────────────
function PathLines({ positions }) {
  const lines = [];
  for (let i = 1; i <= 59; i++) {
    const a = positions[i], b = positions[i + 1];
    if (!a || !b) continue;
    lines.push(
      <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
        stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="4 3" />
    );
  }
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: BOARD_W, height: BOARD_H, pointerEvents: 'none', overflow: 'visible' }}
      width={BOARD_W} height={BOARD_H}>
      {lines}
    </svg>
  );
}

// ── BoardCell ─────────────────────────────────────────────────────────────
function BoardCell({ cell, cellOverride, pos, teamsHere, popup, onClick }) {
  const effectiveType = (cellOverride?.type && cell.type !== 'start' && cell.type !== 'finish')
    ? cellOverride.type : cell.type;
  const s = CELL_STYLES[effectiveType] || CELL_STYLES.green;
  const displayText = cellOverride?.text || cell.text || null;
  const coinChange = (cellOverride?.coinChange !== undefined) ? cellOverride.coinChange : cell.coinChange;
  const emoji = CELL_EMOJI[effectiveType];

  return (
    <div className="board-cell"
      style={{ position: 'absolute', left: pos.x - CR, top: pos.y - CR, width: CR * 2, height: CR * 2, background: s.bg, borderColor: s.border }}
      onClick={onClick}>
      {displayText
        ? <span className="ct">{displayText}</span>
        : emoji
          ? <span className="ci">{emoji}</span>
          : coinChange !== 0
            ? <span className="ce">{coinChange > 0 ? `+${coinChange}` : coinChange}</span>
            : null
      }
      {popup && (
        <span key={popup.key} className="coin-popup" style={{ color: popup.amount > 0 ? '#FFD700' : '#ff6b6b' }}>
          {popup.amount > 0 ? `+${popup.amount}` : popup.amount}💰
        </span>
      )}
      {teamsHere.length > 0 && (
        <div className="pieces">
          {teamsHere.map(t => (
            <div key={t.id} className="piece" style={{ background: t.color }} title={t.name}>
              {t.imageUrl
                ? <img src={t.imageUrl} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : t.initials}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PieceView ─────────────────────────────────────────────────────────────
function PieceView({ currentTeam, teams, config, cellData }) {
  if (!currentTeam) return null;
  const pos = currentTeam.position;
  const from = Math.max(1, pos - 5), to = Math.min(60, pos + 5);
  const stripIds = [];
  for (let i = from; i <= to; i++) stripIds.push(i);

  return (
    <div className="piece-view">
      <h3>{KO.pieceView}</h3>
      <div className="strip">
        {stripIds.map(id => {
          const cell = config.cells.find(c => c.id === id);
          const override = cellData[id] || {};
          const effectiveType = (override.type && cell.type !== 'start' && cell.type !== 'finish')
            ? override.type : cell.type;
          const s = CELL_STYLES[effectiveType] || CELL_STYLES.green;
          const isCurrent = id === pos;
          const size = isCurrent ? 100 : 80;
          const teamsHere = teams.filter(t => t.position === id);
          const displayText = override.text || cell.text || null;
          const coinChange = override.coinChange !== undefined ? override.coinChange : cell.coinChange;
          const emoji = CELL_EMOJI[effectiveType];

          return (
            <div key={id}
              className={`strip-cell${isCurrent ? ' strip-current' : ''}`}
              style={{ width: size, height: size, background: s.bg, border: `3px solid ${s.border}`, flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.5)' }}>{id}</span>
              {displayText && <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.6)', textAlign: 'center', maxWidth: '90%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{displayText}</span>}
              {!displayText && emoji && <span style={{ fontSize: 10 }}>{emoji}</span>}
              {!displayText && !emoji && coinChange !== 0 && <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(0,0,0,0.7)' }}>{coinChange > 0 ? `+${coinChange}` : coinChange}</span>}
              {teamsHere.length > 0 && (
                <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                  {teamsHere.map(t => (
                    <div key={t.id}
                      style={{ width: 20, height: 20, borderRadius: '50%', background: t.color, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, color: '#fff', overflow: 'hidden', flexShrink: 0 }}
                      title={t.name}>
                      {t.imageUrl
                        ? <img src={t.imageUrl} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : t.initials}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TeamCard ──────────────────────────────────────────────────────────────
function TeamCard({ team, isActive, turns, maxTurns, onEditClick }) {
  return (
    <div className={`team-card${isActive ? ' active' : ''}`} style={{ '--tc': team.color }}>
      <div className="team-avatar" style={{ background: team.color, cursor: 'pointer' }} title={KO.editTeam} onClick={onEditClick}>
        {team.imageUrl
          ? <img src={team.imageUrl} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          : team.initials}
      </div>
      <div style={{ flex: 1 }}>
        <div className="team-name">{team.name}</div>
        <div className="team-stats">
          <span className="stat">{KO.statCell(team.position)}</span>
          <span className="stat stat-coins">💰 {team.coins}</span>
          <span className="stat stat-turns">{KO.turnsOf(turns, maxTurns)}</span>
        </div>
        {team.skipTurn && <span style={{ fontSize: '0.65rem', color: '#FFD93D' }}>⏭️ 다음 턴 스킵</span>}
        {team.shieldActive && <span style={{ fontSize: '0.65rem', color: '#4FC3F7' }}>🛡️ 방어 중</span>}
        {team.doubleCoins && <span style={{ fontSize: '0.65rem', color: '#FFD700' }}>✨ 다음 코인 2배</span>}
        {team.forcedMove && <span style={{ fontSize: '0.65rem', color: '#FF9800' }}>📍 강제 이동됨</span>}
      </div>
      {isActive && <span className="active-arrow">▶</span>}
    </div>
  );
}

// ── CellEditModal ─────────────────────────────────────────────────────────
function CellEditModal({ cell, cellOverride, onSave, onCancel }) {
  const isSpecial = cell.type === 'start' || cell.type === 'finish';
  const [text, setText] = useState(cellOverride.text || cell.text || '');
  const [coinChange, setCoinChange] = useState(
    cellOverride.coinChange !== undefined ? cellOverride.coinChange : cell.coinChange
  );
  const [type, setType] = useState((cellOverride.type && !isSpecial) ? cellOverride.type : cell.type);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>{KO.editCell(cell.id)}</h3>
        <label className="modal-label">
          <span>텍스트 (최대 20자)</span>
          <input type="text" maxLength={20} value={text} onChange={e => setText(e.target.value)} className="modal-input" placeholder="셀 설명 입력…" />
        </label>
        <label className="modal-label">
          <span>코인 변화</span>
          <input type="number" value={coinChange} onChange={e => setCoinChange(Number(e.target.value))} className="modal-input" />
        </label>
        {!isSpecial && (
          <label className="modal-label">
            <span>유형</span>
            <select value={type} onChange={e => setType(e.target.value)} className="modal-input">
              <option value="blue">파랑 (코인+)</option>
              <option value="green">초록 (중립)</option>
              <option value="red">빨강 (코인-)</option>
              <option value="monster">몬스터 👹 (랜덤 이벤트)</option>
              <option value="vs">VS 게임 ⚡</option>
              <option value="market">특별 이벤트 ✨</option>
              <option value="drink">마시기 🍺</option>
            </select>
          </label>
        )}
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>{KO.cancel}</button>
          <button className="modal-btn modal-btn-save" onClick={() => onSave({ text, coinChange, type: isSpecial ? cell.type : type })}>
            {KO.save}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TeamEditModal ─────────────────────────────────────────────────────────
function TeamEditModal({ team, onSave, onCancel }) {
  const [name, setName] = useState(team.name);
  const [imageUrl, setImageUrl] = useState(team.imageUrl || null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>{KO.editTeam}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div className="team-edit-avatar" style={{ background: team.color }}
            onClick={() => fileRef.current && fileRef.current.click()} title={KO.changePhoto}>
            {imageUrl
              ? <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>{team.initials}</span>}
            <div className="team-edit-avatar-overlay"><span>{KO.changePhoto}</span></div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
        <label className="modal-label">
          <span>{KO.teamName}</span>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="modal-input" placeholder="팀 이름 입력…" />
        </label>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>{KO.cancel}</button>
          <button className="modal-btn modal-btn-save" onClick={() => onSave({ name, imageUrl })}>{KO.save}</button>
        </div>
      </div>
    </div>
  );
}

// ── WinnerOverlay ─────────────────────────────────────────────────────────
function WinnerOverlay({ winner, maxTurns, onReset }) {
  return (
    <div className="overlay" onClick={onReset}>
      <div className="winner-modal" onClick={e => e.stopPropagation()}>
        <p className="modal-confetti">🎉🎊🏆🎊🎉</p>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
          {maxTurns}턴 완료 — 게임 종료
        </p>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFD700' }}>{winner.name}</h2>
        <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.75)', margin: '4px 0 16px' }}>
          {winner.isMultiple ? '공동 우승!' : '우승!'}
        </p>
        <div className="winner-rankings">
          {winner.rankedTeams.map((t, i) => (
            <div key={t.id} className={`winner-rank-row${i === 0 ? ' rank-first' : ''}`}>
              <span className="rank-pos">{i + 1}위</span>
              <div className="rank-avatar" style={{ background: t.color }}>
                {t.imageUrl
                  ? <img src={t.imageUrl} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : t.initials}
              </div>
              <span className="rank-name">{t.name}</span>
              <span className="rank-coins">💰 {t.coins}</span>
            </div>
          ))}
        </div>
        <button className="modal-play-again" onClick={onReset}>{KO.playAgain}</button>
      </div>
    </div>
  );
}

// ── ImageLightbox — tap image to full-screen ─────────────────────────────
function ImageLightbox({ src, alt, onClose }) {
  return (
    <div onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'
      }}>
      <img src={src} alt={alt}
        style={{ maxWidth: '96vw', maxHeight: '96vh', objectFit: 'contain', borderRadius: 8 }}
        onClick={e => e.stopPropagation()} />
    </div>
  );
}

// ── TeamSelectModal — pick opponent before VS game ────────────────────────
function TeamSelectModal({ currentTeamIdx, teams, onSelect }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', minWidth: 300 }}>
        <h3>⚡ VS 게임!</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: -6, marginBottom: 18 }}>
          상대 팀을 선택하세요
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {teams.map((t, i) => i === currentTeamIdx ? null : (
            <button key={t.id} className="roll-btn" style={{ background: t.color }} onClick={() => onSelect(i)}>
              {t.imageUrl
                ? <img src={t.imageUrl} alt={t.name}
                  style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', marginRight: 8, verticalAlign: 'middle', border: '2px solid rgba(255,255,255,0.5)' }} />
                : null}
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── VSModal — game spinner ────────────────────────────────────────────────
function VSModal({ teamName, opponentName, onClose }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * VS_GAMES.length));
  const [stopped, setStopped] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const ivRef = useRef(null);

  useEffect(() => {
    ivRef.current = setInterval(() => setIdx(i => (i + 1) % VS_GAMES.length), 110);
    return () => clearInterval(ivRef.current);
  }, []);

  const stop = () => {
    if (stopped) return;
    clearInterval(ivRef.current);
    setStopped(true);
  };

  const game = VS_GAMES[idx];
  return (
    <>
      <div className="modal-overlay">
        <div className="modal-box" onClick={e => e.stopPropagation()}
          style={{ textAlign: 'center', minWidth: 340, maxWidth: 500, width: '90vw' }}>
          <h3>⚡ VS 게임!</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: -6, marginBottom: 16 }}>
            {teamName}{opponentName ? ` vs ${opponentName}` : ''} — {stopped ? '이 게임을 진행하세요!' : '게임 고르는 중…'}
          </p>
          <div className="spinner-display">
            <div className="spinner-name">{game.name}</div>
            {stopped && (
              <img src={game.img} alt={game.name} onClick={() => setLightbox(true)}
                style={{
                  width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 10, marginTop: 14,
                  border: '1px solid rgba(255,255,255,0.15)', cursor: 'zoom-in'
                }} />
            )}
          </div>
          {!stopped
            ? <button className="roll-btn" style={{ background: '#EF5350', marginTop: 16 }} onClick={stop}>STOP</button>
            : <button className="roll-btn" style={{ background: '#4CAF50', marginTop: 16 }} onClick={onClose}>확인! 🎮</button>
          }
        </div>
      </div>
      {lightbox && <ImageLightbox src={game.img} alt={game.name} onClose={() => setLightbox(false)} />}
    </>
  );
}

// ── SpecialEventModal — roulette special event ────────────────────────────
function SpecialEventModal({ teamIdx, teams, onApply, onStartCellPick }) {
  const [idx, setIdx] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [phase, setPhase] = useState('spin'); // 'spin' | 'selectTeam'
  const ivRef = useRef(null);

  useEffect(() => {
    ivRef.current = setInterval(() => setIdx(i => (i + 1) % SPECIAL_EVENTS.length), 130);
    return () => clearInterval(ivRef.current);
  }, []);

  const stop = () => {
    if (stopped) return;
    clearInterval(ivRef.current);
    setStopped(true);
  };

  const event = SPECIAL_EVENTS[idx];

  const handleNext = () => {
    if (event.needsTeam) setPhase('selectTeam');
    else onApply(event.id, null, null);
  };

  const handleTeamSelect = (tIdx) => {
    if (event.needsCell) onStartCellPick(tIdx);
    else onApply(event.id, tIdx, null);
  };

  if (phase === 'spin') {
    return (
      <div className="modal-overlay">
        <div className="modal-box" onClick={e => e.stopPropagation()}
          style={{ textAlign: 'center', minWidth: 340, maxWidth: 500, width: '90vw' }}>
          <h3>✨ 특별 이벤트!</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: -6, marginBottom: 16 }}>
            {teams[teamIdx]?.name} — {stopped ? '이 이벤트를 진행하세요!' : '이벤트 고르는 중…'}
          </p>
          <div className="spinner-display">
            <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>{event.emoji}</div>
            <div className="spinner-name">{event.name}</div>
            {stopped && (
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>{event.desc}</div>
            )}
          </div>
          {!stopped
            ? <button className="roll-btn" style={{ background: '#EF5350', marginTop: 16 }} onClick={stop}>STOP</button>
            : <button className="roll-btn" style={{ background: '#FF9800', marginTop: 16 }} onClick={handleNext}>
              {event.needsTeam ? '팀 선택 →' : '적용! ✓'}
            </button>
          }
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', minWidth: 300 }}>
        <h3>{event.emoji} {event.name}</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: -6, marginBottom: 18 }}>
          대상 팀을 선택하세요
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {teams.map((t, i) => i === teamIdx ? null : (
            <button key={t.id} className="roll-btn" style={{ background: t.color }} onClick={() => handleTeamSelect(i)}>
              {t.imageUrl
                ? <img src={t.imageUrl} alt={t.name}
                  style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', marginRight: 8, verticalAlign: 'middle', border: '2px solid rgba(255,255,255,0.5)' }} />
                : null}
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MonsterEventModal — roulette monster event ────────────────────────────
function MonsterEventModal({ teams, teamIdx, onResolve }) {
  const [idx, setIdx] = useState(0);
  const [stopped, setStopped] = useState(false);
  const ivRef = useRef(null);

  useEffect(() => {
    ivRef.current = setInterval(() => setIdx(i => (i + 1) % MONSTER_EVENTS.length), 130);
    return () => clearInterval(ivRef.current);
  }, []);

  const stop = () => {
    if (stopped) return;
    clearInterval(ivRef.current);
    setStopped(true);
  };

  const event = MONSTER_EVENTS[idx];

  const handleConfirm = () => {
    const tIdx = teamIdx;
    let updaterFn;
    let appliedCoins = teams[tIdx].coins;

    if (event.id === 'loseCoin') {
      const newCoins = Math.max(0, teams[tIdx].coins - 20);
      appliedCoins = newCoins;
      updaterFn = (prev) => prev.map((t, i) => i === tIdx ? { ...t, coins: newCoins } : { ...t });
    } else if (event.id === 'redistribute') {
      const total = teams.reduce((sum, t) => sum + t.coins, 0);
      const each = Math.floor(total / teams.length);
      appliedCoins = each;
      updaterFn = (prev) => prev.map(t => ({ ...t, coins: each }));
    } else if (event.id === 'richPoor') {
      const maxCoins = Math.max(...teams.map(t => t.coins));
      const minCoins = Math.min(...teams.map(t => t.coins));
      const richIdx = teams.findIndex(t => t.coins === maxCoins);
      const poorIdx = teams.findIndex(t => t.coins === minCoins);
      if (richIdx === poorIdx) {
        updaterFn = (prev) => prev.map(t => ({ ...t }));
      } else {
        const transfer = Math.min(10, teams[richIdx].coins);
        updaterFn = (prev) => prev.map((t, i) => {
          if (i === richIdx) return { ...t, coins: Math.max(0, t.coins - transfer) };
          if (i === poorIdx) return { ...t, coins: t.coins + transfer };
          return { ...t };
        });
        if (tIdx === richIdx) appliedCoins = Math.max(0, teams[tIdx].coins - transfer);
        else if (tIdx === poorIdx) appliedCoins = teams[tIdx].coins + transfer;
      }
    } else {
      updaterFn = (prev) => prev.map(t => ({ ...t }));
    }

    onResolve(updaterFn, appliedCoins);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={e => e.stopPropagation()}
        style={{ textAlign: 'center', minWidth: 340, maxWidth: 500, width: '90vw' }}>
        <h3>👹 몬스터 출현!</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: -6, marginBottom: 16 }}>
          {teams[teamIdx]?.name} — {stopped ? '이 이벤트가 발동됩니다!' : '이벤트 고르는 중…'}
        </p>
        <div className="spinner-display">
          <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>{event.emoji}</div>
          <div className="spinner-name">{event.name}</div>
          {stopped && (
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>{event.desc}</div>
          )}
        </div>
        {!stopped
          ? <button className="roll-btn" style={{ background: '#EF5350', marginTop: 16 }} onClick={stop}>STOP</button>
          : <button className="roll-btn" style={{ background: '#6A1B9A', marginTop: 16 }} onClick={handleConfirm}>확인 😱</button>
        }
      </div>
    </div>
  );
}

// ── DrinkModal ────────────────────────────────────────────────────────────
function DrinkModal({ cellText, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🍺</div>
        <h3 style={{ fontSize: '1.3rem', marginBottom: 20 }}>{cellText || '술 마시기!'}</h3>
        <button className="roll-btn" style={{ background: '#FF9800' }} onClick={onClose}>원샷! 🍻</button>
      </div>
    </div>
  );
}

// ── RoundCarousel — swipe game picker after each round ───────────────────
function RoundCarousel({ round, onClose }) {
  const [idx, setIdx] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [dragStartX, setDragStartX] = useState(null);
  const [lightbox, setLightbox] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const spinRef = useRef(null);

  useEffect(() => () => clearInterval(spinRef.current), []);

  const prev = () => setIdx(i => (i - 1 + MINI_GAMES.length) % MINI_GAMES.length);
  const next = () => setIdx(i => (i + 1) % MINI_GAMES.length);

  const onDragStart = (clientX) => setDragStartX(clientX);
  const onDragEnd = (clientX) => {
    if (dragStartX === null) return;
    const diff = dragStartX - clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    setDragStartX(null);
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const steps = 22 + Math.floor(Math.random() * 10);
    let count = 0;
    spinRef.current = setInterval(() => {
      setIdx(i => (i + 1) % MINI_GAMES.length);
      count++;
      if (count >= steps) {
        clearInterval(spinRef.current);
        setSpinning(false);
      }
    }, 80);
  };

  const game = MINI_GAMES[idx];

  if (confirmed) {
    return (
      <>
        <div className="overlay">
          <div className="winner-modal" style={{ minWidth: 360, maxWidth: 580, width: '92vw', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#FFD700', marginBottom: 16 }}>🎮 {game.name}</h2>
            <img src={game.img} alt={game.name} onClick={() => setLightbox(true)}
              style={{
                width: '100%', maxHeight: 420, objectFit: 'contain', borderRadius: 12, marginBottom: 20,
                border: '1px solid rgba(255,255,255,0.12)', cursor: 'zoom-in'
              }} />
            <button className="modal-play-again" onClick={() => onClose(game)}>게임 시작! 🎮</button>
          </div>
        </div>
        {lightbox && <ImageLightbox src={game.img} alt={game.name} onClose={() => setLightbox(false)} />}
      </>
    );
  }

  return (
    <div className="overlay">
      <div className="winner-modal" style={{ minWidth: 340, textAlign: 'center' }}>
        <p style={{ fontSize: '1.8rem', marginBottom: 4 }}>🎲</p>
        <h2 style={{ fontSize: '1.5rem', color: '#FFD700', marginBottom: 6 }}>라운드 {round} 완료!</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: 20 }}>
          미니게임을 선택하세요 (스와이프 또는 화살표)
        </p>

        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, userSelect: 'none', cursor: spinning ? 'default' : 'grab' }}
          onMouseDown={e => { if (!spinning) onDragStart(e.clientX); }}
          onMouseUp={e => { if (!spinning) onDragEnd(e.clientX); }}
          onTouchStart={e => { if (!spinning) onDragStart(e.touches[0].clientX); }}
          onTouchEnd={e => { if (!spinning) onDragEnd(e.changedTouches[0].clientX); }}
        >
          <button onClick={e => { e.stopPropagation(); if (!spinning) prev(); }}
            disabled={spinning}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8, width: 40, height: 40, cursor: spinning ? 'not-allowed' : 'pointer', fontSize: '1.4rem', flexShrink: 0, opacity: spinning ? 0.35 : 1 }}>‹</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: spinning ? '#FFD700' : '#fff', minHeight: '1.6em', lineHeight: 1.3, transition: 'color 0.1s' }}>{game.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.38)', marginTop: 6 }}>{spinning ? '…' : `${idx + 1} / ${MINI_GAMES.length}`}</div>
          </div>
          <button onClick={e => { e.stopPropagation(); if (!spinning) next(); }}
            disabled={spinning}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', borderRadius: 8, width: 40, height: 40, cursor: spinning ? 'not-allowed' : 'pointer', fontSize: '1.4rem', flexShrink: 0, opacity: spinning ? 0.35 : 1 }}>›</button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 0 }}>
          <button className="modal-play-again" style={{ flex: 1, background: '#9C27B0' }} onClick={spin} disabled={spinning}>
            {spinning ? '🎰 선택 중…' : '🎰 Spin!'}
          </button>
          <button className="modal-play-again" style={{ flex: 1, opacity: spinning ? 0.35 : 1, cursor: spinning ? 'not-allowed' : 'pointer' }}
            disabled={spinning} onClick={() => setConfirmed(true)}>선택! ✓</button>
        </div>
      </div>
    </div>
  );
}

// ── PenaltyModal — red / monster cell: accept penalty or drink ────────────
function PenaltyModal({ teamName, penalty, coins, isMonster, onResolve }) {
  const [phase, setPhase] = useState('choice');

  if (phase === 'drink') {
    const shots = Math.ceil(Math.abs(penalty) / 5);
    return (
      <div className="modal-overlay">
        <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', minWidth: 300 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>{'🍺'.repeat(shots)}</div>
          <h3>술로 위기 탈출!</h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 4px' }}>
            <strong>{teamName}</strong>이(가) 페널티를 피했습니다!
          </p>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FFD700', margin: '10px 0 20px' }}>
            {shots}잔 🍻
          </div>
          <button className="roll-btn" style={{ background: '#FF9800' }} onClick={() => onResolve(false)}>
            {shots === 1 ? '원샷! 🍻' : `${shots}잔 마시기! 🍻`}
          </button>
        </div>
      </div>
    );
  }

  const canAfford = coins >= Math.abs(penalty);
  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', minWidth: 300 }}>
        <div style={{ fontSize: '3rem', marginBottom: 4 }}>{isMonster ? '👹' : '⚠️'}</div>
        <h3>{isMonster ? '몬스터 출현!' : '페널티 칸!'}</h3>
        <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: -6, marginBottom: 8 }}>{teamName}</p>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ff6b6b', marginBottom: 6 }}>
          {penalty} 💰
        </div>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
          {canAfford ? '벌칙을 받거나, 술을 마시고 회피하세요.' : '코인이 부족합니다 — 술로 회피하세요!'}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="modal-btn modal-btn-save" style={{ flex: 1, background: '#EF5350', opacity: canAfford ? 1 : 0.35, cursor: canAfford ? 'pointer' : 'not-allowed' }}
            disabled={!canAfford}
            onClick={() => onResolve(true)}>
            벌칙 받기 💸
          </button>
          <button className="modal-btn modal-btn-cancel" style={{ flex: 1 }}
            onClick={() => setPhase('drink')}>
            술 마시기 🍺
          </button>
        </div>
      </div>
    </div>
  );
}

// ── VsCoinModal — winner tab + adjustable distribution for VS games ────────
function VsCoinModal({ teams, teamIdx, opponentIdx, onConfirm }) {
  const [winnerIdx, setWinnerIdx] = useState(null);
  const [winAmt, setWinAmt] = useState(10);
  const [loseAmt, setLoseAmt] = useState(10);

  const participants = [teamIdx, opponentIdx];
  const loserIdx = winnerIdx !== null ? participants.find(i => i !== winnerIdx) : null;

  if (winnerIdx === null) {
    return (
      <div className="modal-overlay">
        <div className="modal-box" onClick={e => e.stopPropagation()}
          style={{ textAlign: 'center', minWidth: 340 }}>
          <h3>⚡ VS 결과</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: -6, marginBottom: 20 }}>
            이긴 팀을 선택하세요
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {participants.map(idx => {
              const t = teams[idx];
              return (
                <button key={t.id} className="roll-btn" style={{ flex: 1, background: t.color }}
                  onClick={() => setWinnerIdx(idx)}>
                  {t.imageUrl && (
                    <img src={t.imageUrl} alt={t.name}
                      style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', marginRight: 8, verticalAlign: 'middle', border: '2px solid rgba(255,255,255,0.5)' }} />
                  )}
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const winner = teams[winnerIdx];
  const loser = teams[loserIdx];
  const buildDeltas = () => teams.map((_, i) => i === winnerIdx ? winAmt : i === loserIdx ? -loseAmt : 0);

  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ minWidth: 340 }}>
        <h3>⚡ VS 코인 지급</h3>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: -8, marginBottom: 16 }}>
          금액을 조정하세요
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: winner.color, border: '2px solid rgba(255,255,255,0.4)', overflow: 'hidden', flexShrink: 0 }}>
            {winner.imageUrl && <img src={winner.imageUrl} alt={winner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <span style={{ flex: 1, fontWeight: 700, fontSize: '0.88rem' }}>{winner.name} 🏆</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="manual-dice-btn" style={{ width: 34, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => setWinAmt(a => Math.max(0, a - 5))}>-5</button>
            <button className="manual-dice-btn" style={{ width: 30, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => setWinAmt(a => Math.max(0, a - 1))}>-1</button>
            <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 900, fontSize: '0.95rem', color: '#FFD700' }}>+{winAmt}</span>
            <button className="manual-dice-btn" style={{ width: 30, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => setWinAmt(a => a + 1)}>+1</button>
            <button className="manual-dice-btn" style={{ width: 34, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => setWinAmt(a => a + 5)}>+5</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: loser.color, border: '2px solid rgba(255,255,255,0.4)', overflow: 'hidden', flexShrink: 0 }}>
            {loser.imageUrl && <img src={loser.imageUrl} alt={loser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <span style={{ flex: 1, fontWeight: 700, fontSize: '0.88rem' }}>{loser.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="manual-dice-btn" style={{ width: 34, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => setLoseAmt(a => Math.max(0, a - 5))}>-5</button>
            <button className="manual-dice-btn" style={{ width: 30, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => setLoseAmt(a => Math.max(0, a - 1))}>-1</button>
            <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 900, fontSize: '0.95rem', color: '#ff6b6b' }}>-{loseAmt}</span>
            <button className="manual-dice-btn" style={{ width: 30, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => setLoseAmt(a => a + 1)}>+1</button>
            <button className="manual-dice-btn" style={{ width: 34, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => setLoseAmt(a => a + 5)}>+5</button>
          </div>
        </div>
        <button className="roll-btn" style={{ background: '#4CAF50', marginTop: 4 }} onClick={() => onConfirm(buildDeltas())}>
          확인 ✓
        </button>
      </div>
    </div>
  );
}

// ── MiniGameCoinModal — post-round minigame coin distribution ─────────────
function MiniGameCoinModal({ teams, game, onConfirm }) {
  const gameType = game.type; // '1v2' | '111_win' | '111_lose'
  const [phase, setPhase] = useState(gameType === '1v2' ? 'spin' : 'select');
  const [oneIdx, setOneIdx] = useState(null);
  const [spinIdx, setSpinIdx] = useState(0);
  const [spinStopped, setSpinStopped] = useState(false);
  const [deltas, setDeltas] = useState(null);
  const spinRef = useRef(null);

  useEffect(() => {
    if (phase !== 'spin') return;
    spinRef.current = setInterval(() => setSpinIdx(i => (i + 1) % teams.length), 150);
    return () => clearInterval(spinRef.current);
  }, [phase]);

  const stopSpin = () => {
    if (spinStopped) return;
    clearInterval(spinRef.current);
    setSpinStopped(true);
    setOneIdx(spinIdx);
  };

  const enterConfirm = (d) => { setDeltas(d); setPhase('confirm'); };
  const adjust = (i, v) => setDeltas(prev => prev.map((x, j) => j === i ? x + v : x));

  if (phase === 'spin') {
    const t = teams[spinIdx];
    return (
      <div className="modal-overlay">
        <div className="modal-box" onClick={e => e.stopPropagation()}
          style={{ textAlign: 'center', minWidth: 340, maxWidth: 460, width: '90vw' }}>
          <h3>🎮 {game.name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: -6, marginBottom: 16 }}>
            {spinStopped ? '"1" 팀이 정해졌습니다!' : '"1" 팀을 뽑는 중…'}
          </p>
          <div className="spinner-display" style={{ padding: '20px 0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: t.color, margin: '0 auto 12px', border: '3px solid rgba(255,255,255,0.5)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t.imageUrl
                ? <img src={t.imageUrl} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontWeight: 900, color: '#fff', fontSize: '1.3rem' }}>{t.initials}</span>}
            </div>
            <div className="spinner-name">{t.name}</div>
          </div>
          {!spinStopped
            ? (
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="roll-btn" style={{ flex: 1, background: '#EF5350' }} onClick={stopSpin}>STOP</button>
                <button className="roll-btn" style={{ flex: 1, background: '#546E7A' }} onClick={() => { clearInterval(spinRef.current); setPhase('manual'); }}>직접 선택</button>
              </div>
            )
            : <button className="roll-btn" style={{ background: '#FF9800', marginTop: 8 }} onClick={() => setPhase('result')}>게임 진행! →</button>
          }
        </div>
      </div>
    );
  }

  if (phase === 'manual') {
    return (
      <div className="modal-overlay">
        <div className="modal-box" onClick={e => e.stopPropagation()}
          style={{ textAlign: 'center', minWidth: 340 }}>
          <h3>🎮 {game.name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: -6, marginBottom: 20 }}>
            "1" 팀을 선택하세요
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {teams.map((t, i) => (
              <button key={t.id} className="roll-btn" style={{ background: t.color }}
                onClick={() => { setOneIdx(i); setSpinStopped(true); setPhase('result'); }}>
                {t.imageUrl && (
                  <img src={t.imageUrl} alt={t.name}
                    style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', marginRight: 8, verticalAlign: 'middle', border: '2px solid rgba(255,255,255,0.5)' }} />
                )}
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const twoIndices = teams.map((_, i) => i).filter(i => i !== oneIdx);
    return (
      <div className="modal-overlay">
        <div className="modal-box" onClick={e => e.stopPropagation()}
          style={{ textAlign: 'center', minWidth: 340 }}>
          <h3>🎮 {game.name} — 결과</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: -6, marginBottom: 20 }}>
            누가 이겼나요?
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="roll-btn" style={{ flex: 1, background: teams[oneIdx].color }}
              onClick={() => enterConfirm(teams.map((_, i) => i === oneIdx ? 20 : -5))}>
              {teams[oneIdx].imageUrl && (
                <img src={teams[oneIdx].imageUrl} alt={teams[oneIdx].name}
                  style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', marginRight: 6, verticalAlign: 'middle' }} />
              )}
              {teams[oneIdx].name} 승 (1팀)
            </button>
            <button className="roll-btn" style={{ flex: 1, background: '#546E7A' }}
              onClick={() => enterConfirm(teams.map((_, i) => i === oneIdx ? -10 : 10))}>
              2팀 승<br />
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({twoIndices.map(i => teams[i].name).join(', ')})</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'select') {
    const label = gameType === '111_win' ? '이긴 팀을 선택하세요' : '진 팀을 선택하세요';
    return (
      <div className="modal-overlay">
        <div className="modal-box" onClick={e => e.stopPropagation()}
          style={{ textAlign: 'center', minWidth: 340 }}>
          <h3>🎮 {game.name}</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: -6, marginBottom: 20 }}>
            {label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {teams.map((t, i) => (
              <button key={t.id} className="roll-btn" style={{ background: t.color }}
                onClick={() => enterConfirm(
                  gameType === '111_win'
                    ? teams.map((_, j) => j === i ? 10 : -5)
                    : teams.map((_, j) => j === i ? -10 : 10)
                )}>
                {t.imageUrl && (
                  <img src={t.imageUrl} alt={t.name}
                    style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', marginRight: 8, verticalAlign: 'middle', border: '2px solid rgba(255,255,255,0.5)' }} />
                )}
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // confirm phase — adjustable distribution
  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ minWidth: 340 }}>
        <h3>🎮 미니게임 코인 지급</h3>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: -8, marginBottom: 14 }}>
          금액을 조정하세요
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {teams.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.color, border: '2px solid rgba(255,255,255,0.4)', overflow: 'hidden', flexShrink: 0 }}>
                {t.imageUrl && <img src={t.imageUrl} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <span style={{ flex: 1, fontWeight: 700, fontSize: '0.88rem' }}>{t.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button className="manual-dice-btn" style={{ width: 34, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => adjust(i, -5)}>-5</button>
                <button className="manual-dice-btn" style={{ width: 30, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => adjust(i, -1)}>-1</button>
                <span style={{ minWidth: 38, textAlign: 'center', fontWeight: 900, fontSize: '0.95rem', color: deltas[i] > 0 ? '#FFD700' : deltas[i] < 0 ? '#ff6b6b' : '#fff' }}>
                  {deltas[i] > 0 ? `+${deltas[i]}` : deltas[i]}
                </span>
                <button className="manual-dice-btn" style={{ width: 30, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => adjust(i, 1)}>+1</button>
                <button className="manual-dice-btn" style={{ width: 34, height: 30, padding: 0, fontSize: '0.75rem' }} onClick={() => adjust(i, 5)}>+5</button>
              </div>
            </div>
          ))}
        </div>
        <button className="roll-btn" style={{ background: '#4CAF50', marginTop: 8 }} onClick={() => onConfirm(deltas)}>
          확인 ✓
        </button>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────
function App() {
  const [config, setConfig] = useState(null);
  const [teams, setTeams] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [diceVal, setDiceVal] = useState(6);
  const [rolling, setRolling] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [winner, setWinner] = useState(null);
  const [popup, setPopup] = useState(null);
  const [editCellId, setEditCellId] = useState(null);
  const [editTeamIdx, setEditTeamIdx] = useState(null);
  const [turnsPerTeam, setTurnsPerTeam] = useState([0, 0, 0]);
  const [maxTurns, setMaxTurns] = useState(MAX_TURNS);
  const [cellData, setCellData] = useState(() => {
    try { const s = localStorage.getItem('gh_texts'); if (s) return JSON.parse(s); } catch (_) { }
    return {};
  });

  // Special modal states
  const [vsModal, setVsModal] = useState(null);              // { teamIdx }
  const [specialEventModal, setSpecialEventModal] = useState(null); // { teamIdx }
  const [monsterModal, setMonsterModal] = useState(null);    // { teamIdx }
  const [drinkModal, setDrinkModal] = useState(null);        // { teamIdx, cellText }
  const [roundCarousel, setRoundCarousel] = useState(null);  // { round }
  const [pendingRound, setPendingRound] = useState(null);    // { round } — waiting for button
  const pendingCarouselRef = useRef(null);
  const [penaltyModal, setPenaltyModal] = useState(null);    // { teamIdx, penalty }
  const [coinAwardModal, setCoinAwardModal] = useState(null); // { source: 'vs'|'round' }
  const [vsTeamSelect, setVsTeamSelect] = useState(null);    // { teamIdx } — pick opponent first
  const penaltyResolveRef = useRef(null);
  const monsterResolveRef = useRef(null);
  const [cellPickMode, setCellPickMode] = useState(null); // { targetName, onPick: (cellId) => void } | null

  const boardAreaRef = useRef(null);
  const [boardScale, setBoardScale] = useState(1);

  // Manual dice
  const [manualMode, setManualMode] = useState(false);

  const snap = useRef({});
  snap.current = { config, teams, currentIdx, turnsPerTeam, maxTurns };

  const cellDataRef = useRef(cellData);
  cellDataRef.current = cellData;

  // ── Preload all game images on mount ─────────────────────────────────
  useEffect(() => {
    [...VS_GAMES, ...MINI_GAMES].forEach(g => { const i = new Image(); i.src = g.img; });
  }, []);

  // ── Load board.json ──────────────────────────────────────────────────
  useEffect(() => {
    fetch('./board.json').then(r => r.json()).then(data => {
      let savedNames = {};
      try { const s = localStorage.getItem('gh_team_names'); if (s) savedNames = JSON.parse(s); } catch (_) { }
      setConfig(data);
      const mappedTeams = data.teams.map(t => ({
        ...t, position: 1, coins: data.settings.startingCoins,
        name: savedNames[t.id] ? savedNames[t.id].name : t.name,
        imageUrl: savedNames[t.id]?.imageUrl ?? t.imageUrl ?? null,
        skipTurn: false, shieldActive: false, doubleCoins: false, forcedMove: false,
      }));
      mappedTeams.forEach(t => { if (t.imageUrl) { const i = new Image(); i.src = t.imageUrl; } });
      setTeams(mappedTeams);
    }).catch(() => alert('board.json 로드 실패. 웹서버에서 실행하세요.'));
  }, []);

  // ── Persist cellData ──────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem('gh_texts', JSON.stringify(cellData)); } catch (_) { }
  }, [cellData]);

  // ── Scale board to fit container ──────────────────────────────────────
  useEffect(() => {
    const el = boardAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setBoardScale(Math.min(1, entry.contentRect.width / BOARD_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Helper: flush pending carousel ───────────────────────────────────
  const flushCarousel = useCallback(() => {
    if (pendingCarouselRef.current) {
      setPendingRound(pendingCarouselRef.current);
      pendingCarouselRef.current = null;
    }
  }, []);

  // ── applyMove ─────────────────────────────────────────────────────────
  const applyMove = useCallback((steps) => {
    const { config, teams, currentIdx, turnsPerTeam, maxTurns } = snap.current;
    const idx = currentIdx;
    const fromPos = teams[idx].position;
    const teamsLen = teams.length;

    let rawDest = fromPos + steps;
    while (rawDest > 60) rawDest -= 60;
    const toPos = rawDest;

    const destCell = config.cells.find(c => c.id === toPos);
    const baseEffect = destCell ? destCell.coinChange : 0;
    const cdOverride = cellDataRef.current[toPos];

    const effectiveCellType = (cdOverride?.type && destCell?.type !== 'start' && destCell?.type !== 'finish')
      ? cdOverride.type : (destCell?.type || 'green');

    const isMonster = effectiveCellType === 'monster';
    const rawDelta = isMonster
      ? 0
      : (cdOverride?.coinChange !== undefined) ? cdOverride.coinChange : baseEffect;

    const shielded = teams[idx].shieldActive && rawDelta < 0;
    const delta = shielded ? 0 : (teams[idx].doubleCoins && rawDelta > 0 ? rawDelta * 2 : rawDelta);
    const finalCoins = Math.max(0, teams[idx].coins + delta);
    const originalCoins = teams[idx].coins;

    setAnimating(true);

    const advanceTurn = (appliedCoins) => {
      const newTurns = [...turnsPerTeam];
      newTurns[idx]++;
      setTurnsPerTeam(newTurns);
      setAnimating(false);

      if (newTurns.every(t => t >= maxTurns)) {
        const { teams: lt } = snap.current;
        const ft = lt.map((t, i) => i === idx ? { ...t, coins: appliedCoins } : t);
        const ranked = [...ft].sort((a, b) => b.coins - a.coins);
        const topCoins = ranked[0].coins;
        const topGroup = ranked.filter(t => t.coins === topCoins);
        setWinner({ name: topGroup.length > 1 ? KO.tieWinName : topGroup[0].name, isMultiple: topGroup.length > 1, coins: topCoins, rankedTeams: ranked });
      } else {
        setCurrentIdx((idx + 1) % teamsLen);
        const roundDone = (idx + 1) % teamsLen === 0;
        if (roundDone) pendingCarouselRef.current = { round: newTurns[idx] };

        if (effectiveCellType === 'vs') {
          setVsTeamSelect({ teamIdx: idx });
        } else if (effectiveCellType === 'market') {
          setSpecialEventModal({ teamIdx: idx });
        } else if (effectiveCellType === 'drink') {
          const cellText = cdOverride?.text || destCell?.text || '';
          setDrinkModal({ teamIdx: idx, cellText });
        } else if (roundDone) {
          setPendingRound({ round: newTurns[idx] });
          pendingCarouselRef.current = null;
        }
      }
    };

    const triggerCellEffect = () => {
      const needsMonsterModal = isMonster;
      const needsPenaltyModal = effectiveCellType === 'red' && delta < 0;

      if (needsMonsterModal) {
        setAnimating(false);
        monsterResolveRef.current = (updaterFn, appliedCoins) => {
          if (updaterFn) setTeams(updaterFn);
          setMonsterModal(null);
          advanceTurn(appliedCoins);
        };
        setMonsterModal({ teamIdx: idx });
      } else if (needsPenaltyModal) {
        setAnimating(false);
        penaltyResolveRef.current = (applyPenalty) => {
          if (applyPenalty) {
            setTeams(prev => {
              const u = prev.map(t => ({ ...t }));
              u[idx].coins = finalCoins;
              if (shielded) u[idx].shieldActive = false;
              if (u[idx].doubleCoins) u[idx].doubleCoins = false;
              return u;
            });
            setPopup({ cellId: toPos, amount: delta, key: Date.now() });
            setTimeout(() => setPopup(null), 1200);
            setPenaltyModal(null);
            advanceTurn(finalCoins);
          } else {
            setTeams(prev => {
              const u = prev.map(t => ({ ...t }));
              if (u[idx].doubleCoins) u[idx].doubleCoins = false;
              return u;
            });
            setPenaltyModal(null);
            advanceTurn(originalCoins);
          }
        };
        setPenaltyModal({ teamIdx: idx, penalty: delta });
      } else {
        setTeams(prev => {
          const u = prev.map(t => ({ ...t }));
          u[idx].coins = finalCoins;
          if (shielded) u[idx].shieldActive = false;
          if (u[idx].doubleCoins) u[idx].doubleCoins = false;
          return u;
        });
        if (delta !== 0) {
          setPopup({ cellId: toPos, amount: delta, key: Date.now() });
          setTimeout(() => setPopup(null), 1200);
        }
        advanceTurn(finalCoins);
      }
    };

    if (steps === 0) {
      setTimeout(triggerCellEffect, 50);
      return;
    }

    let step = fromPos, stepsLeft = steps;
    const stepFn = () => {
      step = (step % 60) + 1;
      stepsLeft--;
      setTeams(prev => {
        const u = prev.map(t => ({ ...t }));
        u[idx].position = step;
        return u;
      });

      if (stepsLeft > 0) {
        setTimeout(stepFn, 280);
      } else {
        triggerCellEffect();
      }
    };

    setTimeout(stepFn, 280);
  }, []);

  // ── Roll dice ─────────────────────────────────────────────────────────
  const roll = () => {
    if (rolling || animating || !!winner) return;
    const team = teams[currentIdx];

    // Skip turn if flagged
    if (team?.skipTurn) {
      setTeams(prev => {
        const u = prev.map(t => ({ ...t }));
        u[currentIdx].skipTurn = false;
        return u;
      });
      const newTurns = [...turnsPerTeam];
      newTurns[currentIdx]++;
      setTurnsPerTeam(newTurns);
      setCurrentIdx((currentIdx + 1) % teams.length);
      return;
    }

    // Forced cell: trigger current cell effect without rolling
    if (team?.forcedMove) {
      setTeams(prev => {
        const u = prev.map(t => ({ ...t }));
        u[currentIdx].forcedMove = false;
        return u;
      });
      applyMove(0);
      return;
    }

    setRolling(true);
    let count = 0;
    const iv = setInterval(() => {
      count++;
      setDiceVal(Math.ceil(Math.random() * 6));
      if (count >= 10) {
        clearInterval(iv);
        setRolling(false);
        const v = Math.ceil(Math.random() * 6);
        setDiceVal(v);
        applyMove(v);
      }
    }, 75);
  };

  // ── Reset ─────────────────────────────────────────────────────────────
  const reset = () => {
    if (!config) return;
    let savedNames = {};
    try { const s = localStorage.getItem('gh_team_names'); if (s) savedNames = JSON.parse(s); } catch (_) { }
    setTeams(config.teams.map(t => ({
      ...t, position: 1, coins: config.settings.startingCoins,
      name: savedNames[t.id] ? savedNames[t.id].name : t.name,
      imageUrl: savedNames[t.id]?.imageUrl ?? t.imageUrl ?? null,
      skipTurn: false, shieldActive: false, doubleCoins: false,
    })));
    setCurrentIdx(0); setDiceVal(6); setWinner(null); setRolling(false);
    setAnimating(false); setPopup(null); setMaxTurns(MAX_TURNS);
    setTurnsPerTeam(Array(config.teams.length).fill(0));
    setVsModal(null); setVsTeamSelect(null); setSpecialEventModal(null); setMonsterModal(null);
    setDrinkModal(null); setRoundCarousel(null); setCellPickMode(null);
    setPendingRound(null); setPenaltyModal(null); setCoinAwardModal(null);
    pendingCarouselRef.current = null; penaltyResolveRef.current = null; monsterResolveRef.current = null;
  };

  // ── Special event apply ───────────────────────────────────────────────────
  const applySpecialEvent = (eventId, targetTeamIdx, targetCell) => {
    if (!specialEventModal) return;
    const teamIdx = specialEventModal.teamIdx;

    if (eventId !== 'drink') {
      setTeams(prev => {
        const u = prev.map(t => ({ ...t }));
        const team = u[teamIdx];
        if (eventId === 'steal') {
          const stolen = Math.min(5, u[targetTeamIdx].coins);
          u[targetTeamIdx].coins -= stolen;
          team.coins += stolen;
        } else if (eventId === 'donate') {
          const given = Math.min(5, team.coins);
          team.coins -= given;
          u[targetTeamIdx].coins += given;
        } else if (eventId === 'switch') {
          const myPos = team.position;
          team.position = u[targetTeamIdx].position;
          u[targetTeamIdx].position = myPos;
        } else if (eventId === 'random') {
          team.position = Math.floor(Math.random() * 60) + 1;
          team.forcedMove = true;
        } else if (eventId === 'double') {
          team.doubleCoins = true;
        } else if (eventId === 'send') {
          u[targetTeamIdx].position = targetCell;
        }
        return u;
      });
    }

    setSpecialEventModal(null);

    if (eventId === 'drink') {
      setDrinkModal({ teamIdx: targetTeamIdx, cellText: '음주 선고! 🍺' });
    } else {
      flushCarousel();
    }
  };

  const startCellPick = (targetTeamIdx) => {
    const targetName = teams[targetTeamIdx]?.name;
    setSpecialEventModal(null);
    setCellPickMode({
      targetName,
      onPick: (cellId) => {
        setCellPickMode(null);
        setTeams(prev => {
          const u = prev.map(t => ({ ...t }));
          u[targetTeamIdx].position = cellId;
          u[targetTeamIdx].forcedMove = true;
          return u;
        });
        flushCarousel();
      },
    });
  };

  // ── Save cell ─────────────────────────────────────────────────────────
  const saveCell = (data) => {
    if (editCellId === null) return;
    const baseCell = config && config.cells.find(c => c.id === editCellId);
    const isSpecial = baseCell && (baseCell.type === 'start' || baseCell.type === 'finish');
    setCellData(prev => ({ ...prev, [editCellId]: { text: data.text, coinChange: data.coinChange, type: isSpecial ? baseCell.type : data.type } }));
    setEditCellId(null);
  };

  // ── Save team ─────────────────────────────────────────────────────────
  const saveTeam = (data) => {
    if (editTeamIdx === null) return;
    setTeams(prev => {
      const u = prev.map(t => ({ ...t }));
      u[editTeamIdx].name = data.name;
      u[editTeamIdx].imageUrl = data.imageUrl;
      const nameMap = {};
      u.forEach(t => { nameMap[t.id] = { name: t.name, imageUrl: t.imageUrl }; });
      try { localStorage.setItem('gh_team_names', JSON.stringify(nameMap)); } catch (_) { }
      return u;
    });
    setEditTeamIdx(null);
  };

  if (!config) return <div className="loading">Loading board…</div>;

  const currentTeam = teams[currentIdx];
  const editCell = editCellId !== null ? config.cells.find(c => c.id === editCellId) : null;
  const editTeam = editTeamIdx !== null ? teams[editTeamIdx] : null;
  const vsTeam = vsModal ? teams[vsModal.teamIdx] : null;
  const vsOpponent = vsModal?.opponentIdx !== undefined ? teams[vsModal.opponentIdx] : null;
  const drkTeam = drinkModal ? teams[drinkModal.teamIdx] : null;

  return (
    <div className="app">
      {/* Header */}
      <header>
        <img src="gh_logo.jpeg" alt="GH" className="logo" />
        <div className="header-text">
          <h1>{KO.title}</h1>
          <p className="subtitle">{KO.subtitle}</p>
        </div>
        <div className="header-actions">
          <button className="reset-btn" onClick={reset}>{KO.reset}</button>
        </div>
      </header>

      <main>
        {/* Board / Piece view */}
        <section className="board-area" ref={boardAreaRef}>
          <div className="board-canvas-wrapper" style={{ height: Math.round(BOARD_H * boardScale) }}>
            <div className="board-canvas" style={{ width: BOARD_W, height: BOARD_H, transform: `scale(${boardScale})`, transformOrigin: 'top left' }}>
              <PathLines positions={POSITIONS} />
              {config.cells.map(cell => (
                <BoardCell
                  key={cell.id}
                  cell={cell}
                  cellOverride={cellData[cell.id] || {}}
                  pos={POSITIONS[cell.id] || defaultPos(cell.id)}
                  teamsHere={teams.filter(t => t.position === cell.id)}
                  popup={popup && popup.cellId === cell.id ? popup : null}
                  onClick={() => cellPickMode ? cellPickMode.onPick(cell.id) : setEditCellId(cell.id)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Side panel */}
        <aside className="panel">
          <div className="panel-section">
            <h2>{KO.teams}</h2>
            {teams.map((t, i) => (
              <TeamCard key={t.id} team={t} isActive={i === currentIdx && !winner} turns={turnsPerTeam[i] || 0} maxTurns={maxTurns} onEditClick={() => setEditTeamIdx(i)} />
            ))}
          </div>
          <div className="panel-section dice-section">
            {winner ? (
              <div className="winner-banner">
                {KO.gameOverBanner}<br />
                <span style={{ color: '#FFD700', fontSize: '1rem' }}>🏆 {winner.name}</span>
              </div>
            ) : pendingRound ? (
              <>
                <p className="turn-label" style={{ color: '#FFD700' }}>🎲 라운드 {pendingRound.round} 완료!</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>결과를 확인한 후 미니게임을 시작하세요</p>
                <button className="roll-btn" style={{ background: '#9C27B0' }}
                  onClick={() => { setRoundCarousel(pendingRound); setPendingRound(null); }}>
                  🎮 미니게임 시작!
                </button>
              </>
            ) : (
              <>
                <p className="turn-label">{KO.turn(currentTeam?.name)}</p>
                {currentTeam?.skipTurn && <p style={{ fontSize: '0.75rem', color: '#FFD93D', textAlign: 'center' }}>⏭️ 이번 턴 스킵됩니다</p>}
                {currentTeam?.forcedMove && <p style={{ fontSize: '0.75rem', color: '#FF9800', textAlign: 'center' }}>📍 주사위 없이 현재 칸 효과 발동!</p>}
                <Dice value={diceVal} rolling={rolling} />
                {manualMode && !currentTeam?.forcedMove ? (
                  <div className="manual-dice-grid">
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <button key={n} className="manual-dice-btn"
                        disabled={animating || !!winner}
                        onClick={() => { setDiceVal(n); applyMove(n); }}>
                        {n}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button className="roll-btn" style={{ background: currentTeam?.forcedMove ? '#FF9800' : (currentTeam?.color || '#4FC3F7') }}
                    onClick={roll} disabled={rolling || animating || !!winner}>
                    {rolling ? KO.rolling : animating ? KO.moving : currentTeam?.forcedMove ? '📍 칸 효과 발동!' : KO.rollDice}
                  </button>
                )}
                <label className="manual-toggle">
                  <input type="checkbox" checked={manualMode} onChange={e => setManualMode(e.target.checked)} />
                  수동 입력
                </label>
              </>
            )}
          </div>
        </aside>
      </main>

      {/* Cell pick mode banner */}
      {cellPickMode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 800,
          background: 'rgba(255,152,0,0.96)', color: '#1a1a2e',
          padding: '14px 20px', textAlign: 'center', fontWeight: 900, fontSize: '1rem',
          boxShadow: '0 2px 16px rgba(0,0,0,0.5)', letterSpacing: 0.3,
        }}>
          📍 {cellPickMode.targetName}을(를) 이동시킬 칸을 클릭하세요
        </div>
      )}

      {/* Winner overlay */}
      {winner && <WinnerOverlay winner={winner} maxTurns={maxTurns} onReset={reset} />}

      {/* VS team select */}
      {vsTeamSelect && (
        <TeamSelectModal
          currentTeamIdx={vsTeamSelect.teamIdx}
          teams={teams}
          onSelect={(opponentIdx) => { setVsTeamSelect(null); setVsModal({ teamIdx: vsTeamSelect.teamIdx, opponentIdx }); }}
        />
      )}

      {/* VS modal */}
      {vsModal && vsTeam && (
        <VSModal
          teamName={vsTeam.name}
          opponentName={vsOpponent?.name}
          onClose={() => {
            const ti = vsModal.teamIdx, oi = vsModal.opponentIdx;
            setVsModal(null);
            setCoinAwardModal({ source: 'vs', teamIdx: ti, opponentIdx: oi });
          }}
        />
      )}

      {/* Special event modal */}
      {specialEventModal && (
        <SpecialEventModal teamIdx={specialEventModal.teamIdx} teams={teams}
          onApply={applySpecialEvent} onStartCellPick={startCellPick} />
      )}

      {/* Monster event modal */}
      {monsterModal && (
        <MonsterEventModal teams={teams} teamIdx={monsterModal.teamIdx}
          onResolve={(updaterFn, appliedCoins) => monsterResolveRef.current?.(updaterFn, appliedCoins)} />
      )}

      {/* Drink modal */}
      {drinkModal && drkTeam && (
        <DrinkModal cellText={drinkModal.cellText} onClose={() => { setDrinkModal(null); flushCarousel(); }} />
      )}

      {/* Round carousel */}
      {roundCarousel && !winner && (
        <RoundCarousel round={roundCarousel.round} onClose={(game) => { setRoundCarousel(null); setCoinAwardModal({ source: 'round', game }); }} />
      )}

      {/* Cell edit modal */}
      {editCell && (
        <CellEditModal cell={editCell} cellOverride={cellData[editCellId] || {}} onSave={saveCell} onCancel={() => setEditCellId(null)} />
      )}

      {/* Team edit modal */}
      {editTeam && (
        <TeamEditModal team={editTeam} onSave={saveTeam} onCancel={() => setEditTeamIdx(null)} />
      )}

      {/* Penalty modal — red cells */}
      {penaltyModal && teams[penaltyModal.teamIdx] && (
        <PenaltyModal
          teamName={teams[penaltyModal.teamIdx].name}
          penalty={penaltyModal.penalty}
          coins={teams[penaltyModal.teamIdx].coins}
          isMonster={false}
          onResolve={(applyPenalty) => penaltyResolveRef.current?.(applyPenalty)}
        />
      )}

      {/* Coin award modal — after VS game or minigame */}
      {coinAwardModal && !winner && (
        coinAwardModal.source === 'vs'
          ? <VsCoinModal
            teams={teams}
            teamIdx={coinAwardModal.teamIdx}
            opponentIdx={coinAwardModal.opponentIdx}
            onConfirm={(deltas) => {
              setTeams(prev => prev.map((t, i) => ({ ...t, coins: Math.max(0, t.coins + deltas[i]) })));
              setCoinAwardModal(null);
              flushCarousel();
            }}
          />
          : <MiniGameCoinModal
            teams={teams}
            game={coinAwardModal.game}
            onConfirm={(deltas) => {
              setTeams(prev => prev.map((t, i) => ({ ...t, coins: Math.max(0, t.coins + deltas[i]) })));
              setCoinAwardModal(null);
            }}
          />
      )}

      {/* Floating +5 turns button */}
      <button
        onClick={() => setMaxTurns(prev => prev + 1)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 500,
          background: 'rgba(20,20,48,0.92)', border: '1px solid rgba(255,255,255,0.18)',
          color: '#fff', borderRadius: 12, padding: '10px 16px',
          fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)', lineHeight: 1.3,
        }}
      >
        +1턴<br />
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)' }}>{maxTurns}턴</span>
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
