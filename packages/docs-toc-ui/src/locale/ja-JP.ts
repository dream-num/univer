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
    'docs-toc-ui': {
        tableOfContents: {
            title: '目次',
            insertTitle: '目次',
            automaticTitle: '自動作成の目次',
            customTitle: 'ユーザー設定の目次…',
            contentsTitle: '目次',
            levels: '表示するレベル',
            showPageNumbers: 'ページ番号を表示する',
            rightAlignPageNumbers: 'ページ番号を右揃えにする',
            tabLeader: 'タブリーダー',
            leaderNone: 'なし',
            leaderDots: '点線',
            leaderDashes: '破線',
            leaderUnderline: '下線',
            format: '書式',
            formatFromTemplate: 'テンプレートから',
            formatClassic: 'クラシック',
            formatModern: 'モダン',
            formatSimple: 'シンプル',
            preview: '印刷プレビュー',
            previewHeading: '見出し',
            noHeadings: '見出しが見つかりません。見出し 1～3 のスタイルを適用するか、対応するレベルを選択してください。',
            updateTitle: '目次の更新',
            removeTitle: '目次の削除',
            updatePageNumbersOnly: 'ページ番号だけを更新する',
            updateEntireTable: '目次をすべて更新する',
            updateHint: 'この目次の更新方法を選択してください。',
        },
    },
};

export default locale;
