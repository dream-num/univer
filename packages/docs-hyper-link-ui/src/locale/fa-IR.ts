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
            confirm: 'تایید',
            cancel: 'انصراف',
            title: 'لینک',
            address: 'لینک',
            placeholder: 'لطفا یک آدرس لینک وارد کنید',
            addressError: 'آدرس غیرمجاز است!',
            label: 'برچسب',
            labelError: 'لطفا برچسب لینک را وارد کنید',
        },
        info: {
            copy: 'کپی',
            edit: 'ویرایش',
            cancel: 'لینک را لغو کنید',
            coped: 'لینک به کلیپ بورد کپی شد',
        },
        menu: {
            tooltip: 'افزودن لینک',
        },
    },
};

export default locale;
