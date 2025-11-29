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

import type enUS from './en-US';

const locale: typeof enUS = {
    sheetImage: {
        title: '画像',

        upload: {
            float: 'セル上に配置',
            cell: 'セル内に配置',
        },

        panel: {
            title: '画像の編集',
        },
    },
    'image-popup': {
        replace: '画像の変更',
        delete: '削除',
        edit: '編集',
        crop: 'トリミング',
        reset: '元のサイズに戻す',
    },
    'drawing-anchor': {
        title: 'プロパティ',
        both: 'セルに合わせて移動やサイズ変更をする',
        position: 'セルに合わせて移動するがサイズ変更はしない',
        none: 'セルに合わせて移動やサイズ変更をしない',
    },
    'update-status': {
        exceedMaxSize: '画像サイズが制限（{0}MB）を超えています',
        invalidImageType: 'サポートされていない画像形式です',
        exceedMaxCount: '一度にアップロードできるのは {0} 個までです',
        invalidImage: '無効な画像です',
    },
    'cell-image': {
        pasteTitle: 'セル内画像として貼り付け',
        pasteContent: 'セル内画像を貼り付けると、既存のセル内容が上書きされます。続行しますか？',
        pasteError: 'この箇所では、シートのセル内画像のコピー＆ペーストはサポートされていません',
    },
};

export default locale;
