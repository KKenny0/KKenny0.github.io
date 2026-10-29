const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export function createPlayground(width,height,size,compact=false){
  const positions=compact?[[.03,.02],[.97,.02],[.03,.98],[.97,.98]]:[[.04,.17],[.28,.92],[.8,.31],[.98,.9]];
  return {width,height,size,elapsed:0,people:positions.map(([x,y],i)=>({
    x:x*Math.max(0,width-size),y:y*Math.max(0,height-size-62),z:0,vz:0,tilt:0,
    vx:(i%2?-.7:.8)*size*.21,vy:(i<2?.6:-.65)*size*.17,wait:.45+i*.7,
  }))};
}

function contain(p,scene){
  p.x=clamp(p.x,0,Math.max(0,scene.width-scene.size));
  p.y=clamp(p.y,0,Math.max(0,scene.height-scene.size-62));
}

export function stepPlayground(scene,seconds,held=new Set(),obstacle=null,random=Math.random){
  const dt=Math.min(seconds,.035),s=scene.size;
  scene.elapsed+=dt;
  for(const [i,p] of scene.people.entries()){
    if(held.has(i))continue;
    p.wait-=dt;
    if(p.wait<=0&&p.z===0){
      p.vz=s*1.18;p.wait=1.3+random()*2;
      const angle=random()*Math.PI*2;p.vx=Math.cos(angle)*s*.32;p.vy=Math.sin(angle)*s*.32;
    }
    p.vz-=s*4.1*dt;p.z=Math.max(0,p.z+p.vz*dt);if(!p.z)p.vz=0;
    p.tilt=p.z/s*p.vx*.1+Math.sin(scene.elapsed*1.3+i*2)*.7;
    p.x+=p.vx*dt;p.y+=p.vy*dt;
    if(p.x<0||p.x>scene.width-s)p.vx=(p.x<0?1:-1)*Math.abs(p.vx);
    if(p.y<0||p.y>scene.height-s-62)p.vy=(p.y<0?1:-1)*Math.abs(p.vy);
    contain(p,scene);
    if(obstacle){
      const cx=p.x+s/2,cy=p.y+s/2;
      const left=obstacle.x-s*.32,right=obstacle.x+obstacle.width+s*.32;
      const top=obstacle.y-s*.4,bottom=obstacle.y+obstacle.height+s*.3;
      if(cx>left&&cx<right&&cy>top&&cy<bottom){
        const distances=[cx-left,right-cx,cy-top,bottom-cy];
        const side=distances.indexOf(Math.min(...distances));
        if(side===0){p.x=left-s/2;p.vx=-Math.abs(p.vx);}
        if(side===1){p.x=right-s/2;p.vx=Math.abs(p.vx);}
        if(side===2){p.y=top-s/2;p.vy=-Math.abs(p.vy);}
        if(side===3){p.y=bottom-s/2;p.vy=Math.abs(p.vy);}
        contain(p,scene);
      }
    }
  }
  for(let i=0;i<scene.people.length;i++)for(let j=i+1;j<scene.people.length;j++){
    const a=scene.people[i],b=scene.people[j];
    const dx=b.x-a.x,dy=b.y-a.y,overlapX=s*.94-Math.abs(dx),overlapY=s+58-Math.abs(dy);
    if(overlapX<=0||overlapY<=0)continue;
    const heldA=held.has(i),heldB=held.has(j);if(heldA&&heldB)continue;
    const nx=overlapX<overlapY?(dx>=0?1:-1):0,ny=overlapX<overlapY?0:(dy>=0?1:-1);
    const depth=Math.min(overlapX,overlapY),shareA=heldA?0:heldB?1:.5,shareB=heldB?0:heldA?1:.5;
    // A hovered or focused link must stay under the pointer, even on collision.
    a.x-=nx*depth*shareA;a.y-=ny*depth*shareA;b.x+=nx*depth*shareB;b.y+=ny*depth*shareB;
    const speed=((heldA?0:a.vx)-(heldB?0:b.vx))*nx+((heldA?0:a.vy)-(heldB?0:b.vy))*ny;
    if(speed>0){
      if(!heldA){a.vx-=speed*nx*(heldB?2:1);a.vy-=speed*ny*(heldB?2:1);}
      if(!heldB){b.vx+=speed*nx*(heldA?2:1);b.vy+=speed*ny*(heldA?2:1);}
    }
    for(const [index,p] of [[i,a],[j,b]])if(!held.has(index)){contain(p,scene);if(!p.z)p.vz=s*.7;}
  }
}

export function animatePlayground(root,isPaused){
  const field=root.querySelector('.playground-field'),intro=root.querySelector('.playground-identity');
  const nodes=[...field.querySelectorAll('.playground-character')];
  const bodies=nodes.map(n=>n.querySelector('.playground-body')),shadows=nodes.map(n=>n.querySelector('.playground-shadow'));
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let scene,obstacle,frame=0,last=0,hovered=null;
  function draw(){
    scene.people.forEach((p,i)=>{
      nodes[i].style.transform=`translate3d(${p.x}px,${p.y}px,0)`;
      nodes[i].style.zIndex=String(nodes[i]===document.activeElement||nodes[i]===hovered?1000:10+Math.round(p.y));
      bodies[i].style.transform=`translateY(${-p.z}px) rotate(${p.tilt}deg)`;
      shadows[i].style.transform=`scale(${1-p.z/scene.size*.65})`;
      shadows[i].style.opacity=String(.17-p.z/scene.size*.13);
    });
  }
  function measure(){
    const compact=root.clientWidth<900,w=field.clientWidth,h=field.clientHeight;
    const size=compact?clamp(w*.34,100,142):clamp(w*.145,145,240);
    const previous=scene;scene=createPlayground(w,h,size,compact);
    if(previous)scene.people.forEach((p,i)=>{
      p.x=previous.people[i].x/Math.max(1,previous.width-previous.size)*Math.max(0,w-size);
      p.y=previous.people[i].y/Math.max(1,previous.height-previous.size-62)*Math.max(0,h-size-62);
      contain(p,scene);
    });
    field.style.setProperty('--character-size',`${size}px`);
    const f=field.getBoundingClientRect(),r=intro.getBoundingClientRect();
    obstacle=compact?null:{x:r.left-f.left-12,y:r.top-f.top-12,width:r.width+24,height:r.height+24};
    draw();
  }
  function tick(now){
    const dt=last?Math.min((now-last)/1000,.035):0;last=now;
    if(!isPaused()&&!motion.matches&&!document.hidden){
      const held=new Set();nodes.forEach((n,i)=>{if(n===hovered||n===document.activeElement)held.add(i);});
      stepPlayground(scene,dt,held,obstacle);draw();
    }
    frame=requestAnimationFrame(tick);
  }
  const enter=e=>{if(e.pointerType!=='touch')hovered=e.currentTarget;};
  const leave=()=>{hovered=null;};
  nodes.forEach(n=>{n.addEventListener('pointerenter',enter);n.addEventListener('pointerleave',leave);n.addEventListener('pointercancel',leave);});
  const quiet=()=>{if(motion.matches){scene.people.forEach(p=>{p.z=0;p.vz=0;p.tilt=0;});draw();}last=0;};
  measure();const observer=new ResizeObserver(measure);observer.observe(field);observer.observe(intro);
  motion.addEventListener('change',quiet);quiet();frame=requestAnimationFrame(tick);
  return()=>{
    cancelAnimationFrame(frame);observer.disconnect();motion.removeEventListener('change',quiet);
    nodes.forEach(n=>{n.removeEventListener('pointerenter',enter);n.removeEventListener('pointerleave',leave);n.removeEventListener('pointercancel',leave);});
  };
}
