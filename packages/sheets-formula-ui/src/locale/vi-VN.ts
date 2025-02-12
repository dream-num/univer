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

import array from './function-list/array/vi-VN';
import compatibility from './function-list/compatibility/vi-VN';
import cube from './function-list/cube/vi-VN';
import database from './function-list/database/vi-VN';
import date from './function-list/date/vi-VN';
import engineering from './function-list/engineering/vi-VN';
import financial from './function-list/financial/vi-VN';
import information from './function-list/information/vi-VN';
import logical from './function-list/logical/vi-VN';
import lookup from './function-list/lookup/vi-VN';
import math from './function-list/math/vi-VN';
import statistical from './function-list/statistical/vi-VN';
import text from './function-list/text/vi-VN';
import univer from './function-list/univer/vi-VN';
import web from './function-list/web/vi-VN';

export default {
    formula: {
        insert: {
            tooltip: 'Hàm',
            sum: 'Tổng',
            average: 'Giá trị trung bình',
            count: 'Đếm',
            max: 'Giá trị lớn nhất',
            min: 'Giá trị nhỏ nhất',
            more: 'Thêm hàm...',
        },
        functionList: {
            ...financial,
            ...date,
            ...math,
            ...statistical,
            ...lookup,
            ...database,
            ...text,
            ...logical,
            ...information,
            ...engineering,
            ...cube,
            ...compatibility,
            ...web,
            ...array,
            ...univer,
        },

        prompt: {
            helpExample: 'Ví dụ',
            helpAbstract: 'Giới thiệu',
            required: 'Bắt buộc.',
            optional: 'Tùy chọn.',
        },

        error: {
            title: 'Lỗi',
            divByZero: 'Mẫu số bằng không',
            name: 'Tên không hợp lệ',
            value: 'Lỗi trong giá trị',
            num: 'Lỗi số',
            na: 'Giá trị không khả dụng',
            cycle: 'Tham chiếu vòng lặp',
            ref: 'Tham chiếu ô không hợp lệ',
            spill: 'Vùng tràn không phải vùng trống',
            calc: 'Lỗi tính toán',
            error: 'Lỗi',
            connect: 'Đang kết nối',
            null: 'Lỗi giá trị rỗng',
        },

        functionType: {
            financial: 'Tài chính',
            date: 'Ngày và giờ',
            math: 'Toán học và lượng giác',
            statistical: 'Thống kê',
            lookup: 'Tra cứu và tham chiếu',
            database: 'Cơ sở dữ liệu',
            text: 'Văn bản',
            logical: 'Lôgic',
            information: 'Thông tin',
            engineering: 'Kỹ thuật',
            cube: 'Khối dữ liệu',
            compatibility: 'Tương thích',
            web: 'Web',
            array: 'Mảng',
            univer: 'Univer',
            user: 'Tùy chỉnh của người dùng',
            definedname: 'Tên đã xác định',
        },

        moreFunctions: {
            confirm: 'Áp dụng',
            prev: 'Bước trước',
            next: 'Bước tiếp theo',
            searchFunctionPlaceholder: 'Tìm kiếm hàm',
            allFunctions: 'Tất cả các hàm',
            syntax: 'Cú pháp',
        },

        operation: {
            pasteFormula: 'Chỉ dán công thức',
        },
    },

};
