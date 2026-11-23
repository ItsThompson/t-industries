import type { ActionReturn } from 'svelte/action';
import { spring } from 'svelte/motion';
import { observeMotionPreference } from '$lib/motion-preference';
import { constrain } from './constrain';
import { overlapsProtectedContent } from './overlaps-protected-content';
import type { Bounds, Drag, Point, SpringProfile } from './types';
import './drag.css';

const MIN_DRAG_WIDTH_PX = 1081;
const RETURN_SPRING = { stiffness: 0.6, damping: 0.85 };

export function draggableDecoration(
  node: HTMLImageElement,
  profile: SpringProfile,
): ActionReturn {
  const page = node.closest<HTMLElement>('[data-decoration-page]') ?? document.documentElement;
  const motion = spring<Point>({ x: 0, y: 0 }, { ...profile, precision: 0.01 });
  let origin: Point | null = null;
  let bounds: Bounds | null = null;
  let position: Point = { x: 0, y: 0 };
  let target: Point = { x: 0, y: 0 };
  let restingPosition: Point = { x: 0, y: 0 };
  let rejection: Point | null = null;
  let translation: Point = { x: 0, y: 0 };
  let drag: Drag | null = null;
  let stopMotionPreference: (() => void) | null = null;
  let reducedMotion = false;
  let resumeFrame: number | null = null;

  function setImmediately(point: Point): void {
    void motion.set(point, { hard: true });
    if (resumeFrame !== null) cancelAnimationFrame(resumeFrame);
    // A hard update cancels Svelte's pending spring task on the next frame.
    // Resume after that task so subsequent input in the same frame is not lost.
    resumeFrame = requestAnimationFrame(() => {
      resumeFrame = null;
      if (origin && !reducedMotion) void motion.set(target);
    });
  }

  function paint(): void {
    if (!origin || !bounds) return;
    const visible = constrain(position, bounds);
    translation = { x: visible.x - origin.x, y: visible.y - origin.y };
    node.style.setProperty('--drag-x', `${translation.x}px`);
    node.style.setProperty('--drag-y', `${translation.y}px`);
  }

  const unsubscribe = motion.subscribe((value) => {
    position = value;
    paint();
  });

  function moveTo(point: Point): void {
    if (!bounds) return;
    target = constrain(point, bounds);
    if (reducedMotion) setImmediately(target);
    else if (resumeFrame === null) void motion.set(target);
  }

  function measure(): Point {
    const rect = node.getBoundingClientRect();
    const pageRect = page.getBoundingClientRect();
    bounds = {
      left: pageRect.left + window.scrollX,
      right: Math.max(pageRect.left, pageRect.right - rect.width) + window.scrollX,
      top: pageRect.top + window.scrollY,
      bottom: Math.max(pageRect.top, pageRect.bottom - rect.height) + window.scrollY,
    };
    return {
      x: rect.left + window.scrollX - translation.x,
      y: rect.top + window.scrollY - translation.y,
    };
  }

  function release(): void {
    if (!drag) return;
    const pointerId = drag.pointerId;
    drag = null;
    node.removeAttribute('data-dragging');
    window.removeEventListener('scroll', followPointer);
    if (node.hasPointerCapture(pointerId)) node.releasePointerCapture(pointerId);
  }

  function resolveDrop(point: Point): Point {
    return overlapsProtectedContent(page, point, node.getBoundingClientRect()) ? restingPosition : point;
  }

  function cancel(): void {
    if (!drag) return;
    if (bounds) target = resolveDrop(constrain(position, bounds));
    restingPosition = target;
    release();
    setImmediately(target);
  }

  function clearRejection(): void {
    rejection = null;
    node.removeAttribute('data-rejected');
    motion.stiffness = profile.stiffness;
    motion.damping = profile.damping;
  }

  function handleRejectionEnd(event: AnimationEvent): void {
    if (event.target !== node || event.animationName !== 'canvas-decoration-reject') return;
    if (!rejection) return;
    const returnTo = rejection;
    clearRejection();
    motion.stiffness = RETURN_SPRING.stiffness;
    motion.damping = RETURN_SPRING.damping;
    moveTo(returnTo);
  }

  function reset(): void {
    clearRejection();
    release();
    if (origin) setImmediately({ x: 0, y: 0 });
    origin = null;
    bounds = null;
    translation = { x: 0, y: 0 };
    target = { x: 0, y: 0 };
    restingPosition = target;
    void motion.set(target, { hard: true });
    node.style.removeProperty('--drag-x');
    node.style.removeProperty('--drag-y');
    node.removeAttribute('data-drag-enabled');
    stopMotionPreference?.();
    stopMotionPreference = null;
  }

  function handleResize(): void {
    reset();
    if (window.innerWidth < MIN_DRAG_WIDTH_PX) return;
    stopMotionPreference = observeMotionPreference({
      onReduce: () => {
        reducedMotion = true;
        if (rejection) target = rejection;
        clearRejection();
        if (origin) setImmediately(target);
      },
      onAnimate: () => { reducedMotion = false; },
    });
    node.setAttribute('data-drag-enabled', '');
  }

  function followPointer(): void {
    if (!drag) return;
    moveTo({
      x: drag.objectStart.x + drag.pointer.x + window.scrollX - drag.pointerStart.x,
      y: drag.objectStart.y + drag.pointer.y + window.scrollY - drag.pointerStart.y,
    });
  }

  function handlePointerDown(event: PointerEvent): void {
    if (window.innerWidth < MIN_DRAG_WIDTH_PX || event.pointerType !== 'mouse') return;
    if (event.button !== 0 || !event.isPrimary || drag) return;
    event.preventDefault();
    event.stopPropagation();
    clearRejection();
    const measured = measure();
    if (!bounds) return;
    if (!origin) {
      origin = measured;
      target = constrain(measured, bounds);
      restingPosition = target;
      void motion.set(target, { hard: true });
    } else {
      origin = measured;
    }
    moveTo(constrain(position, bounds));
    drag = {
      pointerId: event.pointerId,
      pointerStart: { x: event.clientX + window.scrollX, y: event.clientY + window.scrollY },
      objectStart: target,
      pointer: { x: event.clientX, y: event.clientY },
    };
    node.setPointerCapture(event.pointerId);
    node.setAttribute('data-dragging', '');
    window.addEventListener('scroll', followPointer, { passive: true });
  }

  function handlePointerMove(event: PointerEvent): void {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.pointer = { x: event.clientX, y: event.clientY };
    followPointer();
  }

  function handlePointerUp(event: PointerEvent): void {
    if (!drag || event.pointerId !== drag.pointerId) return;
    handlePointerMove(event);
    release();
    if (!overlapsProtectedContent(page, target, node.getBoundingClientRect())) {
      restingPosition = target;
      return;
    }
    if (reducedMotion) {
      moveTo(restingPosition);
      return;
    }
    rejection = restingPosition;
    setImmediately(target);
    node.setAttribute('data-rejected', '');
  }

  function handlePointerCancel(event: PointerEvent): void {
    if (drag?.pointerId === event.pointerId) cancel();
  }

  function handleVisibilityChange(): void {
    if (!document.hidden || !origin || !bounds) return;
    clearRejection();
    release();
    target = resolveDrop(constrain(position, bounds));
    restingPosition = target;
    // Background tabs pause frames; stop the spring before that long time step.
    setImmediately(target);
  }

  node.addEventListener('pointerdown', handlePointerDown);
  node.addEventListener('pointermove', handlePointerMove);
  node.addEventListener('pointerup', handlePointerUp);
  node.addEventListener('pointercancel', handlePointerCancel);
  node.addEventListener('lostpointercapture', handlePointerCancel);
  node.addEventListener('animationend', handleRejectionEnd);
  window.addEventListener('resize', handleResize);
  window.addEventListener('blur', cancel);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  handleResize();

  return {
    destroy(): void {
      cancel();
      clearRejection();
      stopMotionPreference?.();
      if (resumeFrame !== null) cancelAnimationFrame(resumeFrame);
      unsubscribe();
      void motion.set(position, { hard: true });
      node.removeEventListener('pointerdown', handlePointerDown);
      node.removeEventListener('pointermove', handlePointerMove);
      node.removeEventListener('pointerup', handlePointerUp);
      node.removeEventListener('pointercancel', handlePointerCancel);
      node.removeEventListener('lostpointercapture', handlePointerCancel);
      node.removeEventListener('animationend', handleRejectionEnd);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', cancel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    },
  };
}
