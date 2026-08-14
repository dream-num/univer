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
    'sheets-data-validation-ui': {
        title: 'データの入力規則',
        ribbon: {
            setCheckbox: 'チェックボックスを設定',
            clearCheckbox: 'チェックボックスをクリア',
            dropdownPresetTitle: 'プリセットを適用:',
            editDropdown: 'オプションを編集',
            clearDropdown: 'プルダウンをクリア',
            dateTime: '日付と時刻',
            presets: {
                yes: 'はい',
                no: 'いいえ',
                notStarted: '未着手',
                inProgress: '進行中',
                completed: '完了',
                option1: 'オプション 1',
                option2: 'オプション 2',
            },
        },
        operators: {
            legal: '有効な形式',
        },
        validFail: {
            formulaError: '参照範囲に見えないデータが含まれています。範囲を再設定してください',
        },
        panel: {
            title: 'データの入力規則の管理',
            addTitle: '新しい入力規則を追加',
            removeAll: 'すべて削除',
            add: 'ルールを追加',
            range: '適用範囲',
            type: '条件',
            options: '詳細オプション',
            operator: 'データ',
            removeRule: 'ルールを削除',
            done: '完了',
            formulaPlaceholder: '値または数式を入力',
            valuePlaceholder: '値を入力',
            formulaAnd: 'と',
            invalid: '無効なデータ',
            showWarning: '警告を表示',
            rejectInput: '入力を拒否',
            messageInfo: '入力時メッセージ',
            showInfo: 'セルを選択したときに入力時メッセージを表示する',
            rangeError: '範囲が正しくありません',
            allowBlank: '空白を無視する',
        },
        date: {
            title: '日付',
        },
        list: {
            title: 'リスト',
            add: '追加',
            options: 'オプション',
            customOptions: 'カスタム',
            refOptions: '範囲を参照',
            edit: '編集',
        },
        checkbox: {
            title: 'チェックボックス',
            tips: 'セル内のカスタム値を使用してください',
            checked: 'チェックされた値',
            unchecked: 'チェックされていない値',
        },
        alert: {
            title: 'エラー',
            ok: 'OK',
        },
        error: {
            title: '無効な値:',
        },
        renderMode: {
            arrow: '矢印',
            chip: 'チップ',
            text: 'プレーンテキスト',
            label: '表示スタイル',
        },
        showTime: {
            label: '時間セレクターを表示',
        },
        permission: {
            dialog: {
                setStyleErr: 'この範囲は保護されており、スタイルを変更する権限がありません。変更するには作成者に連絡してください。',
            },
        },
    },
};

export default locale;
