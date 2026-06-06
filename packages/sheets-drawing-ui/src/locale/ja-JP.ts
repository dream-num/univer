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
    'sheets-drawing-ui': {
        title: '画像',
        uploadLoading: {
            loading: '読み込み中...',
        },

        upload: {
            float: 'セル上に配置',
            cell: 'セル内に配置',
        },

        panel: {
            title: '画像の編集',
        },

        save: {
            title: 'セル画像を保存',
            menuLabel: 'セル画像を保存',
            imageCount: '画像数',
            fileNameConfig: 'ファイル名',
            useRowCol: 'セルアドレスを使用 (A1, B2...)',
            useColumnValue: '列の値を使用',
            selectColumn: '列を選択',
            cancel: 'キャンセル',
            confirm: '保存',
            saving: '保存中...',
            error: 'セル画像の保存に失敗しました',
        },
        'image-popup': {
            replace: '画像の変更',
            delete: '削除',
            edit: '編集',
            crop: 'トリミング',
            reset: '元のサイズに戻す',
            flipH: '左右反転',
            flipV: '上下反転',
        },
        'update-status': {
            exceedMaxSize: '画像サイズが制限（{0}MB）を超えています',
            invalidImageType: 'サポートされていない画像形式です',
            exceedMaxCount: '一度にアップロードできるのは {0} 個までです',
            invalidImage: '無効な画像です',
        },
        'drawing-anchor': {
            title: 'プロパティ',
            both: 'セルに合わせて移動やサイズ変更をする',
            position: 'セルに合わせて移動するがサイズ変更はしない',
            none: 'セルに合わせて移動やサイズ変更をしない',
        },
        'cell-image': {
            pasteTitle: 'セル内画像として貼り付け',
            pasteContent: 'セル内画像を貼り付けると、既存のセル内容が上書きされます。続行しますか？',
            pasteError: 'この箇所では、シートのセル内画像のコピー＆ペーストはサポートされていません',
        },
        permission: {
            dialog: {
                editErr: 'この範囲は保護されており、編集権限がありません。編集するには作成者に連絡してください。',
            },
        },
        shortcut: {
            'drawing-view': '図形表示',
            'drawing-move-down': '図形を下へ移動',
            'drawing-move-up': '図形を上へ移動',
            'drawing-move-left': '図形を左へ移動',
            'drawing-move-right': '図形を右へ移動',
            'drawing-delete': '図形を削除',
        },
    },
};

export default locale;
