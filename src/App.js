import { useState, useRef, useCallback, useEffect } from "react";

const API_BASE = "https://quilt-talisman-sadly.ngrok-free.dev";
// ngrok free tier shows an HTML interstitial to browser traffic unless this header is sent
const NGROK_HEADERS = {"ngrok-skip-browser-warning":"1"};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --white:#ffffff;--paper:#f5f7f9;--paper-alt:#eceff3;
    --line:#dee3e9;--line-strong:#c7cfd9;
    --ink-900:#0b1220;--ink-700:#1b2a41;--ink-500:#3d5266;--slate-400:#7c8b9c;
    --teal-900:#083a36;--teal-700:#0b5b56;--teal-600:#0f766e;--teal-50:#eaf6f4;
    --red-900:#5c1710;--red-700:#8c2318;--red-600:#a3291d;--red-50:#fbeeec;
    --amber-700:#92400e;--amber-50:#fdf3e7;
    --serif:'Source Serif 4',Georgia,serif;--sans:'IBM Plex Sans',sans-serif;--mono:'IBM Plex Mono',monospace;
    --shadow-sm:0 1px 2px rgba(11,18,32,0.06),0 1px 1px rgba(11,18,32,0.04);
    --shadow:0 2px 10px rgba(11,18,32,0.07);--shadow-lg:0 12px 32px rgba(11,18,32,0.14);
    --radius:10px;--radius-sm:6px;
  }
  html,body,#root{height:100%;font-family:var(--sans);background:var(--paper);color:var(--ink-900);-webkit-font-smoothing:antialiased;}
  button{font-family:var(--sans);cursor:pointer;}
  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:var(--paper-alt);}
  ::-webkit-scrollbar-thumb{background:var(--line-strong);border-radius:99px;}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.45;}}
  @keyframes shimmer{0%{background-position:-400px 0;}100%{background-position:400px 0;}}
  .fade-in{animation:fadeIn 0.35s ease forwards;}
  .spin{animation:spin 0.8s linear infinite;}
  .pulse{animation:pulse 2s ease infinite;}
`;

function injectCSS(){
  useEffect(()=>{
    const el=document.createElement("style");
    el.textContent=GLOBAL_CSS;
    document.head.appendChild(el);
    return ()=>document.head.removeChild(el);
  },[]);
}

function Card({children,style={},className=""}){
  return(
    <div className={className} style={{background:"var(--white)",borderRadius:"var(--radius)",border:"1px solid var(--line)",boxShadow:"var(--shadow-sm)",...style}}>
      {children}
    </div>
  );
}

function Badge({children,color="ink"}){
  const map={
    ink:{bg:"var(--paper-alt)",color:"var(--ink-700)",border:"var(--line-strong)"},
    teal:{bg:"var(--teal-50)",color:"var(--teal-700)",border:"#c9e7e2"},
    red:{bg:"var(--red-50)",color:"var(--red-700)",border:"#eeccc5"},
    amber:{bg:"var(--amber-50)",color:"var(--amber-700)",border:"#f3ddb0"},
  };
  const s=map[color]||map.ink;
  return(
    <span style={{display:"inline-flex",alignItems:"center",padding:"2px 10px",borderRadius:4,fontSize:11,fontWeight:600,letterSpacing:"0.03em",background:s.bg,color:s.color,border:`1px solid ${s.border}`}}>
      {children}
    </span>
  );
}

function StatBar({label,value,max=100,color="var(--teal-600)"}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:12,color:"var(--ink-500)",width:130,flexShrink:0}}>{label}</span>
      <div style={{flex:1,height:6,background:"var(--paper-alt)",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:3,background:color,width:`${Math.min((value/max)*100,100)}%`,transition:"width 1.2s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
      <span style={{fontSize:12,fontFamily:"var(--mono)",color:"var(--ink-700)",width:46,textAlign:"right",flexShrink:0}}>
        {typeof value==="number"?value.toFixed(value>10?1:4):value}
      </span>
    </div>
  );
}

function UploadZone({onFile,file,dragOver,setDragOver,inputRef}){
  return(
    <div
      onClick={()=>inputRef.current?.click()}
      onDragOver={e=>{e.preventDefault();setDragOver(true);}}
      onDragLeave={()=>setDragOver(false)}
      onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)onFile(f);}}
      style={{border:`1.5px dashed ${dragOver?"var(--teal-600)":"var(--line-strong)"}`,borderRadius:"var(--radius)",padding:"40px 24px",textAlign:"center",cursor:"pointer",background:dragOver?"var(--teal-50)":"var(--paper)",transition:"all 0.2s"}}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])onFile(e.target.files[0]);}}/>
      <div style={{width:48,height:48,borderRadius:8,background:dragOver?"var(--teal-50)":"var(--white)",border:"1px solid var(--line)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:20,boxShadow:"var(--shadow-sm)",color:"var(--teal-700)"}}>⊕</div>
      {file?(
        <>
          <p style={{fontWeight:600,fontSize:14,color:"var(--ink-700)",marginBottom:4}}>{file.name}</p>
          <p style={{fontSize:12,color:"var(--slate-400)"}}>Click to select a different image</p>
        </>
      ):(
        <>
          <p style={{fontWeight:600,fontSize:14,color:"var(--ink-700)",marginBottom:4}}>Upload peripheral blood smear image</p>
          <p style={{fontSize:12,color:"var(--slate-400)"}}>Drag and drop, or click to browse · PNG, JPG, BMP, TIFF · max 20 MB</p>
        </>
      )}
    </div>
  );
}

function ReportStamp({result}){
  const isPos=result.label_id===1;
  const accent = isPos ? "var(--red-700)" : "var(--teal-700)";
  const bg     = isPos ? "var(--red-50)"  : "var(--teal-50)";
  const border = isPos ? "#eeccc5" : "#c9e7e2";
  return(
    <div style={{borderRadius:"var(--radius)",background:"var(--white)",border:`1px solid ${border}`,borderLeft:`4px solid ${accent}`,overflow:"hidden"}}>
      <div style={{padding:"8px 20px",background:bg,borderBottom:`1px solid ${border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
        <span style={{fontSize:10.5,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:accent}}>AI-Assisted Analysis · Research Use Only</span>
        <span style={{fontSize:10.5,color:accent,fontFamily:"var(--mono)"}}>Ensemble v2 · majority vote</span>
      </div>
      <div style={{padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div>
          <p style={{fontSize:11,color:"var(--slate-400)",fontWeight:600,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Classification</p>
          <p style={{fontSize:26,fontWeight:600,fontFamily:"var(--serif)",color:accent}}>{result.label}</p>
        </div>
        <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:11,color:"var(--slate-400)",marginBottom:2}}>Confidence</p>
            <p style={{fontSize:20,fontWeight:600,fontFamily:"var(--mono)",color:"var(--ink-900)"}}>{result.confidence}%</p>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:11,color:"var(--slate-400)",marginBottom:2}}>Inference time</p>
            <p style={{fontSize:20,fontWeight:600,fontFamily:"var(--mono)",color:"var(--ink-900)"}}>{result.inference_ms}ms</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassifierCard({name,vote,prob,color}){
  const isPos=vote===1;
  return(
    <div style={{borderRadius:"var(--radius-sm)",border:"1px solid var(--line)",background:"var(--paper)",padding:"14px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:12,fontWeight:600,color:"var(--ink-700)"}}>{name}</span>
        <Badge color={isPos?"red":"teal"}>{isPos?"ALL +":"Normal"}</Badge>
      </div>
      <div style={{height:5,background:"var(--white)",borderRadius:3,overflow:"hidden",marginBottom:6,border:"1px solid var(--line)"}}>
        <div style={{height:"100%",width:`${prob}%`,background:color,borderRadius:3,transition:"width 1s ease"}}/>
      </div>
      <p style={{fontSize:11,color:"var(--slate-400)",fontFamily:"var(--mono)"}}>{prob}% probability</p>
    </div>
  );
}

function FeatureTile({k,v}){
  const labels={nucleus_area_px:"Nucleus Area",nucleus_pixels:"Nucleus Pixels",circularity:"Circularity",solidity:"Solidity",nc_ratio:"N/C Ratio",eccentricity:"Eccentricity",glcm_contrast:"GLCM Contrast",glcm_energy:"GLCM Energy",glcm_homogeneity:"GLCM Homogeneity",glcm_correlation:"GLCM Correlation",mean_intensity_R:"Mean R Channel",mean_intensity_G:"Mean G Channel",mean_intensity_B:"Mean B Channel"};
  return(
    <div style={{background:"var(--paper)",borderRadius:"var(--radius-sm)",border:"1px solid var(--line)",padding:"12px 14px"}}>
      <p style={{fontSize:10,color:"var(--slate-400)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{labels[k]||k}</p>
      <p style={{fontSize:15,fontWeight:600,fontFamily:"var(--mono)",color:"var(--ink-900)"}}>{typeof v==="number"?(v>100?Math.round(v):v.toFixed(4)):v}</p>
    </div>
  );
}

function Skeleton({h=20,w="100%",radius=6}){
  return(
    <div style={{height:h,width:w,borderRadius:radius,background:"linear-gradient(90deg,#eceff3 25%,#dee3e9 50%,#eceff3 75%)",backgroundSize:"400px 100%",animation:"shimmer 1.4s ease infinite"}}/>
  );
}

function HistoryRow({record}){
  const isPos=record.label_id===1;
  const date=new Date(record.timestamp);
  const dateStr=date.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
  const timeStr=date.toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"});
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 100px 90px 90px 120px",gap:12,alignItems:"center",padding:"14px 16px",borderBottom:"1px solid var(--line)"}}>
      <div>
        <p style={{fontSize:13,fontWeight:600,color:"var(--ink-700)",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{record.filename||"unnamed"}</p>
        <p style={{fontSize:11,color:"var(--slate-400)"}}>{dateStr} · {timeStr}</p>
      </div>
      <div><Badge color={isPos?"red":"teal"}>{record.label||(isPos?"ALL +":"Normal")}</Badge></div>
      <div style={{fontSize:13,fontFamily:"var(--mono)",color:"var(--ink-700)"}}>{record.confidence}%</div>
      <div style={{fontSize:12,fontFamily:"var(--mono)",color:"var(--slate-400)"}}>{record.inference_ms}ms</div>
      <div style={{display:"flex",gap:4}}>
        {record.votes&&Object.entries(record.votes).map(([k,v])=>(
          <span key={k} title={k} style={{fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:4,background:v===1?"var(--red-50)":"var(--teal-50)",color:v===1?"var(--red-700)":"var(--teal-700)"}}>{k[0]}</span>
        ))}
      </div>
    </div>
  );
}

function HistoryView({history,loading,error,summary,onRefresh,onClear}){
  return(
    <div className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontSize:19,fontWeight:600,fontFamily:"var(--serif)",color:"var(--ink-900)",marginBottom:4}}>Case History</h2>
          <p style={{fontSize:12,color:"var(--slate-400)"}}>Persisted on disk · {history.length} record{history.length===1?"":"s"} shown</p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <Badge color="red">ALL+ {summary.ALL_positive||0}</Badge>
          <Badge color="teal">Normal {summary.Normal||0}</Badge>
          <button onClick={onRefresh} style={{padding:"6px 14px",borderRadius:"var(--radius-sm)",border:"1px solid var(--line-strong)",background:"var(--white)",fontSize:12,fontWeight:600,color:"var(--ink-700)"}}>↻ Refresh</button>
          <button onClick={onClear} style={{padding:"6px 14px",borderRadius:"var(--radius-sm)",border:"1px solid #eeccc5",background:"var(--red-50)",fontSize:12,fontWeight:600,color:"var(--red-700)"}}>Clear All</button>
        </div>
      </div>

      {error&&(
        <div style={{marginBottom:14,padding:"12px 16px",background:"var(--red-50)",borderRadius:"var(--radius-sm)",border:"1px solid #eeccc5",fontSize:13,color:"var(--red-700)"}}>
          ⚠ {error}
        </div>
      )}

      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 100px 90px 90px 120px",gap:12,padding:"12px 16px",background:"var(--paper)",borderBottom:"1px solid var(--line)"}}>
          {["File / Time","Result","Confidence","Latency","Votes"].map(h=>(
            <span key={h} style={{fontSize:11,fontWeight:700,color:"var(--slate-400)",textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</span>
          ))}
        </div>

        {loading&&(
          <div style={{padding:24,display:"flex",flexDirection:"column",gap:10}}>
            <Skeleton h={40} radius={6}/><Skeleton h={40} radius={6}/><Skeleton h={40} radius={6}/>
          </div>
        )}

        {!loading&&history.length===0&&(
          <div style={{padding:48,textAlign:"center"}}>
            <p style={{fontSize:13,color:"var(--slate-400)"}}>No predictions yet. Run an analysis to see it appear here.</p>
          </div>
        )}

        {!loading&&history.map(r=>(<HistoryRow key={r.id} record={r}/>))}
      </Card>
    </div>
  );
}

function LoginScreen({onLoggedIn}){
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);

  const submit=async(e)=>{
    e.preventDefault();
    if(!password||loading)return;
    setLoading(true);setError(null);
    try{
      const res=await fetch(`${API_BASE}/api/auth/login`,{
        method:"POST",
        headers:{...NGROK_HEADERS,"Content-Type":"application/json"},
        body:JSON.stringify({password}),
      });
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw new Error(data.detail||`HTTP ${res.status}`);
      onLoggedIn(data.token);
    }catch(e){setError(e.message||"Login failed. Check your connection.");}
    finally{setLoading(false);}
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--ink-900)",padding:24}}>
      <Card style={{padding:"40px 36px",width:"100%",maxWidth:380,border:"1px solid var(--ink-700)"}} className="fade-in">
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:44,height:44,borderRadius:8,background:"var(--teal-700)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
            <span style={{color:"white",fontSize:18,fontFamily:"var(--serif)",fontWeight:600}}>+</span>
          </div>
          <h1 style={{fontSize:19,fontWeight:600,fontFamily:"var(--serif)",color:"var(--ink-900)",marginBottom:6}}>ALL Detection System</h1>
          <p style={{fontSize:12,color:"var(--slate-400)"}}>Restricted access · Authorized personnel only</p>
        </div>
        <form onSubmit={submit}>
          <label style={{fontSize:11,fontWeight:600,color:"var(--ink-500)",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.04em"}}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
            style={{width:"100%",padding:"11px 14px",borderRadius:"var(--radius-sm)",border:"1px solid var(--line-strong)",fontSize:14,fontFamily:"var(--sans)",marginBottom:14,outline:"none"}}
          />
          {error&&(
            <div style={{marginBottom:14,padding:"10px 14px",background:"var(--red-50)",borderRadius:"var(--radius-sm)",border:"1px solid #eeccc5",fontSize:13,color:"var(--red-700)"}}>
              ⚠ {error}
            </div>
          )}
          <button type="submit" disabled={loading||!password} style={{width:"100%",padding:"12px 0",borderRadius:"var(--radius-sm)",border:"none",background:loading||!password?"var(--paper-alt)":"var(--teal-700)",color:loading||!password?"var(--slate-400)":"white",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {loading?<><div className="spin" style={{width:16,height:16,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%"}}/>Signing in…</>:"Sign In"}
          </button>
        </form>
        <p style={{fontSize:11,color:"var(--slate-400)",textAlign:"center",marginTop:20,lineHeight:1.6}}>
          Multi-Stage Ensemble Learning System for research use.<br/>Not intended for standalone clinical diagnosis.
        </p>
      </Card>
    </div>
  );
}

export default function App(){
  injectCSS();
  const [file,setFile]=useState(null);
  const [preview,setPreview]=useState(null);
  const [dragOver,setDragOver]=useState(false);
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [error,setError]=useState(null);
  const [apiOk,setApiOk]=useState(null);
  const [activeTab,setActiveTab]=useState("predict"); // "predict" | "history"
  const [history,setHistory]=useState([]);
  const [historyLoading,setHistoryLoading]=useState(false);
  const [historyError,setHistoryError]=useState(null);
  const [historySummary,setHistorySummary]=useState({ALL_positive:0,Normal:0});
  const inputRef=useRef();

  // ── Auth ──────────────────────────────────────────────────────────────
  const [token,setToken]=useState(()=>localStorage.getItem("all_auth_token"));
  const [authChecked,setAuthChecked]=useState(false);

  const authHeaders=useCallback((extra={})=>({
    ...NGROK_HEADERS,...extra,
    ...(token?{Authorization:`Bearer ${token}`}:{}),
  }),[token]);

  const logout=useCallback(()=>{
    localStorage.removeItem("all_auth_token");
    setToken(null);
  },[]);

  useEffect(()=>{
    if(!token){setAuthChecked(true);return;}
    fetch(`${API_BASE}/api/auth/check`,{headers:authHeaders()})
      .then(r=>{if(!r.ok)throw new Error("invalid");return r.json();})
      .then(()=>setAuthChecked(true))
      .catch(()=>{logout();setAuthChecked(true);});
  },[token,authHeaders,logout]);

  useEffect(()=>{
    fetch(`${API_BASE}/api/health`,{headers:NGROK_HEADERS})
      .then(r=>r.json())
      .then(d=>setApiOk(d.models_ready===true))
      .catch(()=>setApiOk(false));
  },[]);

  const fetchHistory=useCallback(async()=>{
    setHistoryLoading(true);setHistoryError(null);
    try{
      const res=await fetch(`${API_BASE}/api/history`,{headers:authHeaders()});
      if(res.status===401){logout();return;}
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      setHistory(data.records||[]);
      setHistorySummary(data.summary||{ALL_positive:0,Normal:0});
    }catch(e){setHistoryError(e.message);}
    finally{setHistoryLoading(false);}
  },[authHeaders,logout]);

  useEffect(()=>{
    if(activeTab==="history")fetchHistory();
  },[activeTab,fetchHistory]);

  const clearHistory=async()=>{
    if(!window.confirm("Clear all prediction history? This cannot be undone."))return;
    try{
      const res=await fetch(`${API_BASE}/api/history`,{method:"DELETE",headers:authHeaders()});
      if(res.status===401){logout();return;}
      fetchHistory();
    }catch(e){setHistoryError(e.message);}
  };

  const handleFile=useCallback(f=>{
    setFile(f);setResult(null);setError(null);
    setPreview(URL.createObjectURL(f));
  },[]);

  const analyse=async()=>{
    if(!file||loading)return;
    setLoading(true);setResult(null);setError(null);
    const form=new FormData();
    form.append("file",file);
    try{
      const res=await fetch(`${API_BASE}/api/predict`,{method:"POST",body:form,headers:authHeaders()});
      if(res.status===401){logout();return;}
      if(!res.ok){const e=await res.json().catch(()=>({detail:"Unknown error"}));throw new Error(e.detail||`HTTP ${res.status}`);}
      setResult(await res.json());
      if(activeTab==="history")fetchHistory();
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  };

  if(!authChecked){
    return(
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--paper)"}}>
        <div className="spin" style={{width:26,height:26,border:"3px solid var(--line)",borderTopColor:"var(--teal-600)",borderRadius:"50%"}}/>
      </div>
    );
  }

  if(!token){
    return <LoginScreen onLoggedIn={t=>{localStorage.setItem("all_auth_token",t);setToken(t);}}/>;
  }

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>

      {/* LETTERHEAD */}
      <nav style={{background:"var(--ink-900)",padding:"0 32px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:28,height:28,borderRadius:6,background:"var(--teal-700)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--serif)",fontWeight:600,color:"white",fontSize:14}}>+</div>
          <div>
            <span style={{fontFamily:"var(--serif)",fontWeight:600,fontSize:15,color:"white"}}>ALL Detection System</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",background:"rgba(255,255,255,0.06)",borderRadius:6,padding:3,border:"1px solid rgba(255,255,255,0.1)"}}>
            {[{k:"predict",label:"Analyze"},{k:"history",label:"Case History"}].map(t=>(
              <button key={t.k} onClick={()=>setActiveTab(t.k)} style={{padding:"6px 14px",borderRadius:4,border:"none",fontSize:12,fontWeight:600,background:activeTab===t.k?"var(--teal-700)":"transparent",color:activeTab===t.k?"white":"rgba(255,255,255,0.65)",transition:"all 0.2s"}}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:99,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.75)"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:apiOk===null?"#7c8b9c":apiOk?"#2ea88f":"#c0574a",...(apiOk&&{animation:"pulse 2s infinite"})}}/>
            {apiOk===null?"Checking…":apiOk?"Model Online":"Model Offline"}
          </div>
          <button onClick={logout} title="Log out" style={{padding:"6px 12px",borderRadius:4,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.65)"}}>Log out</button>
        </div>
      </nav>

      {/* PAGE HEADER */}
      {activeTab==="predict"&&(
      <div style={{background:"var(--white)",borderBottom:"1px solid var(--line)",padding:"32px 32px 28px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--teal-700)",marginBottom:8}}>Peripheral Blood Smear Analysis</p>
          <h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(22px,3vw,32px)",fontWeight:600,lineHeight:1.25,color:"var(--ink-900)",marginBottom:10,maxWidth:640}}>
            Acute Lymphoblastic Leukemia Detection
          </h1>
          <p style={{fontSize:14,color:"var(--ink-500)",maxWidth:620,lineHeight:1.65,marginBottom:16}}>
            A multi-stage ensemble evaluates uploaded blood smear images using deep and handcrafted morphological features. Results are produced for research reference and are not a substitute for professional pathological review.
          </p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {["Bilateral Filter","ResNet50 (2048-d)","GLCM + Shape","PCA Fusion","SVM · RF · GB","Stacking Ensemble"].map(t=>(
              <span key={t} style={{padding:"3px 10px",borderRadius:4,background:"var(--paper)",border:"1px solid var(--line)",fontSize:11,fontWeight:500,color:"var(--ink-500)",fontFamily:"var(--mono)"}}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* MAIN */}
      <main style={{flex:1,maxWidth:1100,width:"100%",margin:"0 auto",padding:activeTab==="predict"?"28px 24px 48px":"32px 24px 48px"}}>

        {activeTab==="history"&&(
          <HistoryView
            history={history}
            loading={historyLoading}
            error={historyError}
            summary={historySummary}
            onRefresh={fetchHistory}
            onClear={clearHistory}
          />
        )}

        {activeTab==="predict"&&(<>
        <Card style={{padding:24,marginBottom:20}}>
          <h2 style={{fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:"var(--slate-400)",marginBottom:16}}>Specimen Upload</h2>
          <UploadZone onFile={handleFile} file={file} dragOver={dragOver} setDragOver={setDragOver} inputRef={inputRef}/>

          {file&&(
            <div style={{display:"grid",gridTemplateColumns:result?.preview_b64?"1fr 1fr":"1fr",gap:12,marginTop:16}}>
              <div style={{borderRadius:"var(--radius-sm)",overflow:"hidden",border:"1px solid var(--line)"}}>
                <img src={preview} alt="Original" style={{width:"100%",height:180,objectFit:"cover",display:"block"}}/>
                <div style={{padding:"8px 12px",background:"var(--paper)",fontSize:11,color:"var(--ink-500)",fontWeight:500,borderTop:"1px solid var(--line)"}}>Original specimen</div>
              </div>
              {result?.preview_b64&&(
                <div style={{borderRadius:"var(--radius-sm)",overflow:"hidden",border:"1px solid var(--line)"}}>
                  <img src={`data:image/png;base64,${result.preview_b64}`} alt="Processed" style={{width:"100%",height:180,objectFit:"cover",display:"block"}}/>
                  <div style={{padding:"8px 12px",background:"var(--paper)",fontSize:11,color:"var(--ink-500)",fontWeight:500,borderTop:"1px solid var(--line)"}}>Segmented nucleus boundary</div>
                </div>
              )}
            </div>
          )}

          {file&&(
            <button onClick={analyse} disabled={loading} style={{marginTop:16,width:"100%",padding:"13px 0",borderRadius:"var(--radius-sm)",border:"none",background:loading?"var(--paper-alt)":"var(--teal-700)",color:loading?"var(--slate-400)":"white",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s"}}>
              {loading?<><div className="spin" style={{width:18,height:18,border:"2px solid rgba(255,255,255,0.35)",borderTopColor:"white",borderRadius:"50%"}}/>Analyzing specimen…</>:"Run Analysis"}
            </button>
          )}

          {error&&(
            <div style={{marginTop:14,padding:"12px 16px",background:"var(--red-50)",borderRadius:"var(--radius-sm)",border:"1px solid #eeccc5",fontSize:13,color:"var(--red-700)"}}>
              ⚠ {error}
            </div>
          )}
        </Card>

        {loading&&(
          <Card style={{padding:24,marginBottom:20}} className="fade-in">
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Skeleton h={32} radius={6}/><Skeleton h={16} w="60%" radius={4}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                <Skeleton h={90} radius={6}/><Skeleton h={90} radius={6}/><Skeleton h={90} radius={6}/>
              </div>
              <Skeleton h={100} radius={6}/>
            </div>
          </Card>
        )}

        {result&&!loading&&(
          <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:20}}>
            <ReportStamp result={result}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <Card style={{padding:24}}>
                <h3 style={{fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:"var(--slate-400)",marginBottom:16}}>Classifier Votes</h3>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <ClassifierCard name="Support Vector Machine" vote={result.votes.SVM} prob={result.classifier_probs.SVM} color="var(--teal-600)"/>
                  <ClassifierCard name="Random Forest" vote={result.votes.RF} prob={result.classifier_probs.RF} color="var(--ink-500)"/>
                  <ClassifierCard name="Gradient Boosting" vote={result.votes.GB} prob={result.classifier_probs.GB} color="var(--amber-700)"/>
                </div>
                <div style={{marginTop:14,padding:"10px 14px",background:"var(--paper)",borderRadius:"var(--radius-sm)",border:"1px solid var(--line)",fontSize:11,color:"var(--slate-400)",fontFamily:"var(--mono)"}}>
                  hard majority vote · 2-of-3 classifier agreement
                </div>
              </Card>

              <Card style={{padding:24}}>
                <h3 style={{fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:"var(--slate-400)",marginBottom:16}}>Class Probabilities</h3>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <StatBar label="ALL-Positive" value={result.probabilities.ALL} max={100} color="var(--red-600)"/>
                  <StatBar label="Normal" value={result.probabilities.Normal} max={100} color="var(--teal-600)"/>
                </div>
                <div style={{height:1,background:"var(--line)",margin:"20px 0"}}/>
                <h3 style={{fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:"var(--slate-400)",marginBottom:14}}>Model Performance (test set)</h3>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <StatBar label="Accuracy"  value={92.02} color="var(--teal-600)"/>
                  <StatBar label="Precision" value={99.17} color="var(--ink-500)"/>
                  <StatBar label="Recall"    value={90.66} color="var(--amber-700)"/>
                  <StatBar label="F1-Score"  value={94.72} color="var(--teal-700)"/>
                  <StatBar label="ROC-AUC"   value={98.71} color="var(--ink-700)"/>
                </div>
              </Card>
            </div>

            <Card style={{padding:24}}>
              <h3 style={{fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:"var(--slate-400)",marginBottom:16}}>Extracted Diagnostic Features</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
                {Object.entries(result.features).map(([k,v])=>(<FeatureTile key={k} k={k} v={v}/>))}
              </div>
              <div style={{marginTop:14,padding:"10px 14px",background:"var(--paper)",borderRadius:"var(--radius-sm)",border:"1px solid var(--line)",fontSize:11,color:"var(--ink-500)",display:"flex",gap:6,flexWrap:"wrap",fontFamily:"var(--mono)"}}>
                <span style={{fontWeight:600,color:"var(--slate-400)"}}>Pipeline:</span>
                {["Bilateral filter","Otsu segmentation","ResNet50 2048-d","GLCM 18-d","Shape 10-d","Stats 15-d","L2 norm","PCA 100-d"].map(s=>(
                  <span key={s} style={{padding:"1px 8px",borderRadius:4,background:"var(--white)",border:"1px solid var(--line)",fontSize:10,fontWeight:500}}>{s}</span>
                ))}
              </div>
            </Card>
          </div>
        )}

        {!file&&!result&&(
          <Card style={{padding:48,textAlign:"center"}}>
            <h3 style={{fontSize:17,fontWeight:600,fontFamily:"var(--serif)",color:"var(--ink-900)",marginBottom:8}}>Awaiting Specimen</h3>
            <p style={{fontSize:13,color:"var(--slate-400)",maxWidth:400,margin:"0 auto"}}>
              Upload a peripheral blood smear image above. The system runs the full ensemble pipeline and returns a classification in seconds.
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginTop:32,textAlign:"left"}}>
              {[
                {title:"Preprocessing",desc:"Bilateral filtering + Otsu WBC nucleus segmentation"},
                {title:"Feature Extraction",desc:"ResNet50 deep features + GLCM + Shape + Statistical (2,091-d)"},
                {title:"Ensemble Classification",desc:"SVM + Random Forest + Gradient Boosting combined by majority vote"},
              ].map((c,i)=>(
                <div key={c.title} style={{padding:16,borderRadius:"var(--radius-sm)",background:"var(--paper)",border:"1px solid var(--line)",borderTop:"2px solid var(--teal-600)"}}>
                  <p style={{fontSize:10,fontWeight:700,color:"var(--teal-700)",fontFamily:"var(--mono)",marginBottom:6}}>STAGE {i+1}</p>
                  <p style={{fontSize:13,fontWeight:600,color:"var(--ink-700)",marginBottom:4}}>{c.title}</p>
                  <p style={{fontSize:11,color:"var(--slate-400)",lineHeight:1.6}}>{c.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
        </>)}
      </main>

      <footer style={{borderTop:"1px solid var(--line)",background:"var(--white)",padding:"20px 32px",textAlign:"center",fontSize:11,color:"var(--slate-400)"}}>
        Multi-Stage Ensemble Learning System for ALL Detection ·
      </footer>
    </div>
  );
}
