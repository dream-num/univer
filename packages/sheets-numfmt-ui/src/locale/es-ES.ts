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
            title: 'Formato de número',
            numfmtType: 'Tipos de formato',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            general: 'General',
            accounting: 'Contabilidad',
            text: 'Texto',
            number: 'Número',
            percent: 'Porcentaje',
            scientific: 'Científico',
            currency: 'Moneda',
            date: 'Fecha',
            time: 'Hora',
            thousandthPercentile: 'Separador de miles',
            preview: 'Vista previa',
            dateTime: 'Fecha y hora',
            decimalLength: 'Decimales',
            currencyType: 'Símbolo de moneda',
            moreFmt: 'Formatos',
            financialValue: 'Valor financiero',
            roundingCurrency: 'Redondear la moneda',
            timeDuration: 'Duración',
            currencyDes: 'El formato de moneda se utiliza para representar valores monetarios generales. El formato de contabilidad alinea una columna de valores con los puntos decimales.',
            accountingDes: 'El formato de número de contabilidad alinea una columna de valores con símbolos de moneda y puntos decimales.',
            dateType: 'Tipo de fecha',
            dateDes: 'El formato de fecha presenta valores de series de fecha y hora como valores de fecha.',
            negType: 'Tipo de número negativo',
            generalDes: 'El formato regular no contiene ningún formato de número específico.',
            thousandthPercentileDes: 'El formato de separador de miles se utiliza para la representación de números ordinarios. Los formatos monetarios y de contabilidad proporcionan un formato especializado para cálculos de valores monetarios.',
            addDecimal: 'Aumentar decimales',
            subtractDecimal: 'Disminuir decimales',
            customFormat: 'Formato personalizado',
            customFormatDes: 'Generar formatos de número personalizados basados en los existentes.',
        },
    },
};

export default locale;
