import { useState, useRef, useCallback, useEffect } from "react";

const API_BASE = "https://quilt-talisman-sadly.ngrok-free.dev";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --white:#ffffff;--offwhite:#f8fafc;--gray-50:#f1f5f9;--gray-100:#e2e8f0;
    --gray-200:#cbd5e1;--gray-400:#94a3b8;--gray-600:#475569;--gray-800:#1e293b;--gray-900:#0f172a;
    --blue-50:#eff6ff;--blue-100:#dbeafe;--blue-500:#3b82f6;--blue-600:#2563eb;--blue-700:#1d4ed8;
    --red-50:#fef2f2;--red-100:#fee2e2;--red-500:#ef4444;--red-600:#dc2626;
    --green-50:#f0fdf4;--green-100:#dcfce7;--green-500:#22c55e;--green-600:#16a34a;
    --purple-50:#faf5ff;--purple-500:#a855f7;--amber-50:#fffbeb;--amber-500:#f59e0b;
    --sans:'Inter',sans-serif;--mono:'JetBrains Mono',monospace;
    --shadow-sm:0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04);
    --shadow:0 4px 16px rgba(0,0,0,0.08);--shadow-lg:0 10px 40px rgba(0,0,0,0.12);
    --radius:14px;--radius-sm:8px;
  }
  html,body,#root{height:100%;font-family:var(--sans);background:var(--offwhite);color:var(--gray-900);-webkit-font-smoothing:antialiased;}
  button{font-family:var(--sans);cursor:pointer;}
  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:var(--gray-50);}
  ::-webkit-scrollbar-thumb{background:var(--gray-200);border-radius:99px;}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
  @keyframes shimmer{0%{background-position:-400px 0;}100%{background-position:400px 0;}}
  .fade-in{animation:fadeIn 0.4s ease forwards;}
  .spin{animation:spin 0.8s linear infinite;}
  .pulse{animation:pulse 1.8s ease infinite;}
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
    <div className={className} style={{background:"var(--white)",borderRadius:"var(--radius)",border:"1px solid var(--gray-100)",boxShadow:"var(--shadow-sm)",...style}}>
      {children}
    </div>
  );
}

function Badge({children,color="blue"}){
  const map={
    blue:{bg:"var(--blue-50)",color:"var(--blue-600)",border:"var(--blue-100)"},
    red:{bg:"var(--red-50)",color:"var(--red-600)",border:"var(--red-100)"},
    green:{bg:"var(--green-50)",color:"var(--green-600)",border:"var(--green-100)"},
    gray:{bg:"var(--gray-50)",color:"var(--gray-600)",border:"var(--gray-100)"},
    purple:{bg:"var(--purple-50)",color:"var(--purple-500)",border:"#ede9fe"},
    amber:{bg:"var(--amber-50)",color:"var(--amber-500)",border:"#fde68a"},
  };
  const s=map[color]||map.blue;
  return(
    <span style={{display:"inline-flex",alignItems:"center",padding:"2px 10px",borderRadius:99,fontSize:11,fontWeight:600,letterSpacing:"0.03em",background:s.bg,color:s.color,border:`1px solid ${s.border}`}}>
      {children}
    </span>
  );
}

function StatBar({label,value,max=100,color="var(--blue-500)"}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:12,color:"var(--gray-600)",width:130,flexShrink:0}}>{label}</span>
      <div style={{flex:1,height:6,background:"var(--gray-100)",borderRadius:99,overflow:"hidden"}}>
        <div style={{height:"100%",borderRadius:99,background:color,width:`${Math.min((value/max)*100,100)}%`,transition:"width 1.2s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
      <span style={{fontSize:12,fontFamily:"var(--mono)",color:"var(--gray-800)",width:46,textAlign:"right",flexShrink:0}}>
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
      style={{border:`2px dashed ${dragOver?"var(--blue-500)":"var(--gray-200)"}`,borderRadius:"var(--radius)",padding:"40px 24px",textAlign:"center",cursor:"pointer",background:dragOver?"var(--blue-50)":"var(--gray-50)",transition:"all 0.2s"}}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])onFile(e.target.files[0]);}}/>
      <div style={{width:52,height:52,borderRadius:14,background:dragOver?"var(--blue-100)":"var(--white)",border:"1px solid var(--gray-200)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:24,boxShadow:"var(--shadow-sm)"}}>🔬</div>
      {file?(
        <>
          <p style={{fontWeight:600,fontSize:14,color:"var(--gray-800)",marginBottom:4}}>{file.name}</p>
          <p style={{fontSize:12,color:"var(--gray-400)"}}>Click to change image</p>
        </>
      ):(
        <>
          <p style={{fontWeight:600,fontSize:14,color:"var(--gray-800)",marginBottom:4}}>Drop blood smear image here</p>
          <p style={{fontSize:12,color:"var(--gray-400)"}}>or click to browse · PNG, JPG, BMP, TIFF · max 20 MB</p>
        </>
      )}
    </div>
  );
}

function VerdictBanner({result}){
  const isPos=result.label_id===1;
  return(
    <div style={{borderRadius:"var(--radius)",background:isPos?"var(--red-50)":"var(--green-50)",border:`1px solid ${isPos?"var(--red-100)":"var(--green-100)"}`,padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:isPos?"var(--red-100)":"var(--green-100)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>
          {isPos?"⚠️":"✅"}
        </div>
        <div>
          <p style={{fontSize:11,color:isPos?"var(--red-600)":"var(--green-600)",fontWeight:600,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>Classification Result</p>
          <p style={{fontSize:24,fontWeight:800,color:isPos?"var(--red-600)":"var(--green-600)"}}>{result.label}</p>
        </div>
      </div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
        <div style={{textAlign:"right"}}>
          <p style={{fontSize:11,color:"var(--gray-400)",marginBottom:2}}>Confidence</p>
          <p style={{fontSize:22,fontWeight:700,fontFamily:"var(--mono)",color:isPos?"var(--red-600)":"var(--green-600)"}}>{result.confidence}%</p>
        </div>
        <div style={{textAlign:"right"}}>
          <p style={{fontSize:11,color:"var(--gray-400)",marginBottom:2}}>Inference</p>
          <p style={{fontSize:22,fontWeight:700,fontFamily:"var(--mono)",color:"var(--gray-800)"}}>{result.inference_ms}ms</p>
        </div>
      </div>
    </div>
  );
}

function ClassifierCard({name,vote,prob,color}){
  const isPos=vote===1;
  return(
    <div style={{borderRadius:"var(--radius-sm)",border:`1px solid ${isPos?"var(--red-100)":"var(--green-100)"}`,background:isPos?"var(--red-50)":"var(--green-50)",padding:"14px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:12,fontWeight:700,color:"var(--gray-700)"}}>{name}</span>
        <Badge color={isPos?"red":"green"}>{isPos?"ALL +":"Normal"}</Badge>
      </div>
      <div style={{height:5,background:"white",borderRadius:99,overflow:"hidden",marginBottom:6}}>
        <div style={{height:"100%",width:`${prob}%`,background:color,borderRadius:99,transition:"width 1s ease"}}/>
      </div>
      <p style={{fontSize:11,color:"var(--gray-500)",fontFamily:"var(--mono)"}}>{prob}% probability</p>
    </div>
  );
}

function FeatureTile({k,v}){
  const labels={nucleus_area_px:"Nucleus Area",nucleus_pixels:"Nucleus Pixels",circularity:"Circularity",solidity:"Solidity",nc_ratio:"N/C Ratio",eccentricity:"Eccentricity",glcm_contrast:"GLCM Contrast",glcm_energy:"GLCM Energy",glcm_homogeneity:"GLCM Homogeneity",glcm_correlation:"GLCM Correlation",mean_intensity_R:"Mean R Channel",mean_intensity_G:"Mean G Channel",mean_intensity_B:"Mean B Channel"};
  return(
    <div style={{background:"var(--gray-50)",borderRadius:"var(--radius-sm)",border:"1px solid var(--gray-100)",padding:"12px 14px"}}>
      <p style={{fontSize:10,color:"var(--gray-400)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{labels[k]||k}</p>
      <p style={{fontSize:15,fontWeight:700,fontFamily:"var(--mono)",color:"var(--gray-900)"}}>{typeof v==="number"?(v>100?Math.round(v):v.toFixed(4)):v}</p>
    </div>
  );
}

function Skeleton({h=20,w="100%",radius=6}){
  return(
    <div style={{height:h,width:w,borderRadius:radius,background:"linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",backgroundSize:"400px 100%",animation:"shimmer 1.4s ease infinite"}}/>
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
  const inputRef=useRef();

  useEffect(()=>{
    fetch(`${API_BASE}/api/health`)
      .then(r=>r.json())
      .then(d=>setApiOk(d.models_ready===true))
      .catch(()=>setApiOk(false));
  },[]);

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
      const res=await fetch(`${API_BASE}/api/predict`,{method:"POST",body:form});
      if(!res.ok){const e=await res.json().catch(()=>({detail:"Unknown error"}));throw new Error(e.detail||`HTTP ${res.status}`);}
      setResult(await res.json());
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>

      {/* NAV */}
      <nav style={{background:"var(--white)",borderBottom:"1px solid var(--gray-100)",padding:"0 32px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"var(--shadow-sm)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:"var(--blue-600)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🩸</div>
          <div>
            <span style={{fontWeight:700,fontSize:15,color:"var(--gray-900)"}}>ALL Detection</span>
            <span style={{fontSize:12,color:"var(--gray-400)",marginLeft:8}}>Multi-Stage Ensemble</span>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:99,background:apiOk===null?"var(--gray-50)":apiOk?"var(--green-50)":"var(--red-50)",border:`1px solid ${apiOk===null?"var(--gray-100)":apiOk?"var(--green-100)":"var(--red-100)"}`,fontSize:12,fontWeight:500,color:apiOk===null?"var(--gray-400)":apiOk?"var(--green-600)":"var(--red-600)"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:apiOk===null?"var(--gray-300)":apiOk?"var(--green-500)":"var(--red-500)",...(apiOk&&{animation:"pulse 2s infinite"})}}/>
            {apiOk===null?"Checking API…":apiOk?"Backend Online":"Backend Offline"}
          </div>
          <Badge color="blue">v1.0.0</Badge>
        </div>
      </nav>

      {/* HERO */}
      <div style={{background:"linear-gradient(135deg,var(--blue-600) 0%,#1e40af 100%)",padding:"48px 32px 56px",textAlign:"center",color:"white"}}>
        <h1 style={{fontSize:"clamp(24px,4vw,44px)",fontWeight:800,lineHeight:1.15,marginBottom:14}}>
          Acute Lymphoblastic Leukemia<br/>Detection System
        </h1>
        <p style={{fontSize:15,opacity:0.82,maxWidth:520,margin:"0 auto 28px",lineHeight:1.7}}>
          Upload a peripheral blood smear image. The ensemble of SVM, Random Forest, and Gradient Boosting analyses it in real time using ResNet50 deep features and handcrafted GLCM, shape, and statistical descriptors.
        </p>
        <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
          {["Bilateral Filter","ResNet50 (2048-d)","GLCM + Shape","PCA Fusion","SVM · RF · GB","Majority Vote"].map(t=>(
            <span key={t} style={{padding:"4px 12px",borderRadius:99,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",fontSize:11,fontWeight:500}}>{t}</span>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <main style={{flex:1,maxWidth:1100,width:"100%",margin:"-28px auto 0",padding:"0 24px 48px"}}>

        <Card style={{padding:24,marginBottom:20}}>
          <h2 style={{fontSize:15,fontWeight:700,color:"var(--gray-800)",marginBottom:16}}>Upload Blood Smear Image</h2>
          <UploadZone onFile={handleFile} file={file} dragOver={dragOver} setDragOver={setDragOver} inputRef={inputRef}/>

          {file&&(
            <div style={{display:"grid",gridTemplateColumns:result?.preview_b64?"1fr 1fr":"1fr",gap:12,marginTop:16}}>
              <div style={{borderRadius:"var(--radius-sm)",overflow:"hidden",border:"1px solid var(--gray-100)"}}>
                <img src={preview} alt="Original" style={{width:"100%",height:180,objectFit:"cover",display:"block"}}/>
                <div style={{padding:"8px 12px",background:"var(--gray-50)",fontSize:11,color:"var(--gray-500)",fontWeight:500}}>📁 Original Image</div>
              </div>
              {result?.preview_b64&&(
                <div style={{borderRadius:"var(--radius-sm)",overflow:"hidden",border:"1px solid var(--gray-100)"}}>
                  <img src={`data:image/png;base64,${result.preview_b64}`} alt="Processed" style={{width:"100%",height:180,objectFit:"cover",display:"block"}}/>
                  <div style={{padding:"8px 12px",background:"var(--gray-50)",fontSize:11,color:"var(--gray-500)",fontWeight:500}}>🧬 Segmented Nucleus</div>
                </div>
              )}
            </div>
          )}

          {file&&(
            <button onClick={analyse} disabled={loading} style={{marginTop:16,width:"100%",padding:"13px 0",borderRadius:"var(--radius-sm)",border:"none",background:loading?"var(--gray-100)":"var(--blue-600)",color:loading?"var(--gray-400)":"white",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s",boxShadow:loading?"none":"0 4px 14px rgba(37,99,235,0.35)"}}>
              {loading?<><div className="spin" style={{width:18,height:18,border:"2px solid var(--gray-300)",borderTopColor:"var(--blue-500)",borderRadius:"50%"}}/>Analysing…</>:"⚡ Run Ensemble Analysis"}
            </button>
          )}

          {error&&(
            <div style={{marginTop:14,padding:"12px 16px",background:"var(--red-50)",borderRadius:"var(--radius-sm)",border:"1px solid var(--red-100)",fontSize:13,color:"var(--red-600)"}}>
              ⚠ {error}
            </div>
          )}
        </Card>

        {loading&&(
          <Card style={{padding:24,marginBottom:20}} className="fade-in">
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Skeleton h={32} radius={8}/><Skeleton h={16} w="60%" radius={6}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                <Skeleton h={90} radius={8}/><Skeleton h={90} radius={8}/><Skeleton h={90} radius={8}/>
              </div>
              <Skeleton h={100} radius={8}/>
            </div>
          </Card>
        )}

        {result&&!loading&&(
          <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:20}}>
            <VerdictBanner result={result}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <Card style={{padding:24}}>
                <h3 style={{fontSize:14,fontWeight:700,color:"var(--gray-800)",marginBottom:16}}>Classifier Votes</h3>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <ClassifierCard name="Support Vector Machine" vote={result.votes.SVM} prob={result.classifier_probs.SVM} color="var(--blue-500)"/>
                  <ClassifierCard name="Random Forest" vote={result.votes.RF} prob={result.classifier_probs.RF} color="var(--purple-500)"/>
                  <ClassifierCard name="Gradient Boosting" vote={result.votes.GB} prob={result.classifier_probs.GB} color="var(--amber-500)"/>
                </div>
                <div style={{marginTop:14,padding:"10px 14px",background:"var(--gray-50)",borderRadius:"var(--radius-sm)",border:"1px solid var(--gray-100)",fontSize:11,color:"var(--gray-500)",fontFamily:"var(--mono)"}}>
                  y_final = mode(y_SVM, y_RF, y_GB) · soft vote avg
                </div>
              </Card>

              <Card style={{padding:24}}>
                <h3 style={{fontSize:14,fontWeight:700,color:"var(--gray-800)",marginBottom:16}}>Class Probabilities</h3>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  <StatBar label="ALL-Positive" value={result.probabilities.ALL} max={100} color="var(--red-500)"/>
                  <StatBar label="Normal" value={result.probabilities.Normal} max={100} color="var(--green-500)"/>
                </div>
                <div style={{height:1,background:"var(--gray-100)",margin:"20px 0"}}/>
                <h3 style={{fontSize:14,fontWeight:700,color:"var(--gray-800)",marginBottom:14}}>Model Performance</h3>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <StatBar label="Accuracy"  value={87.23} color="var(--blue-500)"/>
                  <StatBar label="Precision" value={99.40} color="var(--purple-500)"/>
                  <StatBar label="Recall"    value={84.34} color="var(--amber-500)"/>
                  <StatBar label="F1-Score"  value={91.26} color="var(--green-500)"/>
                  <StatBar label="ROC-AUC"   value={97.98} color="var(--blue-600)"/>
                </div>
              </Card>
            </div>

            <Card style={{padding:24}}>
              <h3 style={{fontSize:14,fontWeight:700,color:"var(--gray-800)",marginBottom:16}}>Extracted Diagnostic Features</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
                {Object.entries(result.features).map(([k,v])=>(<FeatureTile key={k} k={k} v={v}/>))}
              </div>
              <div style={{marginTop:14,padding:"10px 14px",background:"var(--blue-50)",borderRadius:"var(--radius-sm)",border:"1px solid var(--blue-100)",fontSize:11,color:"var(--blue-600)",display:"flex",gap:6,flexWrap:"wrap"}}>
                <span style={{fontWeight:600}}>Pipeline:</span>
                {["Bilateral filter","Otsu segmentation","ResNet50 2048-d","GLCM 18-d","Shape 10-d","Stats 15-d","L2 norm","PCA 50-d"].map(s=>(
                  <span key={s} style={{padding:"1px 8px",borderRadius:99,background:"var(--blue-100)",fontSize:10,fontWeight:500}}>{s}</span>
                ))}
              </div>
            </Card>
          </div>
        )}

        {!file&&!result&&(
          <Card style={{padding:48,textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:16}}>🩸</div>
            <h3 style={{fontSize:18,fontWeight:700,color:"var(--gray-800)",marginBottom:8}}>Ready to Analyse</h3>
            <p style={{fontSize:13,color:"var(--gray-400)",maxWidth:380,margin:"0 auto"}}>
              Upload a peripheral blood smear image above. The system will run the full 6-stage ensemble pipeline and return a classification in seconds.
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginTop:32,textAlign:"left"}}>
              {[
                {icon:"⚙️",title:"Preprocessing",desc:"Bilateral filtering + Otsu WBC nucleus segmentation"},
                {icon:"🔬",title:"Feature Extraction",desc:"ResNet50 deep features + GLCM + Shape + Statistical (2,091-d)"},
                {icon:"🧠",title:"Ensemble Classification",desc:"SVM + Random Forest + Gradient Boosting with majority voting"},
              ].map(c=>(
                <div key={c.title} style={{padding:16,borderRadius:"var(--radius-sm)",background:"var(--gray-50)",border:"1px solid var(--gray-100)"}}>
                  <div style={{fontSize:24,marginBottom:8}}>{c.icon}</div>
                  <p style={{fontSize:13,fontWeight:700,color:"var(--gray-800)",marginBottom:4}}>{c.title}</p>
                  <p style={{fontSize:11,color:"var(--gray-400)",lineHeight:1.6}}>{c.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      <footer style={{borderTop:"1px solid var(--gray-100)",background:"var(--white)",padding:"20px 32px",textAlign:"center",fontSize:11,color:"var(--gray-400)"}}>
        Multi-Stage Ensemble Learning System ·
      </footer>
    </div>
  );
}
