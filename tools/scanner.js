const fs=require('fs');
const code=fs.readFileSync('assets/js/solar-water-heater-configurator.js','utf8');
let state={inSingle:false,inDouble:false,inTemplate:false,inLineComment:false,inBlockComment:false,escape:false};
for(let i=0;i<code.length;i++){
  const c=code[i];
  const next = code[i+1];
  if(state.inLineComment){ if(c==='\n') state.inLineComment=false; continue; }
  if(state.inBlockComment){ if(c==='*' && next==='/' ){ state.inBlockComment=false; i++; continue;} else continue; }
  if(state.escape){ state.escape=false; continue; }
  if(c==='\\') { state.escape=true; continue; }
  if(!state.inSingle && !state.inDouble && !state.inTemplate){
    if(c==='/' && next==='/' ){ state.inLineComment=true; i++; continue; }
    if(c==='/' && next==='*' ){ state.inBlockComment=true; i++; continue; }
  }
  if(!state.inSingle && !state.inDouble && !state.inTemplate){
    if(c==='`'){ state.inTemplate=true; continue; }
    if(c==='"'){ state.inDouble=true; continue; }
    if(c==="'"){ state.inSingle=true; continue; }
    continue;
  }
  if(state.inTemplate){ if(c==='`'){ state.inTemplate=false; continue; } if(c==='\\') { state.escape=true; continue;} continue; }
  if(state.inDouble){ if(c==='"'){ state.inDouble=false; continue;} if(c==='\\') { state.escape=true; continue;} continue; }
  if(state.inSingle){ if(c==="'"){ state.inSingle=false; continue;} if(c==='\\') { state.escape=true; continue;} continue; }
}
const out = [];
out.push('inSingle='+state.inSingle);
out.push('inDouble='+state.inDouble);
out.push('inTemplate='+state.inTemplate);
out.push('inLineComment='+state.inLineComment);
out.push('inBlockComment='+state.inBlockComment);
out.push('escape='+state.escape);
// Now simple brace balance ignoring braces inside strings/templates/comments
let stack=[];
state={inSingle:false,inDouble:false,inTemplate:false,inLineComment:false,inBlockComment:false,escape:false};
for(let i=0;i<code.length;i++){
  const c=code[i]; const next=code[i+1];
  if(state.inLineComment){ if(c==='\n') state.inLineComment=false; continue; }
  if(state.inBlockComment){ if(c==='*' && next==='/' ){ state.inBlockComment=false; i++; continue;} else continue; }
  if(state.escape){ state.escape=false; continue; }
  if(!state.inSingle && !state.inDouble && !state.inTemplate){
    if(c==='/' && next==='/' ){ state.inLineComment=true; i++; continue; }
    if(c==='/' && next==='*' ){ state.inBlockComment=true; i++; continue; }
  }
  if(!state.inSingle && !state.inDouble && !state.inTemplate){
    if(c==='`'){ state.inTemplate=true; continue; }
    if(c==='"'){ state.inDouble=true; continue; }
    if(c==="'"){ state.inSingle=true; continue; }
    if(c==='{') stack.push(i);
    if(c==='}'){
      if(stack.length===0){
        const lines=code.slice(0,i).split('\n');
        console.log('UNMATCHED_CLOSE_AT', 'index',i,'line',lines.length+1);
        console.log('context:', lines.slice(-3).join('\n'));
        process.exit(0);
      } else stack.pop();
    }
    continue;
  }
  if(state.inTemplate){ if(c==='`'){ state.inTemplate=false; continue;} if(c==='\\'){ state.escape=true; continue;} continue; }
  if(state.inDouble){ if(c==='"'){ state.inDouble=false; continue;} if(c==='\\'){ state.escape=true; continue;} continue; }
  if(state.inSingle){ if(c==="'"){ state.inSingle=false; continue;} if(c==='\\'){ state.escape=true; continue;} continue; }
}
if(stack.length>0){ const lines=code.slice(0,stack[stack.length-1]).split('\n'); out.push('UNMATCHED_OPEN_AT index '+stack[stack.length-1]+' line '+(lines.length+1)); }
else out.push('BALANCED');
require('fs').writeFileSync('tools/scanner_result.txt', out.join('\n'));
console.log('WROTE_RESULT');
