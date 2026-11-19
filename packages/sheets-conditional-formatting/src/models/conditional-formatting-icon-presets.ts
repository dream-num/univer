/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { CanvasIconName } from '@univerjs/icons-svg';

const progressColors = { black: '#7A7A7A', '#E5E5E5': 'transparent' };

export const conditionalFormattingIconPresets = {
    progress0: { name: 'progress-0-double-icon', colors: progressColors },
    progress25: { name: 'progress-25-double-icon', colors: progressColors },
    progress50: { name: 'progress-50-double-icon', colors: progressColors },
    progress75: { name: 'progress-75-double-icon', colors: progressColors },
    progress100: { name: 'progress-100-double-icon', colors: progressColors },
    starEmpty: { name: 'star-empty-double-icon', colors: { black: '#FFBD37' } },
    starIncomplete: { name: 'star-incomplete-double-icon', colors: { black: '#FFBD37' } },
    starFull: { name: 'star-full-double-icon', colors: { black: '#FFBD37' } },
    guffaw: { name: 'guffaw-double-icon', colors: { black: '#8F5F00', '#E5E5E5': '#FFBD37' } },
    smile: { name: 'smile-double-icon', colors: { black: '#8F5F00', '#E5E5E5': '#FFBD37' } },
    noninductive: { name: 'noninductive-double-icon', colors: { black: '#8F5F00', '#E5E5E5': '#FFBD37' } },
    dissatisfied: { name: 'dissatisfied-double-icon', colors: { black: '#8F5F00', '#E5E5E5': '#FFBD37' } },
    impatient: { name: 'impatient-double-icon', colors: { black: '#8F5F00', '#E5E5E5': '#FFBD37' } },
    signal0: { name: 'signal-0-double-icon', colors: { black: '#0493EE' } },
    signal25: { name: 'signal-25-double-icon', colors: { black: '#0493EE' } },
    signal50: { name: 'signal-50-double-icon', colors: { black: '#0493EE' } },
    signal75: { name: 'signal-75-double-icon', colors: { black: '#0493EE' } },
    signal100: { name: 'signal-100-double-icon', colors: { black: '#0493EE' } },
    mistake: { name: 'mistake-double-icon', colors: { black: '#FE4B4B', '#E5E5E5': '#FFFFFF' } },
    warn: { name: 'warn-double-icon', colors: { black: '#FFBD37', '#E5E5E5': '#FFFFFF' } },
    correct: { name: 'correct-double-icon', colors: { black: '#59D01E', '#E5E5E5': '#FFFFFF' } },
    mistake2: { name: 'close-icon', colors: { black: '#FE4B4B' } },
    warn2: { name: 'exclamation-icon', colors: { black: '#FFBD37' } },
    correct2: { name: 'check-mark-icon', colors: { black: '#59D01E' } },
    downRed: { name: 'arrow-down-icon', colors: { black: '#FE4B4B' } },
    rightGold: { name: 'arrow-right-icon', colors: { black: '#FFBD37' } },
    upGreen: { name: 'arrow-up-icon', colors: { black: '#59D01E' } },
    rightAndDownGold: { name: 'arrow-tilt-down-icon', colors: { black: '#FFBD37' } },
    rightAndUpGold: { name: 'arrow-tilt-up-icon', colors: { black: '#FFBD37' } },
    downGray: { name: 'arrow-down-icon', colors: { black: '#999999' } },
    rightGray: { name: 'arrow-right-icon', colors: { black: '#999999' } },
    upGray: { name: 'arrow-up-icon', colors: { black: '#999999' } },
    rightAndDownGray: { name: 'arrow-tilt-down-icon', colors: { black: '#999999' } },
    rightAndUpGray: { name: 'arrow-tilt-up-icon', colors: { black: '#999999' } },
    flagGreen: { name: 'flag-icon', colors: { black: '#59D01E' } },
    flagGold: { name: 'flag-icon', colors: { black: '#FFBD37' } },
    flagRed: { name: 'flag-icon', colors: { black: '#FE4B4B' } },
    cross: { name: 'cross-icon', colors: { black: '#FFBD37' } },
    up: { name: 'up-icon', colors: { black: '#59D01E' } },
    down: { name: 'down-icon', colors: { black: '#FE4B4B' } },
    rhomboidRed: { name: 'rhomboid-icon', colors: { black: '#FE4B4B' } },
    rhomboidGold: { name: 'rhomboid-icon', colors: { black: '#FFBD37' } },
    roundnessGreen: { name: 'roundness-icon', colors: { black: '#59D01E' } },
    roundnessGold: { name: 'roundness-icon', colors: { black: '#FFBD37' } },
    roundnessRed: { name: 'roundness-icon', colors: { black: '#FE4B4B' } },
    roundnessPink: { name: 'roundness-icon', colors: { black: '#FB9D9D' } },
    roundnessGray: { name: 'roundness-icon', colors: { black: '#999999' } },
    roundnessBlack: { name: 'roundness-icon' },
    triangleGold: { name: 'triangle-icon', colors: { black: '#FFBD37' } },
    indicateGreen: { name: 'indicate-double-icon', colors: { '#E5E5E5': '#59D01E' } },
    indicateGold: { name: 'indicate-double-icon', colors: { '#E5E5E5': '#FFBD37' } },
    indicateRed: { name: 'indicate-double-icon', colors: { '#E5E5E5': '#FE4B4B' } },
    cell0: { name: 'cell-0-double-icon', colors: { white: '#0493EE', black: '#0493EE' } },
    cell25: { name: 'cell-25-double-icon', colors: { white: '#0493EE', black: '#0493EE' } },
    cell50: { name: 'cell-50-double-icon', colors: { white: '#0493EE', black: '#0493EE' } },
    cell75: { name: 'cell-75-double-icon', colors: { white: '#0493EE', black: '#0493EE' } },
    cell100: { name: 'cell-100-double-icon', colors: { white: '#0493EE', black: '#0493EE' } },
} as const satisfies Record<string, { name: CanvasIconName; colors?: Record<string, string> }>;
