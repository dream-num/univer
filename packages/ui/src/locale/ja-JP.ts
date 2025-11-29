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
    toolbar: {
        heading: {
            normal: '標準',
            title: 'タイトル',
            subTitle: 'サブタイトル',
            1: '見出し 1',
            2: '見出し 2',
            3: '見出し 3',
            4: '見出し 4',
            5: '見出し 5',
            6: '見出し 6',
            tooltip: '見出しを設定',
        },
    },
    ribbon: {
        start: '開始',
        startDesc: 'ワークシートを初期化し、基本パラメータを設定します。',
        insert: '挿入',
        insertDesc: '行、列、グラフなどさまざまな要素を挿入します。',
        formulas: '数式',
        formulasDesc: 'データ計算のための関数と数式を使用します。',
        data: 'データ',
        dataDesc: 'データの管理（インポート、並べ替え、フィルタリングを含む）。',
        view: '表示',
        viewDesc: '表示モードを切り替え、表示効果を調整します。',
        others: 'その他',
        othersDesc: 'その他の機能と設定。',
        more: 'もっと見る',
    },
    fontFamily: {
        TimesNewRoman: 'Times New Roman',
        Arial: 'Arial',
        Tahoma: 'Tahoma',
        Verdana: 'Verdana',
        MicrosoftYaHei: 'Microsoft YaHei',
        SimSun: 'SimSun',
        SimHei: 'SimHei',
        Kaiti: 'Kaiti',
        FangSong: 'FangSong',
        NSimSun: 'NSimSun',
        STXinwei: 'STXinwei',
        STXingkai: 'STXingkai',
        STLiti: 'STLiti',
        HanaleiFill: 'HanaleiFill',
        Anton: 'Anton',
        Pacifico: 'Pacifico',
    },
    'shortcut-panel': {
        title: 'ショートカット',
    },
    shortcut: {
        undo: '元に戻す',
        redo: 'やり直す',
        cut: '切り取り',
        copy: 'コピー',
        paste: '貼り付け',
        'shortcut-panel': 'ショートカットパネルを切り替え',
    },
    'common-edit': '一般編集ショートカット',
    'toggle-shortcut-panel': 'ショートカットパネルを切り替え',
    clipboard: {
        authentication: {
            title: '権限が拒否されました',
            content: 'Univerにクリップボードアクセスの権限を付与してください。',
        },
    },
    textEditor: {
        formulaError: '有効な数式を入力してください。例: =SUM(A1)',
        rangeError: '有効な範囲を入力してください。例: A1:B10',
    },
    rangeSelector: {
        title: 'データ範囲の選択',
        addAnotherRange: '範囲を追加',
        buttonTooltip: 'データ範囲を選択',
        placeHolder: '範囲を選択または入力してください。',
        confirm: '確認',
        cancel: 'キャンセル',
    },
    'global-shortcut': 'グローバルショートカット',
    'zoom-slider': {
        resetTo: 'リセット',
    },
};

export default locale;
