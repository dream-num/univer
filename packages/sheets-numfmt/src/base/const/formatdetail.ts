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

export const DATEFMTLISG = [
    {
        label: '1930-08-05',
        suffix: 'yyyy-MM-dd',
    },
    {
        label: '1930/08/05',
        suffix: 'yyyy/MM/dd',
    },
    {
        label: '1930年08月05日',
        suffix: 'yyyy"年"MM"月"dd"日"',
    },
    {
        label: '08-05',
        suffix: 'MM-dd',
    },
    {
        label: '8月5日',
        suffix: 'M"月"d"日"',
    },
    {
        label: '13:30:30',
        suffix: 'h:mm:ss',
    },
    {
        label: '13:30',
        suffix: 'h:mm',
    },
    {
        label: '下午01:30',
        suffix: 'A/P hh:mm',
    },
    {
        label: '下午1:30',
        suffix: 'A/P h:mm',
    },
    {
        label: '下午1:30:30',
        suffix: 'A/P h:mm:ss',
    },
    {
        label: '08-05 下午 01:30',
        suffix: 'MM-dd A/P hh:mm',
    },
];

export const NUMBERFORMAT = [
    {
        label: '(1,235)',
        suffix: '#,##0_);(#,##0)',
    },
    {
        label: '(1,235) ',
        suffix: '#,##0_);[Red](#,##0)',
        color: 'red',
    },
    {
        label: '1,234.56',
        suffix: '#,##0.00_);#,##0.00',
    },
    {
        label: '1,234.56',
        suffix: '#,##0.00_);[Red]#,##0.00',
        color: 'red',
    },
    {
        label: '-1,234.56',
        suffix: '#,##0.00_);-#,##0.00',
    },
    {
        label: '-1,234.56',
        suffix: '#,##0.00_);[Red]-#,##0.00',
        color: 'red',
    },
];
export const CURRENCYFORMAT = [
    {
        label: (suffix: string) => `${suffix}1,235`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);"${suffix}"#,##0.00`,
    },
    {
        label: (suffix: string) => `${suffix}1,235`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);[Red]"${suffix}"#,##0.00`,
        color: 'red',
    },
    {
        label: (suffix: string) => `(${suffix}1,235)`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);("${suffix}"#,##0.00)`,
    },
    {
        label: (suffix: string) => `(${suffix}1,235)`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);[Red]("${suffix}"#,##0.00)`,
        color: 'red',
    },
    {
        label: (suffix: string) => `-${suffix}1,235`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);-"${suffix}"#,##0.00`,
    },
    {
        label: (suffix: string) => `-${suffix}1,235`,
        suffix: (suffix: string) => `"${suffix}"#,##0.00_);[Red]-"${suffix}"#,##0.00`,
        color: 'red',
    },
];
