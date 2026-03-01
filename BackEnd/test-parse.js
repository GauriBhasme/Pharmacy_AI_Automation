const raw = "Calling Tool: `orderMedicine` with arguments: `{'medicineName': 'paracetamol', 'quantity': 2}`";
function extract(text){
  let m;
  m = text.match(/Calling\s+tool:\s*`(\w+)\((.*)\)`/i);
  if(m){try{return {name:m[1],args:JSON.parse(m[2])};}catch(e){}}
  m = text.match(/Calling\s+Tool:\s*`(\w+)`\s*with arguments:\s*`([^`]*)`/i);
  if(m){try{const argText=m[2].replace(/'/g,'\"'); return {name:m[1],args:JSON.parse(argText)};}catch(e){}}
  return null;
}
console.log(extract(raw));