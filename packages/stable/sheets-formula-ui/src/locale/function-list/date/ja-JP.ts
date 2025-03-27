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

export default {
    DATE: {
        description: '指定された日付に対応するシリアル値を返します。',
        abstract: '指定された日付に対応するシリアル値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/date-%E9%96%A2%E6%95%B0-e36c0c8c-4104-49da-ab83-82328b832349',
            },
        ],
        functionParameter: {
            year: { name: '年', detail: 'year 引数の値 には 、1 ~ 4 桁の数字を指定できます。 Excel は、コンピューター が使用 している日付システムに応じて年の引数を解釈します。 既定では、Univer では 1900 年の日付システムが使用されます。つまり、最初の日付は 1900 年 1 月 1 日です。' },
            month: { name: '月', detail: '1 ~ 12 (1 月から 12 月) の月を表す正または負の整数です。' },
            day: { name: '日', detail: '1 ~ 31 の月の日を表す正または負の整数です。' },
        },
    },
    DATEDIF: {
        description: '2 つの日付間の日数、月数、年数を計算します。 この関数は、年齢を計算する数式に使うと便利です。',
        abstract: '2 つの日付間の日数、月数、年数を計算します。 この関数は、年齢を計算する数式に使うと便利です。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/datedif-%E9%96%A2%E6%95%B0-25dba1a4-2812-480b-84dd-8b32a451b35c',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '指定した期間の最初の日付または開始日を表す日付。' },
            endDate: { name: '終了日', detail: '期間の最後の日付または終了日を表す日付。' },
            method: { name: '単位', detail: '返される情報の種類。' },
        },
    },
    DATEVALUE: {
        description: '日付を表す文字列をシリアル値に変換します。',
        abstract: '日付を表す文字列をシリアル値に変換します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/datevalue-%E9%96%A2%E6%95%B0-df8b07d4-7761-4a93-bc33-b7471bbff252',
            },
        ],
        functionParameter: {
            dateText: { name: '日付文字列', detail: 'Excel の日付形式で日付を表すテキスト、または Excel の日付形式で日付を表すテキストを含むセルへの参照。 たとえば、"1/30/2008" や "30-Jan-2008" は、日付を表す引用符内のテキスト文字列です。\nWindows 版 Excel の標準の日付システムを使用する場合、日付文字列の引数には、1900 年 1 月 1 日～ 9999 年 12 月 31 日までの間の日付を指定する必要があります。 DATEVALUE 関数は、#VALUE を返します。 が返されます。\n日付文字列 引数の年の部分を省略すると、DATEVALUE 関数はコンピューターのシステム時計による現在の年を使用します。 日付文字列引数に時刻の情報が含まれていても無視されます。' },
        },
    },
    DAY: {
        description: 'シリアル番号で表された、日付の日情報を返します。日情報は 1 ～ 31 の範囲内の整数で示されます。',
        abstract: 'シリアル値を日付に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/day-%E9%96%A2%E6%95%B0-8a7d1cbb-6c7d-4ba1-8aea-25c134d03101',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'シリアル値', detail: '検索する日付を指定します。 日付は、DATE 関数を使って入力するか、他の数式または他の関数の結果を指定します。 たとえば、2008 年 5 月 23 日を入力する場合は、DATE(2008,5,23) を使用します。' },
        },
    },
    DAYS: {
        description: '2 つの日付間の日数を返します。',
        abstract: '2 つの日付間の日数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/days-%E9%96%A2%E6%95%B0-57740535-d549-4395-8728-0f07bff0b9df',
            },
        ],
        functionParameter: {
            endDate: { name: '終了日', detail: '開始日と終了日を指定し、その間の日数を求めます。' },
            startDate: { name: '開始日', detail: '開始日と終了日を指定し、その間の日数を求めます。' },
        },
    },
    DAYS360: {
        description: '1 年を 360 日 (30 日 x 12) として、支払いの計算などに使用される 2 つの日付の間の日数を返します。',
        abstract: '1 年を 360 日 (30 日 x 12) として、支払いの計算などに使用される 2 つの日付の間の日数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/days360-%E9%96%A2%E6%95%B0-b9a509fd-49ef-407e-94df-0cbda5718c2a',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '開始日と終了日を指定し、その間の日数を求めます。' },
            endDate: { name: '終了日', detail: '開始日と終了日を指定し、その間の日数を求めます。' },
            method: { name: '方法', detail: '計算に米国方式とヨーロッパ方式のどちらを採用するかを、論理値で指定します。' },
        },
    },
    EDATE: {
        description: '開始日から起算して、指定された月数だけ前または後の日付に対応するシリアル値を返します。 この関数を使用すると、伝票の発行日と同じ日に当たる支払日や満期日の日付を計算することができます。',
        abstract: '開始日から起算して、指定した月数だけ前または後の日付に対応するシリアル値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/edate-%E9%96%A2%E6%95%B0-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '起算日を表す日付を指定します。 日付は、DATE 関数を使って入力するか、他の数式または他の関数の結果を指定します。 たとえば、2008 年 5 月 23 日を入力する場合は、DATE(2008,5,23) を使用します。 日付を文字列として入力した場合、エラーが発生することがあります。' },
            months: { name: '月', detail: '開始日から起算した月数を指定します。 "月" に正の数を指定すると起算日より後の日付を返し、負の数を指定すると起算日より前の日付を返します。' },
        },
    },
    EOMONTH: {
        description: '開始日から起算して、指定した月数だけ前または後の月の最終日に対応するシリアル値を返します。',
        abstract: '開始日から起算して、指定した月数だけ前または後の月の最終日に対応するシリアル値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/eomonth-%E9%96%A2%E6%95%B0-7314ffa1-2bc9-4005-9d66-f49db127d628',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '起算日を表す日付を指定します。' },
            months: { name: '月', detail: '開始日から起算した月数を指定します。' },
        },
    },
    EPOCHTODATE: {
        description: 'Unix エポック タイムスタンプ（秒、ミリ秒、またはマイクロ秒）を協定世界時（UTC）の日時に変換します。',
        abstract: 'Unix エポック タイムスタンプ（秒、ミリ秒、またはマイクロ秒）を協定世界時（UTC）の日時に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/13193461?hl=ja&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            timestamp: { name: 'タイムスタンプ', detail: 'Unix エポック タイムスタンプ（秒、ミリ秒、またはマイクロ秒）。' },
            unit: { name: '時間の単位', detail: 'タイムスタンプを表示する時間の単位。デフォルト値は 1: \n1 は時間単位が秒であることを示します。\n2 は時間単位がミリ秒であることを示します。\n3 は時間単位がマイクロ秒であることを示します。' },
        },
    },
    HOUR: {
        description: 'シリアル値を時刻に変換します。',
        abstract: 'シリアル値を時刻に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/hour-%E9%96%A2%E6%95%B0-a3afa879-86cb-4339-b1b5-2dd2d7310ac7',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'シリアル値', detail: '検索する日付を指定します。 日付は、DATE 関数を使って入力するか、他の数式または他の関数の結果を指定します。 たとえば、2008 年 5 月 23 日を入力する場合は、DATE(2008,5,23) を使用します。' },
        },
    },
    ISOWEEKNUM: {
        description: '指定された日付のその年における ISO 週番号を返します。',
        abstract: '指定された日付のその年における ISO 週番号を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/isoweeknum-%E9%96%A2%E6%95%B0-1c2d0afe-d25b-4ab1-8894-8d0520e90e0e',
            },
        ],
        functionParameter: {
            date: { name: '日付', detail: 'で日付や時刻の計算に使用されるコードのことです。' },
        },
    },
    MINUTE: {
        description: 'シリアル値を時刻の分に変換します。',
        abstract: 'シリアル値を時刻の分に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/minute-%E9%96%A2%E6%95%B0-af728df0-05c4-4b07-9eed-a84801a60589',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'シリアル値', detail: '検索する日付を指定します。 日付は、DATE 関数を使って入力するか、他の数式または他の関数の結果を指定します。 たとえば、2008 年 5 月 23 日を入力する場合は、DATE(2008,5,23) を使用します。' },
        },
    },
    MONTH: {
        description: 'シリアル値を月に変換します。',
        abstract: 'シリアル値を月に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/month-%E9%96%A2%E6%95%B0-579a2881-199b-48b2-ab90-ddba0eba86e8',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'シリアル値', detail: '検索する月の日付を指定します。 日付は、DATE 関数を使って入力するか、他の数式または他の関数の結果として指定します。 たとえば、2008 年 5 月 23 日を入力する場合は、DATE(2008,5,23) を使用します。' },
        },
    },
    NETWORKDAYS: {
        description: '開始日と終了日を指定して、その期間内の稼動日の日数を返します。',
        abstract: '開始日と終了日を指定して、その期間内の稼動日の日数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/networkdays-%E9%96%A2%E6%95%B0-48e717bf-a7a3-495f-969e-5005e3eb18e7',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '起算日を表す日付を指定します。' },
            endDate: { name: '終了日', detail: '対象期間の最終日を表す日付を指定します。' },
            holidays: { name: '休日', detail: '国民の祝日や変動休日など、稼働日数の計算から除外する日付のリストを指定します。' },
        },
    },
    NETWORKDAYS_INTL: {
        description: '週末がどの曜日で何日間あるかを示すパラメーターを使用して、開始日と終了日の間にある稼働日の日数を返します。',
        abstract: '週末がどの曜日で何日間あるかを示すパラメーターを使用して、開始日と終了日の間にある稼働日の日数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/networkdays-intl-%E9%96%A2%E6%95%B0-a9b26239-4f20-46a1-9ab8-4e925bfd5e28',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '起算日を表す日付を指定します。' },
            endDate: { name: '終了日', detail: '対象期間の最終日を表す日付を指定します。' },
            weekend: { name: '週末', detail: 'は、週末を示す週末番号または文字列で指定します。' },
            holidays: { name: '休日', detail: '国民の祝日や変動休日など、稼働日数の計算から除外する日付のリストを指定します。' },
        },
    },
    NOW: {
        description: '現在の日付と時刻に対応するシリアル値を返します。',
        abstract: '現在の日付と時刻に対応するシリアル値を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/now-%E9%96%A2%E6%95%B0-3337fd29-145a-4347-b2e6-20c904739c46',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'シリアル値を時刻の秒に変換します。',
        abstract: 'シリアル値を時刻の秒に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/second-%E9%96%A2%E6%95%B0-740d1cfc-553c-4099-b668-80eaa24e8af1',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'シリアル値', detail: '検索する日付を指定します。 日付は、DATE 関数を使って入力するか、他の数式または他の関数の結果を指定します。 たとえば、2008 年 5 月 23 日を入力する場合は、DATE(2008,5,23) を使用します。' },
        },
    },
    TIME: {
        description: '指定した時刻に対応するシリアル値を返します。',
        abstract: '指定した時刻に対応するシリアル値を返します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/time-%E9%96%A2%E6%95%B0-9a5aff99-8f7d-4611-845e-747d0b8d5457',
            },
        ],
        functionParameter: {
            hour: { name: '時', detail: '時間を表す 0 (ゼロ) から 32767 までの数値。 23 より大きい値は 24 で割られ、残りは時間値として扱われます。 たとえば、TIME(27,0,0) = TIME(3,0,0) = .125 または 3:00 AM。' },
            minute: { name: '分', detail: '分を表す 0 から 32767 までの数値。 59 より大きい値は、時間と分に変換されます。 たとえば、TIME(0,750,0) = TIME(12,30,0) = .520833 または 12:30 PM。' },
            second: { name: '秒', detail: '2 番目を表す 0 から 32767 までの数値。 59 を超える値は、時間、分、秒に変換されます。 たとえば、TIME(0,0,2000) = TIME(0,33,22) = .023148 または 12:33:20 AM。' },
        },
    },
    TIMEVALUE: {
        description: '時刻を表す文字列をシリアル値に変換します。',
        abstract: '時刻を表す文字列をシリアル値に変換します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/timevalue-%E9%96%A2%E6%95%B0-0b615c12-33d8-4431-bf3d-f3eb6d186645',
            },
        ],
        functionParameter: {
            timeText: { name: '時刻文字列', detail: 'Microsoft Excel のいずれかの時刻形式で時刻を表すテキスト文字列。たとえば、"6:45 PM" と "18:45" のテキスト文字列は、時間を表す引用符で囲みます。' },
        },
    },
    TO_DATE: {
        description: '指定された数値を日付に変換します。',
        abstract: '指定された数値を日付に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.google.com/docs/answer/3094239?hl=ja&sjid=2155433538747546473-AP',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: '日付に変換する引数またはセルへの参照です。' },
        },
    },
    TODAY: {
        description: '現在の日付に対応するシリアル値を返します。',
        abstract: '現在の日付に対応するシリアル値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/today-%E9%96%A2%E6%95%B0-5eb3078d-a82c-4736-8930-2f51a028fdd9',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: 'シリアル値を曜日に変換します。',
        abstract: 'シリアル値を曜日に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/weekday-%E9%96%A2%E6%95%B0-60e44483-2ed1-439f-8bd0-e404c190949a',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'シリアル値', detail: '検索する日付のシリアル値を指定します。' },
            returnType: { name: '週の基準', detail: '戻り値の種類を数値で指定します。' },
        },
    },
    WEEKNUM: {
        description: 'シリアル値をその年の何週目に当たるかを示す値に変換します。',
        abstract: 'シリアル値をその年の何週目に当たるかを示す値に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/weeknum-%E9%96%A2%E6%95%B0-e5c43a03-b4ab-426c-b411-b18c13c75340',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'シリアル値', detail: '日付を指定します。' },
            returnType: { name: '週の基準', detail: ' 週の始まりを何曜日とするかを数値で指定します。 既定値は 1 です。' },
        },
    },
    WORKDAY: {
        description: '開始日から起算して、指定した稼動日数だけ前または後の日付に対応するシリアル値を返します。',
        abstract: '開始日から起算して、指定した稼動日数だけ前または後の日付に対応するシリアル値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/workday-%E9%96%A2%E6%95%B0-f764a5b7-05fc-4494-9486-60d494efbf33',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '起算日を表す日付を指定します。' },
            days: { name: '日数', detail: '開始日から起算して、週末や祭日を除く週日の日数を指定します。 日数に正の数を指定すると、起算日より後の日付となり、負の数を指定すると、起算日より前の日付となります。' },
            holidays: { name: '休日', detail: '国民の祝日や変動休日など、稼働日数の計算から除外する日付のリストを指定します。' },
        },
    },
    WORKDAY_INTL: {
        description: '週末がどの曜日で何日間あるかを示すパラメーターを使用して、開始日から起算して指定した稼働日数だけ前または後の日付に対応するシリアル値を返します。',
        abstract: '週末がどの曜日で何日間あるかを示すパラメーターを使用して、開始日から起算して指定した稼働日数だけ前または後の日付に対応するシリアル値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/workday-intl-%E9%96%A2%E6%95%B0-a378391c-9ba7-4678-8a39-39611a9bf81d',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '起算日を表す日付を指定します。' },
            days: { name: '日数', detail: '開始日から起算して、週末や祭日を除く週日の日数を指定します。 日数に正の数を指定すると、起算日より後の日付となり、負の数を指定すると、起算日より前の日付となります。' },
            weekend: { name: '週末', detail: 'は、週末を示す週末番号または文字列で指定します。' },
            holidays: { name: '休日', detail: '国民の祝日や変動休日など、稼働日数の計算から除外する日付のリストを指定します。' },
        },
    },
    YEAR: {
        description: '日付に対応する年を返します。 戻り値は、1900 (年) ～ 9999 (年) の範囲の整数となります。',
        abstract: 'シリアル値を年に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/year-%E9%96%A2%E6%95%B0-c64f017a-1354-490d-981f-578e8ec8d3b9',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'シリアル値', detail: '検索する年の日付を指定します。 日付は、DATE 関数を使って入力するか、他の数式または他の関数の結果として指定します。 たとえば、2008 年 5 月 23 日を入力する場合は、DATE(2008,5,23) を使用します。 日付を文字列として入力した場合、エラーが発生することがあります。' },
        },
    },
    YEARFRAC: {
        description: '開始日と終了日を指定して、その間の期間が 1 年間に対して占める割合を返します。',
        abstract: '開始日と終了日を指定して、その間の期間が 1 年間に対して占める割合を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/office/yearfrac-%E9%96%A2%E6%95%B0-3844141e-c76d-4143-82b6-208454ddc6a8',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '起算日を表す日付を指定します。' },
            endDate: { name: '終了日', detail: '対象期間の最終日を表す日付を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
};
