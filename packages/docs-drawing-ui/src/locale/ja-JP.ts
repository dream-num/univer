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
    docImage: {
        title: '画像',

        upload: {
            float: '画像を挿入',
        },

        panel: {
            title: '画像の編集',
        },
    },
    'image-popup': {
        replace: '置換',
        delete: '削除',
        edit: '編集',
        crop: 'トリミング',
        reset: 'サイズをリセット',
    },
    'image-text-wrap': {
        title: '文字列の折り返し',
        wrappingStyle: '折り返しのスタイル',
        square: '四角形',
        topAndBottom: '上下',
        inline: '行内',
        behindText: '文字列の背面',
        inFrontText: '文字列の前面',
        wrapText: '文字列の折り返し',
        bothSide: '両側',
        leftOnly: '左のみ',
        rightOnly: '右のみ',
        distanceFromText: '文字列からの距離',
        top: '上(px)',
        left: '左(px)',
        bottom: '下(px)',
        right: '右(px)',
    },
    'image-position': {
        title: '位置',
        horizontal: '水平方向',
        vertical: '垂直方向',
        absolutePosition: '絶対位置(px)',
        relativePosition: '相対位置',
        toTheRightOf: '右側に',
        relativeTo: '基準に対して',
        bellow: '下に',
        options: 'オプション',
        moveObjectWithText: '文字列と一緒にオブジェクトを移動',
        column: '列',
        margin: '余白',
        page: 'ページ',
        line: '行',
        paragraph: '段落',
    },
    'update-status': {
        exceedMaxSize: '画像のサイズが制限を超えています。制限: {0}MB',
        invalidImageType: '無効な画像形式です',
        exceedMaxCount: '一度にアップロードできる最大数は{0}件です',
        invalidImage: '無効な画像です',
    },
};

export default locale;
