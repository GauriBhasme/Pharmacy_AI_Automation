import fetch from 'node-fetch';

async function main(){
  const resp=await fetch('http://localhost:5000/api/agent/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({message:'hi'})
  });
  console.log('status', resp.status);
  const text=await resp.text();
  console.log(text);
}

main();