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
    sheet: {
        cf: {
            title: 'Định dạng có điều kiện',
            menu: {
                manageConditionalFormatting: 'Quản lý định dạng có điều kiện',
                createConditionalFormatting: 'Tạo định dạng có điều kiện mới',
                clearRangeRules: 'Xóa quy tắc cho vùng chọn',
                clearWorkSheetRules: 'Xóa quy tắc cho toàn bộ bảng tính',
            },
            form: {
                lessThan: 'Giá trị phải nhỏ hơn {0}',
                lessThanOrEqual: 'Giá trị phải nhỏ hơn hoặc bằng {0}',
                greaterThan: 'Giá trị phải lớn hơn {0}',
                greaterThanOrEqual: 'Giá trị phải lớn hơn hoặc bằng {0}',
                rangeSelector: 'Chọn phạm vi hoặc nhập giá trị',
            },
            iconSet: {
                direction: 'Hướng',
                shape: 'Hình dạng',
                mark: 'Dấu',
                rank: 'Hạng',
                rule: 'Quy tắc',
                icon: 'Biểu tượng',
                type: 'Loại',
                value: 'Giá trị',
                reverseIconOrder: 'Đảo ngược thứ tự biểu tượng',
                and: 'Và',
                when: 'Khi giá trị',
                onlyShowIcon: 'Chỉ hiển thị biểu tượng',
            },
            symbol: {
                greaterThan: '>',
                greaterThanOrEqual: '>=',
                lessThan: '<',
                lessThanOrEqual: '<=',
            },
            panel: {
                createRule: 'Tạo quy tắc mới',
                clear: 'Xóa tất cả quy tắc',
                range: 'Phạm vi áp dụng',
                styleType: 'Loại kiểu',
                submit: 'Xác nhận',
                cancel: 'Hủy bỏ',
                rankAndAverage: 'Đầu / Cuối / Giá trị trung bình',
                styleRule: 'Quy tắc kiểu',
                isNotBottom: 'Đầu',
                isBottom: 'Cuối',
                greaterThanAverage: 'Lớn hơn giá trị trung bình',
                lessThanAverage: 'Nhỏ hơn giá trị trung bình',
                medianValue: 'Giá trị trung vị',
                fillType: 'Cách thức điền',
                pureColor: 'Màu thuần',
                gradient: 'Chuyển màu',
                colorSet: 'Thiết lập màu sắc',
                positive: 'Giá trị dương',
                native: 'Giá trị âm',
                workSheet: 'Toàn bộ bảng tính',
                selectedRange: 'Vùng chọn',
                managerRuleSelect: 'Quản lý quy tắc của {0}',
                onlyShowDataBar: 'Chỉ hiển thị thanh dữ liệu',
            },
            preview: {
                describe: {
                    beginsWith: 'Bắt đầu với {0}',
                    endsWith: 'Kết thúc với {0}',
                    containsText: 'Chứa văn bản {0}',
                    notContainsText: 'Không chứa văn bản {0}',
                    equal: 'Bằng {0}',
                    notEqual: 'Không bằng {0}',
                    containsBlanks: 'Rỗng',
                    notContainsBlanks: 'Không rỗng',
                    containsErrors: 'Lỗi',
                    notContainsErrors: 'Không lỗi',
                    greaterThan: 'Lớn hơn {0}',
                    greaterThanOrEqual: 'Lớn hơn hoặc bằng {0}',
                    lessThan: 'Nhỏ hơn {0}',
                    lessThanOrEqual: 'Nhỏ hơn hoặc bằng {0}',
                    notBetween: 'Không nằm giữa {0} và {1}',
                    between: 'Nằm giữa {0} và {1}',
                    yesterday: 'Hôm qua',
                    tomorrow: 'Ngày mai',
                    last7Days: '7 ngày qua',
                    thisMonth: 'Tháng này',
                    lastMonth: 'Tháng trước',
                    nextMonth: 'Tháng sau',
                    thisWeek: 'Tuần này',
                    lastWeek: 'Tuần trước',
                    nextWeek: 'Tuần sau',
                    today: 'Hôm nay',
                    topN: 'Top {0}',
                    bottomN: 'Cuối {0}',
                    topNPercent: 'Top {0}%',
                    bottomNPercent: 'Cuối {0}%',
                },
            },
            operator: {
                beginsWith: 'Bắt đầu với',
                endsWith: 'Kết thúc với',
                containsText: 'Chứa văn bản',
                notContainsText: 'Không chứa văn bản',
                equal: 'Bằng',
                notEqual: 'Không bằng',
                containsBlanks: 'Rỗng',
                notContainsBlanks: 'Không rỗng',
                containsErrors: 'Lỗi',
                notContainsErrors: 'Không lỗi',
                greaterThan: 'Lớn hơn',
                greaterThanOrEqual: 'Lớn hơn hoặc bằng',
                lessThan: 'Nhỏ hơn',
                lessThanOrEqual: 'Nhỏ hơn hoặc bằng',
                notBetween: 'Không nằm giữa',
                between: 'Nằm giữa',
                yesterday: 'Hôm qua',
                tomorrow: 'Ngày mai',
                last7Days: '7 ngày qua',
                thisMonth: 'Tháng này',
                lastMonth: 'Tháng trước',
                nextMonth: 'Tháng sau',
                thisWeek: 'Tuần này',
                lastWeek: 'Tuần trước',
                nextWeek: 'Tuần sau',
                today: 'Hôm nay',
            },
            ruleType: {
                highlightCell: 'Làm nổi bật ô',
                dataBar: 'Thanh dữ liệu',
                colorScale: 'Thang màu',
                formula: 'Công thức tùy chỉnh',
                iconSet: 'Tập hợp biểu tượng',
                duplicateValues: 'Giá trị trùng lặp',
                uniqueValues: 'Giá trị duy nhất',
            },
            subRuleType: {
                uniqueValues: 'Giá trị duy nhất',
                duplicateValues: 'Giá trị trùng lặp',
                rank: 'Đầu cuối',
                text: 'Văn bản',
                timePeriod: 'Thời gian',
                number: 'Giá trị số',
                average: 'Giá trị trung bình',
            },
            valueType: {
                num: 'Giá trị số',
                min: 'Giá trị nhỏ nhất',
                max: 'Giá trị lớn nhất',
                percent: 'Phần trăm',
                percentile: 'Phần trăm điểm',
                formula: 'Công thức',
                none: 'Không',
            },
            errorMessage: {
                notBlank: 'Điều kiện không được để trống',
                formulaError: 'Lỗi công thức',
                rangeError: 'Bad selection',
            },
        },
    },
};

export default locale;
