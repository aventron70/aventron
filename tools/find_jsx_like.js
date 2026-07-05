const fs=require('fs');const code=fs.readFileSync('assets/js/solar-water-heater-configurator.js','utf8');let inSingle=false,inDouble=false,inTemplate=false,inLine=false,inBlock=false,esc=false;const hits=[];for(let i=0;i<code.length;i++){const c=code[i];const next=code[i+1]; if(esc){esc=false;continue;} if(inLine){ if(c==='\n') inLine=false; continue;} if(inBlock){ if(c==='*' && next==='/' ){ inBlock=false; i++; continue;} continue;} if(!inSingle && !inDouble && !inTemplate){ if(c==='/' && next==='/' ){ inLine=true; i++; continue;} if(c==='/' && next==='*'){ inBlock=true; i++; continue;} } if(c==='\\'){ esc=true; continue;} if(!inSingle && !inDouble && !inTemplate){ if(c==='`'){ inTemplate=true; continue;} if(c==='"'){ inDouble=true; continue;} if(c==="'"){ inSingle=true; continue;} if(c==='<' ){ // check next non-space
    const rest = code.slice(i, i+30);
    if(/^<\/?[A-Za-z]/.test(rest)){
      const linesBefore=code.slice(0,i).split('\n'); hits.push({index:i,line:linesBefore.length+1,context:code.slice(Math.max(0,i-80),i+80)});
    }
 }
 continue; }
 if(inTemplate){ if(c==='`'){ inTemplate=false; continue;} if(c==='\\'){ esc=true; continue;} continue; }
 if(inDouble){ if(c==='"'){ inDouble=false; continue;} if(c==='\\'){ esc=true; continue;} continue; }
 if(inSingle){ if(c==="'"){ inSingle=false; continue;} if(c==='\\'){ esc=true; continue;} continue; }
}
const out=[];
if(hits.length===0) out.push('NO_HITS'); else{ for(const h of hits) { out.push('LINE '+h.line); out.push('---'); out.push(h.context); out.push('---\n'); }}
require('fs').writeFileSync('tools/find_jsx_like_result.txt', out.join('\n'));
console.log('WROTE');
