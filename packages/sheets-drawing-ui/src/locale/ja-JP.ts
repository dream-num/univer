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
    sheetImage: {
        title: '이미지',

        upload: {
            float: '플로팅 이미지',
            cell: '셀 내 이미지',
        },

        panel: {
            title: '이미지 편집',
        },
    },
    'image-popup': {
        replace: '바꾸기',
        delete: '삭제',
        edit: '편집',
        crop: '자르기',
        reset: '원래 크기',
    },
    'drawing-anchor': {
        title: '고정 위치 설정',
        both: '셀과 함께 이동 및 크기 조절',
        position: '셀과 함께 이동하되 크기 변경 안 함',
        none: '셀과 함께 이동 및 크기 조절 안 함',
    },
    'update-status': {
        exceedMaxSize: '이미지 크기가 제한({0}MB)을 초과했습니다',
        invalidImageType: '지원하지 않는 이미지 형식입니다',
        exceedMaxCount: '한 번에 {0}개까지만 업로드할 수 있습니다',
        invalidImage: '유효하지 않은 이미지입니다',
    },
    'cell-image': {
        pasteTitle: '셀 이미지로 붙여넣기',
        pasteContent: '셀 이미지 붙여넣기는 기존 셀 내용을 덮어씁니다. 계속 진행하시겠습니까?',
        pasteError: '이 단위에서는 시트 셀 이미지 복사 붙여넣기를 지원하지 않습니다',
    },
};

export default locale;
