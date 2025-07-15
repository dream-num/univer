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
    AVEDEV: {
        description: '데이터 요소와 평균의 절대 편차의 평균을 반환합니다',
        abstract: '데이터 요소와 평균의 절대 편차의 평균을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/avedev-함수-58fe8d65-2a84-4dc7-8052-f3f87b5c6639',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '절대 편차의 평균을 구하려는 첫 번째 인수입니다.' },
            number2: { name: 'number2', detail: '절대 편차의 평균을 구하려는 2에서 255개의 인수입니다.' },
        },
    },
    AVERAGE: {
        description: '인수의 평균(산술 평균)을 반환합니다',
        abstract: '인수의 평균(산술 평균)을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/average-함수-047bac88-d466-426c-a32b-8f33eb960cf6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '평균을 구하려는 첫 번째 숫자, 셀 참조 또는 범위입니다.' },
            number2: { name: 'number2', detail: '평균을 구하려는 추가 숫자, 셀 참조 또는 범위로 최대 255개입니다.' },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'Finds the weighted average of a set of values, given the values and the corresponding weights.',
        abstract: 'Finds the weighted average of a set of values, given the values and the corresponding weights.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9084098?hl=en&ref_topic=3105600&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: '要计算平均数的值。' },
            weights: { name: 'weights', detail: '要应用的相应权重列表。' },
            additionalValues: { name: 'additional_values', detail: '要计算平均数的其他值。' },
            additionalWeights: { name: 'additional_weights', detail: '要应用的其他权重。' },
        },
    },
    AVERAGEA: {
        description: '인수의 평균(산술 평균)을 반환합니다(숫자, 텍스트 및 논리값 포함)',
        abstract: '인수의 평균(산술 평균)을 반환합니다(숫자, 텍스트 및 논리값 포함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/averagea-함수-f5f84098-d453-4f4c-bbba-3d2c66356091',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: '평균을 구하려는 첫 번째 인수입니다.' },
            value2: { name: 'value2', detail: '평균을 구하려는 2에서 255개의 추가 인수입니다.' },
        },
    },
    AVERAGEIF: {
        description: '범위에서 지정한 조건을 충족하는 모든 셀의 평균(산술 평균)을 반환합니다',
        abstract: '범위에서 지정한 조건을 충족하는 모든 셀의 평균을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/averageif-함수-faec8e2e-0dec-4308-af69-f5576d8ac642',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: '평균을 구하려는 하나 이상의 셀(숫자 또는 이름, 배열 또는 숫자가 포함된 참조)입니다.' },
            criteria: { name: 'criteria', detail: '평균을 구할 셀을 정의하는 숫자, 식, 셀 참조 또는 텍스트 형식의 조건입니다.' },
            averageRange: { name: 'average_range', detail: '평균을 구할 실제 셀입니다. 생략하면 range가 사용됩니다.' },
        },
    },
    AVERAGEIFS: {
        description: '여러 조건을 충족하는 모든 셀의 평균(산술 평균)을 반환합니다',
        abstract: '여러 조건을 충족하는 모든 셀의 평균을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/averageifs-함수-48910c45-1fc0-4389-a028-f7c5c3001690',
            },
        ],
        functionParameter: {
            averageRange: { name: 'average_range', detail: '평균을 구할 하나 이상의 셀(숫자 또는 이름, 배열 또는 숫자가 포함된 참조)입니다.' },
            criteriaRange1: { name: 'criteria_range1', detail: '조건을 평가할 범위입니다.' },
            criteria1: { name: 'criteria1', detail: '평균을 구할 셀을 정의하는 조건입니다.' },
            criteriaRange2: { name: 'criteria_range2', detail: '추가 범위입니다. 최대 127개의 범위 쌍을 입력할 수 있습니다.' },
            criteria2: { name: 'criteria2', detail: '추가 관련 조건입니다. 최대 127개의 조건 쌍을 입력할 수 있습니다.' },
        },
    },
    BETA_DIST: {
        description: '베타 누적 분포 함수를 반환합니다',
        abstract: '베타 누적 분포 함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/beta-dist-함수-11188c9c-780a-42c7-ba43-9ecb5a878d31',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '함수를 계산할 값입니다.' },
            alpha: { name: 'alpha', detail: '분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '분포의 매개 변수입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
            A: { name: 'A', detail: 'x 구간의 하한값입니다.' },
            B: { name: 'B', detail: 'x 구간의 상한값입니다.' },
        },
    },
    BETA_INV: {
        description: '지정된 베타 분포에 대한 누적 분포 함수의 역함수를 반환합니다',
        abstract: '지정된 베타 분포에 대한 누적 분포 함수의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/beta-inv-함수-e84cb8aa-8df0-4cf6-9892-83a341d252eb',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '베타 분포와 연관된 확률입니다.' },
            alpha: { name: 'alpha', detail: '분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '분포의 매개 변수입니다.' },
            A: { name: 'A', detail: 'x 구간의 하한값입니다.' },
            B: { name: 'B', detail: 'x 구간의 상한값입니다.' },
        },
    },
    BINOM_DIST: {
        description: '개별항 이항 분포 확률을 반환합니다',
        abstract: '개별항 이항 분포 확률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/binom-dist-함수-c5ae37b6-f39c-4be2-94c2-509a1480770c',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: '시행의 성공 횟수입니다.' },
            trials: { name: 'trials', detail: '독립 시행 횟수입니다.' },
            probabilityS: { name: 'probability_s', detail: '각 시행의 성공 확률입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
        },
    },
    BINOM_DIST_RANGE: {
        description: '시행 결과의 확률이 이항 분포를 사용하는 경우를 반환합니다',
        abstract: '시행 결과의 확률이 이항 분포를 사용하는 경우를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/binom-dist-range-함수-17331329-74c7-4053-bb4c-6653a7421595',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: '독립 시행 횟수입니다.' },
            probabilityS: { name: 'probability_s', detail: '각 시행의 성공 확률입니다.' },
            numberS: { name: 'number_s', detail: '시행의 성공 횟수입니다.' },
            numberS2: { name: 'number_s2', detail: '선택 사항입니다. 지정하면 성공 시행 횟수가 number_s와 number_s2 사이에 있을 확률을 반환합니다.' },
        },
    },
    BINOM_INV: {
        description: '누적 이항 분포가 기준값 이상인 최소값을 반환합니다',
        abstract: '누적 이항 분포가 기준값 이상인 최소값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/binom-inv-함수-80a0370c-ada6-49b4-83e7-05a91ba77ac9',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: '베르누이 시행 횟수입니다.' },
            probabilityS: { name: 'probability_s', detail: '각 시행의 성공 확률입니다.' },
            alpha: { name: 'alpha', detail: '기준값입니다.' },
        },
    },
    CHISQ_DIST: {
        description: '누적 베타 확률 밀도 함수를 반환합니다',
        abstract: '누적 베타 확률 밀도 함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/chisq-dist-함수-8486b05e-5c05-4942-a9ea-f6b341518732',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 평가할 값입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '자유도입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
        },
    },
    CHISQ_DIST_RT: {
        description: '카이 제곱 분포의 단측 확률을 반환합니다',
        abstract: '카이 제곱 분포의 단측 확률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/chisq-dist-rt-함수-dc4832e8-ed2b-49ae-8d7c-b28d5804c0f2',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 평가할 값입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '자유도입니다.' },
        },
    },
    CHISQ_INV: {
        description: '누적 베타 확률 밀도 함수를 반환합니다',
        abstract: '누적 베타 확률 밀도 함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/chisq-inv-함수-400db556-62b3-472d-80b3-254723e7092f',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '카이 제곱 분포와 연관된 확률입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '자유도입니다.' },
        },
    },
    CHISQ_INV_RT: {
        description: '카이 제곱 분포의 단측 확률의 역함수를 반환합니다',
        abstract: '카이 제곱 분포의 단측 확률의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/chisq-inv-rt-함수-435b5ed8-98d5-4da6-823f-293e2cbc94fe',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '카이 제곱 분포와 연관된 확률입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '자유도입니다.' },
        },
    },
    CHISQ_TEST: {
        description: '독립성 검정을 반환합니다',
        abstract: '독립성 검정을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/chisq-test-함수-2e8a7861-b14a-4985-aa93-fb88de3f260f',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: '예상값과 비교할 관찰값이 포함된 데이터 범위입니다.' },
            expectedRange: { name: 'expected_range', detail: '행과 열의 합계 곱을 총합계로 나눈 예상값이 포함된 데이터 범위입니다.' },
        },
    },
    CONFIDENCE_NORM: {
        description: '정규 분포를 사용하여 모집단 평균의 신뢰 구간을 반환합니다',
        abstract: '정규 분포를 사용하여 모집단 평균의 신뢰 구간을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/confidence-norm-함수-7cec58a6-85bb-488d-91c3-63828d4fbfd4',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '신뢰 수준을 계산하는 데 사용되는 유의 수준입니다.' },
            standardDev: { name: 'standard_dev', detail: '데이터 범위의 모집단 표준 편차이며 이미 알려진 것으로 가정합니다.' },
            size: { name: 'size', detail: '표본 크기입니다.' },
        },
    },
    CONFIDENCE_T: {
        description: '스튜던트 t 분포를 사용하여 모집단 평균의 신뢰 구간을 반환합니다',
        abstract: '스튜던트 t 분포를 사용하여 모집단 평균의 신뢰 구간을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/confidence-t-함수-e8eca395-6c3a-4ba9-9003-79ccc61d3c53',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '신뢰 수준을 계산하는 데 사용되는 유의 수준입니다.' },
            standardDev: { name: 'standard_dev', detail: '데이터 범위의 모집단 표준 편차이며 이미 알려진 것으로 가정합니다.' },
            size: { name: 'size', detail: '표본 크기입니다.' },
        },
    },
    CORREL: {
        description: '두 데이터 집합 사이의 상관 계수를 반환합니다',
        abstract: '두 데이터 집합 사이의 상관 계수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/correl-함수-995dcef7-0c0a-4bed-a3fb-239d7b68ca92',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '값의 셀 범위입니다.' },
            array2: { name: 'array2', detail: '값의 두 번째 셀 범위입니다.' },
        },
    },
    COUNT: {
        description: '인수 목록에서 숫자의 개수를 계산합니다',
        abstract: '인수 목록에서 숫자의 개수를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/count-함수-a59cd7fc-b623-4d93-87a4-d23bf411294c',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: '숫자의 개수를 구하려는 첫 번째 항목, 셀 참조 또는 범위입니다.' },
            value2: { name: 'value2', detail: '숫자의 개수를 구하려는 추가 항목, 셀 참조 또는 범위로 최대 255개입니다.' },
        },
    },
    COUNTA: {
        description: '인수 목록에서 값의 개수를 계산합니다',
        abstract: '인수 목록에서 값의 개수를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/counta-함수-7dc98875-d5c1-46f1-9a82-53f3219e2509',
            },
        ],
        functionParameter: {
            number1: {
                name: 'value1',
                detail: '개수를 구하려는 첫 번째 인수입니다.',
            },
            number2: {
                name: 'value2',
                detail: '개수를 구하려는 추가 인수로 최대 255개입니다.',
            },
        },
    },
    COUNTBLANK: {
        description: '범위에서 빈 셀의 개수를 계산합니다',
        abstract: '범위에서 빈 셀의 개수를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/countblank-함수-6a92d772-675c-4bee-b346-24af6bd3ac22',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: '빈 셀의 개수를 구하려는 범위입니다.' },
        },
    },
    COUNTIF: {
        description: '범위에서 지정한 조건을 충족하는 셀의 개수를 계산합니다',
        abstract: '범위에서 지정한 조건을 충족하는 셀의 개수를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/countif-함수-e0de10c6-f885-4e71-abb4-1f464816df34',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: '개수를 구하려는 셀 그룹입니다.' },
            criteria: { name: 'criteria', detail: '개수를 계산할 셀을 결정하는 숫자, 식, 셀 참조 또는 텍스트 문자열 형식의 조건입니다.' },
        },
    },
    COUNTIFS: {
        description: '범위에서 여러 조건을 충족하는 셀의 개수를 계산합니다',
        abstract: '범위에서 여러 조건을 충족하는 셀의 개수를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/countifs-함수-dda3dc6e-f74e-4aee-88bc-aa8c2a866842',
            },
        ],
        functionParameter: {
            criteriaRange1: { name: 'criteria_range1', detail: '조건을 평가할 첫 번째 범위입니다.' },
            criteria1: { name: 'criteria1', detail: '개수를 계산할 셀을 정의하는 조건입니다.' },
            criteriaRange2: { name: 'criteria_range2', detail: '추가 범위입니다. 최대 127개의 범위 쌍을 입력할 수 있습니다.' },
            criteria2: { name: 'criteria2', detail: '추가 관련 조건입니다. 최대 127개의 조건 쌍을 입력할 수 있습니다.' },
        },
    },
    COVARIANCE_P: {
        description: '모집단 공분산, 즉 두 데이터 집합에서 대응하는 데이터 요소의 편차의 곱의 평균을 반환합니다',
        abstract: '모집단 공분산을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/covariance-p-함수-6f0e1e6d-956d-4e4b-9943-cfef0bf9edfc',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '정수의 첫 번째 셀 범위입니다.' },
            array2: { name: 'array2', detail: '정수의 두 번째 셀 범위입니다.' },
        },
    },
    COVARIANCE_S: {
        description: '표본 공분산, 즉 두 데이터 집합에서 각 데이터 요소 쌍의 편차의 곱의 평균을 반환합니다',
        abstract: '표본 공분산을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/covariance-s-함수-0a539b74-7371-42aa-a18f-1f5320314977',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '정수의 첫 번째 셀 범위입니다.' },
            array2: { name: 'array2', detail: '정수의 두 번째 셀 범위입니다.' },
        },
    },
    DEVSQ: {
        description: '편차의 제곱의 합을 반환합니다',
        abstract: '편차의 제곱의 합을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/devsq-함수-8b739616-8376-4df5-8bd0-cfe0a6caf444',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '평균의 편차를 계산하려는 1에서 255개의 인수입니다.' },
            number2: { name: 'number2', detail: '평균의 편차를 계산하려는 1에서 255개의 인수입니다.' },
        },
    },
    EXPON_DIST: {
        description: '지수 분포를 반환합니다',
        abstract: '지수 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/expon-dist-함수-4c12ae24-e563-4155-bf3e-8b78b6ae140e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '함수를 계산할 값입니다.' },
            lambda: { name: 'lambda', detail: '매개 변수 값입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
        },
    },
    F_DIST: {
        description: 'F 확률 분포를 반환합니다',
        abstract: 'F 확률 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/f-dist-함수-a887efdc-7c8e-46cb-a74a-f884cd29b25d',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '함수를 계산할 값입니다.' },
            degFreedom1: { name: 'deg_freedom1', detail: '분자 자유도입니다.' },
            degFreedom2: { name: 'deg_freedom2', detail: '분모 자유도입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
        },
    },
    F_DIST_RT: {
        description: 'F 확률 분포를 반환합니다',
        abstract: 'F 확률 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/f-dist-rt-함수-d74cbb00-6017-4ac9-b7d7-6049badc0520',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '함수를 계산할 값입니다.' },
            degFreedom1: { name: 'deg_freedom1', detail: '분자 자유도입니다.' },
            degFreedom2: { name: 'deg_freedom2', detail: '분모 자유도입니다.' },
        },
    },
    F_INV: {
        description: 'F 확률 분포의 역함수를 반환합니다',
        abstract: 'F 확률 분포의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/f-inv-함수-0dda0cf9-4ea0-42fd-8c3c-417a1ff30dbe',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'F 누적 분포와 연관된 확률입니다.' },
            degFreedom1: { name: 'deg_freedom1', detail: '분자 자유도입니다.' },
            degFreedom2: { name: 'deg_freedom2', detail: '분모 자유도입니다.' },
        },
    },
    F_INV_RT: {
        description: 'F 확률 분포의 역함수를 반환합니다',
        abstract: 'F 확률 분포의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/f-inv-rt-함수-d371aa8f-b0b1-40ef-9cc2-496f0693ac00',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'F 누적 분포와 연관된 확률입니다.' },
            degFreedom1: { name: 'deg_freedom1', detail: '분자 자유도입니다.' },
            degFreedom2: { name: 'deg_freedom2', detail: '분모 자유도입니다.' },
        },
    },
    F_TEST: {
        description: 'F-검정의 결과를 반환합니다',
        abstract: 'F-검정의 결과를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/f-test-함수-100a59e7-4108-46f8-8443-78ffacb6c0a7',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '데이터의 첫 번째 배열 또는 범위입니다.' },
            array2: { name: 'array2', detail: '데이터의 두 번째 배열 또는 범위입니다.' },
        },
    },
    FISHER: {
        description: 'Fisher 변환을 반환합니다',
        abstract: 'Fisher 변환을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/fisher-함수-d656523c-5076-4f95-b87b-7741bf236c69',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '변환할 숫자 값입니다.' },
        },
    },
    FISHERINV: {
        description: 'Fisher 변환의 역변환을 반환합니다',
        abstract: 'Fisher 변환의 역변환을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/fisherinv-함수-62504b39-415a-4284-a285-19c8e82f86bb',
            },
        ],
        functionParameter: {
            y: { name: 'y', detail: '역변환할 값입니다.' },
        },
    },
    FORECAST: {
        description: '선형 추세를 따라 값을 반환합니다',
        abstract: '선형 추세를 따라 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/forecast-및-forecast-linear-함수-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '값을 예측하려는 데이터 요소입니다.' },
            knownYs: { name: 'known_ys', detail: '종속 배열이나 데이터 범위입니다.' },
            knownXs: { name: 'known_xs', detail: '독립 배열이나 데이터 범위입니다.' },
        },
    },
    FORECAST_ETS: {
        description: 'Returns a future value based on existing (historical) values by using the AAA version of the Exponential Smoothing (ETS) algorithm',
        abstract: 'Returns a future value based on existing (historical) values by using the AAA version of the Exponential Smoothing (ETS) algorithm',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: 'Returns a confidence interval for the forecast value at the specified target date',
        abstract: 'Returns a confidence interval for the forecast value at the specified target date',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.CONFINT',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: 'Returns the length of the repetitive pattern Excel detects for the specified time series',
        abstract: 'Returns the length of the repetitive pattern Excel detects for the specified time series',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.SEASONALITY',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_ETS_STAT: {
        description: 'Returns a statistical value as a result of time series forecasting',
        abstract: 'Returns a statistical value as a result of time series forecasting',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/en-us/office/forecasting-functions-reference-897a2fe9-6595-4680-a0b0-93e0308d5f6e#_FORECAST.ETS.STAT',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: 'first' },
            number2: { name: 'number2', detail: 'second' },
        },
    },
    FORECAST_LINEAR: {
        description: '기존 값을 기반으로 미래 값을 반환합니다',
        abstract: '기존 값을 기반으로 미래 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/forecast-및-forecast-linear-함수-50ca49c9-7b40-4892-94e4-7ad38bbeda99',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '값을 예측하려는 데이터 요소입니다.' },
            knownYs: { name: 'known_ys', detail: '종속 배열이나 데이터 범위입니다.' },
            knownXs: { name: 'known_xs', detail: '독립 배열이나 데이터 범위입니다.' },
        },
    },
    FREQUENCY: {
        description: '빈도 분포를 세로 배열로 반환합니다',
        abstract: '빈도 분포를 세로 배열로 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/frequency-함수-44e3be2b-eca0-42cd-a3f7-fd9ea898fdb9',
            },
        ],
        functionParameter: {
            dataArray: { name: 'data_array', detail: '빈도를 계산하려는 값의 배열 또는 참조입니다.' },
            binsArray: { name: 'bins_array', detail: 'data_array의 값을 그룹화할 간격의 배열 또는 참조입니다.' },
        },
    },
    GAMMA: {
        description: '감마 함수 값을 반환합니다',
        abstract: '감마 함수 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/gamma-함수-ce1702b1-cf55-471d-8307-f83be0fc5297',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: 'GAMMA를 계산하려는 숫자 값입니다.' },
        },
    },
    GAMMA_DIST: {
        description: '감마 분포를 반환합니다',
        abstract: '감마 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/gamma-dist-함수-9b6f1538-d11c-4d5f-8966-21f6a2201def',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 평가할 값입니다.' },
            alpha: { name: 'alpha', detail: '분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '분포의 매개 변수입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
        },
    },
    GAMMA_INV: {
        description: '감마 누적 분포의 역함수를 반환합니다',
        abstract: '감마 누적 분포의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/gamma-inv-함수-74991443-c2b0-4be5-aaab-1aa4d71fbb18',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '감마 분포와 연관된 확률입니다.' },
            alpha: { name: 'alpha', detail: '분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '분포의 매개 변수입니다.' },
        },
    },
    GAMMALN: {
        description: '감마 함수의 자연 로그 Γ(x)를 반환합니다',
        abstract: '감마 함수의 자연 로그 Γ(x)를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/gammaln-함수-b838c48b-c65f-484f-9e1d-141c55470eb9',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'GAMMALN을 계산하려는 값입니다.' },
        },
    },
    GAMMALN_PRECISE: {
        description: '감마 함수의 자연 로그 Γ(x)를 반환합니다',
        abstract: '감마 함수의 자연 로그 Γ(x)를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/gammaln-precise-함수-5cdfe601-4e1e-4189-9d74-241ef1caa599',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'GAMMALN을 계산하려는 값입니다.' },
        },
    },
    GAUSS: {
        description: '표준 정규 누적 분포보다 0.5 작은 값을 반환합니다',
        abstract: '표준 정규 누적 분포보다 0.5 작은 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/gauss-함수-069f1b4e-7dee-4d6a-a71f-4b69044a6b33',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: '숫자입니다.' },
        },
    },
    GEOMEAN: {
        description: '기하 평균을 반환합니다',
        abstract: '기하 평균을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/geomean-함수-db1ac48d-25a5-40a0-ab83-0b38980e40d5',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '평균을 계산하려는 1에서 255개의 인수입니다.' },
            number2: { name: 'number2', detail: '평균을 계산하려는 1에서 255개의 인수입니다.' },
        },
    },
    GROWTH: {
        description: '지수 추세를 따라 값을 반환합니다',
        abstract: '지수 추세를 따라 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/growth-함수-541a91dc-3d5e-437d-b156-21324e68b80d',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_ys', detail: '관계 b*m^x에서 이미 알고 있는 y 값의 집합입니다.' },
            knownXs: { name: 'known_xs', detail: '관계 b*m^x에서 이미 알고 있는 x 값의 선택적 집합입니다.' },
            newXs: { name: 'new_xs', detail: 'GROWTH가 해당 y 값을 반환하도록 하려는 새 x 값입니다.' },
            constb: { name: 'const', detail: '상수 b를 1과 같도록 강제할지 여부를 지정하는 논리값입니다.' },
        },
    },
    HARMEAN: {
        description: '조화 평균을 반환합니다',
        abstract: '조화 평균을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/harmean-함수-5efd9184-fab5-42f9-b1d3-57883a1d3bc6',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '평균을 계산하려는 1에서 255개의 인수입니다.' },
            number2: { name: 'number2', detail: '평균을 계산하려는 1에서 255개의 인수입니다.' },
        },
    },
    HYPGEOM_DIST: {
        description: '초기하 분포를 반환합니다',
        abstract: '초기하 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/hypgeom-dist-함수-6dbd547f-1d12-4b1f-8ae5-b0d9e3d22fbf',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: '표본의 성공 횟수입니다.' },
            numberSample: { name: 'number_sample', detail: '표본 크기입니다.' },
            populationS: { name: 'population_s', detail: '모집단의 성공 횟수입니다.' },
            numberPop: { name: 'number_pop', detail: '모집단 크기입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
        },
    },
    INTERCEPT: {
        description: '선형 회귀선의 절편을 반환합니다',
        abstract: '선형 회귀선의 절편을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/intercept-함수-2a9b74e2-9d47-4772-b663-3bca70bf63ef',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_ys', detail: '종속 관찰값 또는 데이터의 집합입니다.' },
            knownXs: { name: 'known_xs', detail: '독립 관찰값 또는 데이터의 집합입니다.' },
        },
    },
    KURT: {
        description: '데이터 집합의 첨도를 반환합니다',
        abstract: '데이터 집합의 첨도를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/kurt-함수-bc3a265c-5da4-4dcb-b7fd-c237789095ab',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '첨도를 계산하려는 1에서 255개의 인수입니다.' },
            number2: { name: 'number2', detail: '첨도를 계산하려는 1에서 255개의 인수입니다.' },
        },
    },
    LARGE: {
        description: '데이터 집합에서 k번째로 큰 값을 반환합니다',
        abstract: '데이터 집합에서 k번째로 큰 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/large-함수-3af0af19-1190-42bb-bb8b-01672ec00a64',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'k번째로 큰 값을 결정하려는 데이터의 배열 또는 범위입니다.' },
            k: { name: 'k', detail: '배열에서 반환할 n번째로 큰 값의 위치입니다.' },
        },
    },
    LINEST: {
        description: '선형 추세의 매개 변수를 반환합니다',
        abstract: '선형 추세의 매개 변수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/linest-함수-84d7d0d9-6e50-4101-977a-fa7abf772b6d',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_ys', detail: 'y = mx + b 관계에서 이미 알고 있는 y 값의 집합입니다.' },
            knownXs: { name: 'known_xs', detail: 'y = mx + b 관계에서 이미 알고 있는 x 값의 선택적 집합입니다.' },
            constb: { name: 'const', detail: '상수 b를 0으로 강제할지 여부를 지정하는 논리값입니다.' },
            stats: { name: 'stats', detail: '추가 회귀 통계를 반환할지 여부를 지정하는 논리값입니다.' },
        },
    },
    LOGEST: {
        description: '지수 추세의 매개 변수를 반환합니다',
        abstract: '지수 추세의 매개 변수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/logest-함수-f27462d8-3657-4030-866b-a272c1d18b4b',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_ys', detail: 'y = b*m^x 관계에서 이미 알고 있는 y 값의 집합입니다.' },
            knownXs: { name: 'known_xs', detail: 'y = b*m^x 관계에서 이미 알고 있는 x 값의 선택적 집합입니다.' },
            constb: { name: 'const', detail: '상수 b를 1과 같도록 강제할지 여부를 지정하는 논리값입니다.' },
            stats: { name: 'stats', detail: '추가 회귀 통계를 반환할지 여부를 지정하는 논리값입니다.' },
        },
    },
    LOGNORM_DIST: {
        description: '로그 정규 누적 분포를 반환합니다',
        abstract: '로그 정규 누적 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/lognorm-dist-함수-eb60d00b-48a9-4217-be2b-6074aee6b070',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '함수를 평가할 값입니다.' },
            mean: { name: 'mean', detail: 'ln(x)의 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: 'ln(x)의 표준 편차입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
        },
    },
    LOGNORM_INV: {
        description: '로그 정규 누적 분포의 역함수를 반환합니다',
        abstract: '로그 정규 누적 분포의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/lognorm-inv-함수-fe79751a-f1f2-4af8-a0a1-e151b2d4f600',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '로그 정규 분포와 연관된 확률입니다.' },
            mean: { name: 'mean', detail: 'ln(x)의 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: 'ln(x)의 표준 편차입니다.' },
        },
    },
    MARGINOFERROR: {
        description: 'Calculates the margin of error from a range of values and a confidence level.',
        abstract: 'Calculates the margin of error from a range of values and a confidence level.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/12487850?hl=en&sjid=11250989209896695200-AP',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'The range of values used to calculate the margin of error.' },
            confidence: { name: 'confidence', detail: 'The desired confidence level between (0, 1).' },
        },
    },
    MAX: {
        description: '인수 목록에서 최대값을 반환합니다',
        abstract: '인수 목록에서 최대값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/max-함수-e0012258-dde4-4e73-a28e-0ec0df6d3071',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '최대값을 찾으려는 첫 번째 숫자입니다.' },
            number2: { name: 'number2', detail: '최대값을 찾으려는 2에서 255개의 숫자입니다.' },
        },
    },
    MAXA: {
        description: '인수 목록에서 최대값을 반환합니다(숫자, 텍스트 및 논리값 포함)',
        abstract: '인수 목록에서 최대값을 반환합니다(숫자, 텍스트 및 논리값 포함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/maxa-함수-814bda1e-3840-4bff-9365-2f59ac2ee62d',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: '최대값을 찾으려는 첫 번째 인수입니다.' },
            value2: { name: 'value2', detail: '최대값을 찾으려는 2에서 255개의 인수입니다.' },
        },
    },
    MAXIFS: {
        description: '조건 집합에 의해 지정된 셀 중에서 최대값을 반환합니다',
        abstract: '조건 집합에 의해 지정된 셀 중에서 최대값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/maxifs-함수-dfd611e6-da2c-488a-919b-9b6376b28883',
            },
        ],
        functionParameter: {
            maxRange: { name: 'max_range', detail: '최대값을 결정하려는 셀입니다.' },
            criteriaRange1: { name: 'criteria_range1', detail: '조건을 평가할 범위입니다.' },
            criteria1: { name: 'criteria1', detail: '최대값을 결정할 셀을 정의하는 조건입니다.' },
            criteriaRange2: { name: 'criteria_range2', detail: '추가 범위입니다. 최대 127개의 범위 쌍을 입력할 수 있습니다.' },
            criteria2: { name: 'criteria2', detail: '추가 관련 조건입니다. 최대 127개의 조건 쌍을 입력할 수 있습니다.' },
        },
    },
    MEDIAN: {
        description: '주어진 숫자의 중앙값을 반환합니다',
        abstract: '주어진 숫자의 중앙값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/median-함수-d0916313-4753-414c-8537-ce85bdd967d2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '중앙값을 계산하려는 1에서 255개의 숫자입니다.' },
            number2: { name: 'number2', detail: '중앙값을 계산하려는 1에서 255개의 숫자입니다.' },
        },
    },
    MIN: {
        description: '인수 목록에서 최소값을 반환합니다',
        abstract: '인수 목록에서 최소값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/min-함수-61635d12-920f-4ce2-a70f-96f202dcc152',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '최소값을 찾으려는 첫 번째 숫자입니다.' },
            number2: { name: 'number2', detail: '최소값을 찾으려는 2에서 255개의 숫자입니다.' },
        },
    },
    MINA: {
        description: '인수 목록에서 최소값을 반환합니다(숫자, 텍스트 및 논리값 포함)',
        abstract: '인수 목록에서 최소값을 반환합니다(숫자, 텍스트 및 논리값 포함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/mina-함수-245a6f46-7ca5-4dc7-ab49-805341bc31d3',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: '최소값을 찾으려는 첫 번째 인수입니다.' },
            value2: { name: 'value2', detail: '최소값을 찾으려는 2에서 255개의 인수입니다.' },
        },
    },
    MINIFS: {
        description: '조건 집합에 의해 지정된 셀 중에서 최소값을 반환합니다',
        abstract: '조건 집합에 의해 지정된 셀 중에서 최소값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/minifs-함수-6ca1ddaa-079b-4e74-80cc-72eef32e6599',
            },
        ],
        functionParameter: {
            minRange: { name: 'min_range', detail: '최소값을 결정하려는 셀입니다.' },
            criteriaRange1: { name: 'criteria_range1', detail: '조건을 평가할 범위입니다.' },
            criteria1: { name: 'criteria1', detail: '최소값을 결정할 셀을 정의하는 조건입니다.' },
            criteriaRange2: { name: 'criteria_range2', detail: '추가 범위입니다. 최대 127개의 범위 쌍을 입력할 수 있습니다.' },
            criteria2: { name: 'criteria2', detail: '추가 관련 조건입니다. 최대 127개의 조건 쌍을 입력할 수 있습니다.' },
        },
    },
    MODE_MULT: {
        description: '배열이나 데이터 범위에서 가장 자주 발생하는 값의 세로 배열을 반환합니다',
        abstract: '배열이나 데이터 범위에서 가장 자주 발생하는 값의 세로 배열을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/mode-mult-함수-50fd9464-b2ba-4191-b57a-39446689ae8c',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '최빈값을 계산하려는 1에서 254개의 인수입니다.' },
            number2: { name: 'number2', detail: '최빈값을 계산하려는 1에서 254개의 인수입니다.' },
        },
    },
    MODE_SNGL: {
        description: '데이터 집합에서 가장 자주 발생하는 값을 반환합니다',
        abstract: '데이터 집합에서 가장 자주 발생하는 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/mode-sngl-함수-f1267c16-66c6-4386-959f-8fba5f8bb7f8',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '최빈값을 계산하려는 1에서 254개의 인수입니다.' },
            number2: { name: 'number2', detail: '최빈값을 계산하려는 1에서 254개의 인수입니다.' },
        },
    },
    NEGBINOM_DIST: {
        description: '음이항 분포를 반환합니다',
        abstract: '음이항 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/negbinom-dist-함수-c8239f89-c2d0-45bd-b6af-172e570f8599',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: '실패 횟수입니다.' },
            numberS: { name: 'number_s', detail: '성공의 임계값입니다.' },
            probabilityS: { name: 'probability_s', detail: '성공 확률입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
        },
    },
    NORM_DIST: {
        description: '정규 누적 분포를 반환합니다',
        abstract: '정규 누적 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/norm-dist-함수-edb1cc14-a21c-4e53-839d-8082074c9f8d',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 계산하려는 값입니다.' },
            mean: { name: 'mean', detail: '분포의 산술 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: '분포의 표준 편차입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
        },
    },
    NORM_INV: {
        description: '정규 누적 분포의 역함수를 반환합니다',
        abstract: '정규 누적 분포의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/norm-inv-함수-54b30935-fee7-493c-bedb-2278a9db7e13',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '정규 분포에 해당하는 확률입니다.' },
            mean: { name: 'mean', detail: '분포의 산술 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: '분포의 표준 편차입니다.' },
        },
    },
    NORM_S_DIST: {
        description: '표준 정규 누적 분포를 반환합니다',
        abstract: '표준 정규 누적 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/norm-s-dist-함수-1e787282-3832-4520-a9ae-bd2a8d99ba88',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: '분포를 계산하려는 값입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
        },
    },
    NORM_S_INV: {
        description: '표준 정규 누적 분포의 역함수를 반환합니다',
        abstract: '표준 정규 누적 분포의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/norm-s-inv-함수-d6d556b4-ab7f-49cd-b526-5a20918452b1',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '정규 분포에 해당하는 확률입니다.' },
        },
    },
    PEARSON: {
        description: 'Pearson 곱 모멘트 상관 계수를 반환합니다',
        abstract: 'Pearson 곱 모멘트 상관 계수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/pearson-함수-0c3e30fc-e5af-49c4-808a-3ef66e034c18',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '독립 값의 집합입니다.' },
            array2: { name: 'array2', detail: '종속 값의 집합입니다.' },
        },
    },
    PERCENTILE_EXC: {
        description: '범위에 있는 값의 k번째 백분위수를 반환합니다. 여기서 k는 0..1 범위에 있으며 0과 1은 제외됩니다',
        abstract: '범위에 있는 값의 k번째 백분위수를 반환합니다. 여기서 k는 0..1 범위에 있으며 0과 1은 제외됩니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/percentile-exc-함수-bbaa7204-e9e1-4010-85bf-c31dc5dce4ba',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '상대 위치를 정의하는 데이터의 배열 또는 범위입니다.' },
            k: { name: 'k', detail: '0..1 범위(0과 1 제외)의 백분위수 값입니다.' },
        },
    },
    PERCENTILE_INC: {
        description: '범위에 있는 값의 k번째 백분위수를 반환합니다',
        abstract: '범위에 있는 값의 k번째 백분위수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/percentile-inc-함수-680f9539-45eb-410b-9a5e-c1355e5fe2ed',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '상대 위치를 정의하는 데이터의 배열 또는 범위입니다.' },
            k: { name: 'k', detail: '0..1 범위(0과 1 포함)의 백분위수 값입니다.' },
        },
    },
    PERCENTRANK_EXC: {
        description: '데이터 집합에서 값의 순위를 해당 집합의 백분율(0..1, 0과 1 제외)로 반환합니다',
        abstract: '데이터 집합에서 값의 순위를 해당 집합의 백분율(0..1, 0과 1 제외)로 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/percentrank-exc-함수-d8afee96-b7e2-4a2f-8c01-8fcdedaa6314',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '상대 위치를 정의하는 데이터의 배열 또는 범위입니다.' },
            x: { name: 'x', detail: '순위를 알려는 값입니다.' },
            significance: { name: 'significance', detail: '반환된 백분율 값의 유효 자릿수를 식별하는 값입니다.' },
        },
    },
    PERCENTRANK_INC: {
        description: '데이터 집합에서 값의 백분율 순위를 반환합니다',
        abstract: '데이터 집합에서 값의 백분율 순위를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/percentrank-inc-함수-149592c9-00c0-49ba-86c1-c1f45b80463a',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '상대 위치를 정의하는 데이터의 배열 또는 범위입니다.' },
            x: { name: 'x', detail: '순위를 알려는 값입니다.' },
            significance: { name: 'significance', detail: '반환된 백분율 값의 유효 자릿수를 식별하는 값입니다.' },
        },
    },
    PERMUT: {
        description: '지정한 개체 수로 만들 수 있는 순열의 수를 반환합니다',
        abstract: '지정한 개체 수로 만들 수 있는 순열의 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/permut-함수-3bd1cb9a-2880-41ab-a197-f246a7a602d3',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '개체 수를 나타내는 정수입니다.' },
            numberChosen: { name: 'number_chosen', detail: '각 순열의 개체 수를 나타내는 정수입니다.' },
        },
    },
    PERMUTATIONA: {
        description: '지정된 개체 수(반복 포함)에서 선택할 수 있는 순열의 수를 반환합니다',
        abstract: '지정된 개체 수(반복 포함)에서 선택할 수 있는 순열의 수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/permutationa-함수-6c7d7fdc-d657-44e6-aa19-2857b25cae4e',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '개체 수를 나타내는 정수입니다.' },
            numberChosen: { name: 'number_chosen', detail: '각 순열의 개체 수를 나타내는 정수입니다.' },
        },
    },
    PHI: {
        description: '표준 정규 분포의 밀도 함수 값을 반환합니다',
        abstract: '표준 정규 분포의 밀도 함수 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/phi-함수-23e49bc6-a8e8-402d-98d3-9ded87f6295c',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '표준 정규 분포의 밀도를 구하려는 숫자입니다.' },
        },
    },
    POISSON_DIST: {
        description: '포아송 분포를 반환합니다',
        abstract: '포아송 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/poisson-dist-함수-c5ae37b6-f39c-4be2-94c2-509a1480770c',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '이벤트 수입니다.' },
            mean: { name: 'mean', detail: '예상되는 숫자 값입니다.' },
            cumulative: { name: 'cumulative', detail: '반환된 확률 분포의 형태를 결정하는 논리값입니다.' },
        },
    },
    PROB: {
        description: '범위에 있는 값이 두 한계값 사이에 있을 확률을 반환합니다',
        abstract: '범위에 있는 값이 두 한계값 사이에 있을 확률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/prob-함수-9ac30561-c81c-42cd-a3f7-fd9ea898fdb9',
            },
        ],
        functionParameter: {
            xRange: { name: 'x_range', detail: '각각에 대한 확률이 연결된 x 숫자 값의 범위입니다.' },
            probRange: { name: 'prob_range', detail: 'x_range의 값과 연결된 확률 집합입니다.' },
            lowerLimit: { name: 'lower_limit', detail: '확률을 계산하려는 값의 하한입니다.' },
            upperLimit: { name: 'upper_limit', detail: '확률을 계산하려는 값의 선택적 상한입니다.' },
        },
    },
    QUARTILE_EXC: {
        description: '0..1 범위(0과 1 제외)의 백분위수 값을 기준으로 데이터 집합의 사분위수를 반환합니다',
        abstract: '0..1 범위(0과 1 제외)의 백분위수 값을 기준으로 데이터 집합의 사분위수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/quartile-exc-함수-5a355b7a-840b-4a01-b0f1-f538c2864cad',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '사분위수 값을 구하려는 배열 또는 셀 범위입니다.' },
            quart: { name: 'quart', detail: '반환할 사분위수를 나타냅니다.' },
        },
    },
    QUARTILE_INC: {
        description: '데이터 집합의 사분위수를 반환합니다',
        abstract: '데이터 집합의 사분위수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/quartile-inc-함수-1bbacc80-5075-42f1-aed6-47d735c4819d',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '사분위수 값을 구하려는 배열 또는 셀 범위입니다.' },
            quart: { name: 'quart', detail: '반환할 사분위수를 나타냅니다.' },
        },
    },
    RANK_AVG: {
        description: '숫자 목록에서 숫자의 순위를 반환합니다',
        abstract: '숫자 목록에서 숫자의 순위를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/rank-avg-함수-bd406a6f-eb38-4d73-aa8e-6d1c3c72e83a',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '순위를 찾으려는 숫자입니다.' },
            ref: { name: 'ref', detail: '숫자 목록의 배열 또는 참조입니다. ref의 숫자가 아닌 값은 무시됩니다.' },
            order: { name: 'order', detail: 'number 순위를 매기는 방법을 지정하는 숫자입니다.' },
        },
    },
    RANK_EQ: {
        description: '숫자 목록에서 숫자의 순위를 반환합니다',
        abstract: '숫자 목록에서 숫자의 순위를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/rank-eq-함수-284858ce-8ef6-450e-b662-26245be04a40',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '순위를 찾으려는 숫자입니다.' },
            ref: { name: 'ref', detail: '숫자 목록의 배열 또는 참조입니다. ref의 숫자가 아닌 값은 무시됩니다.' },
            order: { name: 'order', detail: 'number 순위를 매기는 방법을 지정하는 숫자입니다.' },
        },
    },
    RSQ: {
        description: 'Pearson 곱 모멘트 상관 계수의 제곱을 반환합니다',
        abstract: 'Pearson 곱 모멘트 상관 계수의 제곱을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/rsq-함수-d7161715-25a5-40a0-ab83-0b38980e40d5',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: 'The dependent array or range of data.' },
            array2: { name: 'array2', detail: 'The independent array or range of data.' },
        },
    },
    SKEW: {
        description: '분포의 왜도를 반환합니다',
        abstract: '분포의 왜도를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/skew-함수-bdf49d86-b1ef-4804-a046-28eaea69c9fa',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '왜도를 계산하려는 1에서 255개의 인수입니다.' },
            number2: { name: 'number2', detail: '왜도를 계산하려는 1에서 255개의 인수입니다.' },
        },
    },
    SKEW_P: {
        description: '모집단을 기반으로 분포의 왜도를 반환합니다: 평균 주위의 비대칭 정도를 나타냅니다',
        abstract: '모집단을 기반으로 분포의 왜도를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/skew-p-함수-76530a5c-99b9-48a1-8392-26632d542fcb',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '왜도를 계산하려는 1에서 254개의 숫자 또는 숫자가 포함된 이름, 배열 또는 참조입니다.' },
            number2: { name: 'number2', detail: '왜도를 계산하려는 1에서 254개의 숫자 또는 숫자가 포함된 이름, 배열 또는 참조입니다.' },
        },
    },
    SLOPE: {
        description: '선형 회귀선의 기울기를 반환합니다',
        abstract: '선형 회귀선의 기울기를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/slope-함수-11fb8f97-3117-4813-98aa-61d7e01276b9',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_ys', detail: '종속 데이터 요소의 배열이나 셀 범위입니다.' },
            knownXs: { name: 'known_xs', detail: '독립 데이터 요소의 집합입니다.' },
        },
    },
    SMALL: {
        description: '데이터 집합에서 k번째로 작은 값을 반환합니다',
        abstract: '데이터 집합에서 k번째로 작은 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/small-함수-3af0af19-1190-42bb-bb8b-01672ec00a64',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'k번째로 작은 값을 결정하려는 배열 또는 숫자 데이터 범위입니다.' },
            k: { name: 'k', detail: '배열 또는 데이터 범위에서 반환할 가장 작은 값의 위치입니다.' },
        },
    },
    STANDARDIZE: {
        description: '정규화된 값을 반환합니다',
        abstract: '정규화된 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/standardize-함수-81d66554-2d54-40ec-ba83-6437108ee775',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '정규화하려는 값입니다.' },
            mean: { name: 'mean', detail: '분포의 산술 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: '분포의 표준 편차입니다.' },
        },
    },
    STDEV_P: {
        description: '전체 모집단을 기준으로 표준 편차를 계산합니다',
        abstract: '전체 모집단을 기준으로 표준 편차를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/stdev-p-함수-6e917c05-31a0-496f-ade7-4f4e7462f285',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '모집단에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '모집단에 해당하는 2에서 254개의 숫자 인수입니다.' },
        },
    },
    STDEV_S: {
        description: '표본을 기준으로 표준 편차를 평가합니다',
        abstract: '표본을 기준으로 표준 편차를 평가합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/stdev-s-함수-0a539b74-7371-42aa-a18f-1f5320314977',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '표본에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '표본에 해당하는 2에서 254개의 숫자 인수입니다.' },
        },
    },
    STDEVA: {
        description: '표본을 기준으로 표준 편차를 평가합니다(숫자, 텍스트 및 논리값 포함)',
        abstract: '표본을 기준으로 표준 편차를 평가합니다(숫자, 텍스트 및 논리값 포함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/stdeva-함수-5ff38888-7ea5-4dc7-ab49-805341bc31d3',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: '표본에 해당하는 첫 번째 인수입니다.' },
            value2: { name: 'value2', detail: '표본에 해당하는 2에서 254개의 인수입니다.' },
        },
    },
    STDEVPA: {
        description: '전체 모집단을 기준으로 표준 편차를 계산합니다(숫자, 텍스트 및 논리값 포함)',
        abstract: '전체 모집단을 기준으로 표준 편차를 계산합니다(숫자, 텍스트 및 논리값 포함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/stdevpa-함수-5578d4d6-455a-4308-9991-d405afe2c28c',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: '모집단에 해당하는 첫 번째 인수입니다.' },
            value2: { name: 'value2', detail: '모집단에 해당하는 2에서 254개의 인수입니다.' },
        },
    },
    STEYX: {
        description: '회귀에서 각 x에 대해 예측된 y 값의 표준 오차를 반환합니다',
        abstract: '회귀에서 각 x에 대해 예측된 y 값의 표준 오차를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/steyx-함수-6ce74b2c-449d-4a6e-b9ac-f9cef5ba48ab',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_ys', detail: '종속 데이터 요소의 배열 또는 범위입니다.' },
            knownXs: { name: 'known_xs', detail: '독립 데이터 요소의 배열 또는 범위입니다.' },
        },
    },
    T_DIST: {
        description: '백분율 요소(확률)를 스튜던트 t-분포로 반환합니다',
        abstract: '백분율 요소(확률)를 스튜던트 t-분포로 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/t-dist-함수-4329459f-ae91-48c2-bba8-1ead1c6c21b2',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 평가할 숫자 값입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '자유도를 나타내는 정수입니다.' },
            cumulative: { name: 'cumulative', detail: '반환할 분포 유형을 지정합니다.' },
        },
    },
    T_DIST_2T: {
        description: '스튜던트 t-분포의 백분율 요소(확률)를 반환합니다',
        abstract: '스튜던트 t-분포의 백분율 요소(확률)를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/t-dist-2t-함수-198e9340-e360-4230-bd21-f52f22ff5c28',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 평가할 숫자 값입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '자유도를 나타내는 정수입니다.' },
        },
    },
    T_DIST_RT: {
        description: '스튜던트 t-분포를 반환합니다',
        abstract: '스튜던트 t-분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/t-dist-rt-함수-20a30020-86f9-4b35-af1f-7ef6ae683eda',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 평가할 숫자 값입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '자유도를 나타내는 정수입니다.' },
        },
    },
    T_INV: {
        description: '스튜던트 t-분포의 t 값을 확률과 자유도의 함수로 반환합니다',
        abstract: '스튜던트 t-분포의 t 값을 확률과 자유도의 함수로 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/t-inv-함수-2908272b-4e61-42fd-8c3c-417a1ff30dbe',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '스튜던트 t-분포와 연관된 확률입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '분포의 자유도를 나타내는 정수입니다.' },
        },
    },
    T_INV_2T: {
        description: '스튜던트 t-분포의 역함수를 반환합니다',
        abstract: '스튜던트 t-분포의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/t-inv-2t-함수-ce72ea19-ec6c-4be7-bed2-b9baf2264f17',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '스튜던트 t-분포와 연관된 확률입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '자유도를 나타내는 정수입니다.' },
        },
    },
    T_TEST: {
        description: '스튜던트 t-검정과 연관된 확률을 반환합니다',
        abstract: '스튜던트 t-검정과 연관된 확률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/t-test-함수-100a59e7-4108-46f8-8443-78ffacb6c0a7',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '데이터의 첫 번째 집합입니다.' },
            array2: { name: 'array2', detail: '데이터의 두 번째 집합입니다.' },
            tails: { name: 'tails', detail: 'Specifies the number of distribution tails. If tails = 1, T.TEST uses the one-tailed distribution. If tails = 2, T.TEST uses the two-tailed distribution.' },
            type: { name: 'type', detail: 'The kind of t-Test to perform.' },
        },
    },
    TREND: {
        description: '선형 추세를 따라 값을 반환합니다',
        abstract: '선형 추세를 따라 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/trend-함수-e2f135f0-8827-4096-9873-9a7cf7b51ef1',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_ys', detail: '관계 y = mx + b에서 이미 알고 있는 y 값의 집합입니다.' },
            knownXs: { name: 'known_xs', detail: '관계 y = mx + b에서 이미 알고 있는 x 값의 선택적 집합입니다.' },
            newXs: { name: 'new_xs', detail: 'TREND가 해당 y 값을 반환하도록 하려는 새 x 값입니다.' },
            constb: { name: 'const', detail: '상수 b를 0으로 강제할지 여부를 지정하는 논리값입니다.' },
        },
    },
    TRIMMEAN: {
        description: '데이터 집합의 내부 평균을 반환합니다',
        abstract: '데이터 집합의 내부 평균을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/trimmean-함수-d90c9878-a119-4746-88fa-63d988f511d3',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '절사하고 평균을 구할 값의 배열 또는 범위입니다.' },
            percent: { name: 'percent', detail: '제외할 데이터 요소의 비율입니다.' },
        },
    },
    VAR_P: {
        description: '전체 모집단을 기준으로 분산을 계산합니다',
        abstract: '전체 모집단을 기준으로 분산을 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/var-p-함수-73d1285c-108c-4843-ba5d-a51f90656f3a',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '모집단에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '모집단에 해당하는 2에서 254개의 숫자 인수입니다.' },
        },
    },
    VAR_S: {
        description: '표본을 기준으로 분산을 평가합니다',
        abstract: '표본을 기준으로 분산을 평가합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/var-s-함수-0a539b74-7371-42aa-a18f-1f5320314977',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '표본에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '표본에 해당하는 2에서 254개의 숫자 인수입니다.' },
        },
    },
    VARA: {
        description: '표본을 기준으로 분산을 평가합니다(숫자, 텍스트 및 논리값 포함)',
        abstract: '표본을 기준으로 분산을 평가합니다(숫자, 텍스트 및 논리값 포함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/vara-함수-3de77469-fa3a-47b4-85fd-81758a1e1d07',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: '표본에 해당하는 첫 번째 인수입니다.' },
            value2: { name: 'value2', detail: '표본에 해당하는 2에서 254개의 인수입니다.' },
        },
    },
    VARPA: {
        description: '전체 모집단을 기준으로 분산을 계산합니다(숫자, 텍스트 및 논리값 포함)',
        abstract: '전체 모집단을 기준으로 분산을 계산합니다(숫자, 텍스트 및 논리값 포함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/varpa-함수-59a62635-4e89-4fad-88ac-ce4dc0513b96',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: '모집단에 해당하는 첫 번째 인수입니다.' },
            value2: { name: 'value2', detail: '모집단에 해당하는 2에서 254개의 인수입니다.' },
        },
    },
    WEIBULL_DIST: {
        description: '와이블 분포를 반환합니다',
        abstract: '와이블 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/weibull-dist-함수-4e783c39-9325-49be-b6af-172e570f8599',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '함수를 평가할 값입니다.' },
            alpha: { name: 'alpha', detail: '분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '분포의 매개 변수입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다.' },
        },
    },
    Z_TEST: {
        description: 'z-검정의 단측 확률 값을 반환합니다',
        abstract: 'z-검정의 단측 확률 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/z-test-함수-d633d5a3-2031-4614-a016-92180ad82bee',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'x를 검정할 데이터의 배열 또는 범위입니다.' },
            x: { name: 'x', detail: '검정할 값입니다.' },
            sigma: { name: 'sigma', detail: '모집단(알려진)의 표준 편차입니다. 생략하면 표본 표준 편차가 사용됩니다.' },
        },
    },
};

export default locale;
