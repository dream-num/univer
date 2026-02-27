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
    'action-recorder': {
        menu: {
            title: '操作記録',
            record: '記録を開始...',
            'replay-local': 'ローカルの記録で置き換え...',
            'replay-local-name': 'サブ単位ごとにローカルの記録で置き換え...',
            'replay-local-active': '現在のサブ単位をローカルの記録で置き換え...',
        },
    },
};

export default locale;
