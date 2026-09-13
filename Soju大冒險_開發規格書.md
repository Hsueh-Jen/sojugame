# Soju 大冒險（Soju's Adventure）— 實作規格書 / Implementation Plan

> 交付對象：Antigravity（agentic 遊戲開發工具）  
> 目的：本文件提供完整、可直接動工的遊戲規格，涵蓋玩法、關卡數據、AI 邏輯、美術做法（全面採用 `imgs/` 像素圖片素材）、音效設計與驗收標準，讓開發者/agent 不需要再回頭確認需求即可實作出可完整遊玩、可通關的第一版遊戲。

---

## 1. 專案總覽

| 項目 | 內容 |
|---|---|
| 遊戲名稱 | **Soju大冒險**（英文：Soju's Adventure） |
| 類型 | 橫向捲軸動作闖關（beat-'em-up platformer），1 關 + 1 場 Boss 戰 |
| 主角 | 玩家家中的狗狗 **Soju**（奶油法鬥，臭臉、短尾、藍綠紅背帶、深藍小包包） |
| 平台 | 純前端瀏覽器遊戲，桌面鍵盤操作 |
| 技術棧 | HTML5 + CSS + 原生 JavaScript + Canvas 2D（**不使用**任何遊戲引擎、不需要打包工具，可直接以瀏覽器開啟） |
| 畫面解析度 | 960×540（Canvas 內部座標），CSS 不做額外縮放 |
| 美術風格 | **經典復古像素風格（Pixel Art）**，全面使用 `imgs/` 目錄下的真實像素圖片素材（Soju 4 組動作圖集、主人立繪、3 種小怪、雙型態 Boss、客廳家具平台、運輸籠、裝飾物件與客廳背景），透過 Canvas 2D 的 `drawImage` 渲染（關閉像素平滑 `imageSmoothingEnabled = false` 維持銳利像素感），**徹底廢除**純程式碼手刻網格或幾何拼貼做法。 |
| 音效 | Web Audio API 即時合成音效；**不做背景音樂**（避免第一版太吵），過關畫面播放合成的生日快樂旋律 |
| 難度取向 | 輕鬆爽快、普通動作遊戲難度，3 顆愛心，一般玩家應能在數次嘗試內破關 |
| 單局長度 | 正常關卡約 1 分鐘（之後可再擴充關卡長度） |

### 1.1 故事背景

主人正在餵 Soju 吃零食，氣氛溫馨 → 一名穿著大斗篷、遮住全身的神祕魔王闖入 → 魔王把主人關進狗狗運輸籠 → 魔王帶著運輸籠逃走 → Soju 板著一張臭臉出發尋找主人。玩家操控 Soju 穿越客廳，打倒沿途的家用品小怪，抵達魔王巢穴後，魔王會在過場中脫下斗篷，現出真身：**巨大洗耳液魔王**（帶點獸醫風格的洗耳液瓶怪物）。擊敗魔王後，主人獲救，母女團聚。

### 1.2 像素素材規格與角色設定（`imgs/` 資料夾）

專案正式素材目錄為 `imgs/`，遊戲直接讀取此目錄下的像素圖片進行切圖與渲染：

1. **主角 Soju 動作圖集（4 組 Spritesheet）**：
   - `imgs/idle.jpeg`：**待機呼吸**（Idle Breathing，4 幀，胸口與耳朵微幅起伏）
   - `imgs/run.jpeg`：**奔跑衝刺**（Running，4 幀，前後腳交替奔馳）
   - `imgs/jump.jpeg`：**跳躍動作**（Jumping，4 幀，起跳、騰空、收腹、落地姿態）
   - `imgs/bite.jpeg`：**撲咬攻擊**（Bite Attack，4 幀，前撲、張嘴咬合、收招回正）
   - **圖集規格**：所有動作圖解析度均為 1074×976 px，排版為 2×2 網格（四象限各一幀），背景為純色灰底（載入時透過 Chroma Key 自動轉為透明）。
   - **外觀特徵**：奶油色法鬥犬、標誌性撲克臉/臭臉（眼神半瞇不苟言笑）、幾乎沒有尾巴、身穿多色機能胸背帶（**藍色主帶 + 綠色扣帶 + 紅色卡扣**）、背部配戴一個深藍色隨身小背包。
2. **主人立繪（`imgs/owner.jpeg`）**：
   - 尺寸為 1074×976 px，像素風格女性角色立繪。
   - 外觀為深棕微捲長髮、白色小背心、卡其色短褲、休閒自然風格。
   - 用於開場 STORY 劇情插圖（被抓進籠子）、結局通關重逢畫面。
3. **小怪素材（3 種獨立透明 PNG）**：
   - `imgs/slipper.png`：生氣的藍黃拖鞋小怪（巡邏怪）
   - `imgs/dyson.png`：金屬紫與暗灰衝刺吸塵器怪（衝刺怪）
   - `imgs/ball.png`：紅白條紋彈跳球怪（垂直彈跳怪）
4. **Boss 與彈幕素材**：
   - `imgs/boss_cloaked.png`：深紫斗篷神秘怪（過場與登場前型態）
   - `imgs/boss_revealed.png`：洗耳液魔王（真身，半透明青色藥水瓶身、紅十字標籤、憤怒面孔、滴落觸手足）
   - `imgs/boss_droplet.png`：洗耳液噴射彈幕水滴
   - `imgs/boss_shockwave.png`：魔王跳躍落地之地面衝擊波
5. **場景平台、裝飾與背景**：
   - `imgs/bg_livingroom.jpg`：精緻溫馨客廳橫向長幅背景
   - `imgs/floor.png`：木質地板貼圖（用於地面與平台拼貼）
   - `imgs/sofa.png`：客廳沙發平台（可跳躍站立）
   - `imgs/table.png`：茶几平台（放置書本與馬克杯，可跳躍站立）
   - `imgs/toybox.png`：玩具箱平台（裝滿彩色玩具，可跳躍站立）
   - `imgs/cage.png`：狗狗運輸籠（航空箱造型，劇情用）
   - `imgs/decor_bowl.png`：狗碗裝飾
   - `imgs/decor_snack.png`：Soju 零食袋裝飾
   - `imgs/decor_plant.png`：室內綠意盆栽裝飾
   - `imgs/gate.png`：魔王巢穴石門圖示
6. **UI 素材**：
   - `imgs/heart_full.png`：實心紅心愛心
   - `imgs/heart_empty.png`：扣血空心灰心

---

## 2. 操作與核心玩法

| 輸入 | 行為 | 對應動畫 |
|---|---|---|
| `←` / `→` | 左右移動（地面移動速度 3.4 px/frame） | 播放 `run.jpeg` 4 幀動畫（面左時水平鏡像翻轉） |
| `↑` | 跳躍（僅在地面時觸發，不可連續按住連跳） | 播放 `jump.jpeg` 4 幀動畫 |
| `Space` | 咬擊攻擊（短距離撲咬，具攻擊判定與冷卻）；過場時推進劇情 | 播放 `bite.jpeg` 4 幀動畫 |
| 無按鍵（靜止） | 原地待機 | 循環播放 `idle.jpeg` 4 幀呼吸動畫 |

- **Soju 能力**：左右跑動、跳躍、短距離撲咬攻擊（近距離 lunge bite，爽快打擊感）。
- **生命系統**：**3 顆愛心**。被敵人碰到 / 被 Boss 攻擊到 / 掉進坑洞都扣 1 顆心，並有短暫無敵時間（受傷後角色半透明閃爍）。
- **掉進「黑暗玩具坑」**：扣 1 顆心，**重生在坑洞前方**，不會直接死亡。
- **愛心歸零**：進入 `LOSE` 畫面，顯示「**Soju不爽了，再來一次**」，並提供「再來一次」按鈕，點擊後**重新開始本關**（含 Boss 戰，從關卡最前面重來，不需要重播開場劇情）。

---

## 3. 遊戲狀態機（State Machine）

```
TITLE  →  STORY(5 幕)  →  LEVEL  →  BOSS_INTRO(現身過場)  →  BOSS  →  WIN
                                        ↑                      │
                                        └───────LOSE ←──────────┘
                          (LEVEL 或 BOSS 中愛心歸零都會進 LOSE)
```

| 狀態 | 說明 | 離開條件 |
|---|---|---|
| `TITLE` | 標題畫面，顯示遊戲名稱、Soju 像素精靈、"按空白鍵開始" | 按 `Space` → `STORY` |
| `STORY` | 開場劇情，共 5 幕（見第 7 節），每幕按 `Space` 推進一格 | 第 5 幕再按 `Space` → `LEVEL` |
| `LEVEL` | 主關卡，橫向捲軸，客廳場景 | 玩家 x 超過 `GATE_X` → `BOSS_INTRO`；愛心歸零 → `LOSE` |
| `BOSS_INTRO` | 固定鏡頭過場：斗篷魔王現身，播放 1～2 句對白，斗篷脫落顯示洗耳液魔王真身 | 過場計時結束或按 `Space` → `BOSS` |
| `BOSS` | Boss 戰，固定鏡頭（不捲軸）的獨立房間 | 魔王 HP 歸零並播完死亡延遲 → `WIN`；愛心歸零 → `LOSE` |
| `WIN` | 通關畫面，「母女團聚啦！妍霏生日快樂」，播放生日快樂合成旋律 | **無**（畫面永久停在此，不接受任何按鍵，不可跳出） |
| `LOSE` | 失敗畫面，「Soju不爽了，再來一次」+ 重玩按鈕 | 按下「再來一次」按鈕 → 重置回 `LEVEL` 起點 |

實作提醒：`WIN` 狀態進入後，**必須停止讀取鍵盤事件對遊戲邏輯的影響**（畫面凍結），僅允許音樂持續播放。

---

## 4. 全域常數與實體尺寸

```js
const W = 960, H = 540;
const GRAVITY = 0.62;
const GROUND_Y = 460;              // 地板頂部 y 座標
const PIT_START = 860, PIT_END = 955;   // 黑暗玩具坑（寬度 95px）
const LEVEL_WIDTH = 3200;
const GATE_X = 3100;               // 玩家 x 超過此值 → 觸發 Boss 大門
const MOVE_SPEED = 3.4;            // px/frame（60fps 基準）
const JUMP_V = -12.4;              // 跳躍初速度

// 玩家渲染與碰撞尺寸
const PLAYER_DRAW_W = 76, PLAYER_DRAW_H = 68; // 畫面渲染尺寸（維持像素精緻比例）
const PLAYER_HIT_W = 46, PLAYER_HIT_H = 40;   // 實際判定碰撞箱 AABB
const ATTACK_W = 44, ATTACK_H = 34;          // 咬擊判定區塊
const ATTACK_ACTIVE = 12;          // 攻擊判定持續 frame 數（約 0.2 秒）
const ATTACK_COOLDOWN = 22;        // 攻擊冷卻 frame 數
const HURT_IFRAMES = 80;           // 受傷後無敵 frame 數
const STEP = 1000/60;              // 固定時間步（60fps）
```

**可行性依據**：
玩家跳躍飛行時間 ≈ `2 * |JUMP_V| / GRAVITY ≈ 40 frame`，水平位移 ≈ `MOVE_SPEED * 40 ≈ 136px`，大於坑洞寬度 95px，**確保助跑跳一定能跨越黑暗玩具坑**。

---

## 5. 關卡（Level）設計

### 5.1 場景主題
溫馨客廳風格。背景繪製 `imgs/bg_livingroom.jpg`，地板鋪設 `imgs/floor.png`，平台（沙發 `sofa.png`、茶几 `table.png`、玩具箱 `toybox.png`）與裝飾物（狗碗 `decor_bowl.png`、零食袋 `decor_snack.png`、盆栽 `decor_plant.png`）均以獨立像素精靈圖繪製。

### 5.2 平台資料（世界座標）

```js
const PLATFORMS = [
  { x: 0,       y: GROUND_Y, w: PIT_START,             h: 80, sprite: 'floor' },   // 地板 A（到坑洞前）
  { x: PIT_END, y: GROUND_Y, w: LEVEL_WIDTH - PIT_END, h: 80, sprite: 'floor' },   // 地板 B（坑洞後到底）
  { x: 230,     y: 390,      w: 190,                   h: 70, sprite: 'sofa' },    // 沙發（可站立平台）
  { x: 480,     y: 410,      w: 120,                   h: 50, sprite: 'table' },   // 茶几
  { x: 1350,    y: 395,      w: 150,                   h: 65, sprite: 'toybox' },  // 玩具箱
];
```
**碰撞規則**：處理「由上往下落地」的單向平台碰撞（允許從側面或下方穿過，僅在玩家腳底接觸平台頂部且下墜時觸發著地），避免卡住邊緣影響流暢度。

### 5.3 裝飾物（無碰撞，像素美術物件）

```js
const DECOR = [
  { type: 'decor_bowl',  x: 60,   y: GROUND_Y - 26, w: 40, h: 26 },
  { type: 'decor_snack', x: 150,  y: GROUND_Y - 36, w: 36, h: 36 },
  { type: 'decor_plant', x: 900,  y: GROUND_Y - 64, w: 48, h: 64 },
  { type: 'decor_plant', x: 2050, y: GROUND_Y - 64, w: 48, h: 64 },
  { type: 'gate',        x: GATE_X, y: GROUND_Y - 120, w: 80, h: 120 },
];
```

### 5.4 陷阱：黑暗玩具坑
`x: 860–955`，掉入（`y > H` 且 x 落在區間內）→ 扣 1 顆心，重生於 `x = PIT_START - 50`，賦予短暫無敵時間。

### 5.5 敵人配置（世界座標，由左到右）

| # | 類型 / 圖檔 | x | 移動範圍 / 行為 | 渲染尺寸 (w×h) | 站立平台 |
|---|---|---|---|---|---|
| 1 | 拖鞋 `slipper.png` | 120 | 巡邏 [100,300]，速度 1.3 | 48×32 | 地板 |
| 2 | 拖鞋 `slipper.png` | 300 | 巡邏 [250,405]，速度 1.3 | 48×32 | 沙發 |
| 3 | Dyson `dyson.png` | 600 | 來回衝刺 [560,820]，速度 3.9，觸邊暫停 26 frame | 44×66 | 地板 |
| 4 | 球球 `ball.png` | 1150 | 原地垂直彈跳（重力 0.55×GRAVITY，反彈 -9.2） | 32×32 | 地板 |
| 5 | 拖鞋 `slipper.png` | 1380 | 巡邏 [1360,1485] | 48×32 | 玩具箱 |
| 6 | Dyson `dyson.png` | 1700 | 來回衝刺 [1650,1950] | 44×66 | 地板 |
| 7 | 球球 `ball.png` | 2050 | 垂直彈跳 | 32×32 | 地板 |
| 8 | 拖鞋 `slipper.png` | 2200 | 巡邏 [2150,2350] | 48×32 | 地板 |
| 9 | 拖鞋 `slipper.png` | 2950 | 巡邏 [2900,3060]（把守大門） | 48×32 | 地板 |

- 敵人生命：一律「被咬一下即消滅」（`hp = 1`），爽快打擊感。

---

## 6. 美術實作方式（使用 `imgs/` 像素圖片素材）

本專案全面使用 `imgs/` 資料夾中真正的像素圖片資產，搭配 Canvas 2D 進行繪製。為保持復古像素遊戲的精緻感與清晰度，必須開啟像素化渲染模式：
```js
ctx.imageSmoothingEnabled = false;
```

### 6.1 完整資源清單

| 素材檔案 | 格式 | 內容說明 | 用途 |
|---|---|---|---|
| `imgs/idle.jpeg` | JPEG | Soju 待機呼吸動作 Spritesheet（4 幀，2×2 網格） | 玩家停止移動時之待機動畫 |
| `imgs/run.jpeg` | JPEG | Soju 奔跑動作 Spritesheet（4 幀，2×2 網格） | 玩家左右移動時之奔馳動畫 |
| `imgs/jump.jpeg` | JPEG | Soju 跳躍動作 Spritesheet（4 幀，2×2 網格） | 玩家離地躍起與滯空動畫 |
| `imgs/bite.jpeg` | JPEG | Soju 撲咬攻擊 Spritesheet（4 幀，2×2 網格） | 按下空白鍵時的咬擊攻擊動畫 |
| `imgs/owner.jpeg` | JPEG | 長髮女性主人全身像素立繪 | 開場 STORY 劇情、結局 WIN 團聚插圖 |
| `imgs/slipper.png` | 透明 PNG | 藍黃配色生氣拖鞋小怪 | 巡邏怪 |
| `imgs/dyson.png` | 透明 PNG | 金屬紫吸塵器小怪，生氣紅眼 | 衝刺怪 |
| `imgs/ball.png` | 透明 PNG | 紅白螺旋紋彈跳球小怪 | 彈跳怪 |
| `imgs/boss_cloaked.png` | 透明 PNG | 深紫兜帽斗篷魔王 | BOSS_INTRO 過場與第一型態 |
| `imgs/boss_revealed.png` | 透明 PNG | 巨大洗耳液魔王（紅十字、液體觸手足） | Boss 戰本體 |
| `imgs/boss_droplet.png` | 透明 PNG | 洗耳液彈幕水滴 | Boss `spray` 彈幕攻擊 |
| `imgs/boss_shockwave.png` | 透明 PNG | 地面白色衝擊波 | Boss `slam` 震波攻擊 |
| `imgs/bg_livingroom.jpg` | JPG | 16-bit 復古像素客廳全景背景 | 關卡橫向捲軸背景 |
| `imgs/floor.png` | 透明 PNG | 溫馨木質地板貼圖 | 關卡地面 |
| `imgs/sofa.png` | 透明 PNG | 墨綠色復古布沙發平台 | 關卡平台 |
| `imgs/table.png` | 透明 PNG | 木質茶几平台 | 關卡平台 |
| `imgs/toybox.png` | 透明 PNG | 彩色玩具收納箱平台 | 關卡平台 |
| `imgs/cage.png` | 透明 PNG | 狗狗航空運輸籠 | 劇情關押主人與魔王搬運 |
| `imgs/decor_bowl.png` | 透明 PNG | 狗食碗 | 裝飾物 |
| `imgs/decor_snack.png` | 透明 PNG | Soju 最愛肉乾零食袋 | 裝飾物 |
| `imgs/decor_plant.png` | 透明 PNG | 綠意室內盆栽 | 裝飾物 |
| `imgs/gate.png` | 透明 PNG | 魔王巢穴大門標示 | 終點提示 |
| `imgs/heart_full.png` | 透明 PNG | 實心紅心愛心 | HUD 血量 |
| `imgs/heart_empty.png` | 透明 PNG | 扣血空心灰心 | HUD 血量 |

### 6.2 主角動作 Spritesheet 切圖規格（2×2 網格）

每張 1074×976 的 JPEG Spritesheet 包含 4 幀動畫（Frame 1~4），各幀排列與精確取樣區間如下：

```
+-----------------------------------------------------------+
|  [Header Banner: "XXX SPRITESHEET"] (y: 0 ~ 85, 忽略)     |
+-----------------------------+-----------------------------+
|  FRAME 1 (左上)             |  FRAME 2 (右上)             |
|  Frame Rect:                |  Frame Rect:                |
|  sx: 40, sy: 125            |  sx: 560, sy: 125           |
|  sw: 460, sh: 365           |  sw: 460, sh: 365           |
+-----------------------------+-----------------------------+
|  FRAME 3 (左下)             |  FRAME 4 (右下)             |
|  Frame Rect:                |  Frame Rect:                |
|  sx: 40, sy: 555            |  sx: 560, sy: 555           |
|  sw: 460, sh: 345           |  sw: 460, sh: 345           |
+-----------------------------+-----------------------------+
|  [Footer Border] (y: 915 ~ 976, 忽略)                      |
+-----------------------------------------------------------+
```

- **播放幀率建議**：
  - `idle`：每幀約 12～15 ticks（呼吸動作緩慢均勻）
  - `run`：每幀約 6～8 ticks（奔馳動作緊湊輕快）
  - `jump`：依垂直速度 `vy` 動態選幀（起跳幀 → 上升幀 → 下落幀 → 著地幀）或固定 8 ticks 播放
  - `bite`：每幀約 3～4 ticks（總共約 12～16 ticks，前撲張嘴瞬間生效打擊）

---

## 7. 開場劇情（STORY，共 5 幕）

固定鏡頭插畫 + 底部字幕條 + 右下角「▶ 按空白鍵繼續」提示，按 `Space` 推進下一幕：

| 幕 | 畫面演出（使用 imgs/ 素材） | 字幕文字 |
|---|---|---|
| 0 | `owner.jpeg` 立繪在左，`decor_snack.png` 零食袋在旁，Soju 待機 | 平凡的一天，主人正在餵Soju吃最愛的零食♪ |
| 1 | 主人驚訝，畫面右側出現 `boss_cloaked.png` 斗篷魔王現身 | 咦？誰進來了...一團神祕的斗篷身影！ |
| 2 | 背景轉暗，主人被關入 `cage.png` 運輸籠中 | 什麼！主人被關進了狗狗運輸籠！ |
| 3 | 斗篷魔王拖著 `cage.png` 運輸籠往右側大門逃走 | 神祕魔王帶著主人消失在門外... |
| 4 | Soju 特寫（眼神堅定、臭臉），播放咬擊攻擊動作 | Soju：...哼，我來救你。（按空白鍵開始冒險） |

第 4 幕再按一次 `Space` → 進入 `LEVEL`。

---

## 8. Boss 戰設計

### 8.1 Boss 場景
獨立固定房間（不捲軸，寬度 960，地板高度 `GROUND_Y`）。玩家位於 `x = 60`，Boss 初始位於 `x = 700`。

### 8.2 BOSS_INTRO 過場
```js
function updateBossIntro(){
  bossIntroTimer++;
  if(bossIntroTimer === 70) boss.revealed = true; // 斗篷脫落，切換為 boss_revealed.png
  if(bossIntroTimer > 140 || justPressed.Space) state = 'BOSS';
}
```
字幕：未脫斗篷時「一團神祕的斗篷身影擋住了去路...」；脫斗篷後「？？？：嘿嘿...原來是我，洗耳液魔王！」

### 8.3 Boss 屬性與招式狀態機
- 屬性：`hp: 5, maxHp: 5, w: 100, h: 130`，渲染尺寸約 `120x150`。
- 三招式循環（避免連續同招）：
  1. `spray`（噴彈幕）：發射 `boss_droplet.png` 洗耳液水滴（共 3 顆），沿固定高度飛向玩家，玩家需起跳閃避。
  2. `slam`（跳躍壓地）：垂直跳起落地，左右發射 `boss_shockwave.png` 地面震波，玩家需跳躍閃避。
  3. `summon`（召喚小怪）：召喚 1 隻 `slipper.png` 或 `ball.png` 進場。
- 每次招式結束後進入 `recover`（70 frame 虛弱空檔），是近身咬擊的最佳時機。
- 受到 5 次咬擊後 Boss 被擊倒，場上雜兵彈幕消散，延遲後切換至 `WIN`。

---

## 9. HUD / UI

| 元素 | 顯示時機 | 圖檔與內容 |
|---|---|---|
| 3 顆愛心 | 全程（除 TITLE/STORY） | `heart_full.png`（滿血）與 `heart_empty.png`（扣血） |
| Boss 血條 | `BOSS` 狀態 | 畫面上方置中，5 格血量槽，標題「巨大洗耳液魔王」 |
| 目標提示 | `LEVEL` / `BOSS` | 右上角常駐文字「打倒魔王，救出主人！」 |
| 擊倒數 | `LEVEL` | 左上角顯示當前擊敗小怪總數 |
| 終點大門 | `LEVEL` 靠近終點時 | `gate.png` 大門圖示 |

---

## 10. 音效與音樂（Web Audio API 即時合成）

- **音效規格**：
  - 跳躍：方波，440→880Hz 上滑，0.12s
  - 咬擊：鋸齒波，200→70Hz，0.07s
  - 受傷：鋸齒波，320→110Hz，0.22s
  - 擊敗小怪：方波，500→900Hz 上滑，0.08s
  - Boss 受擊：方波，160→95Hz，0.16s
- **通關音樂（`WIN`）**：合成版〈生日快樂〉經典旋律，使用柔和的 `triangle` 三角波排程播放。
- **瀏覽器規範**：`AudioContext` 延遲至玩家第一次按鍵時初始化，符合瀏覽器 Autoplay 規範。

---

## 11. 程式架構規範

```
soju_adventure.html
├── <style>                          // 像素字體、遊戲外框、置中與 UI 樣式
├── <canvas id="gameCanvas">          // 960x540 遊戲主畫面
├── <button id="restartBtn">          // 僅 LOSE 狀態顯示之重玩按鈕
└── <script>
    ├── 1. 全域常數與配置
    ├── 2. 素材管理與預載入系統（AssetLoader）
    │      ├── loadWithChromaKey() 載入 JPEG 並去除灰底背景（Soju動作圖與主人）
    │      └── loadImage() 載入 PNG/JPG（小怪、Boss、平台、家具、UI、背景）
    ├── 3. 動畫與精靈渲染系統（Sprite & Animation）
    │      ├── drawSpriteFrame(ctx, sprite, frameIdx, dx, dy, dw, dh, flipX)
    │      └── drawImage(ctx, img, dx, dy, dw, dh, flipX)
    ├── 4. 音效模組（Web Audio API 合成音效與生日歌）
    ├── 5. 關卡實體與碰撞系統（平台、裝飾、陷阱、小怪 AI）
    ├── 6. 玩家控制器（狀態、移動、跳躍、撲咬 hitbox、無敵幀）
    ├── 7. Boss 戰狀態機（過場、三招式邏輯、彈幕與震波）
    ├── 8. 狀態更新總分派（updateTitle, updateStory, updateLevel, updateBoss）
    ├── 9. 畫面渲染總分派（renderTitle, renderStory, renderLevel, renderBoss, renderUI）
    └── 10. 遊戲主循環（requestAnimationFrame、固定步長時間累加器）
</script>
```

---

## 12. 測試與驗收標準（Definition of Done）

- [ ] **圖片素材載入**：`imgs/` 中全部 24 個素材皆正常載入，無破圖或報錯。
- [ ] **去背效果**：Soju 動作圖與主人圖在遊戲中呈現乾淨透明底，無灰色邊框。
- [ ] **動畫切換流暢**：
  - 靜止時播放待機呼吸；
  - 跑動時播放奔跑動作，向左移動時角色自動鏡像翻轉；
  - 跳躍時切換跳躍動作；
  - 按空白鍵觸發咬擊動作，Hitbox 判定範圍與動作同步。
- [ ] **小怪與戰鬥**：拖鞋巡邏、Dyson 衝刺、彈跳球跳躍皆正常運作，咬擊一擊必殺。
- [ ] **黑暗玩具坑**：助跑跳可安全跨越；掉入扣血並重生於坑洞前。
- [ ] **Boss 戰完整體驗**：過場斗篷脫落現出真身，3 種招式正常釋放，5 次攻擊可擊敗。
- [ ] **通關畫面**：`WIN` 畫面顯示「母女團聚啦！」「妍霏生日快樂」，播放生日快樂歌，畫面凍結。
- [ ] **失敗畫面**：扣完 3 顆心進入 `LOSE`，點擊「再來一次」可重置關卡起點遊玩。

---

## 13. 附錄 A：像素素材規格表與程式實作範本

### A.1 Spritesheet 切圖座標常數定義

```js
// 主角 Soju 動作 Spritesheet 定義（對應 1074x976 之 2x2 網格）
const SOJU_SPRITES = {
  idle: {
    src: 'imgs/idle.jpeg',
    frames: [
      { sx: 40,  sy: 125, sw: 460, sh: 365 }, // Frame 1 (左上)
      { sx: 560, sy: 125, sw: 460, sh: 365 }, // Frame 2 (右上)
      { sx: 40,  sy: 555, sw: 460, sh: 345 }, // Frame 3 (左下)
      { sx: 560, sy: 555, sw: 460, sh: 345 }, // Frame 4 (右下)
    ],
    frameDuration: 14 // 幀切換間隔 ticks
  },
  run: {
    src: 'imgs/run.jpeg',
    frames: [
      { sx: 40,  sy: 125, sw: 460, sh: 365 },
      { sx: 560, sy: 125, sw: 460, sh: 365 },
      { sx: 40,  sy: 555, sw: 460, sh: 345 },
      { sx: 560, sy: 555, sw: 460, sh: 345 },
    ],
    frameDuration: 7
  },
  jump: {
    src: 'imgs/jump.jpeg',
    frames: [
      { sx: 40,  sy: 125, sw: 460, sh: 365 },
      { sx: 560, sy: 125, sw: 460, sh: 365 },
      { sx: 40,  sy: 555, sw: 460, sh: 345 },
      { sx: 560, sy: 555, sw: 460, sh: 345 },
    ],
    frameDuration: 9
  },
  bite: {
    src: 'imgs/bite.jpeg',
    frames: [
      { sx: 40,  sy: 125, sw: 460, sh: 365 },
      { sx: 560, sy: 125, sw: 460, sh: 365 },
      { sx: 40,  sy: 555, sw: 460, sh: 345 },
      { sx: 560, sy: 555, sw: 460, sh: 345 },
    ],
    frameDuration: 4
  }
};

// 主人立繪採樣座標
const OWNER_SPRITE = {
  src: 'imgs/owner.jpeg',
  frame: { sx: 410, sy: 30, sw: 280, sh: 890 }
};
```

### A.2 AssetLoader 實作範本

```js
class AssetLoader {
  constructor() {
    this.images = {};
  }

  // 載入一般透明 PNG / JPG
  async loadImage(name, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images[name] = img;
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // 載入並去除灰底背景（專為 Soju 動作圖與主人立繪 JPEG 設計）
  async loadWithChromaKey(name, src, targetBg = [134, 134, 134], tolerance = 24) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const offscreen = document.createElement('canvas');
        offscreen.width = img.width;
        offscreen.height = img.height;
        const ctx = offscreen.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const isGray = Math.abs(r - g) <= 12 && Math.abs(g - b) <= 12;
          const matchesBg = Math.abs(r - targetBg[0]) <= tolerance &&
                            Math.abs(g - targetBg[1]) <= tolerance &&
                            Math.abs(b - targetBg[2]) <= tolerance;
          if (isGray && matchesBg) {
            data[i + 3] = 0; // 設為完全透明
          }
        }

        ctx.putImageData(imgData, 0, 0);
        this.images[name] = offscreen;
        resolve(offscreen);
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // 批量載入專案所有素材
  async init() {
    await Promise.all([
      // 1. Soju 與主人（Chroma Key 去灰底）
      this.loadWithChromaKey('idle', 'imgs/idle.jpeg', [135, 135, 135]),
      this.loadWithChromaKey('run', 'imgs/run.jpeg', [133, 133, 133]),
      this.loadWithChromaKey('jump', 'imgs/jump.jpeg', [129, 129, 129]),
      this.loadWithChromaKey('bite', 'imgs/bite.jpeg', [124, 124, 124]),
      this.loadWithChromaKey('owner', 'imgs/owner.jpeg', [123, 123, 123]),

      // 2. 敵人與 Boss
      this.loadImage('slipper', 'imgs/slipper.png'),
      this.loadImage('dyson', 'imgs/dyson.png'),
      this.loadImage('ball', 'imgs/ball.png'),
      this.loadImage('boss_cloaked', 'imgs/boss_cloaked.png'),
      this.loadImage('boss_revealed', 'imgs/boss_revealed.png'),
      this.loadImage('boss_droplet', 'imgs/boss_droplet.png'),
      this.loadImage('boss_shockwave', 'imgs/boss_shockwave.png'),

      // 3. 場景、平台與裝飾
      this.loadImage('bg_livingroom', 'imgs/bg_livingroom.jpg'),
      this.loadImage('floor', 'imgs/floor.png'),
      this.loadImage('sofa', 'imgs/sofa.png'),
      this.loadImage('table', 'imgs/table.png'),
      this.loadImage('toybox', 'imgs/toybox.png'),
      this.loadImage('cage', 'imgs/cage.png'),
      this.loadImage('decor_bowl', 'imgs/decor_bowl.png'),
      this.loadImage('decor_snack', 'imgs/decor_snack.png'),
      this.loadImage('decor_plant', 'imgs/decor_plant.png'),
      this.loadImage('gate', 'imgs/gate.png'),

      // 4. UI
      this.loadImage('heart_full', 'imgs/heart_full.png'),
      this.loadImage('heart_empty', 'imgs/heart_empty.png'),
    ]);
  }

  get(name) {
    return this.images[name];
  }
}
```

### A.3 精靈繪製與水平翻轉函式

```js
function drawSpriteFrame(ctx, imageCanvas, frame, dx, dy, dw, dh, flipX = false) {
  if (!imageCanvas) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (flipX) {
    ctx.translate(Math.round(dx + dw), Math.round(dy));
    ctx.scale(-1, 1);
    ctx.drawImage(
      imageCanvas,
      frame.sx, frame.sy, frame.sw, frame.sh,
      0, 0, dw, dh
    );
  } else {
    ctx.drawImage(
      imageCanvas,
      frame.sx, frame.sy, frame.sw, frame.sh,
      Math.round(dx), Math.round(dy), dw, dh
    );
  }
  ctx.restore();
}

function drawSimpleImage(ctx, img, dx, dy, dw, dh, flipX = false) {
  if (!img) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (flipX) {
    ctx.translate(Math.round(dx + dw), Math.round(dy));
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, dw, dh);
  } else {
    ctx.drawImage(img, Math.round(dx), Math.round(dy), dw, dh);
  }
  ctx.restore();
}
```

---

## 14. 建議開發順序（任務拆分）

1. **基礎建設與載入器**：建置 HTML/Canvas 與 `AssetLoader`，實作 Chroma Key 去背與全量素材載入。
2. **玩家精靈渲染與動作切換**：
   - 整合 Soju 的 4 個 Spritesheet；
   - 依玩家狀態（待機、跑動、跳躍、咬擊）切換動畫幀與翻轉方向；
   - 實作左右移動、重力、跳躍物理與單向平台著地。
3. **關卡平台、裝飾物與坑洞**：
   - 繪製客廳背景 `bg_livingroom.jpg`、地板 `floor.png`、沙發 `sofa.png`、茶几 `table.png`、玩具箱 `toybox.png`；
   - 加入黑暗玩具坑摔落扣血與重生機制；
   - 實作平滑鏡像捲軸攝影機跟隨。
4. **敵人系統與撲咬攻擊**：
   - 繪製 `slipper.png`、`dyson.png`、`ball.png`；
   - 建立拖鞋巡邏、Dyson 衝刺、彈跳球行為 AI；
   - 實作咬擊攻擊判定（Hitbox）與打擊音效、受傷閃爍無敵時間。
5. **Boss 戰與現身過場**：
   - 實作 `BOSS_INTRO` 過場（`boss_cloaked.png` 斗篷脫落顯示 `boss_revealed.png` 真身）；
   - 實作 Boss 3 種攻擊招式狀態機（彈幕 `boss_droplet.png`、地面震波 `boss_shockwave.png`、召喚小怪）。
6. **開場劇情與結尾**：
   - 結合 `owner.jpeg` 主人立繪、`cage.png` 與 Soju 動作圖製作 5 幕開場劇情；
   - 通關 `WIN` 畫面（「母女團聚啦！」「妍霏生日快樂」）與生日快樂合成音樂播放；
   - 失敗 `LOSE` 畫面與重玩按鈕。
7. **驗收測試**：依據第 12 節檢核表進行完整功能驗證。

---

## 15. 未來可擴充方向（本版暫不做，先保留記錄）
- 背景音樂（BGM）選項
- 更多關卡、更多房間與房間切換
- 更多小怪種類、Boss 狂暴第二階段
- 行動裝置虛擬搖桿支援
- 闖關時間與最高分排行
