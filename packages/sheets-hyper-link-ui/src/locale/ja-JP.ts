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
    hyperLink: {
        form: {
            editTitle: 'リンクの編集',
            addTitle: 'リンクの挿入',
            label: '表示文字列',
            type: '種類',
            link: 'リンク',
            linkPlaceholder: 'リンクを入力',
            range: '範囲',
            worksheet: 'ワークシート',
            definedName: '定義済みの名前',
            ok: 'OK',
            cancel: 'キャンセル',
            labelPlaceholder: '表示する文字列を入力',
            inputError: '値を入力してください',
            selectError: '選択してください',
            linkError: '有効なリンクを入力してください',
        },
        menu: {
            add: 'リンクの挿入',
        },
        message: {
            noSheet: '対象のワークシートが削除されました',
            refError: '無効な範囲です',
            hiddenSheet: 'リンクを開けません。参照先のワークシートが非表示です',
            coped: 'リンクがクリップボードにコピーされました',
        },
        popup: {
            copy: 'リンクをコピー',
            edit: 'リンクの編集',
            cancel: 'リンク解除',
        },
    },
};

export default locale;
