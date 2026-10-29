import assert from 'node:assert/strict';
import {createPlayground,stepPlayground,animatePlayground} from '../src/scripts/home-playground.js';

const fixedRandom=()=>.37;
const airborne=createPlayground(1100,550,160);
Object.assign(airborne.people[0],{z:25,tilt:2,vz:-12,wait:1});
const frozenPose={...airborne.people[0]};
for(let i=0;i<8;i++)stepPlayground(airborne,1/60,new Set([0]),null,fixedRandom);
assert.deepEqual(airborne.people[0],frozenPose,'Holding an airborne character freezes its complete pose and jump state');
stepPlayground(airborne,1/60,new Set(),null,fixedRandom);
assert.notEqual(airborne.people[0].z,frozenPose.z,'Releasing resumes the frozen jump');
const scene=createPlayground(1100,550,160);
const held=new Set([0]),initial=scene.people.map(p=>({x:p.x,y:p.y}));
for(let i=0;i<240;i++)stepPlayground(scene,1/60,held,null,fixedRandom);
assert.equal(scene.people[0].x,initial[0].x);
assert.equal(scene.people[0].y,initial[0].y);
for(let i=1;i<4;i++)assert.ok(Math.hypot(scene.people[i].x-initial[i].x,scene.people[i].y-initial[i].y)>1,`Character ${i} continues while 0 is held`);
stepPlayground(scene,1/60,new Set(),null,fixedRandom);
assert.notEqual(scene.people[0].x,initial[0].x,'Releasing the character resumes motion');

// An actual collision must not displace either side when that side is held.
for(const fixed of [0,1]){
  const collision=createPlayground(1100,550,160);
  collision.people[0]={...collision.people[0],x:350,y:100,vx:50,vy:0,wait:10};
  collision.people[1]={...collision.people[1],x:490,y:100,vx:-50,vy:0,wait:10};
  const position={x:collision.people[fixed].x,y:collision.people[fixed].y};
  stepPlayground(collision,1/60,new Set([fixed]),null,fixedRandom);
  assert.equal(collision.people[fixed].x,position.x);assert.equal(collision.people[fixed].y,position.y);
  assert.ok(fixed===0?collision.people[1].vx>0:collision.people[0].vx<0,'Moving character reflects off the fixed character');
}
for(const [w,h,s] of [[347,445,118],[292,445,100],[1500,750,217]]){
  const bounded=createPlayground(w,h,s,w<900);
  for(let i=0;i<3600;i++){
    stepPlayground(bounded,1/60,new Set(),null,fixedRandom);
    for(const p of bounded.people){
      assert.ok(Number.isFinite(p.x+p.y+p.z));
      assert.ok(p.x>=0&&p.x<=w-s,'Horizontal bounds');
      assert.ok(p.y>=0&&p.y<=h-s-62,'Vertical bounds include labels');
    }
  }
}
const reserved=createPlayground(1100,550,160);
reserved.people[0]={...reserved.people[0],x:470,y:30,vx:0,vy:0,wait:10};
stepPlayground(reserved,1/60,new Set(),{x:440,y:10,width:250,height:150},fixedRandom);
assert.ok(reserved.people[0].x!==470||reserved.people[0].y!==30,'Characters leave the reserved introduction');
console.log('PASS: independent hover, release, fixed-target collision from either side, phone/desktop bounds and introduction avoidance.');

// Exercise the actual animation lifecycle, including live system preference changes.
const originals=Object.fromEntries(['document','matchMedia','ResizeObserver','requestAnimationFrame','cancelAnimationFrame'].map(k=>[k,globalThis[k]]));
const frames=new Map(),listeners=new Map();let nextFrame=0,disconnected=false,paused=false;
const nodes=Array.from({length:4},()=>({style:{},listeners:new Map(),parts:{},
  querySelector(key){return this.parts[key]??=( {style:{}} );},
  addEventListener(key,fn){this.listeners.set(key,fn);},removeEventListener(key){this.listeners.delete(key);}
}));
const field={clientWidth:1100,clientHeight:550,style:{setProperty(){}},querySelectorAll:()=>nodes,getBoundingClientRect:()=>({left:0,top:0})};
const intro={getBoundingClientRect:()=>({left:440,top:10,width:250,height:150})};
const root={clientWidth:1200,querySelector:key=>key==='.playground-field'?field:intro};
const preference={matches:false,addEventListener:(k,fn)=>listeners.set(k,fn),removeEventListener:k=>listeners.delete(k)};
try{
  globalThis.document={activeElement:null,hidden:false};globalThis.matchMedia=()=>preference;
  globalThis.ResizeObserver=class{observe(){}disconnect(){disconnected=true;}};
  globalThis.requestAnimationFrame=fn=>{const id=++nextFrame;frames.set(id,fn);return id;};
  globalThis.cancelAnimationFrame=id=>frames.delete(id);
  const advance=now=>{const [id,fn]=frames.entries().next().value;frames.delete(id);fn(now);};
  const positions=()=>nodes.map(n=>n.style.transform);
  const destroy=animatePlayground(root,()=>paused);
  advance(10);advance(30);let before=positions();paused=true;advance(60);
  assert.deepEqual(positions(),before,'Global pause stops transforms');
  paused=false;advance(90);assert.notDeepEqual(positions(),before,'Resume moves characters');
  preference.matches=true;listeners.get('change')();before=positions();advance(120);advance(150);
  assert.deepEqual(positions(),before,'Live reduced motion stops transforms');
  assert.ok(nodes.every(n=>n.parts['.playground-body'].style.transform.includes('translateY(0px)')),'Reduced motion settles jumps');
  preference.matches=false;listeners.get('change')();advance(180);advance(210);
  assert.notDeepEqual(positions(),before,'Returning to normal motion resumes');
  document.hidden=true;before=positions();advance(240);assert.deepEqual(positions(),before,'Hidden page stops transforms');
  destroy();assert.equal(frames.size,0);assert.equal(listeners.size,0);assert.ok(disconnected);
  assert.ok(nodes.every(n=>n.listeners.size===0),'Unmount removes pointer handlers');
}finally{for(const [key,value] of Object.entries(originals))if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
console.log('PASS: pause/resume, live reduced motion, hidden page and animation/observer/listener cleanup.');
