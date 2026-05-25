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
    BETADIST: {
        description: '베타 누적 분포 함수를 반환합니다',
        abstract: '베타 누적 분포 함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/betadist-함수-49f1b9a9-a5da-470f-8077-5f1730b5fd47',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '함수를 평가할 A와 B 사이의 값입니다.' },
            alpha: { name: 'alpha', detail: '분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '분포의 매개 변수입니다.' },
            A: { name: 'A', detail: 'x 구간의 하한입니다.' },
            B: { name: 'B', detail: 'x 구간의 상한입니다.' },
        },
    },
    BETAINV: {
        description: '지정된 베타 분포에 대한 누적 분포 함수의 역함수를 반환합니다',
        abstract: '지정된 베타 분포에 대한 누적 분포 함수의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/betainv-함수-8b914ade-b902-43c1-ac9c-c05c54f10d6c',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '베타 분포와 관련된 확률입니다.' },
            alpha: { name: 'alpha', detail: '분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '분포의 매개 변수입니다.' },
            A: { name: 'A', detail: 'x 구간의 하한입니다.' },
            B: { name: 'B', detail: 'x 구간의 상한입니다.' },
        },
    },
    BINOMDIST: {
        description: '개별 항 이항 분포 확률을 반환합니다',
        abstract: '개별 항 이항 분포 확률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/binomdist-함수-506a663e-c4ca-428d-b9a8-05583d68789c',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: '시행에서 성공한 횟수입니다.' },
            trials: { name: 'trials', detail: '독립 시행 횟수입니다.' },
            probabilityS: { name: 'probability_s', detail: '각 시행에서 성공할 확률입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다. cumulative가 TRUE이면 BINOMDIST는 누적 분포 함수를 반환하고, FALSE이면 확률 밀도 함수를 반환합니다.' },
        },
    },
    CHIDIST: {
        description: '카이 제곱 분포의 우측 꼬리 확률을 반환합니다.',
        abstract: '카이 제곱 분포의 우측 꼬리 확률을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/chidist-함수-c90d0fbc-5b56-4f5f-ab57-34af1bf6897e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 평가할 값입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '자유도 수입니다.' },
        },
    },
    CHIINV: {
        description: '카이 제곱 분포의 우측 꼬리 확률의 역함수를 반환합니다.',
        abstract: '카이 제곱 분포의 우측 꼬리 확률의 역함수를 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/chiinv-함수-cfbea3f6-6e4f-40c9-a87f-20472e0512af',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '카이 제곱 분포와 관련된 확률입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '자유도 수입니다.' },
        },
    },
    CHITEST: {
        description: '독립성 검정을 반환합니다',
        abstract: '독립성 검정을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/chitest-함수-981ff871-b694-4134-848e-38ec704577ac',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: '예상 값에 대해 테스트할 관측값이 포함된 데이터 범위입니다.' },
            expectedRange: { name: 'expected_range', detail: '행 합계와 열 합계의 곱을 총 합계로 나눈 비율이 포함된 데이터 범위입니다.' },
        },
    },
    CONFIDENCE: {
        description: '정규 분포를 사용하여 모집단 평균에 대한 신뢰 구간을 반환합니다.',
        abstract: '정규 분포를 사용하여 모집단 평균에 대한 신뢰 구간을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/confidence-함수-75ccc007-f77c-4343-bc14-673642091ad6',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '신뢰 수준을 계산하는 데 사용되는 유의 수준입니다. 신뢰 수준은 100*(1 - alpha)% 또는 즉, 0.05의 alpha는 95% 신뢰 수준을 나타냅니다.' },
            standardDev: { name: 'standard_dev', detail: '데이터 범위에 대한 모집단 표준 편차이며 알려진 것으로 가정됩니다.' },
            size: { name: 'size', detail: '표본 크기입니다.' },
        },
    },
    COVAR: {
        description: '두 데이터 집합의 각 데이터 포인트 쌍에 대한 편차의 곱의 평균인 모집단 공분산을 반환합니다.',
        abstract: '모집단 공분산을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/covar-함수-50479552-2c03-4daf-bd71-a5ab88b2db03',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '첫 번째 셀 값 범위입니다.' },
            array2: { name: 'array2', detail: '두 번째 셀 값 범위입니다.' },
        },
    },
    CRITBINOM: {
        description: '누적 이항 분포가 기준 값보다 작거나 같은 최소값을 반환합니다',
        abstract: '누적 이항 분포가 기준 값보다 작거나 같은 최소값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/critbinom-함수-eb6b871d-796b-4d21-b69b-e4350d5f407b',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: '베르누이 시행 횟수입니다.' },
            probabilityS: { name: 'probability_s', detail: '각 시행에서 성공할 확률입니다.' },
            alpha: { name: 'alpha', detail: '기준 값입니다.' },
        },
    },
    EXPONDIST: {
        description: '지수 분포를 반환합니다',
        abstract: '지수 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/expondist-함수-68ab45fd-cd6d-4887-9770-9357eb8ee06a',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 평가할 값입니다.' },
            lambda: { name: 'lambda', detail: '매개 변수 값입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다. cumulative가 TRUE이면 EXPONDIST는 누적 분포 함수를 반환하고, FALSE이면 확률 밀도 함수를 반환합니다.' },
        },
    },
    FDIST: {
        description: '(우측 꼬리) F 확률 분포를 반환합니다',
        abstract: '(우측 꼬리) F 확률 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/fdist-함수-ecf76fba-b3f1-4e7d-a57e-6a5b7460b786',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '함수를 평가할 값입니다.' },
            degFreedom1: { name: 'deg_freedom1', detail: '분자 자유도입니다.' },
            degFreedom2: { name: 'deg_freedom2', detail: '분모 자유도입니다.' },
        },
    },
    FINV: {
        description: '(우측 꼬리) F 확률 분포의 역함수를 반환합니다',
        abstract: '(우측 꼬리) F 확률 분포의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/finv-함수-4d46c97c-c368-4852-bc15-41e8e31140b1',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: 'F 누적 분포와 관련된 확률입니다.' },
            degFreedom1: { name: 'deg_freedom1', detail: '분자 자유도입니다.' },
            degFreedom2: { name: 'deg_freedom2', detail: '분모 자유도입니다.' },
        },
    },
    FTEST: {
        description: 'F-검정의 결과를 반환합니다',
        abstract: 'F-검정의 결과를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/ftest-함수-4c9e1202-53fe-428c-a737-976f6fc3f9fd',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '첫 번째 배열 또는 데이터 범위입니다.' },
            array2: { name: 'array2', detail: '두 번째 배열 또는 데이터 범위입니다.' },
        },
    },
    GAMMADIST: {
        description: '감마 분포를 반환합니다',
        abstract: '감마 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/gammadist-함수-7327c94d-0f05-4511-83df-1dd7ed23e19e',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 구할 값입니다.' },
            alpha: { name: 'alpha', detail: '분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '분포의 매개 변수입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다. cumulative가 TRUE이면 GAMMADIST는 누적 분포 함수를 반환하고, FALSE이면 확률 밀도 함수를 반환합니다.' },
        },
    },
    GAMMAINV: {
        description: '감마 누적 분포의 역함수를 반환합니다',
        abstract: '감마 누적 분포의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/gammainv-함수-06393558-37ab-47d0-aa63-432f99e7916d',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '감마 분포와 관련된 확률입니다.' },
            alpha: { name: 'alpha', detail: '분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '분포의 매개 변수입니다.' },
        },
    },
    HYPGEOMDIST: {
        description: '초기하 분포를 반환합니다',
        abstract: '초기하 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/hypgeomdist-함수-23e37961-2871-4195-9629-d0b2c108a12e',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: '표본에서 성공한 횟수입니다.' },
            numberSample: { name: 'number_sample', detail: '표본 크기입니다.' },
            populationS: { name: 'population_s', detail: '모집단에서 성공한 횟수입니다.' },
            numberPop: { name: 'number_pop', detail: '모집단 크기입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다. cumulative가 TRUE이면 HYPGEOMDIST는 누적 분포 함수를 반환하고, FALSE이면 확률 밀도 함수를 반환합니다.' },
        },
    },
    LOGINV: {
        description: '로그 정규 누적 분포 함수의 역함수를 반환합니다',
        abstract: '로그 정규 누적 분포 함수의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/loginv-함수-0bd7631a-2725-482b-afb4-de23df77acfe',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '로그 정규 분포에 해당하는 확률입니다.' },
            mean: { name: 'mean', detail: '분포의 산술 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: '분포의 표준 편차입니다.' },
        },
    },
    LOGNORMDIST: {
        description: '누적 로그 정규 분포를 반환합니다',
        abstract: '누적 로그 정규 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/lognormdist-함수-f8d194cb-9ee3-4034-8c75-1bdb3884100b',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 구할 값입니다.' },
            mean: { name: 'mean', detail: '분포의 산술 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: '분포의 표준 편차입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다. cumulative가 TRUE이면 LOGNORM.DIST는 누적 분포 함수를 반환하고, FALSE이면 확률 밀도 함수를 반환합니다.' },
        },
    },
    MODE: {
        description: '데이터 집합에서 가장 일반적인 값을 반환합니다',
        abstract: '데이터 집합에서 가장 일반적인 값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/mode-함수-e45192ce-9122-4980-82ed-4bdc34973120',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '최빈값을 계산할 첫 번째 숫자, 셀 참조 또는 범위입니다.' },
            number2: { name: 'number2', detail: '최빈값을 계산할 추가 숫자, 셀 참조 또는 범위로 최대 255개까지 지정할 수 있습니다.' },
        },
    },
    NEGBINOMDIST: {
        description: '음이항 분포를 반환합니다',
        abstract: '음이항 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/negbinomdist-함수-f59b0a37-bae2-408d-b115-a315609ba714',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: '실패 횟수입니다.' },
            numberS: { name: 'number_s', detail: '성공의 임계값 수입니다.' },
            probabilityS: { name: 'probability_s', detail: '성공 확률입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다. cumulative가 TRUE이면 NEGBINOMDIST는 누적 분포 함수를 반환하고, FALSE이면 확률 밀도 함수를 반환합니다.' },
        },
    },
    NORMDIST: {
        description: '정규 누적 분포를 반환합니다',
        abstract: '정규 누적 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/normdist-함수-126db625-c53e-4591-9a22-c9ff422d6d58',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 구할 값입니다.' },
            mean: { name: 'mean', detail: '분포의 산술 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: '분포의 표준 편차입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다. cumulative가 TRUE이면 NORMDIST는 누적 분포 함수를 반환하고, FALSE이면 확률 밀도 함수를 반환합니다.' },
        },
    },
    NORMINV: {
        description: '정규 누적 분포의 역함수를 반환합니다',
        abstract: '정규 누적 분포의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/norminv-함수-87981ab8-2de0-4cb0-b1aa-e21d4cb879b8',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '정규 분포에 해당하는 확률입니다.' },
            mean: { name: 'mean', detail: '분포의 산술 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: '분포의 표준 편차입니다.' },
        },
    },
    NORMSDIST: {
        description: '표준 정규 누적 분포를 반환합니다',
        abstract: '표준 정규 누적 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/normsdist-함수-463369ea-0345-445d-802a-4ff0d6ce7cac',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: '분포를 구할 값입니다.' },
        },
    },
    NORMSINV: {
        description: '표준 정규 누적 분포의 역함수를 반환합니다',
        abstract: '표준 정규 누적 분포의 역함수를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/normsinv-함수-8d1bce66-8e4d-4f3b-967c-30eed61f019d',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '정규 분포에 해당하는 확률입니다.' },
        },
    },
    PERCENTILE: {
        description: '데이터 집합에서 값의 k 백분위수를 반환합니다 (0과 1 포함)',
        abstract: '데이터 집합에서 값의 k 백분위수를 반환합니다 (0과 1 포함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/percentile-함수-91b43a53-543c-4708-93de-d626debdddca',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '상대적 위치를 정의하는 데이터의 배열 또는 범위입니다.' },
            k: { name: 'k', detail: '0과 1 범위의 백분위수 값입니다 (0과 1 포함).' },
        },
    },
    PERCENTRANK: {
        description: '데이터 집합에서 값의 백분율 순위를 반환합니다 (0과 1 포함)',
        abstract: '데이터 집합에서 값의 백분율 순위를 반환합니다 (0과 1 포함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/percentrank-함수-f1b5836c-9619-4847-9fc9-080ec9024442',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '상대적 위치를 정의하는 데이터의 배열 또는 범위입니다.' },
            x: { name: 'x', detail: '순위를 알고자 하는 값입니다.' },
            significance: { name: 'significance', detail: '반환된 백분율 값의 유효 자릿수를 식별하는 값입니다. 생략하면 PERCENTRANK.INC는 3자리 숫자(0.xxx)를 사용합니다.' },
        },
    },
    POISSON: {
        description: '포아송 분포를 반환합니다',
        abstract: '포아송 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/poisson-함수-d81f7294-9d7c-4f75-bc23-80aa8624173a',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 구할 값입니다.' },
            mean: { name: 'mean', detail: '분포의 산술 평균입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다. cumulative가 TRUE이면 POISSON은 누적 분포 함수를 반환하고, FALSE이면 확률 밀도 함수를 반환합니다.' },
        },
    },
    QUARTILE: {
        description: '데이터 집합의 사분위수를 반환합니다 (0과 1 포함)',
        abstract: '데이터 집합의 사분위수를 반환합니다 (0과 1 포함)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/quartile-함수-93cf8f62-60cd-4fdb-8a92-8451041e1a2a',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '사분위수 값을 구할 데이터의 배열 또는 범위입니다.' },
            quart: { name: 'quart', detail: '반환할 사분위수 값입니다.' },
        },
    },
    RANK: {
        description: '숫자 목록에서 숫자의 순위를 반환합니다',
        abstract: '숫자 목록에서 숫자의 순위를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/rank-함수-6a2fc49d-1831-4a03-9d8c-c279cf99f723',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '순위를 찾으려는 숫자입니다.' },
            ref: { name: 'ref', detail: '숫자 목록에 대한 참조입니다. ref의 숫자가 아닌 값은 무시됩니다.' },
            order: { name: 'order', detail: '숫자 순위를 매기는 방법을 지정하는 숫자입니다. order가 0(영) 또는 생략되면 Microsoft Excel은 ref가 내림차순으로 정렬된 목록인 것처럼 숫자의 순위를 매깁니다. order가 0이 아닌 값이면 Microsoft Excel은 ref가 오름차순으로 정렬된 목록인 것처럼 숫자의 순위를 매깁니다.' },
        },
    },
    STDEV: {
        description: '표본을 기준으로 표준 편차를 추정합니다. 표준 편차는 값이 평균값(평균)에서 얼마나 분산되어 있는지를 나타내는 척도입니다.',
        abstract: '표본을 기준으로 표준 편차를 추정합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/stdev-함수-51fecaaa-231e-4bbb-9230-33650a72c9b0',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '모집단의 표본에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '모집단의 표본에 해당하는 2~255개의 숫자 인수입니다. 쉼표로 구분된 인수 대신 단일 배열이나 배열에 대한 참조를 사용할 수도 있습니다.' },
        },
    },
    STDEVP: {
        description: '인수로 지정된 전체 모집단을 기준으로 표준 편차를 계산합니다.',
        abstract: '전체 모집단을 기준으로 표준 편차를 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/stdevp-함수-1f7c1c88-1bec-4422-8242-e9f7dc8bb195',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '모집단에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '모집단에 해당하는 2~255개의 숫자 인수입니다. 쉼표로 구분된 인수 대신 단일 배열이나 배열에 대한 참조를 사용할 수도 있습니다.' },
        },
    },
    TDIST: {
        description: '스튜던트 t-분포에 대한 확률을 반환합니다',
        abstract: '스튜던트 t-분포에 대한 확률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/tdist-함수-630a7695-4021-4853-9468-4a1f9dcdd192',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 평가할 숫자 값입니다' },
            degFreedom: { name: 'degFreedom', detail: '자유도 수를 나타내는 정수입니다.' },
            tails: { name: 'tails', detail: '반환할 분포 꼬리 수를 지정합니다. Tails = 1이면 TDIST는 단측 분포를 반환합니다. Tails = 2이면 TDIST는 양측 분포를 반환합니다.' },
        },
    },
    TINV: {
        description: '스튜던트 t-분포에 대한 확률의 역함수를 반환합니다 (양측)',
        abstract: '스튜던트 t-분포에 대한 확률의 역함수를 반환합니다 (양측)',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/tinv-함수-a7c85b9d-90f5-41fe-9ca5-1cd2f3e1ed7c',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '스튜던트 t-분포와 관련된 확률입니다.' },
            degFreedom: { name: 'degFreedom', detail: '자유도 수를 나타내는 정수입니다.' },
        },
    },
    TTEST: {
        description: '스튜던트 t-검정과 관련된 확률을 반환합니다',
        abstract: '스튜던트 t-검정과 관련된 확률을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/ttest-함수-1696ffc1-4811-40fd-9d13-a0eaad83c7ae',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '첫 번째 배열 또는 데이터 범위입니다.' },
            array2: { name: 'array2', detail: '두 번째 배열 또는 데이터 범위입니다.' },
            tails: { name: 'tails', detail: '분포 꼬리 수를 지정합니다. tails = 1이면 TTEST는 단측 분포를 사용합니다. tails = 2이면 TTEST는 양측 분포를 사용합니다.' },
            type: { name: 'type', detail: '수행할 t-검정의 종류입니다.' },
        },
    },
    VAR: {
        description: '표본을 기준으로 분산을 추정합니다.',
        abstract: '표본을 기준으로 분산을 추정합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/var-함수-1f2b7ab2-954d-4e17-ba2c-9e58b15a7da2',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '모집단의 표본에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '모집단의 표본에 해당하는 2~255개의 숫자 인수입니다.' },
        },
    },
    VARP: {
        description: '전체 모집단을 기준으로 분산을 계산합니다.',
        abstract: '전체 모집단을 기준으로 분산을 계산합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/varp-함수-26a541c4-ecee-464d-a731-bd4c575b1a6b',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '모집단에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '모집단에 해당하는 2~255개의 숫자 인수입니다.' },
        },
    },
    WEIBULL: {
        description: '와이블 분포를 반환합니다',
        abstract: '와이블 분포를 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/weibull-함수-b83dc2c6-260b-4754-bef2-633196f6fdcc',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '분포를 구할 값입니다.' },
            alpha: { name: 'alpha', detail: '분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '분포의 매개 변수입니다.' },
            cumulative: { name: 'cumulative', detail: '함수의 형태를 결정하는 논리값입니다. cumulative가 TRUE이면 WEIBULL은 누적 분포 함수를 반환하고, FALSE이면 확률 밀도 함수를 반환합니다.' },
        },
    },
    ZTEST: {
        description: 'z-검정의 단측 확률값을 반환합니다',
        abstract: 'z-검정의 단측 확률값을 반환합니다',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/office/ztest-함수-8f33be8a-6bd6-4ecc-8e3a-d9a4420c4a6a',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'x를 테스트할 데이터의 배열 또는 범위입니다.' },
            x: { name: 'x', detail: '테스트할 값입니다.' },
            sigma: { name: 'sigma', detail: '모집단(알려진) 표준 편차입니다. 생략하면 표본 표준 편차가 사용됩니다.' },
        },
    },
};

export default locale;
