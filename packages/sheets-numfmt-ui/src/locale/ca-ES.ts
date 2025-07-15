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
    sheet: {
        numfmt: {
            title: 'Format de nombre',
            numfmtType: 'Tipus de format',
            cancel: 'Cancel·lar',
            confirm: 'Confirmar',
            general: 'General',
            accounting: 'Comptabilitat',
            text: 'Text',
            number: 'Nombre',
            percent: 'Percentatge',
            scientific: 'Científic',
            currency: 'Moneda',
            date: 'Data',
            time: 'Hora',
            thousandthPercentile: 'Separador de milers',
            preview: 'Previsualització',
            dateTime: 'Data i hora',
            decimalLength: 'Decimals',
            currencyType: 'Símbol de moneda',
            moreFmt: 'Formats',
            financialValue: 'Valor financer',
            roundingCurrency: 'Arrodonir la moneda',
            timeDuration: 'Durada',
            currencyDes: 'El format de moneda s\'utilitza per representar valors monetaris generals. El format de comptabilitat alinea una columna de valors amb els punts decimals.',
            accountingDes: 'El format de nombre de comptabilitat alinea una columna de valors amb símbols de moneda i punts decimals.',
            dateType: 'Tipus de data',
            dateDes: 'El format de data presenta valors de sèries de data i hora com a valors de data.',
            negType: 'Tipus de nombre negatiu',
            generalDes: 'El format regular no conté cap format de nombre específic.',
            thousandthPercentileDes: 'El format de separador de milers s\'utilitza per a la representació de nombres ordinaris. Els formats monetaris i de comptabilitat proporcionen un format especialitzat per a càlculs de valors monetaris.',
            addDecimal: 'Augmentar decimals',
            subtractDecimal: 'Disminuir decimals',
            customFormat: 'Format personalitzat',
            customFormatDes: 'Genera formats de nombre personalitzats basats en els existents.',
        },
    },
};

export default locale;
