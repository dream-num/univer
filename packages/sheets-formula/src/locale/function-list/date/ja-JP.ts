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
    DATE: {
        description: '指定された日付に対応するシリアル値を返します。',
        abstract: '指定された日付に対応するシリアル値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/date-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '指定した期間の最初の日付または開始日を表す日付。 日付は、引用符 ("2001/1/30" など) 内のテキスト文字列として、シリアル番号 (たとえば、1900 年 1 月 30 日を表す 36921 など) として、または他の数式または関数の結果として入力できます (例: DATEVALUE("2001/1/30")。' },
            endDate: { name: '終了日', detail: '期間の最後の日付または終了日を表す日付。' },
            unit: { name: '単位', detail: '返される情報の種類。ここで: Unit****Returns " Y "期間の完全な年数。 M "期間の完了した月の数" D "期間の日数" MD "start_dateとend_dateの日数の違い。 日付の月数および年数は無視されます。 大事な： "MD" 引数には既知の制限があるため、使用することはお勧めしません。 以下の既知の問題に関するセクションを参照してください。 YM "start_dateとend_dateの月の違い。 日付の日数と年は無視されます" YD "start_date日とend_date日の違い。 日付の年数は無視されます。' },
        },
    },
    DATEVALUE: {
        description: '日付を表す文字列をシリアル値に変換します。',
        abstract: '日付を表す文字列をシリアル値に変換します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/datevalue-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/day-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/days-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/days360-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/edate-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/eomonth-function',
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
                url: 'https://support.google.com/docs/answer/13193461?hl=ja',
            },
        ],
        functionParameter: {
            timestamp: { name: 'タイムスタンプ', detail: 'EPOCHTODATE(1655908429662,2)' },
            unit: { name: '時間の単位', detail: 'EPOCHTODATE(1655906710)' },
        },
    },
    HOUR: {
        description: 'シリアル値を時刻に変換します。',
        abstract: 'シリアル値を時刻に変換します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/hour-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: '日付', detail: '必須。 日付とは、Excel で日付や時刻の計算に使用されるコードのことです。' },
        },
    },
    MINUTE: {
        description: '時刻の分を返します。 戻り値は 0 (分) ～ 59 (分) の範囲の整数となります。',
        abstract: '時刻の分を返します。 戻り値は 0 (分) ～ 59 (分) の範囲の整数となります。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'シリアル値', detail: '必須。 検索する分が含まれている時刻を指定します。 時刻には、半角の二重引用符 (") で囲んだ文字列 ("6:45 PM" など)、小数 (6:45 PM を表す 0.78125)、または他の数式や関数の結果 (TIMEVALUE("6:45 PM") など) を指定します。' },
        },
    },
    MONTH: {
        description: 'データに含まれる月をシリアル値で返します。 戻り値は 1 (月) ～ 12 (月) の範囲の整数となります。',
        abstract: 'データに含まれる月をシリアル値で返します。 戻り値は 1 (月) ～ 12 (月) の範囲の整数となります。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'シリアル値', detail: '必須。 検索する月の日付を指定します。 日付は、DATE 関数を使って入力するか、他の数式または他の関数の結果として指定します。 たとえば、2008 年 5 月 23 日を入力する場合は、DATE(2008,5,23) を使用します。 日付を文字列として入力 した場合、エラーが発生することがあります。' },
        },
    },
    NETWORKDAYS: {
        description: '開始日から終了日までの期間に含まれる稼動日の日数を返します。 稼働日とは、土曜、日曜、および指定された休日を除く日のことです。 この関数は、特定期間内の稼動日数を基準にして従業員の給与を計算するときに使用します。',
        abstract: '開始日から終了日までの期間に含まれる稼動日の日数を返します。 稼働日とは、土曜、日曜、および指定された休日を除く日のことです。 この関数は、特定期間内の稼動日数を基準にして従業員の給与を計算するときに使用します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '必須。 起算日を表す日付を指定します。' },
            endDate: { name: '終了日', detail: '必須。 対象期間の最終日を表す日付を指定します。' },
            holidays: { name: '休日', detail: 'オプション。 国民の祝日や変動休日など、稼働日数の計算から除外する日付のリストを指定します。 日付を含む一連のセルか、日付を示すシリアル値の配列定数で指定できます。' },
        },
    },
    NETWORKDAYS_INTL: {
        description: '週末がどの曜日で何日間あるかを示すパラメーターを使用して、開始日と終了日の間にある稼働日の日数を返します。',
        abstract: '週末がどの曜日で何日間あるかを示すパラメーターを使用して、開始日と終了日の間にある稼働日の日数を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/networkdays-intl-function',
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
        description: '現在の日付と時刻に対応するシリアル値を返します。 関数が入力される前に、セルの表示形式が [ 標準 ] であった場合、セルの書式は、地域の設定の日付と時刻の書式に合わせて変更されます。 リボンの [ ホーム ] タブにある [ 数値 ] のコマンドを使用して、セルの日付と時刻の書式を変更できます。',
        abstract: '現在の日付と時刻に対応するシリアル値を返します。 関数が入力される前に、セルの表示形式が [ 標準 ] であった場合、セルの書式は、地域の設定の日付と時刻の書式に合わせて変更されます。 リボンの [ ホーム ] タブにある [ 数値 ] のコマンドを使用して、セルの日付と時刻の書式を変更できます。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: '時刻の秒を返します。 戻り値は 0 (秒) ～ 59 (秒) の範囲の整数となります。',
        abstract: '時刻の秒を返します。 戻り値は 0 (秒) ～ 59 (秒) の範囲の整数となります。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'シリアル値', detail: '必須。 検索する秒が含まれている時刻を指定します。 時刻には、半角の二重引用符 (") で囲んだ文字列 ("6:45 PM" など)、小数 (6:45 PM を表す 0.78125)、または他の数式や関数の結果 (TIMEVALUE("6:45 PM") など) を指定します。' },
        },
    },
    TIME: {
        description: '指定した時刻に対応する小数を返します。 この関数を挿入する前のセルの表示形式が [ 標準 ] であった場合、結果は日付形式になります。',
        abstract: '指定した時刻に対応する小数を返します。 この関数を挿入する前のセルの表示形式が [ 標準 ] であった場合、結果は日付形式になります。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: '時', detail: '必須。 時間を表す 0 (ゼロ) から 32767 までの数値。 23 より大きい値は 24 で割られ、残りは時間値として扱われます。 たとえば、TIME(27,0,0) = TIME(3,0,0) = .125 または 3:00 AM。' },
            minute: { name: '分', detail: '必須。 分を表す 0 から 32767 までの数値。 59 より大きい値は、時間と分に変換されます。 たとえば、TIME(0,750,0) = TIME(12,30,0) = .520833 または 12:30 PM。' },
            second: { name: '秒', detail: '必須。 2 番目を表す 0 から 32767 までの数値。 59 を超える値は、時間、分、秒に変換されます。 たとえば、TIME(0,0,2000) = TIME(0,33,22) = .023148 または 12:33:20 AM' },
        },
    },
    TIMEVALUE: {
        description: '時刻を表す文字列をシリアル値に変換します。',
        abstract: '時刻を表す文字列をシリアル値に変換します',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/timevalue-function',
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
                url: 'https://support.google.com/docs/answer/3094239?hl=ja',
            },
        ],
        functionParameter: {
            value: { name: '値', detail: 'TO_DATE(A2)' },
        },
    },
    TODAY: {
        description: '現在の日付に対応するシリアル値を返します。',
        abstract: '現在の日付に対応するシリアル値を返します。',
        links: [
            {
                title: '指導',
                url: 'https://support.microsoft.com/ja-jp/excel/functions/today-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/weekday-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/weeknum-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/workday-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/workday-intl-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/year-function',
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
                url: 'https://support.microsoft.com/ja-jp/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: '開始日', detail: '起算日を表す日付を指定します。' },
            endDate: { name: '終了日', detail: '対象期間の最終日を表す日付を指定します。' },
            basis: { name: '基準', detail: '計算に使用する基準日数を示す数値を指定します。' },
        },
    },
};

export default locale;
