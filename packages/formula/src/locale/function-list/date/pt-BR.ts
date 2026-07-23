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
        description: 'A função DATA retorna o número de série sequencial que representa uma determinada data.',
        abstract: 'A função DATA retorna o número de série sequencial que representa uma determinada data.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/date-function',
            },
        ],
        functionParameter: {
            year: { name: 'year', detail: 'O valor do argumento ano pode conter de um a quatro dígitos. O Excel interpreta-o de acordo com o sistema de datas usado pelo computador; por padrão, o Univer usa o sistema de datas de 1900.' },
            month: { name: 'month', detail: 'Um inteiro positivo ou negativo que representa o mês do ano, de 1 a 12 (janeiro a dezembro).' },
            day: { name: 'day', detail: 'Um inteiro positivo ou negativo que representa o dia do mês, de 1 a 31.' },
        },
    },
    DATEDIF: {
        description: 'Calcula o número de dias, meses ou anos entre duas datas.',
        abstract: 'Calcula o número de dias, meses ou anos entre duas datas.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Uma data que representa a primeira ou a data de início de um determinado período. As datas podem ser inseridas como cadeias de texto entre aspas (por exemplo, "30/1/2001"), como números de série (por exemplo, 36921, que representa 30 de janeiro de 2001, se você estiver usando o sistema de data 1900) ou como resultado de outras fórmulas ou funções (por exemplo, DATA.VALOR("30/1/2001")).' },
            endDate: { name: 'end_date', detail: 'Uma data que representa a última data, ou final, do período.' },
            unit: { name: 'Unidade', detail: 'O tipo de informação que pretende que sejam devolvidas, em que: Unidade****Devolve " Y "O número de anos completos no período.". M "O número de meses completos no período." D "O número de dias no período." MD : a diferença entre os dias em start_date e end_date. Os meses e os anos das datas são ignorados. Importante: Não recomendamos a utilização do argumento "MD", uma vez que existem limitações conhecidas com o mesmo. Veja a secção de problemas conhecidos abaixo." YM "A diferença entre os meses em start_date e end_date. Os dias e anos das datas são ignorados" YD "A diferença entre os dias de start_date e end_date. Os anos das datas são ignorados.' },
        },
    },
    DATEVALUE: {
        description: 'A função DATA.VALOR converte uma data armazenada como texto em um número de série que o Excel reconhece como data. Por exemplo, a fórmula =DATA.VALOR("1/1/2008") retorna 39448, o número de série da data 1/1/2008. Lembre-se, no entanto,de que a configuração de sistema de data de seu computador pode fazer com que os resultados da função DATA.VALOR difiram deste exemplo.',
        abstract: 'A função DATA.VALOR converte uma data armazenada como texto em um número de série que o Excel reconhece como data. Por exemplo, a fórmula =DATA.VALOR("1/1/2008") retorna 39448, o número de série da data 1/1/2008. Lembre-se, no entanto,de que a configuração de sistema de data de seu computador pode fazer com que os resultados da função DATA.VALOR difiram deste exemplo.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/datevalue-function',
            },
        ],
        functionParameter: {
            dateText: { name: 'date_text', detail: 'Obrigatório. Texto que representa uma data em um formato de data do Excel ou uma referência a uma célula que contém texto representando uma data em um formato de data do Excel. Por exemplo "1/30/2008" ou "30-Jan-2008" são cadeias de texto entre aspas que representam datas. Utilizando o sistema de datas predefinido no Microsoft Excel para Windows, o argumento date_text tem de representar uma data entre 1 de janeiro de 1900 e 31 de dezembro de 9999. A função DATA.VALOR retornará o valor de erro #VALOR! se o valor do argumento date_text estiver fora deste intervalo. Se a parte do ano do argumento date_text for omitida, a função DATA.VALOR utiliza o ano atual do relógio incorporado do computador. As informações de tempo no argumento date_text são ignoradas.' },
        },
    },
    DAY: {
        description: 'Retorna o dia de uma data representado por um número de série. O dia é dado como um inteiro que varia de 1 a 31.',
        abstract: 'Retorna o dia de uma data representado por um número de série. O dia é dado como um inteiro que varia de 1 a 31.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obrigatório. A data do dia que você está tentando encontrar. As datas devem ser inseridas com a função DATA ou como resultado de outras fórmulas ou funções. Por exemplo, use DATA(2008;5;23) para 23 de maio de 2008. Poderão ocorrer problemas se as datas forem inseridas como texto .' },
        },
    },
    DAYS: {
        description: 'Retorna o número de dias entre duas datas',
        abstract: 'Retorna o número de dias entre duas datas',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: 'end_date', detail: 'Necessário. Data_inicial e Data_final são as duas datas entre as quais você deseja saber o número de dias.' },
            startDate: { name: 'start_date', detail: 'Necessário. Data_inicial e Data_final são as duas datas entre as quais você deseja saber o número de dias.' },
        },
    },
    DAYS360: {
        description: 'A função DIAS360 retorna o número de dias entre duas datas com base em um ano de 360 dias (doze meses de 30 dias). Use essa função para ajudar no cálculo de pagamentos, se o seu sistema contábil estiver baseado em doze meses de 30 dias.',
        abstract: 'A função DIAS360 retorna o número de dias entre duas datas com base em um ano de 360 dias (doze meses de 30 dias). Use essa função para ajudar no cálculo de pagamentos, se o seu sistema contábil estiver baseado em doze meses de 30 dias.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/days360-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'As duas datas entre as quais você deseja saber o número de dias.' },
            endDate: { name: 'end_date', detail: 'As duas datas entre as quais você deseja saber o número de dias.' },
            method: { name: 'method', detail: 'Um valor lógico que especifica se o cálculo deve usar o método dos EUA ou o europeu.' },
        },
    },
    EDATE: {
        description: 'Retorna um número de série de data que é o número de meses indicado antes ou depois de data_inicial. Use DATAM para calcular datas de liquidação ou datas de vencimento que caem no mesmo dia do mês da data de emissão.',
        abstract: 'Retorna um número de série de data que é o número de meses indicado antes ou depois de data_inicial. Use DATAM para calcular datas de liquidação ou datas de vencimento que caem no mesmo dia do mês da data de emissão.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/edate-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Necessário. Uma data que representa a data inicial. As datas devem ser inseridas com a função DATA ou como resultado de outras fórmulas ou funções. Por exemplo, use DATA(2008;5;23) para 23 de maio de 2008. Poderão ocorrer problemas se as datas forem inseridas como texto .' },
            months: { name: 'months', detail: 'Necessário. O número de meses antes ou depois de data_inicial. Um valor positivo para meses gera uma data futura; um valor negativo gera uma data passada.' },
        },
    },
    EOMONTH: {
        description: 'Retorna o número de série para o último dia do mês que é o número indicado de meses antes ou depois de data_inicial. Use FIMMÊS para calcular as datas de vencimento que caem no último dia do mês.',
        abstract: 'Retorna o número de série para o último dia do mês que é o número indicado de meses antes ou depois de data_inicial. Use FIMMÊS para calcular as datas de vencimento que caem no último dia do mês.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/eomonth-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Necessário. Uma data que representa a data inicial. As datas devem ser inseridas com a função DATA ou como resultado de outras fórmulas ou funções. Por exemplo, use DATA(2008;5;23) para 23 de maio de 2008. Poderão ocorrer problemas se as datas forem inseridas como texto .' },
            months: { name: 'months', detail: 'Necessário. O número de meses antes ou depois de data_inicial. Um valor positivo para meses gera uma data futura; um valor negativo gera uma data passada. Observação Se meses não for um número inteiro, será truncado.' },
        },
    },
    EPOCHTODATE: {
        description: 'Converte um carimbo de data e hora da época Unix em segundos, milissegundos ou microssegundos em uma data e hora no Tempo Universal Coordenado (UTC).',
        abstract: 'Converte um carimbo de data e hora da época Unix em segundos, milissegundos ou microssegundos em uma data e hora no Tempo Universal Coordenado (UTC).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/13193461?hl=pt-BR',
            },
        ],
        functionParameter: {
            timestamp: { name: 'timestamp', detail: 'Um carimbo de data e hora da época Unix, em segundos, milissegundos ou microssegundos.' },
            unit: { name: 'unit', detail: '[OPCIONAL — 1 por padrão]: a unidade de tempo em que o carimbo de data e hora é expresso.' },
        },
    },
    HOUR: {
        description: 'Retorna a hora de um valor de tempo. A hora é retornada como um inteiro, variando de 0 (12:00 A.M.) a 23 (11:00 P.M.).',
        abstract: 'Retorna a hora de um valor de tempo. A hora é retornada como um inteiro, variando de 0 (12:00 A.M.) a 23 (11:00 P.M.).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/hour-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Necessário. O horário que contém a hora que você deseja encontrar. Os horários podem ser inseridos como cadeias de texto entre aspas (por exemplo, "6:45 PM"), como números decimais (por exemplo, 0,78125, que representa 6:45 PM) ou como resultados de outras fórmulas ou funções (por exemplo, VALOR.TEMPO("6:45 PM")).' },
        },
    },
    ISOWEEKNUM: {
        description: 'Retorna o número da semana ISO do ano para uma determinada data.',
        abstract: 'Retorna o número da semana ISO do ano para uma determinada data.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: 'date', detail: 'Obrigatório. A data é o código de data-hora usado pelo Excel para cálculos de data e hora.' },
        },
    },
    MINUTE: {
        description: 'Retorna os minutos de um valor de tempo. O minuto é dado como um número inteiro, que vai de 0 a 59.',
        abstract: 'Retorna os minutos de um valor de tempo. O minuto é dado como um número inteiro, que vai de 0 a 59.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obrigatório. O horário que contém o minuto que você deseja encontrar. Os horários podem ser inseridos como cadeias de texto entre aspas (por exemplo, "6:45 PM"), como números decimais (por exemplo, 0,78125, que representa 6:45 PM) ou como resultados de outras fórmulas ou funções (por exemplo, VALOR.TEMPO("6:45 PM")).' },
        },
    },
    MONTH: {
        description: 'Retorna o mês de uma data representado por um número de série. O mês é fornecido como um inteiro, variando de 1 (janeiro) a 12 (dezembro).',
        abstract: 'Retorna o mês de uma data representado por um número de série. O mês é fornecido como um inteiro, variando de 1 (janeiro) a 12 (dezembro).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obrigatório. A data do mês que você está tentando encontrar. As datas devem ser inseridas com a função DATA ou como resultado de outras fórmulas ou funções. Por exemplo, use DATA(2008;5;23) para 23 de maio de 2008. Poderão ocorrer problemas se as datas forem inseridas como texto .' },
        },
    },
    NETWORKDAYS: {
        description: 'Retorna o número de dias úteis inteiros entre data_inicial e data_final. Os dias úteis excluem os fins de semana e quaisquer datas identificadas em feriados. Use DIATRABALHOTOTAL para calcular os benefícios aos empregados que recebem com base no número de dias trabalhados durante um período específico.',
        abstract: 'Retorna o número de dias úteis inteiros entre data_inicial e data_final. Os dias úteis excluem os fins de semana e quaisquer datas identificadas em feriados. Use DIATRABALHOTOTAL para calcular os benefícios aos empregados que recebem com base no número de dias trabalhados durante um período específico.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obrigatório. Uma data que representa a data inicial.' },
            endDate: { name: 'end_date', detail: 'Obrigatório. A data que representa a data final.' },
            holidays: { name: 'holidays', detail: 'Opcional. Um intervalo opcional de uma ou mais datas a serem excluídas do calendário de dias de trabalho, como feriados estaduais e federais, e feriados móveis. A lista pode ser um intervalo de células que contém as datas ou uma constante de matriz dos números de série que representam as datas.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Retorna o número de dias úteis inteiros entre duas datas usando parâmetros para indicar quais e quantos dias são dias de fim de semana. Dias de fim de semana e quaisquer dias especificados como feriados não são considerados como dias úteis.',
        abstract: 'Retorna o número de dias úteis inteiros entre duas datas usando parâmetros para indicar quais e quantos dias são dias de fim de semana. Dias de fim de semana e quaisquer dias especificados como feriados não são considerados como dias úteis.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/networkdays-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Uma data que representa a data inicial.' },
            endDate: { name: 'end_date', detail: 'Uma data que representa a data final.' },
            weekend: { name: 'weekend', detail: 'Um número ou texto que especifica quando ocorrem os fins de semana.' },
            holidays: { name: 'holidays', detail: 'Um intervalo opcional de uma ou mais datas a excluir do calendário de trabalho, como feriados nacionais, estaduais ou móveis.' },
        },
    },
    NOW: {
        description: 'Retorna o número de série da data e da hora atual. Se o formato da célula era Geral antes de a função ter sido inserida, o Excel transformará o formato dessa célula para que ele corresponda ao mesmo formato de data e hora de suas configurações regionais. Você pode alterar o formato de data e hora da célula usando os comandos no grupo Número da guia Página Inicial , na Faixa de Opções.',
        abstract: 'Retorna o número de série da data e da hora atual. Se o formato da célula era Geral antes de a função ter sido inserida, o Excel transformará o formato dessa célula para que ele corresponda ao mesmo formato de data e hora de suas configurações regionais. Você pode alterar o formato de data e hora da célula usando os comandos no grupo Número da guia Página Inicial , na Faixa de Opções.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Retorna os segundos de um valor de hora. O segundo é fornecido como um inteiro no intervalo de 0 (zero) a 59.',
        abstract: 'Retorna os segundos de um valor de hora. O segundo é fornecido como um inteiro no intervalo de 0 (zero) a 59.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obrigatório. A hora que contém os segundos que você deseja localizar. Horas podem ser inseridas como cadeias de texto entre aspas duplas (por exemplo, "6:45 PM"), como números decimais (por exemplo, 0,78125, que representa 6:45 PM) ou como resultado de outras fórmulas e funções (por exemplo, VALOR.TEMPO("6:45 PM")).' },
        },
    },
    TIME: {
        description: 'Retorna o número decimal para uma determinada hora. Se o formato da célula era Geral antes de a função ser inserida, o resultado será formatado como uma data.',
        abstract: 'Retorna o número decimal para uma determinada hora. Se o formato da célula era Geral antes de a função ser inserida, o resultado será formatado como uma data.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/pt-br/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: 'hour', detail: 'Necessário. Um número de 0 (zero) a 32767 que representa a hora. Qualquer valor maior que 23 será dividido por 24 e o restante será tratado como o valor de hora. Por exemplo, TEMPO(27;0;0) = TEMPO(3;0;0) = ,125 ou 3:00 AM.' },
            minute: { name: 'minute', detail: 'Necessário. Um número de 0 a 32767 que representa o minuto. Qualquer valor maior que 59 será convertido em horas e minutos. Por exemplo, TEMPO(0;750;0) = TEMPO(12;30;0) = ,520833 ou 12:30 PM.' },
            second: { name: 'second', detail: 'Necessário. Um número de 0 a 32767 que representa o segundo. Qualquer valor maior que 59 será convertido em horas e minutos. Por exemplo, TEMPO(0;0;2000) = TEMPO(0;33;22) = ,023148 ou 12:33:20 AM' },
        },
    },
    TIMEVALUE: {
        description: 'Retorna o número decimal da hora representada por uma cadeia de texto. O número decimal é um valor que varia de 0 (zero) a 0,99988426 e que representa as horas entre 0:00:00 (12:00:00 AM) e 23:59:59 (11:59:59 PM).',
        abstract: 'Retorna o número decimal da hora representada por uma cadeia de texto. O número decimal é um valor que varia de 0 (zero) a 0,99988426 e que representa as horas entre 0:00:00 (12:00:00 AM) e 23:59:59 (11:59:59 PM).',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/timevalue-function',
            },
        ],
        functionParameter: {
            timeText: { name: 'time_text', detail: 'Obrigatório. Uma cadeia de texto que representa uma hora em qualquer um dos formatos de hora do Microsoft Excel, por exemplo, as cadeias de texto entre aspas "6:45 PM" e "18:45" representam hora.' },
        },
    },
    TO_DATE: {
        description: 'Converte um número fornecido em uma data.',
        abstract: 'Converte um número fornecido em uma data.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3094239?hl=pt-BR',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'O argumento ou referência de célula a converter em data. Se for um número, será interpretado como a quantidade de dias desde 30 de dezembro de 1899; valores negativos são dias anteriores e valores fracionários representam a hora após a meia-noite. Valores não numéricos são retornados sem alteração.' },
        },
    },
    TODAY: {
        description: 'A função HOJE devolve o número de série da data atual. O número de série é o código de data/hora usado pelo Excel para cálculos de data e hora. Se o formato da célula era Geral antes de a função ser inserida, o Excel irá transformar o formato da célula em Data . Se quiser exibir o número de série, será necessário alterar o formato das células para Geral ou Número .',
        abstract: 'A função HOJE devolve o número de série da data atual. O número de série é o código de data/hora usado pelo Excel para cálculos de data e hora. Se o formato da célula era Geral antes de a função ser inserida, o Excel irá transformar o formato da célula em Data . Se quiser exibir o número de série, será necessário alterar o formato das células para Geral ou Número .',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/today-function',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: 'Retorna o dia da semana correspondente a uma data. O dia é dado como um inteiro, variando de 1 (domingo) a 7 (sábado), por padrão.',
        abstract: 'Retorna o dia da semana correspondente a uma data. O dia é dado como um inteiro, variando de 1 (domingo) a 7 (sábado), por padrão.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/weekday-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obrigatório. Um número sequencial que representa a data do dia que você está tentando encontrar. As datas devem ser inseridas com a função DATA ou como resultado de outras fórmulas ou funções. Por exemplo, use DATA(2008;5;23) para 23 de maio de 2008. Poderão ocorrer problemas se as datas forem inseridas como texto.' },
            returnType: { name: 'return_type', detail: 'Opcional. Um número que determina o tipo do valor retornado.' },
        },
    },
    WEEKNUM: {
        description: 'Retorna o número da semana de uma data específica. Por exemplo, a semana que contém 1 de janeiro é a primeira semana do ano e é numerada semana 1.',
        abstract: 'Retorna o número da semana de uma data específica. Por exemplo, a semana que contém 1 de janeiro é a primeira semana do ano e é numerada semana 1.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/weeknum-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Necessário. Uma data na semana. As datas devem ser inseridas com a função DATA ou como resultado de outras fórmulas ou funções. Por exemplo, use DATA(2008;5;23) para 23 de maio de 2008. Poderão ocorrer problemas se as datas forem inseridas como texto.' },
            returnType: { name: 'return_type', detail: 'Opcional. É um número que determina em que dia a semana começa. O valor padrão é 1.' },
        },
    },
    WORKDAY: {
        description: 'Retorna um número que representa uma data que é o número indicado de dias úteis antes ou após uma data (a data inicial). Os dias úteis excluem fins de semana e quaisquer datas identificadas como feriados. Use DIATRABALHO para excluir os fins de semana ou feriados ao calcular as datas de vencimento de fatura, horas de entrega esperadas ou o número de dias de trabalho executado.',
        abstract: 'Retorna um número que representa uma data que é o número indicado de dias úteis antes ou após uma data (a data inicial). Os dias úteis excluem fins de semana e quaisquer datas identificadas como feriados. Use DIATRABALHO para excluir os fins de semana ou feriados ao calcular as datas de vencimento de fatura, horas de entrega esperadas ou o número de dias de trabalho executado.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/workday-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obrigatório. Uma data que representa a data inicial.' },
            days: { name: 'days', detail: 'Obrigatório. O número de dias úteis antes ou depois de data_inicial. Um valor positivo para gera uma data futura; um valor negativo gera uma data passada.' },
            holidays: { name: 'holidays', detail: 'Opcional. Uma lista opcional com uma ou mais datas a serem excluídas do calendário de trabalho, como feriados estaduais, federais e flutuantes. A lista pode ser um intervalo de células que contém as datas ou uma constante de matriz dos números de série que representam as datas.' },
        },
    },
    WORKDAY_INTL: {
        description: 'Essa função retorna o número de série da data antes ou depois de um número especificado de dias úteis com parâmetros personalizados de fim de semana. Parâmetros opcionais de fim de semana podem indicar quais e quantos dias são dias de fim de semana. Observe que os dias de fim de semana e todos os dias especificados como feriados não são considerados como dias úteis.',
        abstract: 'Essa função retorna o número de série da data antes ou depois de um número especificado de dias úteis com parâmetros personalizados de fim de semana. Parâmetros opcionais de fim de semana podem indicar quais e quantos dias são dias de fim de semana. Observe que os dias de fim de semana e todos os dias especificados como feriados não são considerados como dias úteis.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/workday-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Necessário. A data de início, truncada para que apareça como um número inteiro.' },
            days: { name: 'days', detail: 'Necessário. O número de dias úteis antes ou depois de data_inicial. Um valor positivo gera uma data futura; um valor negativo gera uma data passada; um valor zero gera o start_date já especificado . O deslocamento do dia é truncado para um inteiro.' },
            weekend: { name: 'weekend', detail: 'Opcional. Se usado, isso indica os dias da semana que são dias de fim de semana e não são considerados dias úteis. O argumento do fim de semana é um número ou cadeia de caracteres de fim de semana que especifica quando os fins de semana ocorrem. Os valores do número do fim de semana indicam dias de fim de semana, conforme mostrado abaixo.' },
            holidays: { name: 'holidays', detail: 'Esse é um argumento opcional no final da sintaxe. Ele especifica um conjunto opcional de uma ou mais datas que devem ser excluídas do calendário do dia útil. Feriados devem ser um intervalo de células que contêm as datas -- ou uma constante de matriz dos valores serial que representam essas datas. A ordem de datas ou valores consecutivos em feriados podem ser arbitrários.' },
        },
    },
    YEAR: {
        description: 'Retorna o ano correspondente a uma data. O ano é retornado como um inteiro no intervalo de 1900-9999.',
        abstract: 'Retorna o ano correspondente a uma data. O ano é retornado como um inteiro no intervalo de 1900-9999.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/year-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obrigatório. A data do ano que você deseja encontrar. As datas devem ser inseridas com a função DATA ou como resultados de outras fórmulas ou funções. Por exemplo, utilize DATA(2025;5;23) para o dia 23 de maio de 2025. Poderão ocorrer problemas se as datas forem inseridas como texto.' },
        },
    },
    YEARFRAC: {
        description: 'FRAÇÃOANO calcula a fração do ano representada pelo número de dias inteiros entre duas datas (a data_inicial e a data_final ). Por exemplo, você pode usar o FRAÇÃOANO para identificar a proporção dos benefícios de um ano inteiro, ou obrigações a serem atribuídas a um termo específico.',
        abstract: 'FRAÇÃOANO calcula a fração do ano representada pelo número de dias inteiros entre duas datas (a data_inicial e a data_final ). Por exemplo, você pode usar o FRAÇÃOANO para identificar a proporção dos benefícios de um ano inteiro, ou obrigações a serem atribuídas a um termo específico.',
        links: [
            {
                title: 'Instruções',
                url: 'https://support.microsoft.com/pt-br/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Uma data que representa a data inicial.' },
            endDate: { name: 'end_date', detail: 'Uma data que representa a data final.' },
            basis: { name: 'basis', detail: 'O tipo de base de contagem de dias a ser usado.' },
        },
    },
};

export default locale;
