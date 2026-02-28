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
    'find-replace': {
        toolbar: '検索と置換',
        shortcut: {
            'open-find-dialog': '検索ダイアログを開く',
            'open-replace-dialog': '置換ダイアログを開く',
            'close-dialog': '検索と置換ダイアログを閉じる',
            'go-to-next-match': '次の検索結果へ移動',
            'go-to-previous-match': '前の検索結果へ移動',
            'focus-selection': '選択範囲へ移動',
        },
        dialog: {
            title: '検索',
            find: '検索',
            replace: '置換',
            'replace-all': 'すべて置換',
            'case-sensitive': '大文字と小文字を区別',
            'find-placeholder': 'このシートで検索',
            'advanced-finding': '詳細な検索と置換',
            'replace-placeholder': '置換後の文字列を入力',
            'match-the-whole-cell': 'セル全体を一致させる',
            'find-direction': {
                title: '検索方向',
                row: '行単位で検索',
                column: '列単位で検索',
            },
            'find-scope': {
                title: '検索範囲',
                'current-sheet': '現在のシート',
                workbook: 'ブック全体',
            },
            'find-by': {
                title: '検索対象',
                value: '値で検索',
                formula: '数式で検索',
            },
            'no-match': '検索は完了しましたが、一致する項目がありませんでした。',
            'no-result': '検索結果なし',
        },
        replace: {
            'all-success': '合計 {0} 件、すべて置換しました',
            'all-failure': '置換に失敗しました',
            confirm: {
                title: 'すべての一致項目を置換しますか？',
            },
        },
    },
    'find-replace-shortcuts': '検索と置換',
};

export default locale;
