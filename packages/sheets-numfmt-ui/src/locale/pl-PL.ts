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
    'sheets-numfmt-ui': {
        title: 'Format liczb',
        numfmtType: 'Typy formatów',
        cancel: 'Anuluj',
        confirm: 'Potwierdź',
        general: 'Ogólny',
        accounting: 'Księgowy',
        text: 'Tekstowy',
        number: 'Liczbowy',
        percent: 'Procentowy',
        scientific: 'Naukowy',
        currency: 'Walutowy',
        date: 'Data',
        time: 'Czas',
        thousandthPercentile: 'Separator tysięcy',
        preview: 'Podgląd',
        dateTime: 'Data i czas',
        decimalLength: 'Miejsca dziesiętne',
        currencyType: 'Symbol waluty',
        moreFmt: 'Formaty',
        financialValue: 'Wartość finansowa',
        roundingCurrency: 'Zaokrąglenie waluty w górę',
        timeDuration: 'Czas trwania',
        currencyDes: 'Format walutowy służy do przedstawiania ogólnych wartości walutowych. Format księgowy wyrównuje kolumnę wartości względem miejsc dziesiętnych.',
        accountingDes: 'Format liczbowy księgowy wyrównuje kolumnę wartości względem symboli walut i miejsc dziesiętnych.',
        dateType: 'Typ daty',
        dateDes: 'Format daty przedstawia wartości szeregów dat i czasu jako wartości dat.',
        negType: 'Typ liczby ujemnej',
        generalDes: 'Format ogólny nie zawiera żadnego określonego formatu liczbowego.',
        thousandthPercentileDes: 'Format percentylowy służy do przedstawiania zwykłych liczb. Formaty walutowe i księgowe zapewniają specjalistyczny format do obliczeń wartości pieniężnych.',
        addDecimal: 'Zwiększ liczbę miejsc dziesiętnych',
        subtractDecimal: 'Zmniejsz liczbę miejsc dziesiętnych',
        customFormat: 'Format niestandardowy',
        customFormatDes: 'Generuj niestandardowe formaty liczb na podstawie istniejących formatów.',
        info: {
            error: 'Błąd',
            forceStringInfo: 'Liczba przechowywana jako tekst',
        },
    },
};

export default locale;
