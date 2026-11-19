import {useEffect, useRef, useState} from 'react';

const storageKey = 'kenny-collage-wall-v1';
const origin = {x: 0, y: 0};
const arrows = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};

function readPositions() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return Object.fromEntries(Object.entries(saved ?? {}).filter(([, offset]) =>
      Number.isFinite(offset?.x) && Number.isFinite(offset?.y)
    ));
  } catch {
    return {};
  }
}

function savePositions(positions) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(positions));
  } catch {
    // The current layout still works when browser storage is unavailable.
  }
}

function constrain(wall, object, {x, y}) {
  const inset = 8;
  return {
    x: Math.round(Math.max(inset - object.offsetLeft, Math.min(x, wall.clientWidth - object.offsetLeft - object.offsetWidth - inset))),
    y: Math.round(Math.max(inset - object.offsetTop, Math.min(y, wall.clientHeight - object.offsetTop - object.offsetHeight - inset)))
  };
}

function overlaps(object, offset, other, otherOffset) {
  const x = object.offsetLeft + offset.x;
  const y = object.offsetTop + offset.y;
  const otherX = other.offsetLeft + otherOffset.x;
  const otherY = other.offsetTop + otherOffset.y;
  return x < otherX + other.offsetWidth && x + object.offsetWidth > otherX &&
    y < otherY + other.offsetHeight && y + object.offsetHeight > otherY;
}

export function useCollageWall() {
  const wallRef = useRef(null);
  const saved = useRef({});
  const drag = useRef(null);
  const [positions, setPositions] = useState({});
  const [active, setActive] = useState(null);

  function renderPositions() {
    const wall = wallRef.current;
    const offsets = drag.current ? {...saved.current, [drag.current.id]: drag.current.offset} : saved.current;
    setPositions(Object.fromEntries([...wall.children]
      .filter(object => Object.hasOwn(offsets, object.dataset.object))
      .map(object => [object.dataset.object, constrain(wall, object, offsets[object.dataset.object])])));
  }

  useEffect(() => {
    saved.current = readPositions();
    renderPositions();
    const observer = new ResizeObserver(renderPositions);
    observer.observe(wallRef.current);
    for (const object of wallRef.current.children) observer.observe(object);
    return () => observer.disconnect();
  }, []);

  function move(object, desired, previous) {
    const wall = wallRef.current;
    const next = constrain(wall, object, desired);
    const portrait = wall.querySelector('[data-object="portrait"]');
    const obstacles = object === portrait ? [...wall.children].filter(child => child.dataset.object && child !== object) : [portrait];
    const isClear = offset => obstacles.every(other => {
      const otherOffset = Object.hasOwn(saved.current, other.dataset.object)
        ? constrain(wall, other, saved.current[other.dataset.object]) : origin;
      return !overlaps(object, offset, other, otherOffset);
    });
    const horizontal = {x: next.x, y: previous.y};
    const vertical = {x: previous.x, y: next.y};
    return [next, horizontal, vertical].find(isClear) ?? previous;
  }

  function endDrag(commit) {
    const moving = drag.current;
    if (!moving) return;
    drag.current = null;
    setActive(null);
    if (commit && (moving.offset.x !== moving.start.x || moving.offset.y !== moving.start.y)) {
      saved.current = {...saved.current, [moving.id]: moving.offset};
      savePositions(saved.current);
    }
    renderPositions();
  }

  function resetPositions() {
    endDrag(false);
    saved.current = {};
    savePositions(saved.current);
    renderPositions();
  }

  function handleProps(id, announce) {
    function updateDrag(event) {
      const moving = drag.current;
      if (moving?.id !== id || moving.pointer !== event.pointerId) return;
      const desired = {x: moving.start.x + event.pageX - moving.x, y: moving.start.y + event.pageY - moving.y};
      moving.offset = move(event.currentTarget.parentElement, desired, moving.offset);
      renderPositions();
    }

    return {
      onPointerDown(event) {
        if (event.button !== 0 || drag.current) return;
        const offset = positions[id] ?? origin;
        event.currentTarget.focus({preventScroll: true});
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {id, pointer: event.pointerId, x: event.pageX, y: event.pageY, start: offset, offset};
        setActive(id);
      },
      onPointerMove: updateDrag,
      onPointerUp(event) {
        if (drag.current?.pointer !== event.pointerId) return;
        updateDrag(event);
        endDrag(true);
      },
      onPointerCancel(event) {
        if (drag.current?.pointer === event.pointerId) endDrag(false);
      },
      onLostPointerCapture(event) {
        if (drag.current?.pointer === event.pointerId) endDrag(false);
      },
      onKeyDown(event) {
        if (event.key === 'Escape' && drag.current?.id === id) {
          event.preventDefault();
          endDrag(false);
          return;
        }
        if (!Object.hasOwn(arrows, event.key)) return;
        event.preventDefault();
        if (drag.current) return;
        const step = event.shiftKey ? 30 : 10;
        const [dx, dy] = arrows[event.key];
        const object = event.currentTarget.parentElement;
        const previous = Object.hasOwn(saved.current, id) ? constrain(wallRef.current, object, saved.current[id]) : origin;
        const next = move(object, {x: previous.x + dx * step, y: previous.y + dy * step}, previous);
        const changed = next.x !== previous.x || next.y !== previous.y;
        if (changed) {
          saved.current = {...saved.current, [id]: next};
          savePositions(saved.current);
          renderPositions();
        }
        announce(next, changed);
      }
    };
  }

  function objectProps(id) {
    const {x, y} = positions[id] ?? origin;
    return {
      'data-object': id,
      'data-dragging': active === id || undefined,
      style: x || y ? {translate: `${x}px ${y}px`} : undefined
    };
  }

  return {wallRef, objectProps, handleProps, resetPositions};
}
