/* eslint-disable no-magic-numbers */
import type { BuildInPlacements } from '@rc-component/trigger';

const autoAdjustOverflowTopBottom = {
    shiftX: 0,
    adjustY: 1,
};

const autoAdjustOverflowLeftRight = { adjustX: 1, shiftY: true };

const targetOffset = [0, 0];

export const placements: BuildInPlacements = {
    left: {
        points: ['cr', 'cl'],
        overflow: autoAdjustOverflowLeftRight,
        offset: [-4, 0],
        targetOffset,
    },
    right: {
        points: ['cl', 'cr'],
        overflow: autoAdjustOverflowLeftRight,
        offset: [4, 0],
        targetOffset,
    },
    top: {
        points: ['bc', 'tc'],
        overflow: autoAdjustOverflowTopBottom,
        offset: [0, -4],
        targetOffset,
    },
    bottom: {
        points: ['tc', 'bc'],
        overflow: autoAdjustOverflowTopBottom,
        offset: [0, 4],
        targetOffset,
    },
};

export default placements;
