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
        description: '누적 베타 확률 밀도 함수 값을 반환합니다. 베타 분포는 하루 중 텔레비전을 보는 시간을 백분율로 나타내는 것처럼 표본에서 백분율의 분포를 알아볼 때 일반적으로 사용합니다.',
        abstract: '누적 베타 확률 밀도 함수 값을 반환합니다. 베타 분포는 하루 중 텔레비전을 보는 시간을 백분율로 나타내는 것처럼 표본에서 백분율의 분포를 알아볼 때 일반적으로 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/betadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. 함수를 계산할 값으로서 A와 B 사이의 값입니다.' },
            alpha: { name: 'alpha', detail: '필수. 분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '필수. 분포의 매개 변수입니다.' },
            A: { name: 'A', detail: '선택 사항 입니다 . x가 취할 수 있는 하한값입니다.' },
            B: { name: 'B', detail: '선택 사항입니다. x가 취할 수 있는 상한값입니다.' },
        },
    },
    BETAINV: {
        description: '지정된 베타 분포에 대한 누적 베타 확률 밀도 함수의 역함수 값을 반환합니다. 즉, probability = BETADIST(x,...)이면 BETAINV(probability,...) = x입니다. 베타 분포는 프로젝트 계획에서 예상 완료 시간과 가변성이 주어질 때 가능한 완료 시간을 모델링하는 데 사용할 수 있습니다.',
        abstract: '지정된 베타 분포에 대한 누적 베타 확률 밀도 함수의 역함수 값을 반환합니다. 즉, probability = BETADIST(x,...)이면 BETAINV(probability,...) = x입니다. 베타 분포는 프로젝트 계획에서 예상 완료 시간과 가변성이 주어질 때 가능한 완료 시간을 모델링하는 데 사용할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/betainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '필수. 베타 분포와 관련된 확률입니다.' },
            alpha: { name: 'alpha', detail: '필수. 분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '필수. 분포의 매개 변수입니다.' },
            A: { name: 'A', detail: '선택 사항 입니다 . x가 취할 수 있는 하한값입니다.' },
            B: { name: 'B', detail: '선택 사항입니다. x가 취할 수 있는 상한값입니다.' },
        },
    },
    BINOMDIST: {
        description: '개별항 이항 분포 확률을 반환합니다. 고정된 횟수의 검정이나 시행을 거치는 문제에서 시행의 결과값이 성공 또는 실패 중 하나이고, 시행이 서로 독립적이며, 성공 확률이 전체 실험에서 일정하게 나타나는 경우 BINOMDIST 함수를 사용합니다. 예를 들어 앞으로 태어날 세 명의 아기 중 두 명이 남자 아기일 확률을 계산할 때 이 함수를 사용할 수 있습니다.',
        abstract: '개별항 이항 분포 확률을 반환합니다. 고정된 횟수의 검정이나 시행을 거치는 문제에서 시행의 결과값이 성공 또는 실패 중 하나이고, 시행이 서로 독립적이며, 성공 확률이 전체 실험에서 일정하게 나타나는 경우 BINOMDIST 함수를 사용합니다. 예를 들어 앞으로 태어날 세 명의 아기 중 두 명이 남자 아기일 확률을 계산할 때 이 함수를 사용할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/binomdist-function',
            },
        ],
        functionParameter: {
            numberS: { name: 'number_s', detail: '필수. 시행에서의 성공 횟수입니다.' },
            trials: { name: 'trials', detail: '필수. 독립 시행 횟수입니다.' },
            probabilityS: { name: 'probability_s', detail: '필수. 각 시행에서 성공할 확률입니다.' },
            cumulative: { name: 'cumulative', detail: '필수. 함수의 형식을 결정하는 논리 값입니다. 누적이 TRUE이면 BINOMDIST는 최대 number_s 성공이 있을 확률인 누적 분포 함수를 반환합니다. FALSE이면 성공 가능성이 number_s 확률 질량 함수를 반환합니다.' },
        },
    },
    CHIDIST: {
        description: '카이 제곱 분포의 단측(오른쪽) 검정 확률을 반환합니다. 2 분포는 2 테스트와 연결됩니다. 2 테스트를 사용하여 관찰된 값과 예상 값을 비교합니다. 예를 들어, 유전자 실험은 다음 세대의 식물이 특정 색 집합을 나타낼 것이라고 가설을 세일 수 있습니다. 관찰된 결과를 예상 결과와 비교하여 원래 가설이 유효한지 여부를 결정할 수 있습니다.',
        abstract: '카이 제곱 분포의 단측(오른쪽) 검정 확률을 반환합니다. 2 분포는 2 테스트와 연결됩니다. 2 테스트를 사용하여 관찰된 값과 예상 값을 비교합니다. 예를 들어, 유전자 실험은 다음 세대의 식물이 특정 색 집합을 나타낼 것이라고 가설을 세일 수 있습니다. 관찰된 결과를 예상 결과와 비교하여 원래 가설이 유효한지 여부를 결정할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/chidist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. 분포를 계산하려는 값입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '필수. 자유도를 나타내는 숫자입니다.' },
        },
    },
    CHIINV: {
        description: '카이 제곱 분포의 단측(오른쪽) 검정 확률의 역함수 값을 반환합니다. probability = CHIDIST(x,...)이면 CHIINV(probability,...) = x입니다. 이 함수를 사용하면 관측값과 기대값을 비교하여 가설이 맞는지 확인할 수 있습니다.',
        abstract: '카이 제곱 분포의 단측(오른쪽) 검정 확률의 역함수 값을 반환합니다. probability = CHIDIST(x,...)이면 CHIINV(probability,...) = x입니다. 이 함수를 사용하면 관측값과 기대값을 비교하여 가설이 맞는지 확인할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/chiinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '필수. 카이 제곱 분포와 관련된 확률입니다.' },
            degFreedom: { name: 'deg_freedom', detail: '필수. 자유도를 나타내는 숫자입니다.' },
        },
    },
    CHITEST: {
        description: '독립 검증 결과를 반환합니다. 즉, CHITEST에서는 해당 통계 및 적정 자유도에 대한 카이 제곱(χ2) 분포값이 반환됩니다. χ2 검정을 사용하면 실험에 의해 가설이 검증되었는지 확인할 수 있습니다.',
        abstract: '독립 검증 결과를 반환합니다. 즉, CHITEST에서는 해당 통계 및 적정 자유도에 대한 카이 제곱(χ2) 분포값이 반환됩니다. χ2 검정을 사용하면 실험에 의해 가설이 검증되었는지 확인할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/chitest-function',
            },
        ],
        functionParameter: {
            actualRange: { name: 'actual_range', detail: '필수. 기대값과 비교하여 검정할 관측값이 포함된 데이터 범위입니다.' },
            expectedRange: { name: 'expected_range', detail: '필수. 행 합계와 열 합계를 곱한 값의 총합계에 대한 비율이 들어 있는 데이터 범위입니다.' },
        },
    },
    CONFIDENCE: {
        description: '정규 분포를 사용하여 모집단 평균의 신뢰 구간을 반환합니다.',
        abstract: '정규 분포를 사용하여 모집단 평균의 신뢰 구간을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/confidence-function',
            },
        ],
        functionParameter: {
            alpha: { name: 'alpha', detail: '필수. 신뢰도 수준을 계산하는 데 사용되는 중요도 수준입니다. 신뢰 수준이 100*(1 - alpha)%와 같거나, 즉 알파가 0.05이면 신뢰 수준이 95%를 나타냅니다.' },
            standardDev: { name: 'standard_dev', detail: '필수. 데이터 범위에 대한 모집단의 표준 편차로서 그 값을 알고 있다고 가정합니다.' },
            size: { name: 'size', detail: '필수. 표본 크기입니다.' },
        },
    },
    COVAR: {
        description: '두 데이터 집합의 각 데이터 요소 쌍에 대한 편차 제품의 평균인 공변을 반환합니다.',
        abstract: '두 데이터 집합의 각 데이터 요소 쌍에 대한 편차 제품의 평균인 공변을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/covar-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '필수. 첫 번째 정수 셀 범위입니다.' },
            array2: { name: 'array2', detail: '필수. 두 번째 정수 셀 범위입니다.' },
        },
    },
    CRITBINOM: {
        description: '누적 이항 분포가 기준치 이상이 되는 값 중 최소값을 반환합니다. 이 함수는 품질 보증 응용 프로그램에 사용합니다. 예를 들어 CRITBINOM 함수를 사용하여 전체 로트를 불합격시키지 않고 조립 라인을 계속 가동할 수 있는 결함 부품의 최대 허용 개수를 확인할 수 있습니다.',
        abstract: '누적 이항 분포가 기준치 이상이 되는 값 중 최소값을 반환합니다. 이 함수는 품질 보증 응용 프로그램에 사용합니다. 예를 들어 CRITBINOM 함수를 사용하여 전체 로트를 불합격시키지 않고 조립 라인을 계속 가동할 수 있는 결함 부품의 최대 허용 개수를 확인할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/critbinom-function',
            },
        ],
        functionParameter: {
            trials: { name: 'trials', detail: '필수. 베르누이 시행 횟수입니다.' },
            probabilityS: { name: 'probability_s', detail: '필수. 각 시행의 성공 확률입니다.' },
            alpha: { name: 'alpha', detail: '필수. 기준치입니다.' },
        },
    },
    EXPONDIST: {
        description: '지수 분포값을 반환합니다. EXPONDIST 함수를 사용하여 현금 출납기가 현금을 지급하는 데 걸리는 시간 등 사건들 사이의 시간을 모델링할 수 있습니다. 예를 들어 EXPONDIST 함수를 사용하여 이 과정에 걸리는 시간이 1분 이내일 확률을 구할 수 있습니다.',
        abstract: '지수 분포값을 반환합니다. EXPONDIST 함수를 사용하여 현금 출납기가 현금을 지급하는 데 걸리는 시간 등 사건들 사이의 시간을 모델링할 수 있습니다. 예를 들어 EXPONDIST 함수를 사용하여 이 과정에 걸리는 시간이 1분 이내일 확률을 구할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/expondist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. 함수 값입니다.' },
            lambda: { name: 'lambda', detail: '필수. 매개 변수 값입니다.' },
            cumulative: { name: 'cumulative', detail: '필수. 제공할 지수 함수의 형식을 나타내는 논리 값입니다. 누적이 TRUE이면 EXPONDIST는 누적 분포 함수를 반환합니다. FALSE이면 확률 밀도 함수를 반환합니다.' },
        },
    },
    FDIST: {
        description: '두 데이터 집합에 대한 단측(오른쪽) 검정 F 확률 분포값(분포도)을 반환합니다. 이 함수를 사용하면 두 데이터 집합의 분포도가 서로 다른지 확인할 수 있습니다. 예를 들어 고등학교에 입학하는 남녀 학생의 성적을 조사하여 남녀 학생의 분포도가 서로 다른지를 알아볼 수 있습니다.',
        abstract: '두 데이터 집합에 대한 단측(오른쪽) 검정 F 확률 분포값(분포도)을 반환합니다. 이 함수를 사용하면 두 데이터 집합의 분포도가 서로 다른지 확인할 수 있습니다. 예를 들어 고등학교에 입학하는 남녀 학생의 성적을 조사하여 남녀 학생의 분포도가 서로 다른지를 알아볼 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/fdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. 함수를 계산할 값입니다.' },
            degFreedom1: { name: 'deg_freedom1', detail: '필수. 분자의 자유도입니다.' },
            degFreedom2: { name: 'deg_freedom2', detail: '필수. 분모의 자유도입니다.' },
        },
    },
    FINV: {
        description: '단측(오른쪽) 검정 F 확률 분포의 역함수 값을 반환합니다. p = FDIST(x,...)이면 FINV(p,...) = x입니다.',
        abstract: '단측(오른쪽) 검정 F 확률 분포의 역함수 값을 반환합니다. p = FDIST(x,...)이면 FINV(p,...) = x입니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/finv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '필수. F 누적 분포의 확률값입니다.' },
            degFreedom1: { name: 'deg_freedom1', detail: '필수. 분자의 자유도입니다.' },
            degFreedom2: { name: 'deg_freedom2', detail: '필수. 분모의 자유도입니다.' },
        },
    },
    FTEST: {
        description: 'F-검정 결과를 반환합니다. F-검정은 array1과 array2의 분산이 크게 다르지 않은 양측 검증 확률을 반환합니다. 이 함수를 사용하여 두 표본이 다른 분산을 갖는지 확인할 수 있습니다. 예를 들어 공립 학교와 사립 학교의 시험 성적 분포도가 서로 다른지 확인할 수 있습니다.',
        abstract: 'F-검정 결과를 반환합니다. F-검정은 array1과 array2의 분산이 크게 다르지 않은 양측 검증 확률을 반환합니다. 이 함수를 사용하여 두 표본이 다른 분산을 갖는지 확인할 수 있습니다. 예를 들어 공립 학교와 사립 학교의 시험 성적 분포도가 서로 다른지 확인할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ftest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '필수. 첫 번째 배열 또는 데이터 영역입니다.' },
            array2: { name: 'array2', detail: '필수. 두 번째 배열 또는 데이터 영역입니다.' },
        },
    },
    GAMMADIST: {
        description: '감마 분포값을 반환합니다. 이 함수를 사용하면 한쪽으로 치우친 분포의 변수를 연구할 수 있습니다. 감마 분포는 일반적으로 대기 행렬 분석에 사용됩니다.',
        abstract: '감마 분포값을 반환합니다. 이 함수를 사용하면 한쪽으로 치우친 분포의 변수를 연구할 수 있습니다. 감마 분포는 일반적으로 대기 행렬 분석에 사용됩니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/gammadist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. 분포를 계산하려는 값입니다.' },
            alpha: { name: 'alpha', detail: '필수. 분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '필수. 분포의 매개 변수입니다. beta = 1이면 GAMMADIST에서는 표준 감마 분포를 반환합니다.' },
            cumulative: { name: 'cumulative', detail: '필수. 함수의 형식을 결정하는 논리 값입니다. 누적이 TRUE이면 GAMMADIST는 누적 분포 함수를 반환합니다. FALSE이면 확률 밀도 함수를 반환합니다.' },
        },
    },
    GAMMAINV: {
        description: '감마 누적 분포의 역함수 값을 반환합니다. p = GAMMADIST(x,...)이면 GAMMAINV(p,...) = x입니다. 이 함수를 사용하면 한쪽으로 치우친 분포의 변수를 연구할 수 있습니다.',
        abstract: '감마 누적 분포의 역함수 값을 반환합니다. p = GAMMADIST(x,...)이면 GAMMAINV(p,...) = x입니다. 이 함수를 사용하면 한쪽으로 치우친 분포의 변수를 연구할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/gammainv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '필수. 감마 분포와 관련된 확률입니다.' },
            alpha: { name: 'alpha', detail: '필수. 분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '필수. 분포의 매개 변수입니다. beta = 1이면 GAMMAINV에서는 표준 감마 분포를 반환합니다.' },
        },
    },
    HYPGEOMDIST: {
        description: '초기하 분포값을 반환합니다. HYPGEOMDIST 함수는 주어진 표본의 크기, 모집단의 성공 도수와 크기에 대하여 주어진 표본의 성공 도수가 출현할 확률을 반환합니다. 각 사건의 결과가 성공 또는 실패이고, 주어진 크기의 모집단에서 각 부분 집합 표본을 동등하게 추출하는 유한 모집단의 문제에 이 함수를 사용합니다.',
        abstract: '초기하 분포값을 반환합니다. HYPGEOMDIST 함수는 주어진 표본의 크기, 모집단의 성공 도수와 크기에 대하여 주어진 표본의 성공 도수가 출현할 확률을 반환합니다. 각 사건의 결과가 성공 또는 실패이고, 주어진 크기의 모집단에서 각 부분 집합 표본을 동등하게 추출하는 유한 모집단의 문제에 이 함수를 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/hypgeomdist-function',
            },
        ],
        functionParameter: {
            sampleS: { name: 'sample_s', detail: '필수. 표본의 성공 도수입니다.' },
            numberSample: { name: 'number_sample', detail: '필수. 표본 크기입니다.' },
            populationS: { name: 'population_s', detail: '필수. 모집단의 성공 도수입니다.' },
            numberPop: { name: 'number_pop', detail: '필수. 모집단 크기입니다.' },
        },
    },
    LOGINV: {
        description: 'ln(x)가 mean과 standard_dev를 매개 변수로 갖는 정규 분포인 경우 x에 대한 로그 정규 누적 분포 함수의 역함수 값을 반환합니다. p = LOGNORMDIST(x,...)이면 LOGINV(p,...) = x입니다.',
        abstract: 'ln(x)가 mean과 standard_dev를 매개 변수로 갖는 정규 분포인 경우 x에 대한 로그 정규 누적 분포 함수의 역함수 값을 반환합니다. p = LOGNORMDIST(x,...)이면 LOGINV(p,...) = x입니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/loginv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '필수. 로그 정규 분포와 관련된 확률입니다.' },
            mean: { name: 'mean', detail: '필수. ln(x)의 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: '필수. ln(x)의 표준 편차입니다.' },
        },
    },
    LOGNORMDIST: {
        description: 'ln(x)가 mean과 standard_dev를 매개 변수로 갖는 정규 분포인 경우 x에 대한 로그 정규 누적 분포값을 반환합니다. 이 함수를 사용하여 로그값으로 변환된 데이터를 분석합니다.',
        abstract: 'ln(x)가 mean과 standard_dev를 매개 변수로 갖는 정규 분포인 경우 x에 대한 로그 정규 누적 분포값을 반환합니다. 이 함수를 사용하여 로그값으로 변환된 데이터를 분석합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/lognormdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. 함수를 계산할 값입니다.' },
            mean: { name: 'mean', detail: '필수. ln(x)의 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: '필수. ln(x)의 표준 편차입니다.' },
        },
    },
    MODE: {
        description: '30년 동안 중요한 습지에서 조류 수의 표본에서 목격된 조류 종의 가장 일반적인 수를 알아보거나, 사용량이 적은 시간에 전화 지원 센터에서 가장 자주 발생하는 전화 통화 수를 알아보고 싶다고 가정해 보겠습니다. 숫자 그룹의 모드를 계산하려면 MODE 함수를 사용합니다.',
        abstract: '30년 동안 중요한 습지에서 조류 수의 표본에서 목격된 조류 종의 가장 일반적인 수를 알아보거나, 사용량이 적은 시간에 전화 지원 센터에서 가장 자주 발생하는 전화 통화 수를 알아보고 싶다고 가정해 보겠습니다. 숫자 그룹의 모드를 계산하려면 MODE 함수를 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/mode-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '필수. 최빈값을 계산할 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '선택적. 최빈값을 계산할 숫자 인수로, 2개에서 255개까지 지정할 수 있습니다. 쉼표로 구분된 인수 대신 단일 배열이나 배열에 대한 참조를 사용할 수도 있습니다.' },
        },
    },
    NEGBINOMDIST: {
        description: '음수 이항 분포를 반환합니다. NEGBINOMDIST는 성공의 일정한 확률이 probability_s 경우 number_s 성공 전에 number_f 오류가 발생할 확률을 반환합니다. 이 함수는 성공 횟수가 고정되고 평가판 수가 가변적이라는 점을 제외하고 이항 분포와 유사합니다. 이항과 마찬가지로 평가판은 독립적인 것으로 간주됩니다.',
        abstract: '음수 이항 분포를 반환합니다. NEGBINOMDIST는 성공의 일정한 확률이 probability_s 경우 number_s 성공 전에 number_f 오류가 발생할 확률을 반환합니다. 이 함수는 성공 횟수가 고정되고 평가판 수가 가변적이라는 점을 제외하고 이항 분포와 유사합니다. 이항과 마찬가지로 평가판은 독립적인 것으로 간주됩니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/negbinomdist-function',
            },
        ],
        functionParameter: {
            numberF: { name: 'number_f', detail: '필수. 실패 횟수입니다.' },
            numberS: { name: 'number_s', detail: '필수. 성공 횟수의 임계값입니다.' },
            probabilityS: { name: 'probability_s', detail: '필수. 성공 확률입니다.' },
        },
    },
    NORMDIST: {
        description: 'NORMDIST 함수는 지정된 평균 및 표준 편차에 대한 정규 분포를 반환합니다. 이 함수에는 가설 테스트를 포함하여 다양한 통계 애플리케이션이 있습니다.',
        abstract: 'NORMDIST 함수는 지정된 평균 및 표준 편차에 대한 정규 분포를 반환합니다. 이 함수에는 가설 테스트를 포함하여 다양한 통계 애플리케이션이 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/normdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. 배포하려는 값입니다.' },
            mean: { name: 'mean', detail: '필수. 분포의 산술 평균' },
            standardDev: { name: 'standard_dev', detail: '필수. 배포의 표준 편차' },
            cumulative: { name: 'cumulative', detail: '필수. 함수의 형식을 결정하는 논리 값입니다. 누적이 TRUE이면 NORMDIST는 누적 분포 함수를 반환합니다. 누적이 FALSE이면 확률 질량 함수를 반환합니다.' },
        },
    },
    NORMINV: {
        description: '지정된 평균과 표준 편차에 대한 정규 누적 분포의 역함수 값을 반환합니다.',
        abstract: '지정된 평균과 표준 편차에 대한 정규 누적 분포의 역함수 값을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/norminv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '필수. 정규 분포를 따르는 확률입니다.' },
            mean: { name: 'mean', detail: '필수. 분포의 산술 평균입니다.' },
            standardDev: { name: 'standard_dev', detail: '필수. 분포의 표준 편차입니다.' },
        },
    },
    NORMSDIST: {
        description: '표준 정규 누적 분포 함수를 반환합니다. 이 분포의 평균은 0이며 표준 편차는 1입니다. 표준 정규 곡선 면적 표 대신 이 함수를 사용합니다.',
        abstract: '표준 정규 누적 분포 함수를 반환합니다. 이 분포의 평균은 0이며 표준 편차는 1입니다. 표준 정규 곡선 면적 표 대신 이 함수를 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/normsdist-function',
            },
        ],
        functionParameter: {
            z: { name: 'z', detail: '필수 요소입니다. 분포를 구하려는 값입니다.' },
        },
    },
    NORMSINV: {
        description: '표준 정규 누적 분포의 역함수 값을 반환합니다. 이 분포의 평균은 0이고 표준 편차는 1입니다.',
        abstract: '표준 정규 누적 분포의 역함수 값을 반환합니다. 이 분포의 평균은 0이고 표준 편차는 1입니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/normsinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '필수. 정규 분포를 따르는 확률입니다.' },
        },
    },
    PERCENTILE: {
        description: '범위에서 k번째 백분위수 값을 반환합니다. 이 함수를 사용하면 수용 한계값을 설정할 수 있습니다. 예를 들어 점수가 90번째 백분위수를 넘는 후보를 검색할 수 있습니다.',
        abstract: '범위에서 k번째 백분위수 값을 반환합니다. 이 함수를 사용하면 수용 한계값을 설정할 수 있습니다. 예를 들어 점수가 90번째 백분위수를 넘는 후보를 검색할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/percentile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '필수. 상대 순위를 정의하는 데이터 배열 또는 범위입니다.' },
            k: { name: 'k', detail: '필수 요소입니다. 0에서 1 사이 범위의 백분위수 값입니다.' },
        },
    },
    PERCENTRANK: {
        description: 'PERCENTRANK 함수는 데이터 세트의 값 순위를 데이터 세트의 백분율로 반환합니다. 기본적으로 전체 데이터 세트 내 값의 상대 순위입니다. 예를 들어 PERCENTRANK를 사용하여 동일한 테스트에 대한 모든 점수 필드 중 개별 테스트 점수의 순위를 확인할 수 있습니다.',
        abstract: 'PERCENTRANK 함수는 데이터 세트의 값 순위를 데이터 세트의 백분율로 반환합니다. 기본적으로 전체 데이터 세트 내 값의 상대 순위입니다. 예를 들어 PERCENTRANK를 사용하여 동일한 테스트에 대한 모든 점수 필드 중 개별 테스트 점수의 순위를 확인할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/percentrank-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '필수. 백분율 순위가 결정되는 숫자 값의 데이터 범위(또는 미리 정의된 배열)입니다.' },
            x: { name: 'x', detail: '필수 요소입니다. 배열 내의 순위를 알고자 하는 값입니다.' },
            significance: { name: 'significance', detail: '선택적. 백분율 값의 유효 자릿수를 나타내는 값입니다. 이 인수를 생략하면 PERCENTRANK에서는 세 자릿수(0.xxx)가 사용됩니다.' },
        },
    },
    POISSON: {
        description: '포아송 확률 분포값을 반환합니다. 포아송 분포를 사용하여 유료 주차장에 1분 동안 도착하는 자동차 수를 알아보는 경우처럼 특정 시간 동안 발생하는 사건 수를 예측할 수 있습니다.',
        abstract: '포아송 확률 분포값을 반환합니다. 포아송 분포를 사용하여 유료 주차장에 1분 동안 도착하는 자동차 수를 알아보는 경우처럼 특정 시간 동안 발생하는 사건 수를 예측할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/poisson-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. 사건의 수입니다.' },
            mean: { name: 'mean', detail: '필수. 기대값입니다.' },
            cumulative: { name: 'cumulative', detail: '필수. 반환된 확률 분포의 형태를 결정하는 논리 값입니다. 누적이 TRUE이면, POISSON은 발생하는 임의 이벤트의 수가 0에서 x 사이일 수 있는 누적 포아송 확률을 반환합니다. FALSE이면 발생하는 이벤트 수가 정확히 x인 Poisson 확률 질량 함수를 반환합니다.' },
        },
    },
    QUARTILE: {
        description: '데이터 집합에서 사분위수를 반환합니다. 사분위수는 판매 자료나 조사 자료의 모집단을 몇 개의 그룹으로 나눌 때 사용합니다. 예를 들어 QUARTILE을 사용하여 모집단에서 수익이 상위 25%인 자료들을 구할 수 있습니다.',
        abstract: '데이터 집합에서 사분위수를 반환합니다. 사분위수는 판매 자료나 조사 자료의 모집단을 몇 개의 그룹으로 나눌 때 사용합니다. 예를 들어 QUARTILE을 사용하여 모집단에서 수익이 상위 25%인 자료들을 구할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/quartile-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '필수. 사분위수를 계산하려는 숫자 값의 배열 또는 셀 범위입니다.' },
            quart: { name: 'quart', detail: '필수. 계산하려는 사분위수입니다.' },
        },
    },
    RANK: {
        description: '수 목록 내에서 지정한 수의 크기 순위를 반환합니다. 수의 순위는 목록에 있는 다른 수와의 상대 크기를 말합니다. 목록을 정렬하면 수의 위치와 순위가 같아질 수 있습니다.',
        abstract: '수 목록 내에서 지정한 수의 크기 순위를 반환합니다. 수의 순위는 목록에 있는 다른 수와의 상대 크기를 말합니다. 목록을 정렬하면 수의 위치와 순위가 같아질 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/rank-function',
            },
        ],
        functionParameter: {
            number: { name: 'number', detail: '필수. 순위를 구하려는 수입니다.' },
            ref: { name: 'ref', detail: '필수. 숫자 목록에 대한 참조입니다. 숫자 이외의 값은 무시됩니다.' },
            order: { name: 'order', detail: '선택적. 순위 결정 방법을 지정하는 수입니다. order가 0이거나 이를 생략하면 ref가 내림차순으로 정렬된 목록인 것으로 가정하여 number의 순위를 부여합니다. order가 0이 아니면 ref가 오름차순으로 정렬된 목록인 것으로 가정하여 number의 순위를 부여합니다.' },
        },
    },
    STDEV: {
        description: '표본 집단의 표준 편차를 구합니다. 표준 편차를 통해 값이 평균 값에서 벗어나 있는 정도를 알 수 있습니다.',
        abstract: '표본 집단의 표준 편차를 구합니다. 표준 편차를 통해 값이 평균 값에서 벗어나 있는 정도를 알 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/stdev-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '필수. 모집단 표본에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '선택적. 모집단 표본에 해당하는 숫자 인수로, 2개에서 255개까지 지정할 수 있습니다. 쉼표로 구분된 인수 대신 단일 배열이나 배열에 대한 참조를 사용할 수도 있습니다.' },
        },
    },
    STDEVP: {
        description: '인수로 주어진 모집단 전체의 표준 편차를 계산합니다. 표준 편차를 통해 값이 평균 값에서 벗어나 있는 정도를 알 수 있습니다.',
        abstract: '인수로 주어진 모집단 전체의 표준 편차를 계산합니다. 표준 편차를 통해 값이 평균 값에서 벗어나 있는 정도를 알 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/stdevp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '필수. 모집단에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '선택적. 모집단에 해당하는 숫자 인수로, 2개에서 255개까지 지정할 수 있습니다. 쉼표로 구분된 인수 대신 단일 배열이나 배열에 대한 참조를 사용할 수도 있습니다.' },
        },
    },
    TDIST: {
        description: '학생 t 분포의 백분율 포인트(확률)를 반환합니다. 여기서 숫자 값(x)은 백분율 포인트를 계산할 t의 계산 값입니다. t-분포는 소표본의 데이터를 가설 검정할 때 사용됩니다. t-분포의 임계값 표 대신 이 함수를 사용합니다.',
        abstract: '학생 t 분포의 백분율 포인트(확률)를 반환합니다. 여기서 숫자 값(x)은 백분율 포인트를 계산할 t의 계산 값입니다. t-분포는 소표본의 데이터를 가설 검정할 때 사용됩니다. t-분포의 임계값 표 대신 이 함수를 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/tdist-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. 분포를 구하려는 숫자 값입니다.' },
            degFreedom: { name: 'degFreedom', detail: '필수. 자유도를 나타내는 정수입니다.' },
            tails: { name: 'tails', detail: '필수. 반환할 배포 꼬리 수를 지정합니다. Tails = 1이면 TDIST는 단측 분포를 반환합니다. Tails = 2이면 TDIST는 두 꼬리 분포를 반환합니다.' },
        },
    },
    TINV: {
        description: '스튜던트 t-분포의 양측 역함수 값을 반환합니다.',
        abstract: '스튜던트 t-분포의 양측 역함수 값을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/tinv-function',
            },
        ],
        functionParameter: {
            probability: { name: 'probability', detail: '필수. 양측 스튜던트 t-분포의 확률값입니다.' },
            degFreedom: { name: 'degFreedom', detail: '필수. 분포를 결정짓는 자유도를 나타내는 숫자입니다.' },
        },
    },
    TTEST: {
        description: '스튜던트 t-검정에 근거한 확률을 반환합니다. TTEST 함수를 사용하여 두 개의 표본이 같은 평균값을 갖는 두 개의 같은 모집단에서 추출한 것인지를 판단할 수 있습니다.',
        abstract: '스튜던트 t-검정에 근거한 확률을 반환합니다. TTEST 함수를 사용하여 두 개의 표본이 같은 평균값을 갖는 두 개의 같은 모집단에서 추출한 것인지를 판단할 수 있습니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ttest-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array1', detail: '필수. 첫 번째 데이터 집합입니다.' },
            array2: { name: 'array2', detail: '필수. 두 번째 데이터 집합입니다.' },
            tails: { name: 'tails', detail: '필수. 분포 꼬리 수를 지정합니다. tails = 1이면 TTEST는 단측 분포를 사용합니다. tails = 2인 경우 TTEST는 두 꼬리 분포를 사용합니다.' },
            type: { name: 'type', detail: '필수. 실행할 t-검정의 종류입니다.' },
        },
    },
    VAR: {
        description: '표본의 분산을 예측합니다.',
        abstract: '표본의 분산을 예측합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/var-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '필수. 모집단 표본에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '선택적. 모집단 표본에 해당하는 숫자 인수로, 2개에서 255개까지 지정할 수 있습니다.' },
        },
    },
    VARP: {
        description: '전체 모집단의 분산을 계산합니다.',
        abstract: '전체 모집단의 분산을 계산합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/varp-function',
            },
        ],
        functionParameter: {
            number1: { name: 'number1', detail: '필수. 모집단에 해당하는 첫 번째 숫자 인수입니다.' },
            number2: { name: 'number2', detail: '선택적. 모집단에 해당하는 숫자 인수로, 2개에서 255개까지 지정할 수 있습니다.' },
        },
    },
    WEIBULL: {
        description: '와이블 분포값을 반환합니다. 이 분포는 장치의 평균 고장 시간을 계산하는 경우와 같은 신뢰도 분석에 사용합니다.',
        abstract: '와이블 분포값을 반환합니다. 이 분포는 장치의 평균 고장 시간을 계산하는 경우와 같은 신뢰도 분석에 사용합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/weibull-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: '필수 요소입니다. 함수를 계산할 값입니다.' },
            alpha: { name: 'alpha', detail: '필수. 분포의 매개 변수입니다.' },
            beta: { name: 'beta', detail: '필수. 분포의 매개 변수입니다.' },
            cumulative: { name: 'cumulative', detail: '필수. 함수의 형태를 결정하는 인수입니다.' },
        },
    },
    ZTEST: {
        description: 'z-검정의 단측 검정 확률값을 반환합니다. 가설 모집단 평균 μ0가 주어진 경우 ZTEST 함수는 표본 평균이 데이터 집합(배열)의 관측 평균, 즉 관측된 표본 평균보다 클 확률을 반환합니다.',
        abstract: 'z-검정의 단측 검정 확률값을 반환합니다. 가설 모집단 평균 μ0가 주어진 경우 ZTEST 함수는 표본 평균이 데이터 집합(배열)의 관측 평균, 즉 관측된 표본 평균보다 클 확률을 반환합니다.',
        links: [
            {
                title: '사용법',
                url: 'https://support.microsoft.com/ko-kr/excel/functions/ztest-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: '필수. x를 검정할 데이터의 배열 또는 범위입니다.' },
            x: { name: 'x', detail: '필수 요소입니다. 검정할 값입니다.' },
            sigma: { name: 'sigma', detail: '선택적. 모집단(알려진) 표준 편차입니다. 생략하면 샘플 표준 편차가 사용됩니다.' },
        },
    },
};

export default locale;
