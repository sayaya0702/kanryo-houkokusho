const fs=require('fs'), zlib=require('zlib');
function png(S){
  const buf=Buffer.alloc(S*S*4);
  const set=(x,y,r,g,b,a)=>{if(x<0||y<0||x>=S||y>=S)return;const i=(y*S+x)*4;buf[i]=r;buf[i+1]=g;buf[i+2]=b;buf[i+3]=a;};
  // bg orange
  for(let y=0;y<S;y++)for(let x=0;x<S;x++)set(x,y,249,115,22,255);
  const rr=(x0,y0,w,h,rad,fn)=>{for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){
    let cx=Math.min(Math.max(x,x0+rad),x0+w-rad-1), cy=Math.min(Math.max(y,y0+rad),y0+h-rad-1);
    let dx=x-cx,dy=y-cy; if(dx*dx+dy*dy<=rad*rad) fn(x,y);}};
  // white document
  const dw=Math.round(S*0.42), dh=Math.round(S*0.54), dx=Math.round((S-dw)/2), dy=Math.round((S-dh)/2);
  rr(dx,dy,dw,dh,Math.round(S*0.05),(x,y)=>set(x,y,255,255,255,255));
  // orange lines
  const lines=[0.34,0.46,0.58], lx=dx+Math.round(dw*0.16), lw=Math.round(dw*0.68), lt=Math.max(2,Math.round(S*0.035));
  lines.forEach(f=>{const ly=dy+Math.round(dh*f);for(let y=ly;y<ly+lt;y++)for(let x=lx;x<lx+lw;x++)set(x,y,249,140,60,255);});
  // shorter 4th line
  {const ly=dy+Math.round(dh*0.70);for(let y=ly;y<ly+lt;y++)for(let x=lx;x<lx+Math.round(lw*0.55);x++)set(x,y,249,140,60,255);}
  // build png
  const raw=Buffer.alloc(S*(S*4+1));
  for(let y=0;y<S;y++){raw[y*(S*4+1)]=0;buf.copy(raw,y*(S*4+1)+1,y*S*4,(y+1)*S*4);}
  const idat=zlib.deflateSync(raw);
  const chunk=(type,data)=>{const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const t=Buffer.from(type);const crc=Buffer.alloc(4);
    const c=crc32(Buffer.concat([t,data]));crc.writeUInt32BE(c>>>0);return Buffer.concat([len,t,data,crc]);};
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(S,0);ihdr.writeUInt32BE(S,4);ihdr[8]=8;ihdr[9]=6;
  const sig=Buffer.from([137,80,78,71,13,10,26,10]);
  return Buffer.concat([sig,chunk('IHDR',ihdr),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))]);
}
let crcTable=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;crcTable[n]=c;}
function crc32(buf){let c=0xFFFFFFFF;for(let i=0;i<buf.length;i++)c=crcTable[(c^buf[i])&0xFF]^(c>>>8);return c^0xFFFFFFFF;}
fs.writeFileSync('icons/icon-512.png',png(512));
fs.writeFileSync('icons/icon-192.png',png(192));
fs.writeFileSync('icons/apple-touch-icon.png',png(180));
console.log('icons written');
