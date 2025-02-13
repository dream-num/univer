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
    docLink: {
        edit: {
            confirm: '確認',
            cancel: '取消',
            title: '連結',
            address: '連結',
            label: '文本',
            labelError: '请输入链接文本',
            placeholder: '請輸入合法的連結',
            addressError: '請輸入合法的連結',
        },
        info: {
            copy: '複製',
            edit: '編輯',
            cancel: '取消連結',
            coped: '連結已複製到剪貼板',
        },
        menu: {
            tooltip: '新增連結',
        },
    },
};

export default locale;
