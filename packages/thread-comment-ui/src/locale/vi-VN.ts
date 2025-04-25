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

const enUS: typeof zhCN = {
    threadCommentUI: {
        panel: {
            title: 'Quản lý Bình luận',
            empty: 'Chưa có bình luận',
            filterEmpty: 'Không có kết quả phù hợp',
            reset: 'Đặt lại',
            addComment: 'Thêm bình luận',
            solved: 'Đã giải quyết',
        },
        editor: {
            placeholder: 'Phản hồi',
            reply: 'Phản hồi',
            cancel: 'Hủy',
            save: 'Lưu',
        },
        item: {
            edit: 'Chỉnh sửa',
            delete: 'Xóa',
        },
        filter: {
            sheet: {
                all: 'Tất cả bảng',
                current: 'Bảng hiện tại',
            },
            status: {
                all: 'Tất cả bình luận',
                resolved: 'Đã giải quyết',
                unsolved: 'Chưa giải quyết',
                concernMe: 'Liên quan đến tôi',
            },
        },
    },

};

export default enUS;
