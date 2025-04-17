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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    'image-popup': {
        replace: 'Replace',
        delete: 'Delete',
        edit: 'Edit',
        crop: 'Crop',
        reset: 'Reset Size',
    },
    'image-cropper': {
        error: 'Cannot crop non-image objects.',
    },
    'image-panel': {
        arrange: {
            title: 'Arrange',
            forward: 'Bring Forward',
            backward: 'Send Backward',
            front: 'Bring to Front',
            back: 'Send to Back',
        },
        transform: {
            title: 'Transform',
            rotate: 'Rotate (°)',
            x: 'X (px)',
            y: 'Y (px)',
            width: 'Width (px)',
            height: 'Height (px)',
            lock: 'Lock Ratio (%)',
        },
        crop: {
            title: 'Crop',
            start: 'Start Crop',
            mode: 'Free',
        },
        group: {
            title: 'Group',
            group: 'Group',
            reGroup: 'Regroup',
            unGroup: 'Ungroup',
        },
        align: {
            title: 'Align',
            default: 'Select Align Type',
            left: 'Align Left',
            center: 'Align Center',
            right: 'Align Right',
            top: 'Align Top',
            middle: 'Align Middle',
            bottom: 'Align Bottom',
            horizon: 'Distribute Horizontally ',
            vertical: 'Distribute Vertically ',
        },
        null: 'No Object Selection',
    },
    'drawing-view': 'Drawing',
    shortcut: {
        'drawing-move-down': 'Move Drawing down',
        'drawing-move-up': 'Move Drawing up',
        'drawing-move-left': 'Move Drawing left',
        'drawing-move-right': 'Move Drawing right',
        'drawing-delete': 'Delete Drawing',
    },
};

export default locale;
