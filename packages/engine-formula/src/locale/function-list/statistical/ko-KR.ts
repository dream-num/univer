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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/avedev-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/average-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '평균을 구하려는 첫 번째 숫자, 셀 참조 또는 범위입니다.' },
            number2: { name: 'number2', detail: '평균을 구하려는 추가 숫자, 셀 참조 또는 범위로 최대 255개입니다.' },
        },
    },
    AVERAGE_WEIGHTED: {
        description: 'AVERAGE.WEIGHTED 함수는 값과 각 값에 해당하는 가중치를 사용하여 값 집합의 가중 평균을 계산합니다.',
        abstract: 'AVERAGE.WEIGHTED 함수는 값과 각 값에 해당하는 가중치를 사용하여 값 집합의 가중 평균을 계산합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/9084098?hl=ko',
            },
        ],
        functionParameter: {
            values: { name: 'values', detail: '평균을 계산할 값입니다. 셀 범위를 참조하거나 값 자체를 포함할 수 있습니다.' },
            weights: { name: 'weights', detail: '적용할 가중치 목록입니다. 셀 범위를 참조하거나 가중치를 포함할 수 있습니다. 가중치는 0일 수는 있지만 음수일 수는 없습니다. 가중치 중 적어도 하나는 양수여야 합니다. 셀 범위를 사용하는 경우, 해당 범위 내 행과 열의 수는 값 범위 내 행과 열의 수와 동일해야 합니다.' },
            additionalValues: { name: 'additional_values', detail: '평균을 계산할 추가 값입니다. 추가 값은 선택사항입니다.' },
            additionalWeights: { name: 'additional_weights', detail: '적용할 추가 가중치입니다. 추가 가중치는 선택사항이지만 각 추가_값 뒤에는 한 개의 추가_가중치 가 있어야 합니다.' },
        },
    },
    AVERAGEA: {
        description: '인수의 평균(산술 평균)을 반환합니다(숫자, 텍스트 및 논리값 포함)',
        abstract: '인수의 평균(산술 평균)을 반환합니다(숫자, 텍스트 및 논리값 포함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/averagea-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/averageif-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/averageifs-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/beta-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/beta-inv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/binom-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/binom-dist-range-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/binom-inv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/chisq-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/chisq-dist-rt-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/chisq-inv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/chisq-inv-rt-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/chisq-test-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/confidence-norm-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/confidence-t-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/correl-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/count-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/counta-function',
            },
        ],
        functionParameter: {
            value1: { name: 'value1', detail: '평균을 구하려는 첫 번째 인수입니다.' },
            value2: { name: 'value2', detail: '평균을 구하려는 2에서 255개의 추가 인수입니다.' },
        },
    },
    COUNTBLANK: {
        description: '범위에서 빈 셀의 개수를 계산합니다',
        abstract: '범위에서 빈 셀의 개수를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/countblank-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/use-the-countif-function-in-microsoft-excel',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/countifs-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/covariance-p-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/covariance-s-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/devsq-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/expon-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/f-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/f-dist-rt-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/f-inv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/f-inv-rt-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/f-test-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/fisher-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/fisherinv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/forecast-and-forecast-linear-functions',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '값을 예측하려는 데이터 요소입니다.' },
            knownYs: { name: 'known_ys', detail: '종속 배열이나 데이터 범위입니다.' },
            knownXs: { name: 'known_xs', detail: '독립 배열이나 데이터 범위입니다.' },
        },
    },
    FORECAST_ETS: {
        description: '언제든지 Excel Tech Community 의 전문가에게 문의하거나 커뮤니티에서 지원을 받을 수 있습니다 .',
        abstract: '언제든지 Excel Tech Community 의 전문가에게 문의하거나 커뮤니티에서 지원을 받을 수 있습니다 .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/forecast-ets-function',
            },
        ],
        functionParameter: {
            targetDate: { name: '대상 날짜', detail: '값을 예측할 데이터 요소입니다.' },
            values: { name: '값', detail: '예측에 사용하는 기록 값입니다.' },
            timeline: { name: '시간 표시 막대', detail: '일정한 간격의 숫자 날짜 또는 시간으로 구성된 독립 범위나 배열입니다.' },
            seasonality: { name: '계절성', detail: '선택 사항입니다. 자동 검색은 1, 계절성 없음은 0입니다.' },
            dataCompletion: { name: '데이터 완성', detail: '선택 사항입니다. 누락 지점을 보간하려면 1, 0으로 처리하려면 0을 사용합니다.' },
            aggregation: { name: '집계', detail: '선택 사항입니다. 중복 타임스탬프 집계 방법을 1에서 7로 지정합니다.' },
        },
    },
    FORECAST_ETS_CONFINT: {
        description: '언제든지 Excel Tech Community 의 전문가에게 문의하거나 커뮤니티에서 지원을 받을 수 있습니다 .',
        abstract: '언제든지 Excel Tech Community 의 전문가에게 문의하거나 커뮤니티에서 지원을 받을 수 있습니다 .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/forecast-ets-confint-function',
            },
        ],
        functionParameter: {
            targetDate: { name: '대상 날짜', detail: '값을 예측할 데이터 요소입니다.' },
            values: { name: '값', detail: '예측에 사용하는 기록 값입니다.' },
            timeline: { name: '시간 표시 막대', detail: '일정한 간격의 숫자 날짜 또는 시간으로 구성된 독립 범위나 배열입니다.' },
            confidenceLevel: { name: '신뢰 수준', detail: '선택 사항입니다. 0과 1 사이의 숫자이며 기본값은 0.95입니다.' },
            seasonality: { name: '계절성', detail: '선택 사항입니다. 자동 검색은 1, 계절성 없음은 0입니다.' },
            dataCompletion: { name: '데이터 완성', detail: '선택 사항입니다. 누락 지점을 보간하려면 1, 0으로 처리하려면 0을 사용합니다.' },
            aggregation: { name: '집계', detail: '선택 사항입니다. 중복 타임스탬프 집계 방법을 1에서 7로 지정합니다.' },
        },
    },
    FORECAST_ETS_SEASONALITY: {
        description: '언제든지 Excel Tech Community 의 전문가에게 문의하거나 커뮤니티에서 지원을 받을 수 있습니다 .',
        abstract: '언제든지 Excel Tech Community 의 전문가에게 문의하거나 커뮤니티에서 지원을 받을 수 있습니다 .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/forecast-ets-seasonality-function',
            },
        ],
        functionParameter: {
            values: { name: '값', detail: '예측에 사용하는 기록 값입니다.' },
            timeline: { name: '시간 표시 막대', detail: '일정한 간격의 숫자 날짜 또는 시간으로 구성된 독립 범위나 배열입니다.' },
            dataCompletion: { name: '데이터 완성', detail: '선택 사항입니다. 누락 지점을 보간하려면 1, 0으로 처리하려면 0을 사용합니다.' },
            aggregation: { name: '집계', detail: '선택 사항입니다. 중복 타임스탬프 집계 방법을 1에서 7로 지정합니다.' },
        },
    },
    FORECAST_ETS_STAT: {
        description: '언제든지 Excel Tech Community 의 전문가에게 문의하거나 커뮤니티에서 지원을 받을 수 있습니다 .',
        abstract: '언제든지 Excel Tech Community 의 전문가에게 문의하거나 커뮤니티에서 지원을 받을 수 있습니다 .',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/forecast-ets-stat-function',
            },
        ],
        functionParameter: {
            values: { name: '값', detail: '예측에 사용하는 기록 값입니다.' },
            timeline: { name: '시간 표시 막대', detail: '일정한 간격의 숫자 날짜 또는 시간으로 구성된 독립 범위나 배열입니다.' },
            statisticType: { name: '통계 유형', detail: '반환할 예측 통계를 1에서 8로 지정합니다.' },
            seasonality: { name: '계절성', detail: '선택 사항입니다. 자동 검색은 1, 계절성 없음은 0입니다.' },
            dataCompletion: { name: '데이터 완성', detail: '선택 사항입니다. 누락 지점을 보간하려면 1, 0으로 처리하려면 0을 사용합니다.' },
            aggregation: { name: '집계', detail: '선택 사항입니다. 중복 타임스탬프 집계 방법을 1에서 7로 지정합니다.' },
        },
    },
    FORECAST_LINEAR: {
        description: '기존 값을 기반으로 미래 값을 반환합니다',
        abstract: '기존 값을 기반으로 미래 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/forecast-and-forecast-linear-functions',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/frequency-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/gamma-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/gamma-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/gamma-inv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/gammaln-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/gammaln-precise-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/gauss-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/geomean-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/growth-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/harmean-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/hypgeom-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/intercept-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/kurt-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/large-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/linest-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/logest-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/lognorm-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/lognorm-inv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '로그 정규 분포와 연관된 확률입니다.' },
            mean: { name: 'mean', detail: 'ln(x)의 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: 'ln(x)의 표준 편차입니다.' },
        },
    },
    MARGINOFERROR: {
        description: '이 함수는 값 범위와 신뢰 수준에서 오차 범위를 계산합니다.',
        abstract: '이 함수는 값 범위와 신뢰 수준에서 오차 범위를 계산합니다.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/12487850?hl=ko',
            },
        ],
        functionParameter: {
            range: { name: 'range', detail: 'MARGINOFERROR(A1:C3, 0.99)' },
            confidence: { name: 'confidence', detail: 'The desired confidence level between (0, 1).' },
        },
    },
    MAX: {
        description: '인수 목록에서 최대값을 반환합니다',
        abstract: '인수 목록에서 최대값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/max-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/maxa-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/maxifs-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/median-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/min-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mina-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/minifs-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mode-mult-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mode-sngl-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/negbinom-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/norm-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/norm-inv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/norm-s-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/norm-s-inv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/pearson-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/percentile-exc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/percentile-inc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/percentrank-exc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/percentrank-inc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/permut-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/permutationa-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/phi-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/poisson-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/prob-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/quartile-exc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/quartile-inc-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/rank-avg-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/rank-eq-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/rsq-function',
            },
        ],
        functionParameter: {
            knownYs: { name: 'known_ys', detail: '종속 데이터 요소의 배열이나 셀 범위입니다.' },
            knownXs: { name: 'known_xs', detail: '독립 데이터 요소의 집합입니다.' },
        },
    },
    SKEW: {
        description: '분포의 왜도를 반환합니다',
        abstract: '분포의 왜도를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/skew-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/skew-p-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/slope-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/small-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/standardize-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/stdev-p-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/stdev-s-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/stdeva-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/stdevpa-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/steyx-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/t-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/t-dist-2t-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/t-dist-rt-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/t-inv-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/t-inv-2t-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/t-test-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '데이터의 첫 번째 집합입니다.' },
            array2: { name: 'array2', detail: '데이터의 두 번째 집합입니다.' },
            tails: { name: 'tails', detail: '분포의 꼬리 수를 지정합니다. tails가 1이면 T.TEST는 단측 분포를 사용하고, 2이면 양측 분포를 사용합니다.' },
            type: { name: 'type', detail: '수행할 t-검정의 유형입니다.' },
        },
    },
    TREND: {
        description: '선형 추세를 따라 값을 반환합니다',
        abstract: '선형 추세를 따라 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/trend-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/trimmean-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/var-p-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/var-s-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/vara-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/varpa-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/weibull-dist-function',
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
                url: 'https://support.microsoft.com/ko-kr/excel/functions/z-test-function',
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
