const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] ? Number(process.argv[2]) : 3001;
const root = path.resolve(__dirname, '..');

function contentType(p){
  if(p.endsWith('.html')) return 'text/html';
  if(p.endsWith('.js')) return 'application/javascript';
  if(p.endsWith('.css')) return 'text/css';
  if(p.endsWith('.svg') || p.endsWith('.jpg') || p.endsWith('.jpeg') || p.endsWith('.webp') || p.endsWith('.png')) return 'image/*';
  return 'application/octet-stream';
}

const server = http.createServer((req,res)=>{
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(root, url);
  if(url === '/' || url === '') file = path.join(root, 'index.html');
  // prevent directory traversal
  if(!file.startsWith(root)) return res.writeHead(403).end('Forbidden');
  fs.stat(file, (err,stats)=>{
    if(err || !stats.isFile()){ res.writeHead(404).end('Not found'); return; }
    fs.createReadStream(file).pipe(res);
    res.writeHead(200, { 'Content-Type': contentType(file) });
  });
});

server.listen(PORT, ()=>{
  console.log('Static server running at http://localhost:' + PORT);
});

process.on('SIGINT', ()=>{ server.close(()=>process.exit(0)); });
