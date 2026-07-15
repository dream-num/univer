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
    'docs-ui': {
        toolbar: {
            undo: '元に戻す',
            redo: 'やり直し',
            font: 'フォント',
            fontSize: 'フォントサイズ',
            bold: '太字',
            italic: '斜体',
            strikethrough: '取り消し線',
            subscript: '下付き文字',
            superscript: '上付き文字',
            underline: '下線',
            textColor: {
                main: '文字の色',
            },
            fillColor: {
                main: '塗りつぶしの色',
            },
            table: {
                main: '表',
                insert: '表の挿入',
                colCount: '列数',
                rowCount: '行数',
            },
            resetColor: '既定の色に戻す',
            order: '番号付きリスト',
            unorder: '箇条書き',
            checklist: 'チェックリスト',
            documentFlavor: 'モダンモード',
            alignLeft: '左揃え',
            alignCenter: '中央揃え',
            alignRight: '右揃え',
            alignJustify: '両端揃え',
            horizontalLine: '横線の挿入',
            headerFooter: 'ヘッダーとフッター',
            pageSetup: 'ページ設定',
            heading: {
                tooltip: 'Heading',
                normal: 'Normal text',
                leading1: 'Heading 1',
                leading2: 'Heading 2',
                leading3: 'Heading 3',
                leading4: 'Heading 4',
                leading5: 'Heading 5',
                title: 'Title',
                subTitle: 'Subtitle',
            },
        },
        table: {
            insert: '挿入',
            insertRowAbove: '上に行を挿入',
            insertRowBelow: '下に行を挿入',
            insertColumnLeft: '左に列を挿入',
            insertColumnRight: '右に列を挿入',
            delete: '表を削除',
            deleteRows: '行を削除',
            deleteColumns: '列を削除',
            deleteTable: '表を削除',
        },
        headerFooter: {
            linkToPrevious: 'Link to previous',
            header: 'ヘッダー',
            footer: 'フッター',
            panel: 'ヘッダーとフッターの設定',
            firstPageCheckBox: '先頭ページを別設定',
            oddEvenCheckBox: '奇数/偶数ページを別設定',
            headerTopMargin: 'ヘッダー上余白(px)',
            footerBottomMargin: 'フッター下余白(px)',
            closeHeaderFooter: 'ヘッダー/フッターを閉じる',
            disableText: 'ヘッダーとフッターの設定は無効です',
        },
        placeholder: {
            heading1: '見出し 1',
            heading2: '見出し 2',
            heading3: '見出し 3',
            heading4: '見出し 4',
            heading5: '見出し 5',
            normalText: 'テキストを入力するか「/」を押してコマンドを表示',
            listItem: '項目',
        },
        doc: {
            blockMenu: {
                dragBlock: 'ブロックをドラッグ',
            },

            menu: {
                paragraphSetting: '段落設定',
                sectionSetting: 'Section Settings',
            },
            slider: {
                paragraphSetting: '段落設定',
                sectionSetting: 'Section Settings',
            },
            paragraphSetting: {
                alignment: '配置',
                indentation: 'インデント',
                left: '左',
                right: '右',
                firstLine: '先頭行',
                hanging: 'ぶら下げ',
                spacing: '間隔',
                before: '前の間隔',
                after: '後の間隔',
                lineSpace: '行間',
                multiSpace: '複数行間',
                atLeast: 'At Least (px)',
                exactly: 'Exactly (px)',
                fixedValue: '固定値(px)',
            },
            sectionSetting: {
                selectedSections: '{0} sections selected',
                columnCount: 'Column count',
                columnGap: 'Column gap',
                columnSeparator: 'Separator',
                none: 'None',
                betweenColumns: 'Between columns',
                sectionStart: 'Section start',
                unspecified: 'Unspecified',
                continuous: 'Continuous',
                nextPage: 'Next page',
                evenPage: 'Even page',
                oddPage: 'Odd page',
            },
        },
        rightClick: {
            copy: 'コピー',
            cut: '切り取り',
            paste: '貼り付け',
            delete: '削除',
            bulletList: '箇条書き',
            orderList: '番号付きリスト',
            checkList: 'チェックリスト',
            insertBellow: '下に挿入',
        },
        paragraphMenu: {
            alignAndIndent: '配置とインデント',
            align: '配置',
            indent: 'インデント',
            color: '色',
            increase: '増やす',
            decrease: '減らす',
            increaseIndent: 'インデントを増やす',
            decreaseIndent: 'インデントを減らす',
            defaultTextColor: 'デフォルトの文字色',
            noBackground: '背景なし',
        },
        'page-settings': {
            'document-setting': '文書設定',
            mode: 'モード',
            'modern-mode': 'モダン',
            'classic-mode': 'クラシック',
            'modern-width': 'コンテンツ幅',
            'modern-width-narrow': '狭い',
            'modern-width-medium': '標準',
            'modern-width-wide': '広い',
            'paper-size': '用紙サイズ',
            'page-size': {
                main: '用紙サイズ',
                a4: 'A4',
                a3: 'A3',
                a5: 'A5',
                b4: 'B4',
                b5: 'B5',
                letter: 'Letter',
                legal: 'Legal',
                tabloid: 'Tabloid',
                statement: 'Statement',
                executive: 'Executive',
                folio: 'Folio',
            },
            orientation: '方向',
            portrait: '縦',
            landscape: '横',
            'custom-paper-size': 'カスタム用紙サイズ',
            top: '上',
            bottom: '下',
            left: '左',
            right: '右',
            cancel: 'キャンセル',
            confirm: '確認',
        },
    },
};

export default locale;
