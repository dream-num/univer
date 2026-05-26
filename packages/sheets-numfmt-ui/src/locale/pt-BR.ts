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
        title: 'Formato de número',
        numfmtType: 'Tipos de formato',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        general: 'Geral',
        accounting: 'Contábil',
        text: 'Texto',
        number: 'Número',
        percent: 'Porcentagem',
        scientific: 'Científico',
        currency: 'Moeda',
        date: 'Data',
        time: 'Hora',
        thousandthPercentile: 'Separador de milhares',
        preview: 'Visualização',
        dateTime: 'Data e hora',
        decimalLength: 'Casas decimais',
        currencyType: 'Símbolo da moeda',
        moreFmt: 'Formatos',
        financialValue: 'Valor financeiro',
        roundingCurrency: 'Arredondamento da moeda',
        timeDuration: 'Duração do tempo',
        currencyDes: 'O formato de moeda é usado para representar valores monetários gerais. O formato contábil alinha uma coluna de valores com pontos decimais',
        accountingDes: 'O formato de número contábil alinha uma coluna de valores com símbolos de moeda e pontos decimais',
        dateType: 'Tipo de data',
        dateDes: 'O formato de data apresenta valores de séries de data e hora como valores de data.',
        negType: 'Um tipo de número negativo',
        generalDes: 'O formato regular não contém nenhum formato de número específico.',
        thousandthPercentileDes: 'O formato percentil é usado para a representação de números comuns. Os formatos monetário e contábil fornecem um formato especializado para cálculos de valores monetários.',
        addDecimal: 'Aumentar casas decimais',
        subtractDecimal: 'Diminuir casas decimais',
        customFormat: 'Formato Personalizado',
        customFormatDes: 'Gere formatos de número personalizados com base em formatos existentes.',
        info: {
            error: 'Erro',
            forceStringInfo: 'Número armazenado como texto',
        },
    },
};

export default locale;
