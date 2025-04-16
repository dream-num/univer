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

export default {
    ARRAY_CONSTRAIN: {
        description: 'Ràng buộc giá trị mảng vào một kích thước chỉ định sẵn.',
        abstract: 'Ràng buộc giá trị mảng vào một kích thước chỉ định sẵn.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.google.com/docs/answer/3267036?hl=vi&sjid=8484774178571403392-AP',
            },
        ],
        functionParameter: {
            inputRange: { name: 'mảng', detail: 'Dải ô giới hạn.' },
            numRows: { name: 'số hàng', detail: 'Số hàng mà kết quả cần có.' },
            numCols: { name: 'số cột', detail: 'Số cột mà kết quả cần có' },
        },
    },
    FLATTEN: {
        description: 'Làm phẳng tất cả giá trị trong một hoặc nhiều dải ô thành một cột duy nhất.',
        abstract: 'Làm phẳng tất cả giá trị trong một hoặc nhiều dải ô thành một cột duy nhất.',
        links: [
            {
                title: 'Giảng dạy',
                url: 'https://support.google.com/docs/answer/10307761?hl=vi&sjid=17375453483079636084-AP',
            },
        ],
        functionParameter: {
            range1: { name: 'dải ô 1', detail: 'Dải ô đầu tiên cần làm phẳng.' },
            range2: { name: 'dải ô 2', detail: 'Các dải ô bổ sung để làm phẳng.' },
        },
    },
};
