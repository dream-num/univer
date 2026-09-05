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
import emojiLocale from './emoji-locale/ja-JP.generated';

const locale: typeof enUS = {
    ui: {
        objectPermission: {
            addPeople: 'Add people',
            searchPeople: 'Search people',
            noPeople: 'No people selected',
            noMatchingPeople: 'No matching people',
            canEdit: 'Can edit',
            removePerson: 'Remove',
            confirmPeople: 'Confirm',
            document: 'Document',
            section: 'Section',
            paragraph: 'Paragraph',
            entity: 'Object',
            presentation: 'Presentation',
            page: 'Slide',
            master: 'Master view',
            base: 'Base',
            table: 'Table',
            field: 'Field',
            record: 'Record',
            view: 'View',
            board: 'Board',
            objectName: '{0}: {1}',

            search: 'Search objects',
            empty: 'No matching objects',
            more: 'Showing the first 100 objects. Search to narrow the list.',
            title: 'Permission settings',
            cancel: 'Cancel',
            save: 'Save',
            saving: 'Saving…',
            loading: 'Loading…',
            conflict: 'Permissions changed. Reload before saving.',
            error: 'Could not load or save permissions. Your changes have been kept.',
            reload: 'Reload',
            denied: 'You cannot manage permissions for this object.',
            edit: 'Who can edit',
            all: 'All file editors',
            owner: 'Object owner only',
            members: 'Selected members',
            copy: 'Allow editors to copy',
            print: 'Allow editors to print',
            export: 'Allow editors to export',
            comment: 'Allow editors to comment',
            parentHint: 'File and parent object restrictions still apply.',
        },
        featureSearch: {
            title: '機能を検索',
            placeholder: '機能またはメニュー名を入力…',
            empty: '利用可能な機能が見つかりません',
            ribbon: 'リボン',
            contextMenu: 'コンテキストメニュー',
        },
        emojiPicker: {
            search: '検索',
            random: 'ランダム絵文字',
            recents: '最近使用',
            emojis: '絵文字',
            animals: '動物',
            food: '食べ物',
            activities: 'アクティビティ',
            places: '場所',
            objects: 'オブジェクト',
            symbols: '記号',
            searchResults: '検索結果',
            noResults: '絵文字が見つかりません',
            ...emojiLocale,
        },
        symbolPicker: {
            mathematics: '数学',
            greek: 'ギリシャ文字',
            common: '一般',
        },
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
            'not-supported': 'システムにそのようなフォントが見つからないため、デフォルトのフォントを使用しています。',
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
        navigation: {
            back: '戻る',
            previous: '前へ',
            next: '次へ',
        },
        sidebar: {
            panel: 'サイドバーパネル',
            resize: 'サイドバーのサイズを変更',
            close: 'サイドバーを閉じる',
        },
        beforeClose: {
            title: '一部の変更が保存されていません',
        },
        clipboard: {
            authentication: {
                title: '権限が拒否されました',
                content: 'Univerにクリップボードアクセスの権限を付与してください。',
            },
        },
        rangeSelector: {
            cancel: 'キャンセル',
        },
        'global-shortcut': 'グローバルショートカット',
        row: '行',
        column: '列',
    },
};

export default locale;
