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
    threadCommentUI: {
        panel: {
            title: '댓글 관리',
            empty: '아직 댓글이 없습니다',
            filterEmpty: '일치하는 결과가 없습니다',
            reset: '필터 초기화',
            addComment: '댓글 추가',
            solved: '해결됨',
        },
        editor: {
            placeholder: '답변 또는 @로 다른 사람 추가',
            reply: '댓글',
            cancel: '취소',
            save: '저장',
        },
        item: {
            edit: '편집',
            delete: '댓글 삭제',
        },
        filter: {
            sheet: {
                all: '모든 시트',
                current: '현재 시트',
            },
            status: {
                all: '모든 댓글',
                resolved: '해결됨',
                unsolved: '해결되지 않음',
                concernMe: '나에게 관련됨',
            },
        },
    },
};

export default locale;
