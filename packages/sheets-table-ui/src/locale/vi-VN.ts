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

const locale = {
    'sheets-table': {
        title: 'Bảng',
        selectRange: 'Chọn phạm vi bảng',
        rename: 'Đổi tên bảng',
        updateRange: 'Cập nhật phạm vi bảng',
        tableRangeWithMergeError: 'Phạm vi bảng không thể chồng lấp với các ô đã được hợp nhất',
        tableRangeWithOtherTableError: 'Phạm vi bảng không thể chồng lấp với các bảng khác',
        tableRangeSingleRowError: 'Phạm vi bảng không thể là một hàng đơn lẻ',
        updateError: 'Không thể đặt phạm vi bảng vào khu vực không chồng lấp với bản gốc và không nằm trên cùng một hàng',
        tableStyle: 'Kiểu bảng',
        defaultStyle: 'Kiểu mặc định',
        customStyle: 'Kiểu tùy chỉnh',
        customTooMore: 'Số lượng chủ đề tùy chỉnh vượt quá giới hạn tối đa, vui lòng xóa một số chủ đề không cần thiết và thêm lại',
        setTheme: 'Thiết lập chủ đề bảng',
        removeTable: 'Xóa bảng',
        cancel: 'Hủy',
        confirm: 'Xác nhận',
        header: 'Đầu trang',
        footer: 'Chân trang',
        firstLine: 'Dòng đầu tiên',
        secondLine: 'Dòng thứ hai',
        columnPrefix: 'Cột',
        tablePrefix: 'Bảng',

        insert: {
            main: 'Chèn bảng',
            row: 'Chèn hàng bảng',
            col: 'Chèn cột bảng',
        },

        remove: {
            main: 'Xóa bảng',
            row: 'Xóa hàng bảng',
            col: 'Xóa cột bảng',
        },

        condition: {
            string: 'Văn bản',
            number: 'Số',
            date: 'Ngày',

            empty: '(Trống)',

        },
        string: {
            compare: {
                equal: 'Bằng',
                notEqual: 'Không bằng',
                contains: 'Chứa',
                notContains: 'Không chứa',
                startsWith: 'Bắt đầu với',
                endsWith: 'Kết thúc với',
            },
        },
        number: {
            compare: {
                equal: 'Bằng',
                notEqual: 'Không bằng',
                greaterThan: 'Lớn hơn',
                greaterThanOrEqual: 'Lớn hơn hoặc bằng',
                lessThan: 'Nhỏ hơn',
                lessThanOrEqual: 'Nhỏ hơn hoặc bằng',
                between: 'Trong khoảng',
                notBetween: 'Không trong khoảng',
                above: 'Lớn hơn',
                below: 'Nhỏ hơn',
                topN: 'Top {0}',
            },
        },
        date: {
            compare: {
                equal: 'Bằng',
                notEqual: 'Không bằng',
                after: 'Sau',
                afterOrEqual: 'Sau hoặc bằng',
                before: 'Trước',
                beforeOrEqual: 'Trước hoặc bằng',
                between: 'Trong khoảng',
                notBetween: 'Không trong khoảng',
                today: 'Hôm nay',
                yesterday: 'Hôm qua',
                tomorrow: 'Ngày mai',
                thisWeek: 'Tuần này',
                lastWeek: 'Tuần trước',
                nextWeek: 'Tuần sau',
                thisMonth: 'Tháng này',
                lastMonth: 'Tháng trước',
                nextMonth: 'Tháng sau',
                thisQuarter: 'Quý này',
                lastQuarter: 'Quý trước',
                nextQuarter: 'Quý sau',
                thisYear: 'Năm nay',
                nextYear: 'Năm sau',
                lastYear: 'Năm trước',
                quarter: 'Theo quý',
                month: 'Theo tháng',
                q1: 'Quý 1',
                q2: 'Quý 2',
                q3: 'Quý 3',
                q4: 'Quý 4',
                m1: 'Tháng 1',
                m2: 'Tháng 2',
                m3: 'Tháng 3',
                m4: 'Tháng 4',
                m5: 'Tháng 5',
                m6: 'Tháng 6',
                m7: 'Tháng 7',
                m8: 'Tháng 8',
                m9: 'Tháng 9',
                m10: 'Tháng 10',
                m11: 'Tháng 11',
                m12: 'Tháng 12',
            },
        },
    },
};

export default locale;
