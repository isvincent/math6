/* ===== 線性規劃互動學習網：資料（英文介面字典、題庫、預設題目） ===== */
window.LPDATA = {};

/* ---------- 介面英文字典（中文為 HTML 原文） ---------- */
LPDATA.EN = {
  title:'Linear Programming', subtitle:'Elective Math B (II) · Ch.1 · Interactive Learning', pdf:'Textbook PDF', settings:'Settings',
  nav_home:'Guide', nav_lesson:'Lesson', nav_lab:'Lab', nav_ex:'Exercises', nav_practice:'Practice', nav_quiz:'Quiz', nav_extend:'Beyond', nav_record:'Record',
  hero_tag:'Chapter 1 · Linear Programming',
  hero_p:'Find the <b>best</b> answer under constraints! Starting from families of parallel lines and linear inequalities, learn to draw the feasible region and use the parallel-line method and the vertex method to find the maximum and minimum of an objective function.',
  start_learn:'Start learning', go_lab:'Open the lab', go_quiz:'Take the quiz',
  overall:'Overall progress', overall_d:'Lesson, lab, exercises, practice and quiz', st_lesson:'Lesson sections', st_lesson_d:'marked complete', st_prac:'Practice items', st_quiz:'Best quiz score', st_quiz_d:'80+ = mastery',
  guide_h:'Learning guide', guide_p:'Follow this path. Click a card to jump there; finished steps get a ✔.',
  r1:'① Read the lesson', r1d:'Intro, parallel lines, inequalities, LP', r2:'② Experiment', r2d:'Drag sliders and see the math', r3:'③ Exercises', r3d:'Basic, advanced, literacy', r4:'④ Practice', r4d:'Random items — get 10 right', r5:'⑤ Unit quiz', r5d:'10 items, pass at 80', r6:'⑥ Go beyond', r6d:'Unbounded regions, multiple optima…', r7:'⑦ Learning record', r7d:'Review and download',
  goals_h:'Learning goals',
  g1:'Understand a <strong class="key">family of parallel lines</strong>: keeping the coefficients of x and y in ax+by+c=0 and changing only the constant gives parallel lines; compare their intercepts.',
  g2:'Graph a <strong class="key">linear inequality in two variables</strong> and systems of them: choose the correct half-plane and use a solid or dashed boundary.',
  g3:'Know the terms <strong class="key">feasible solution, feasible region, objective function, optimal solution</strong>.',
  g4:'Use the <strong class="key">parallel-line method</strong> and the <strong class="key">vertex method</strong> to find maxima and minima and solve real-life problems.',
  plan_h:'Suggested schedule (3–4 lessons)', plan_c1:'Lesson', plan_c2:'Content', plan_c3:'Tools',
  p1:'Intro, parallel lines, linear inequalities', p1b:'Lesson 1–2 + Lab A, B', p2:'Feasible region, objective, two methods', p2b:'Lesson 3 + Lab C, D', p3:'Applications (Examples 5, 6) and exercises', p3b:'Exercises + Practice', p4:'Quiz and extension', p4b:'Quiz + Beyond + Record',
  pre_h:'Prerequisite check', tips_h:'Four steps for LP problems', s1:'Define variables', s2:'Write inequalities', s3:'Draw feasible region', s4:'Parallel-line / vertex method',
  tips_p:'Tip: ⚙️ (top right) changes font size, dark mode, language and device layout; 📄 downloads the original textbook PDF.',
  name_lbl:'My name (optional, stored only on this device, used in the report)',
  lesson_h:'Lesson: Linear Programming', lesson_p:'Faithful textbook content. Expand worked solutions and check in-class exercises.',
  toc0:'Chapter intro', toc4:'History',
  lab_h:'Interactive Lab', lab_p:'Drag, tap, observe — see the mathematics of linear programming.',
  labA:'Parallel line family', labB:'Half-planes & test points', labC:'Feasible region scanner', labD:'Rotate the objective', labE:'Lattice point counter',
  labA_p:'Fix a and b (coefficients of x and y) and change only the constant c. Watch the line slide and the intercepts change.',
  const:'constant', animate:'Play', ghost:'Show whole family',
  labA_n:'Notice: the slope −a/b never changes. For ax+by+c=0 with a>0, b>0, the smaller c (larger −c), the farther up-right the line and the larger both intercepts.',
  labB_p:'Set an inequality, then tap anywhere on the graph to drop a test point. See the substitution and which half-plane it is in.',
  testO:'Test with origin', toggleShade:'Show/hide solution',
  labC_p:'Pick a problem or enter your own constraints. Drag the slider (or drag on the graph) to move the objective line ax+by=k, and compare with the vertex table.',
  lg_region:'Feasible region', lg_obj:'Objective line', lg_best:'Optimal point', preset:'Problem', custom:'Custom constraints & objective',
  custom_hint:'One inequality per line, e.g. x+2y>=6, x-y<=2, y<=4, x>=0', objective:'Objective', apply:'Apply', objval:'objective value',
  sweep:'Auto sweep', toMax:'Jump to max', toMin:'Jump to min', vtable:'Vertex table',
  labD_p:'The feasible region (Example 4) is fixed. Rotate the direction of the objective ax+by and watch the optimal vertex jump. When the line is parallel to an edge, the whole edge is optimal!',
  angle:'Direction θ', rotate:'Auto rotate', parallel:'Align with an edge (multiple optima)',
  labD_n:'This is the key to Exercise 9: when the objective line is parallel to an outermost edge, every point on that edge gives the maximum.',
  labE_p:'(Exercise 5) Tap all lattice points inside the feasible region (boundary included), then press Check.',
  picked:'Selected', pts:'points', check:'Check', newQ:'New problem', showAns:'Show answer',
  ex_h:'Exercises 1', ex_p:'Try first, then use hints and solutions, and honestly mark “Got it” or “Need practice”. It is saved to your record.',
  ex_prog:'Exercise progress', ex_prog_d:'Items marked “Got it” / 10',
  prac_h:'Practice', prac_p:'Choose a type and get unlimited random items. Wrong answers get hints; streaks earn bonuses!',
  streak:'Streak', acc:'Accuracy', submit:'Submit', hint:'Hint', next:'Next',
  quiz_h:'Unit Quiz', quiz_p:'10 random items, 10 points each. 80+ means mastery. A full review follows.',
  quiz_ready:'Ready?', quiz_rule:'Covers parallel lines, half-planes, feasible regions, objective functions, both methods, and applications.', quiz_go:'Start quiz', prev:'Previous',
  ext_h:'Advanced & Extended Learning', ext_p:'Content beyond the textbook (marked <span class="tag sup">補充</span>) to deepen understanding.', ext_done:'I have read the extension',
  rec_h:'Learning Record', rec_p:'Everything is stored only in this browser. Download it to hand in.',
  rec_prac:'Practice by type', rec_quiz:'Quiz history', rec_check:'Completion checklist', rec_reflect:'Reflection',
  rec_reflect_p:'What did you learn, what is still unclear, what real-life uses can you think of? (saved and downloadable)',
  save:'Save reflection', rec_log:'Activity log', rec_dl:'Download & manage',
  dl_report:'Download report (HTML, printable to PDF)', dl_csv:'Download activity log (CSV)', dl_json:'Download all data (JSON)', dl_pdf:'Download textbook PDF', reset:'Clear all records',
  foot:'Interactive learning site. Textbook content from “Elective Math B (II), Ch.1 Linear Programming”; supplements are marked.',
  set_h:'Display & Controls', set_fs:'Fullscreen', on:'On', off:'Off', set_sound:'Sound', set_dev:'Device', auto:'Auto', mobile:'Phone', tablet:'Tablet', desktop:'Desktop',
  set_lay:'Layout', portrait:'Portrait', landscape:'Landscape', set_lang:'Language', set_font:'Font size', small:'Smaller', normal:'Standard', large:'Larger',
  set_theme:'Color theme', system:'System', light:'Light', dark:'Dark', set_note:'Settings are saved on this device. Shortcuts: F fullscreen, M sound.'
};

/* ---------- 動態文字 ---------- */
LPDATA.T = {
  zh:{correct:'答對了！', wrong:'再想想！', done:'已完成', markDone:'已標記完成 ✔', saved:'已儲存', got:'✅ 我答對了', retry:'🔁 再練習', answer:'答案', yourAns:'你的答案',
    slope:'斜率', xint:'x 截距', yint:'y 截距', none:'無', inRegion:'在解區域內 ✔', notRegion:'不在解區域內 ✘', onLine:'恰在界線上',
    pass:'精熟！太棒了 🎉', notPass:'再接再厲，看看下方檢討後重新挑戰！', retake:'重新測驗', review:'逐題檢討', score:'分',
    hitRegion:'直線與可行解區域相交：此直線上的可行解都使目標函數值為', missRegion:'直線沒有碰到可行解區域', maxIs:'最大值', minIs:'最小值', noMax:'不存在（區域無界）', noMin:'不存在（區域無界）', at:'發生在', empty:'可行解區域為空集合（無可行解）',
    vtx:'頂點', val:'目標函數值', parseErr:'無法解析：', fsNo:'此瀏覽器不支援全螢幕', resetQ:'確定要清除所有學習紀錄嗎？此動作無法復原。', cleared:'紀錄已清除',
    noData:'尚無紀錄', tries:'作答', correctN:'答對', time:'學習時間', min:'分鐘', visits:'造訪次數',
    lessonDone:'教材小節', labUsed:'實驗室使用', exDone:'習題答對', quizBest:'測驗最高分', pracCorrect:'練習答對',
    enterNum:'請輸入數字', checkAns:'對答案', hintPrefix:'提示：', bestMark:'最佳', pickRight:'答對', partial:'部分正確',
    pre:['會由兩點求直線斜率','會寫直線方程式（點斜式、截距）','會解二元一次聯立方程式求交點','會畫第一冊學過的不等式圖形'],
    multi:'多重最佳解：整條邊都是最大值！', maxAtV:'最大值發生在頂點', minAtV:'最小值發生在頂點'},
  en:{correct:'Correct!', wrong:'Not quite!', done:'Done', markDone:'Marked complete ✔', saved:'Saved', got:'✅ Got it', retry:'🔁 Need practice', answer:'Answer', yourAns:'Your answer',
    slope:'Slope', xint:'x-intercept', yint:'y-intercept', none:'none', inRegion:'in the solution region ✔', notRegion:'not in the region ✘', onLine:'on the boundary',
    pass:'Mastery! Great job 🎉', notPass:'Keep going — check the review below and try again!', retake:'Retake', review:'Review', score:'pts',
    hitRegion:'The line meets the feasible region: feasible points on it give objective value', missRegion:'The line misses the feasible region', maxIs:'Maximum', minIs:'Minimum', noMax:'does not exist (unbounded)', noMin:'does not exist (unbounded)', at:'at', empty:'The feasible region is empty (no feasible solution)',
    vtx:'Vertex', val:'Objective value', parseErr:'Cannot parse: ', fsNo:'Fullscreen not supported', resetQ:'Clear all learning records? This cannot be undone.', cleared:'Records cleared',
    noData:'No records yet', tries:'Tries', correctN:'Correct', time:'Study time', min:'min', visits:'Visits',
    lessonDone:'Lesson sections', labUsed:'Lab uses', exDone:'Exercises solved', quizBest:'Best quiz', pracCorrect:'Practice correct',
    enterNum:'Please enter a number', checkAns:'Check', hintPrefix:'Hint: ', bestMark:'best', pickRight:'Correct', partial:'Partly correct',
    pre:['Find slope from two points','Write line equations (point-slope, intercepts)','Solve 2×2 linear systems for intersections','Graph inequalities from Book 1'],
    multi:'Multiple optima: the whole edge gives the maximum!', maxAtV:'Maximum at vertex', minAtV:'Minimum at vertex'}
};

/* ---------- 實驗室 C 預設題目 ---------- */
LPDATA.PRESETS = [
  {id:'intro', zh:'課文引例：x＋y', en:'Text example: x+y', cons:['x+2y>=6','x-y<=2','y<=4'], p:1, q:1},
  {id:'ex4', zh:'例題 4：x＋3y', en:'Example 4: x+3y', cons:['x+2y<=6','2x+y<=6','x>=0','y>=0'], p:1, q:3},
  {id:'pr4', zh:'隨堂練習：2x＋y', en:'Practice: 2x+y', cons:['x+y>=10','x-y<=0','y<=10'], p:2, q:1},
  {id:'ex5', zh:'例題 5：精油 25x＋12y', en:'Example 5: oil 25x+12y', cons:['5x+4y<=80','3x+y<=30','x>=0','y>=0'], p:25, q:12},
  {id:'pr5', zh:'隨堂（大禹）：50x＋30y', en:'Practice (alloy): 50x+30y', cons:['5x+2y<=90','x+y<=30','x>=0','y>=0'], p:50, q:30},
  {id:'ex6', zh:'例題 6：成本 60000x＋40000y', en:'Example 6: cost 60000x+40000y', cons:['x+2y>=8','2x+y>=10','x>=0','y>=0'], p:60000, q:40000},
  {id:'pr6', zh:'隨堂（甲乙工廠）：10000x＋20000y', en:'Practice (factories): 10000x+20000y', cons:['4x+2y>=16','2x+7y>=20','x>=0','y>=0'], p:10000, q:20000},
  {id:'e10', zh:'習題 10：飼料 5x＋4y', en:'Exercise 10: feed 5x+4y', cons:['7x+2y>=84','x+2y>=24','3x+2y>=60','x>=0','y>=0'], p:5, q:4},
  {id:'grade', zh:'引例：學期成績 0.3x＋0.7y', en:'Opening: grade 0.3x+0.7y', cons:['x>=0','x<=100','y>=0','y<=100','x+y<=150'], p:0.3, q:0.7}
];

/* ---------- 測驗題庫 ---------- */
LPDATA.QUIZ = [
 {t:'平行直線系', q:{zh:'將直線 3x＋2y＝6 向右平移 2 單位，所得直線方程式為何？',en:'Shift the line 3x+2y=6 right by 2 units. Its equation is?'}, o:['3x＋2y＝12','3x＋2y＝8','3x＋2y＝10','3x＋2y＝0'], a:0, e:{zh:'向右平移 2：x 換成 x－2，3(x－2)＋2y＝6 ⇒ 3x＋2y＝12．',en:'Replace x by x−2: 3(x−2)+2y=6 ⇒ 3x+2y=12.'}},
 {t:'平行直線系', q:{zh:'下列哪一條直線與 2x－y＝3 <b>不</b>平行？',en:'Which line is <b>not</b> parallel to 2x−y=3?'}, o:['2x－y＝−5','4x－2y＝1','y＝2x＋7','x－2y＝3'], a:3, e:{zh:'2x－y＝3 斜率為 2；x－2y＝3 的斜率為 1/2，不平行．',en:'Slope of 2x−y=3 is 2; x−2y=3 has slope 1/2.'}},
 {t:'平行直線系', q:{zh:'平行直線系 2x＋3y＝k 中，k 值愈大，直線往哪個方向移動？',en:'In the family 2x+3y=k, as k increases the line moves…'}, o:[{zh:'往右上方',en:'up-right'},{zh:'往左下方',en:'down-left'},{zh:'往左上方',en:'up-left'},{zh:'不移動，只旋轉',en:'it rotates, not moves'}], a:0, e:{zh:'x 截距 k/2、y 截距 k/3 都隨 k 變大，直線往右上方移動．',en:'Both intercepts k/2 and k/3 grow, so the line moves up-right.'}},
 {t:'平行直線系', q:{zh:'三直線 x＋y＝1、x＋y＝4、x＋y＝−2 中，y 截距最大的是哪一條？',en:'Among x+y=1, x+y=4, x+y=−2, which has the largest y-intercept?'}, o:['x＋y＝1','x＋y＝4','x＋y＝−2',{zh:'三者相同',en:'all equal'}], a:1, e:{zh:'令 x＝0，y 截距分別為 1、4、−2．',en:'Set x=0: intercepts 1, 4, −2.'}},
 {t:'半平面', q:{zh:'不等式 3x－2y＋6 ≥ 0 的圖形是哪一個半平面？',en:'The graph of 3x−2y+6 ≥ 0 is the half-plane that…'}, o:[{zh:'含原點的一側（含界線）',en:'contains the origin (with boundary)'},{zh:'不含原點的一側（含界線）',en:'does not contain the origin (with boundary)'},{zh:'含原點的一側（不含界線）',en:'contains the origin (no boundary)'},{zh:'整個平面',en:'the whole plane'}], a:0, e:{zh:'原點代入：0－0＋6＝6 ≥ 0 成立；含等號，界線畫實線．',en:'Origin: 6 ≥ 0 true; “≥” includes the boundary.'}},
 {t:'半平面', q:{zh:'不等式 x－y＜3 的界線 x－y＝3 應該畫成？',en:'For x−y<3, the boundary x−y=3 is drawn as…'}, o:[{zh:'虛線',en:'a dashed line'},{zh:'實線',en:'a solid line'},{zh:'不用畫',en:'not drawn'},{zh:'粗實線',en:'a thick solid line'}], a:0, e:{zh:'不含等號（嚴格不等式），圖形不含界線，以虛線表示．',en:'Strict inequality — boundary excluded — dashed.'}},
 {t:'半平面', q:{zh:'點 (1, 2) 滿足下列哪一個不等式？',en:'Which inequality does (1, 2) satisfy?'}, o:['x＋y ≤ 2','2x－y ≥ 1','x－2y＋4＞0','3x＋y＜5'], a:2, e:{zh:'代入：1＋2＝3、2－2＝0、1－4＋4＝1＞0 ✔、3＋2＝5 不小於 5．',en:'Substitute: 3, 0, 1>0 ✔, 5 (not < 5).'}},
 {t:'半平面', q:{zh:'若界線通過原點，例如 2x－y＞0，課本建議用哪個點來驗算？',en:'If the boundary passes through the origin (e.g., 2x−y>0), the textbook suggests testing…'}, o:[{zh:'(1, 0) 或 (0, 1)',en:'(1, 0) or (0, 1)'},{zh:'仍用原點',en:'still the origin'},{zh:'界線上的任一點',en:'any point on the line'},{zh:'不需驗算',en:'no test needed'}], a:0, e:{zh:'原點在界線上無法判斷，改取 (1, 0) 或 (0, 1)．',en:'The origin lies on the line, so use (1, 0) or (0, 1).'}},
 {t:'名詞', q:{zh:'滿足聯立不等式所有條件的數對 (x, y) 稱為？',en:'An ordered pair (x, y) satisfying all the constraints is called a…'}, o:[{zh:'可行解',en:'feasible solution'},{zh:'最佳解',en:'optimal solution'},{zh:'目標函數',en:'objective function'},{zh:'頂點',en:'vertex'}], a:0, e:{zh:'課本定義：滿足聯立不等式的數對稱為可行解，全部可行解形成可行解區域．',en:'By definition: feasible solution; all of them form the feasible region.'}},
 {t:'名詞', q:{zh:'在「求 x＋y 的最大值」的問題中，x＋y 稱為？',en:'In “find the maximum of x+y”, x+y is called the…'}, o:[{zh:'目標函數',en:'objective function'},{zh:'可行解區域',en:'feasible region'},{zh:'限制條件',en:'constraint'},{zh:'平行直線系',en:'parallel family'}], a:0, e:{zh:'要求極值的那個量稱為目標函數；產生極值的點稱為最佳解．',en:'The quantity being optimized is the objective function.'}},
 {t:'頂點法', q:{zh:'在 x＋2y ≤ 6、2x＋y ≤ 6、x ≥ 0、y ≥ 0 的區域中，2x＋y 的最大值為？',en:'On x+2y ≤ 6, 2x+y ≤ 6, x ≥ 0, y ≥ 0, the maximum of 2x+y is?'}, o:['6','8','3','9'], a:0, e:{zh:'頂點 (0,0)、(3,0)、(2,2)、(0,3) 代入得 0、6、6、3，最大值 6（整段 (3,0)~(2,2) 皆是）．',en:'Vertices give 0, 6, 6, 3 → max 6 (along the edge from (3,0) to (2,2)).'}},
 {t:'頂點法', q:{zh:'區域 x ≥ 0、y ≥ 0、x＋y ≤ 4 中，3x＋y 的最大值為？',en:'On x ≥ 0, y ≥ 0, x+y ≤ 4, the maximum of 3x+y is?'}, o:['12','4','8','16'], a:0, e:{zh:'頂點 (0,0)、(4,0)、(0,4)：0、12、4，最大值 12．',en:'Vertices: 0, 12, 4 → 12.'}},
 {t:'頂點法', q:{zh:'頂點 (0, 0)、(4, 0)、(0, 6) 所圍三角形區域中，x－y 的最小值為？',en:'On the triangle (0,0), (4,0), (0,6), the minimum of x−y is?'}, o:['−6','0','4','−4'], a:0, e:{zh:'代入得 0、4、−6，最小值 −6．',en:'Values 0, 4, −6 → −6.'}},
 {t:'頂點法', q:{zh:'頂點法能成立的關鍵觀念是？',en:'Why does the vertex method work?'}, o:[{zh:'可行解區域邊界為直線、目標函數為一次函數時，極值若存在必在頂點（或邊界）出現',en:'With straight-line boundaries and a linear objective, an extremum (if it exists) occurs at a vertex (or edge)'},{zh:'極值一定在原點',en:'Extrema are always at the origin'},{zh:'極值一定在區域中心',en:'Extrema are at the center'},{zh:'任何函數的極值都在頂點',en:'Any function’s extrema are at vertices'}], a:0, e:{zh:'這正是課本頂點法的依據；注意「若存在」．',en:'This is the textbook’s basis — note “if it exists”.'}},
 {t:'平行線法', q:{zh:'直線 x＋y＝k 向右上方平行移動時，k 值會？',en:'As the line x+y=k slides up-right, k…'}, o:[{zh:'變大',en:'increases'},{zh:'變小',en:'decreases'},{zh:'不變',en:'stays the same'},{zh:'先變大再變小',en:'first up, then down'}], a:0, e:{zh:'x＋y＝k 的 x 截距為 k，往右上方 k 愈大．',en:'Its x-intercept is k, so k grows up-right.'}},
 {t:'平行線法', q:{zh:'例題 6 的區域（x＋2y ≥ 8、2x＋y ≥ 10、x ≥ 0、y ≥ 0）是無界的，目標函數 60000x＋40000y：',en:'Example 6’s region is unbounded. For 60000x+40000y:'}, o:[{zh:'有最小值、沒有最大值',en:'min exists, no max'},{zh:'有最大值、沒有最小值',en:'max exists, no min'},{zh:'兩者都有',en:'both exist'},{zh:'兩者都沒有',en:'neither exists'}], a:0, e:{zh:'直線往右上可無限移動仍碰到區域，所以沒有最大值；最小值 320000 在 (4, 2)．',en:'The line can move up-right forever; min 320000 at (4, 2).'}},
 {t:'平行線法', q:{zh:'區域無界時，用頂點法前要先做什麼？',en:'Before using the vertex method on an unbounded region you should…'}, o:[{zh:'用平行線法確認極值是否存在',en:'confirm with parallel lines that the extremum exists'},{zh:'把區域改成有界',en:'make the region bounded'},{zh:'只代入原點',en:'test only the origin'},{zh:'不需要任何確認',en:'nothing'}], a:0, e:{zh:'無界區域的某些極值可能不存在，需先確認．',en:'Some extrema may not exist on unbounded regions.'}},
 {t:'交點', q:{zh:'直線 x＋2y＝8 與 2x＋y＝10 的交點為？',en:'The intersection of x+2y=8 and 2x+y=10 is?'}, o:['(4, 2)','(2, 4)','(3, 4)','(5, 0)'], a:0, e:{zh:'解聯立：由第二式 y＝10－2x，代入 x＋20－4x＝8 ⇒ x＝4，y＝2．',en:'y=10−2x, x+20−4x=8 ⇒ x=4, y=2.'}},
 {t:'列式', q:{zh:'下列哪一組聯立不等式表示「第一象限內、直線 x＋y＝5 下方（含邊界）」的區域？',en:'Which system describes the first-quadrant region below x+y=5 (boundary included)?'}, o:['x ≥ 0，y ≥ 0，x＋y ≤ 5','x ≥ 0，y ≥ 0，x＋y ≥ 5','x ≤ 0，y ≤ 0，x＋y ≤ 5','x＞0，y＞0，x＋y＜5'], a:0, e:{zh:'第一象限 x ≥ 0、y ≥ 0；含原點的一側為 x＋y ≤ 5；含邊界用 ≤．',en:'First quadrant and the origin side, with “≤”.'}},
 {t:'格子點', q:{zh:'滿足 x ≥ 0、y ≥ 0、x＋y ≤ 2 的整數數對 (x, y) 共有幾組？',en:'How many integer pairs satisfy x ≥ 0, y ≥ 0, x+y ≤ 2?'}, o:['6','3','4','9'], a:0, e:{zh:'x＝0：3 組；x＝1：2 組；x＝2：1 組，共 6 組．',en:'3 + 2 + 1 = 6.'}},
 {t:'應用', q:{zh:'甲產品每件需工時 2 小時、乙產品每件需 1 小時，總工時不超過 10 小時．設甲 x 件、乙 y 件，限制條件為？',en:'Product A needs 2 h, B needs 1 h, total ≤ 10 h. With x of A and y of B, the constraint is?'}, o:['2x＋y ≤ 10','x＋2y ≤ 10','2x＋y ≥ 10','x＋y ≤ 10'], a:0, e:{zh:'總工時＝2x＋1·y，不超過 10 ⇒ 2x＋y ≤ 10．',en:'Total time 2x+y ≤ 10.'}},
 {t:'應用', q:{zh:'例題 5 中，精油產量的目標函數為？',en:'In Example 5, the objective (oil output) is?'}, o:['25x＋12y','15x＋12y','75x＋25y','5x＋4y'], a:0, e:{zh:'每公噸原料 A、B 分別提煉 25、12 公斤精油．',en:'25 kg and 12 kg of oil per ton of A and B.'}},
 {t:'多重解', q:{zh:'若目標函數 x＋ky 在直線 2x－y＝7 上的兩點同時取得最大值，則 k＝？',en:'If x+ky attains its maximum at two points of the line 2x−y=7, then k = ?'}, o:['−1/2','1/2','2','−2'], a:0, e:{zh:'目標函數直線與 2x－y＝7 平行：1/2＝k/(−1)，k＝−1/2（習題 9）．',en:'Parallel lines: 1/2 = k/(−1) ⇒ k = −1/2 (Exercise 9).'}},
 {t:'虛實線', q:{zh:'聯立不等式 x＋y ≥ 2、x－y＜1 的兩界線交點 (1.5, 0.5) 是否屬於解區域？',en:'Is the intersection (1.5, 0.5) of the boundaries of x+y ≥ 2 and x−y<1 in the solution set?'}, o:[{zh:'不屬於，因為 x－y＜1 不含界線',en:'No, x−y<1 excludes its boundary'},{zh:'屬於，因為 x＋y ≥ 2 含界線',en:'Yes, x+y ≥ 2 includes its boundary'},{zh:'屬於，交點一定是頂點',en:'Yes, intersections are always vertices'},{zh:'無法判斷',en:'Cannot tell'}], a:0, e:{zh:'代入 x－y＝1，不滿足 x－y＜1，所以畫空心點．',en:'x−y=1 fails x−y<1, so it is an open dot.'}}
];

/* 練習題型 */
LPDATA.PTYPES = [
  {id:'shift', ic:'↔️', zh:'直線平移', en:'Shifting lines', dz:'平行直線系方程式', de:'Equations of parallel lines'},
  {id:'side', ic:'🌗', zh:'半平面判斷', en:'Which half-plane?', dz:'測試點與虛實線', de:'Test points, solid/dashed'},
  {id:'cross', ic:'✖️', zh:'求頂點', en:'Find a vertex', dz:'兩界線的交點', de:'Intersection of boundaries'},
  {id:'lp', ic:'📈', zh:'求最大／最小值', en:'Max / min', dz:'完整線性規劃', de:'Full LP problem'},
  {id:'mix', ic:'🎲', zh:'綜合隨機', en:'Mixed', dz:'各題型隨機混合', de:'All types mixed'}
];
