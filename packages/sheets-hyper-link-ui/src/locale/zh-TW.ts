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

import type zhCN from './zh-CN';

const locale: typeof zhCN = {
    hyperLink: {
        form: {
            editTitle: '編輯連結',
            addTitle: '插入連結',
            label: '文本',
            labelPlaceholder: '輸入文字',
            type: '類型',
            link: '連結',
            linkPlaceholder: '輸入連結位址',
            range: '單元格',
            worksheet: '工作表',
            definedName: '定義的名稱',
            ok: '確認',
            cancel: '取消',
            inputError: '請輸入',
            selectError: '請選擇',
            linkError: '請輸入合法的連結',
        },
        menu: {
            add: '新增連結',
        },
        message: {
            noSheet: '該子表已被刪除',
            refError: '錯誤的引用',
            hiddenSheet: '無法開啟被隱藏的子表',
            coped: '連結已複製到剪貼簿',
        },
        popup: {
            copy: '複製',
            edit: '編輯',
            cancel: '取消連結',
        },
    },
};

export default locale;
