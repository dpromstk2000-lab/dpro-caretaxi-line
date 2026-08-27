/* DPRO TUTORIAL STANDARD V1.1 / CARETAXI R3 FIRST10 */
(() => {
  "use strict";
  if (window.DPRO_CARETAXI_TUTORIAL) return;
  const VERSION = "CARETAXI-TUTORIAL-R3-V1.0-20260827";
  const STATE_KEY = "dpro_caretaxi_tutorial_first10_v1";
  const POS_KEY = "dpro_caretaxi_tutorial_card_position_v1";
  const ROOT = "./";
  const pathName = () => (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const safeParse = (raw, fallback) => { try { return JSON.parse(raw) ?? fallback; } catch { return fallback; } };

  const STEPS = Object.freeze([
    {n:1,page:"demo-guide.html",title:"全体像を確認",selector:"#screenGrid",fallback:"#primaryDemoLink",text:"介護タクシーの操作は、送迎依頼 → 管理者確認 → 配車・当日運行 → 料金 → 台帳の順につながります。まず5画面の全体像を確認します。",note:"このTutorialは説明だけを行い、予約・見積・配車・料金などの業務更新を自動実行しません。"},
    {n:2,page:"index.html",title:"予約する方を入力",selector:"#requesterType",fallback:'[data-step="1"]',preview:1,text:"予約者区分、乗車する方との関係、お名前、電話番号を確認します。事業所から確認連絡ができる情報が中心です。",note:"画面説明用プレビューです。入力値の自動設定や送信は行いません。"},
    {n:3,page:"index.html",title:"乗車する方と介助条件",selector:"#mobilityType",fallback:'[data-step="2"]',preview:2,text:"乗車する方、移動方法、必要な介助や設備を確認します。階段・建物・緊急連絡先は必要なときだけ開きます。",note:"車いす・ストレッチャー・介助条件も、Tutorial側から変更しません。"},
    {n:4,page:"index.html",title:"送迎内容を指定",selector:"#servicePurpose",fallback:'[data-step="3"]',preview:3,text:"利用目的、片道・往復、希望日・30分単位の希望時間、お迎え先と目的地を入力します。往復時は帰りの指定方法も確認できます。",note:"Tutorialは日時や住所を自動入力しません。"},
    {n:5,page:"index.html",title:"確認して依頼を送る",selector:"#agreementTitle",fallback:'[data-step="4"]',preview:4,text:"入力内容を確認し、必要な同意を確認して送信します。送信時点は“予約確定”ではなく、事業所の確認・見積・確定が続きます。",note:"Tutorialの「次へ」は業務の送信ボタンを押しません。実際の依頼はTutorialを閉じて通常操作で行えます。"},
    {n:6,page:"owner.html",query:"demo=1",title:"管理者PCで依頼を見つける",selector:"#tripRows",fallback:"#adminCode",text:"管理コードで管理者PCを開き、未確認の依頼を探します。一覧の「詳細」から1件の流れを確認できます。",note:"ログインは既存機能です。Tutorialは認証方式や権限を変更しません。"},
    {n:7,page:"owner.html",query:"demo=1",title:"受付・見積・予約確定・配車を理解",selector:"#tripDrawer.open",fallback:"#tripRows",text:"1件の詳細では、内容確認 → 見積 → 予約確定 → 車両・運転者の配車へ進みます。Tutorialでは場所と順序を確認し、業務更新は自動実行しません。",note:"「内容確認」「見積保存」「予約確定」「配車登録」は利用者が意図して操作する既存業務ボタンです。"},
    {n:8,page:"owner-ipad.html",query:"demo=1",title:"iPad配車で当日運行を確認",selector:"#board",fallback:"#adminCode",text:"当日の送迎は状態別レーンで確認します。カードの「詳細 / 配車確認」から送迎内容を開き、当日の状況を追います。",note:"ボードの横スワイプはそのまま利用できます。Tutorialカードは上部の「移動」ハンドルだけで動きます。"},
    {n:9,page:"billing.html",query:"demo=1",title:"料金・支払を確認",selector:"#tripList",fallback:"#adminCode",text:"左の送迎予約を選ぶと、右側で見積内訳・確定料金・支払状況を確認できます。未払い / 一部入金 / 支払済みで絞り込めます。",note:"料金保存・入金登録などの業務更新はTutorialから実行しません。"},
    {n:10,page:"ledger.html",query:"demo=1",title:"台帳と送迎履歴を確認",selector:"#searchInput",fallback:"#adminCode",text:"氏名・ふりがな・電話番号・台帳番号・住所で検索し、予約者 / 乗車者の基本情報、家族関係、よく行く場所、利用履歴を確認します。次回受付の再利用につながります。",note:"First10は検索・確認の学習まで。台帳の作成・編集・保存は自動実行しません。"}
  ]);

  const defaultState = () => ({tutorialId:"CARETAXI_FIRST10_V1",version:1,currentStep:1,status:"idle",completedSteps:[],skippedSteps:[],lastPage:"",updatedAt:Date.now()});
  let state = {...defaultState(), ...safeParse(localStorage.getItem(STATE_KEY), {})};
  let isOpen = false;
  let restoreFocus = null;
  let dragging = null;
  let highlightTarget = null;
  let resizeObserver = null;
  let indexSnapshot = null;

  function saveState(){ state.updatedAt=Date.now(); state.lastPage=pathName(); localStorage.setItem(STATE_KEY,JSON.stringify(state)); }
  function setState(patch){ state={...state,...patch}; saveState(); }
  function step(){ return STEPS[clamp(Number(state.currentStep)||1,1,10)-1]; }
  function pageMatches(s=step()){ const p=pathName(); return p===s.page || (s.page==="index.html" && (p==="" || p==="index.html")); }
  function hrefFor(s){ const sp=new URLSearchParams(s.query||""); sp.set("tutorial","1"); return `${ROOT}${s.page}?${sp.toString()}`; }

  function injectDom(){
    if(q("#dpro-tutorial-card")) return;
    const highlight=document.createElement("div"); highlight.id="dpro-tutorial-highlight"; highlight.setAttribute("aria-hidden","true");
    const launcher=document.createElement("button"); launcher.id="dpro-tutorial-launcher"; launcher.type="button"; launcher.textContent="操作ガイド"; launcher.setAttribute("aria-haspopup","menu"); launcher.setAttribute("aria-expanded","false");
    const menu=document.createElement("div"); menu.id="dpro-tutorial-menu"; menu.setAttribute("role","menu"); menu.innerHTML=`<button type="button" class="primary" data-tutorial-menu="resume">First10を${state.status==="idle"?"開始":"再開"}</button><button type="button" data-tutorial-menu="replay">最初からやり直す</button><a href="./demo-guide.html">公開デモ画面一覧</a>`;
    const card=document.createElement("section"); card.id="dpro-tutorial-card"; card.setAttribute("aria-label","DPRO 操作Tutorial"); card.innerHTML=`<div id="dpro-tutorial-drag-handle" class="dpro-tutorial-handle" role="button" tabindex="0" aria-label="Tutorialカードを移動。矢印キーでも移動できます"><div><strong>移動</strong><span>ドラッグ / 矢印キー</span></div><kbd>STANDARD V1.1</kbd><button class="dpro-tutorial-close" type="button" aria-label="Tutorialを閉じる">×</button></div><div id="dpro-tutorial-content"></div>`;
    document.body.append(highlight,launcher,menu,card);
    bindUi();
  }

  function bindUi(){
    const launcher=q("#dpro-tutorial-launcher"), menu=q("#dpro-tutorial-menu"), handle=q("#dpro-tutorial-drag-handle");
    launcher.addEventListener("click",()=>{ const open=menu.dataset.open!=="1"; menu.dataset.open=open?"1":"0"; launcher.setAttribute("aria-expanded",String(open)); if(open) menu.querySelector("button")?.focus(); });
    menu.addEventListener("click",e=>{
      const action=e.target?.dataset?.tutorialMenu; if(!action) return;
      menu.dataset.open="0"; launcher.setAttribute("aria-expanded","false");
      if(action==="replay") replay(); else resumeOrStart();
    });
    q(".dpro-tutorial-close").addEventListener("click",closeTutorial);
    handle.addEventListener("pointerdown",startDrag);
    handle.addEventListener("keydown",keyboardMove);
    window.addEventListener("pointermove",moveDrag,{passive:false});
    window.addEventListener("pointerup",endDrag);
    window.addEventListener("pointercancel",endDrag);
    window.addEventListener("resize",()=>{clampCard(); updateHighlight();});
    window.addEventListener("scroll",updateHighlight,true);
    window.visualViewport?.addEventListener("resize",()=>{clampCard(); updateHighlight();});
    window.visualViewport?.addEventListener("scroll",()=>{clampCard(); updateHighlight();});
    document.addEventListener("keydown",onGlobalKey,true);
  }

  function onGlobalKey(e){
    if(e.key==="Escape" && isOpen){ e.preventDefault(); e.stopImmediatePropagation(); closeTutorial(); }
  }

  function startDrag(e){
    if(e.button!==undefined && e.button!==0) return;
    if(e.target.closest("button,a,input,select,textarea")) return;
    const card=q("#dpro-tutorial-card"), r=card.getBoundingClientRect();
    dragging={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};
    try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}
    e.preventDefault();
  }
  function moveDrag(e){ if(!dragging || e.pointerId!==dragging.id) return; setCardPosition(e.clientX-dragging.dx,e.clientY-dragging.dy,true); e.preventDefault(); }
  function endDrag(e){ if(!dragging || (e.pointerId!==undefined && e.pointerId!==dragging.id)) return; dragging=null; persistPosition(); }
  function keyboardMove(e){
    if(e.target!==e.currentTarget) return;
    if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) return;
    const card=q("#dpro-tutorial-card"),r=card.getBoundingClientRect(),delta=e.shiftKey?40:16;
    const dx=e.key==="ArrowLeft"?-delta:e.key==="ArrowRight"?delta:0,dy=e.key==="ArrowUp"?-delta:e.key==="ArrowDown"?delta:0;
    setCardPosition(r.left+dx,r.top+dy,true); persistPosition(); e.preventDefault(); e.stopPropagation();
  }
  function viewport(){ const vv=window.visualViewport; return {x:vv?.offsetLeft||0,y:vv?.offsetTop||0,w:vv?.width||innerWidth,h:vv?.height||innerHeight}; }
  function setCardPosition(left,top,clamped){ const card=q("#dpro-tutorial-card"); if(!card)return; const v=viewport(),r=card.getBoundingClientRect(),g=12; const l=clamped?clamp(left,v.x+g,v.x+v.w-r.width-g):left; const t=clamped?clamp(top,v.y+g,v.y+v.h-r.height-g):top; card.style.left=`${Math.round(l)}px`;card.style.top=`${Math.round(t)}px`;card.style.right="auto";card.style.bottom="auto"; }
  function clampCard(){ const card=q("#dpro-tutorial-card"); if(!card||!isOpen)return; const r=card.getBoundingClientRect(); setCardPosition(r.left,r.top,true); }
  function persistPosition(){ const r=q("#dpro-tutorial-card")?.getBoundingClientRect(); if(r) localStorage.setItem(POS_KEY,JSON.stringify({left:r.left,top:r.top})); }
  function placeCard(){ const card=q("#dpro-tutorial-card"); requestAnimationFrame(()=>{ const saved=safeParse(localStorage.getItem(POS_KEY),null),v=viewport(),r=card.getBoundingClientRect(); if(saved) setCardPosition(saved.left,saved.top,true); else setCardPosition(v.x+v.w-r.width-16,v.y+v.h-r.height-18,true); }); }

  function resolveTarget(s=step()){
    if(!pageMatches(s)) return null;
    if(s.n===6 && q("#loginView") && !q("#loginView").classList.contains("hidden")) return q("#adminCode")||q("#loginForm");
    if([8,9,10].includes(s.n)){ const login=q("#loginView"); if(login && !login.classList.contains("hidden")) return q("#adminCode")||login; }
    return q(s.selector)||q(s.fallback)||document.querySelector("main")||document.body;
  }

  function updateHighlight(){
    const h=q("#dpro-tutorial-highlight"); if(!h||!isOpen)return;
    const t=resolveTarget(); highlightTarget=t;
    if(!t || !t.isConnected){h.style.display="none";return;}
    const r=t.getBoundingClientRect(),v=viewport(),pad=6;
    const left=clamp(r.left-pad,v.x,v.x+v.w),top=clamp(r.top-pad,v.y,v.y+v.h),right=clamp(r.right+pad,v.x,v.x+v.w),bottom=clamp(r.bottom+pad,v.y,v.y+v.h);
    if(right<=left||bottom<=top){h.style.display="none";return;}
    Object.assign(h.style,{display:"block",left:`${left}px`,top:`${top}px`,width:`${right-left}px`,height:`${bottom-top}px`});
  }

  function ensureTargetVisible(){ const t=resolveTarget(); if(!t)return; try{t.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center",inline:"nearest"})}catch{} setTimeout(updateHighlight,160); }

  function applyIndexPreview(s){
    restoreIndexPreview();
    if(pathName()!=="index.html" || !s.preview || !isOpen) return;
    const sections=qa(".wizard-step"); if(!sections.length)return;
    indexSnapshot=sections;
    document.body.classList.add("dpro-tutorial-index-preview");
    sections.forEach(el=>el.classList.toggle("dpro-tutorial-preview-visible",Number(el.dataset.step)===Number(s.preview)));
  }
  function restoreIndexPreview(){ if(!indexSnapshot)return; indexSnapshot.forEach(el=>el.classList.remove("dpro-tutorial-preview-visible")); document.body.classList.remove("dpro-tutorial-index-preview"); indexSnapshot=null; }

  function render(){
    if(!isOpen)return;
    const s=step(),content=q("#dpro-tutorial-content"),card=q("#dpro-tutorial-card");
    if(state.status==="completed"){
      restoreIndexPreview(); q("#dpro-tutorial-highlight").style.display="none";
      content.innerHTML=`<div class="dpro-tutorial-complete"><div class="mark">✓</div><h2>First10 完了</h2><p>介護タクシーの依頼から台帳まで、基本の10ステップを確認しました。</p><div class="dpro-tutorial-complete-actions"><button type="button" data-tutorial-action="replay">もう一度見る</button><a href="./demo-guide.html">公開デモ画面一覧へ</a></div></div>`;
      content.querySelector('[data-tutorial-action="replay"]').onclick=replay; clampCard(); return;
    }
    if(!pageMatches(s)) { location.href=hrefFor(s); return; }
    applyIndexPreview(s);
    const percent=s.n*10;
    content.innerHTML=`<div class="dpro-tutorial-body"><div class="dpro-tutorial-progress"><span>First10 ${s.n}/10</span><div class="dpro-tutorial-progress-bar"><i style="width:${percent}%"></i></div><span>${percent}%</span></div><h2>${s.title}</h2><p>${s.text}</p><div class="dpro-tutorial-note">${s.note}</div><div class="dpro-tutorial-target-status">対象を黄色の枠で示しています。対象はそのまま操作できます。</div><div class="dpro-tutorial-actions"><button class="dpro-tutorial-back" type="button" ${s.n===1?"disabled":""}>戻る</button><button class="dpro-tutorial-skip" type="button">スキップ</button><button class="dpro-tutorial-next" type="button">${s.n===10?"完了":"次へ"}</button></div></div>`;
    content.querySelector(".dpro-tutorial-back").onclick=backStep;
    content.querySelector(".dpro-tutorial-skip").onclick=skipStep;
    content.querySelector(".dpro-tutorial-next").onclick=nextStep;
    requestAnimationFrame(()=>{placeCard();ensureTargetVisible();observeTarget();});
  }

  function observeTarget(){ resizeObserver?.disconnect(); const t=resolveTarget(); if(window.ResizeObserver&&t){resizeObserver=new ResizeObserver(updateHighlight);resizeObserver.observe(t);} }
  function markCurrentCompleted(){ const n=step().n; if(!state.completedSteps.includes(n)) state.completedSteps=[...state.completedSteps,n].sort((a,b)=>a-b); }
  function nextStep(){
    const n=step().n; markCurrentCompleted();
    if(n>=10){ setState({status:"completed",currentStep:10}); render(); return; }
    restoreIndexPreview(); setState({status:"active",currentStep:n+1}); const next=step(); if(!pageMatches(next)) location.href=hrefFor(next); else render();
  }
  function backStep(){ const n=step().n; if(n<=1)return; restoreIndexPreview(); setState({status:"active",currentStep:n-1}); const prev=step(); if(!pageMatches(prev)) location.href=hrefFor(prev); else render(); }
  function skipStep(){ const n=step().n; if(!state.skippedSteps.includes(n)) state.skippedSteps=[...state.skippedSteps,n].sort((a,b)=>a-b); nextStep(); }
  function replay(){ setState({...defaultState(),status:"active",currentStep:1,completedSteps:[],skippedSteps:[]}); openTutorial(true); if(!pageMatches(step())) location.href=hrefFor(step()); else render(); }
  function resumeOrStart(){ if(state.status==="idle"||state.status==="completed") setState({...defaultState(),status:"active",currentStep:1}); else setState({status:"active"}); openTutorial(true); const s=step(); if(!pageMatches(s)) location.href=hrefFor(s); else render(); }

  function openTutorial(fromControl=false){
    if(isOpen)return; restoreFocus=fromControl?document.activeElement:null; isOpen=true; q("#dpro-tutorial-card").dataset.open="1"; q("#dpro-tutorial-launcher").style.display="none"; q("#dpro-tutorial-menu").dataset.open="0"; render();
  }
  function closeTutorial(){
    if(!isOpen)return; restoreIndexPreview(); isOpen=false; dragging=null; resizeObserver?.disconnect(); q("#dpro-tutorial-card").dataset.open="0"; q("#dpro-tutorial-highlight").style.display="none"; q("#dpro-tutorial-launcher").style.display=""; if(state.status==="active") setState({status:"paused"}); const target=restoreFocus&&restoreFocus.isConnected?restoreFocus:resolveTarget(); restoreFocus=null; target?.focus?.({preventScroll:true});
  }

  function maybeAutoStart(){
    const params=new URLSearchParams(location.search); const requested=params.get("tutorial")==="1";
    if(requested){ if(state.status==="idle") setState({status:"active"}); else if(state.status==="paused") setState({status:"active"}); openTutorial(false); }
    else if(state.status==="active" && pageMatches(step())) openTutorial(false);
  }

  function init(){ injectDom(); maybeAutoStart(); }
  window.DPRO_CARETAXI_TUTORIAL={VERSION,STEPS,start:resumeOrStart,replay,getState:()=>({...state}),open:()=>openTutorial(true),close:closeTutorial};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();
