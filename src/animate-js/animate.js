import { create } from './methods/create.js';
import { destroy } from './methods/destroy.js';
import { typewriter } from './methods/typewriter.js';
import { tooltip } from './methods/tooltip.js';
import { svg } from './methods/svg.js';
import { dragdrop } from './methods/dragdrop.js';
import { split } from './methods/split.js';
import { observe } from './methods/observe.js';

export const animate = {
  create: create,
  destroy: destroy,
  typewriter: typewriter,
  tooltip: tooltip,
  svg: svg,
  dragdrop: dragdrop,
  split: split,
  observe: observe,
}