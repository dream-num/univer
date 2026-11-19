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
    'drawing-ui': {
        ole: {
            progressReading: '첨부 파일을 읽는 중…',
            progressUploading: '첨부 파일을 업로드하는 중…',
            progressCreating: '온라인 파일을 만드는 중…',
            progressSaving: '링크를 저장하는 중…',
            externalAttachment: '연결된 첨부 파일',
            externalHint: '이 첨부 파일이 참조하는 원본 파일이 문서에 포함되어 있지 않아 미리 보기와 다운로드를 사용할 수 없습니다.',
            missingHint: '문서에 첨부 파일 데이터가 없어 미리 보기와 다운로드를 사용할 수 없습니다.',
            unavailableSummary: '문서에 사용할 수 없는 첨부 파일이 {0}개 있습니다. 자리 표시자는 유지됩니다. 경고 아이콘에 마우스를 올리면 이유를 확인할 수 있습니다.',
            rename: '이름 바꾸기',
            saveName: '이름 저장',
            cancel: '취소',
            invalidName: '255자 이내의 올바른 파일 이름을 입력하세요.',
            renameFailed: '첨부 파일 이름을 바꿀 수 없습니다. 다시 시도하세요.',
            actions: '첨부 파일 작업',
            linkSaveFailed: '온라인 파일이 생성되었지만 링크를 저장하지 못했습니다. 링크 저장을 다시 시도하세요.',
            conversionFailed: '첨부 파일을 변환하지 못했습니다. 다시 시도하세요.',
            converted: '변환 완료',
            open: '열기',
            converting: '변환 중…',
            openSlide: '새 탭에서 온라인 프레젠테이션 열기',
            openDoc: '새 탭에서 온라인 문서 열기',
            openSheet: '새 탭에서 온라인 스프레드시트 열기',
            convertSlide: '온라인 프레젠테이션으로 변환',
            convertDoc: '온라인 문서로 변환',
            convertSheet: '온라인 스프레드시트로 변환',
            nativePreviewHint: '브라우저에서 파일을 표시할 수 없으면 원본을 다운로드하세요.',
            attachment: 'OLE 첨부 파일',
            external: '외부 파일을 사용할 수 없습니다',
            missing: '첨부 파일 데이터를 사용할 수 없습니다',
            opaque: '원본 OLE 바이너리 (다운로드 가능)',
            download: '다운로드',
            preview: '미리 보기',
            remove: '삭제',
            failed: '원본 첨부 파일을 읽을 수 없습니다. 다시 시도하세요.',
            unsupported: '이 파일은 미리 볼 수 없습니다. 원본을 다운로드할 수 있습니다.',
        },
        mobile: { close: '닫기', more: '더 보기' },
        'image-cropper': {
            error: '이미지가 아닌 객체는 자를 수 없습니다.',
        },
        objectListPanel: {
            title: '레이어',
            empty: '개체 없음',
            showAll: '모두 표시',
            hideAll: '모두 숨기기',
            lockAll: '모두 잠금',
            unlockAll: '모두 잠금 해제',
            moveForward: '앞으로 가져오기',
            moveBackward: '뒤로 보내기',
            close: '닫기',
            show: '표시',
            hide: '숨기기',
            lock: '잠금',
            unlock: '잠금 해제',
            lockHint: '실수로 선택하지 않도록 잠금',
            unlockHint: '잠김. 클릭하여 잠금 해제',
            name: '이름',
            nameInput: '개체 이름',
            description: '설명',
            descriptionPlaceholder: '설명 추가',
            details: '세부 정보',
            locate: '위치 찾기',
            expand: '펼치기',
            collapse: '접기',
            dragToReorder: '드래그하여 순서 변경',
            search: '개체 검색',
            filterAll: '전체',
            filterHidden: '숨김',
            filterLocked: '잠김',
            sectionCanvas: '캔버스 레이어',
            sectionFloating: '플로팅 레이어',
            typeNames: {
                object: '개체',
                shape: '도형',
                connector: '연결선',
                image: '이미지',
                chart: '차트',
                table: '표',
                smartArt: 'SmartArt',
                video: '비디오',
                group: '그룹',
                unit: '단위',
                dom: 'DOM',
                text: '텍스트',
                placeholder: '자리 표시자',
                container: '컨테이너',
            },
            noSelection: '세부 정보를 편집할 개체를 선택하세요',
        },
        'image-panel': {
            arrange: {
                title: '정렬',
                forward: '앞으로 가져오기',
                backward: '뒤로 보내기',
                front: '맨 앞으로 가져오기',
                back: '맨 뒤로 보내기',
            },
            transform: {
                title: '변형',
                rotate: '회전 (°)',
                x: 'X 좌표 (px)',
                y: 'Y 좌표 (px)',
                width: '너비 (px)',
                height: '높이 (px)',
                lock: '비율 고정 (%)',
            },
            crop: {
                cancel: '취소',
                apply: '완료',
                title: '자르기',
                start: '자르기 시작',
                mode: '자유 모드',
            },
            group: {
                title: '그룹',
                group: '그룹화',
                unGroup: '그룹 해제',
            },
            align: {
                title: '맞춤',
                default: '맞춤 유형 선택',
                left: '왼쪽 맞춤',
                center: '가운데 맞춤',
                right: '오른쪽 맞춤',
                top: '위쪽 맞춤',
                middle: '가운데 맞춤',
                bottom: '아래쪽 맞춤',
                horizon: '수평 간격 균등 분배',
                vertical: '수직 간격 균등 분배',
            },
            null: '선택된 객체가 없습니다',
        },
        'image-text-wrap': {
            square: '사각형',
            topAndBottom: '위아래',
            inline: '텍스트와 같은 줄',
            behindText: '텍스트 뒤',
            inFrontText: '텍스트 앞',
        },
    },
};

export default locale;
