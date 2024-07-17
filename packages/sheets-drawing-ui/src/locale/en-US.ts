/**
 * Copyright 2023-present DreamNum Inc.
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
    sheetImage: {
        title: 'Image',

        upload: {
            float: 'Float Image',
            cell: 'Cell Image',
        },

        panel: {
            title: 'Edit Image',
        },
    },
    'image-popup': {
        replace: 'Replace',
        delete: 'Delete',
        edit: 'Edit',
        crop: 'Crop',
        reset: 'Reset Size',
    },
    'drawing-anchor': {
        title: 'Anchor Properties',
        both: 'Move and size with cells',
        position: "Move but don't size with cells",
        none: "Don't move or size with cells",
    },
    'update-status': {
        exceedMaxSize: 'Image size exceeds limit, limit is {0}M',
        invalidImageType: 'Invalid image type',
        exceedMaxCount: 'Only {0} images can be uploaded at a time',
        invalidImage: 'Invalid image',
    },
    'sheet-drawing-view': 'Drawing',
    shortcut: {
        sheet: {
            'drawing-move-down': 'Move Drawing down',
            'drawing-move-up': 'Move Drawing up',
            'drawing-move-left': 'Move Drawing left',
            'drawing-move-right': 'Move Drawing right',
            'drawing-delete': 'Delete Drawing',
        },
    },
};

export default locale;
