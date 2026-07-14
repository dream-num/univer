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
        description: 'La funzione DATA restituisce il numero seriale sequenziale che rappresenta una data specifica.',
        abstract: 'La funzione DATA restituisce il numero seriale sequenziale che rappresenta una data specifica.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/date-function',
            },
        ],
        functionParameter: {
            year: { name: 'year', detail: 'Il valore dell\'argomento anno può contenere da una a quattro cifre. Excel lo interpreta in base al sistema di date del computer; per impostazione predefinita, Univer usa il sistema di date 1900.' },
            month: { name: 'month', detail: 'Un numero intero positivo o negativo che rappresenta il mese dell\'anno da 1 a 12, da gennaio a dicembre.' },
            day: { name: 'day', detail: 'Un numero intero positivo o negativo che rappresenta il giorno del mese da 1 a 31.' },
        },
    },
    DATEDIF: {
        description: 'Calcola il numero di giorni, mesi o anni tra due date.',
        abstract: 'Calcola il numero di giorni, mesi o anni tra due date.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/datedif-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Data che rappresenta la prima o la data iniziale di un determinato periodo. Le date possono essere specificate come stringhe di testo racchiuse tra virgolette, ad esempio "30/1/2001", come numeri seriali, ad esempio 36921, che rappresenta il 30 gennaio 2001 se si usa il sistema data 1900, o come risultati di altre formule o funzioni, ad esempio DATA.VALORE("30/1/2001").' },
            endDate: { name: 'end_date', detail: 'Data che rappresenta l\'ultima data, o data finale, del periodo.' },
            unit: { name: 'Unità', detail: 'Tipo di informazioni che si desidera vengano restituite, dove: Unit****Returns " Y "Numero di anni completi nel periodo. M "Numero di mesi completi nel periodo". D "Numero di giorni nel periodo". MD "Differenza tra i giorni di start_date e end_date. Vengono ignorati i mesi e gli anni delle date. Importante: Non è consigliabile usare l\'argomento "MD", perché contiene limitazioni note. Vedere la sezione problemi noti riportata di seguito". YM "Differenza tra i mesi in start_date e end_date. I giorni e gli anni delle date vengono ignorati" YD "La differenza tra i giorni di start_date e end_date. Vengono ignorati gli anni delle date.' },
        },
    },
    DATEVALUE: {
        description: 'La funzione DATA.VALORE converte una data memorizzata come testo in un numero seriale riconosciuto da Excel come data. La formula =DATA.VALORE("01/01/2008") ad esempio restituisce 39448, ovvero il numero seriale della data 01/01/2008. Tuttavia, tenere presente che in base all\'impostazione della data di sistema nel computer in uso, i risultati della funzione DATA.VALORE possono variare rispetto a questo esempio.',
        abstract: 'La funzione DATA.VALORE converte una data memorizzata come testo in un numero seriale riconosciuto da Excel come data. La formula =DATA.VALORE("01/01/2008") ad esempio restituisce 39448, ovvero il numero seriale della data 01/01/2008. Tuttavia, tenere presente che in base all\'impostazione della data di sistema nel computer in uso, i risultati della funzione DATA.VALORE possono variare rispetto a questo esempio.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/datevalue-function',
            },
        ],
        functionParameter: {
            dateText: { name: 'date_text', detail: 'Obbligatorio. Testo che rappresenta una data in un formato di data di Excel oppure riferimento a una cella contenente testo che rappresenta una data in un formato di data di Excel. "30/01/2008" o "30-gen-2008" ad esempio sono stringhe di testo racchiuse tra virgolette che rappresentano date. Usando il sistema data predefinito in Microsoft Excel per Windows, l\'argomento date_text deve rappresentare una data compresa tra il 1° gennaio 1900 e il 31 dicembre 9999. La funzione DATA.VALORE restituisce il #VALUE! se il valore dell\'argomento date_text non rientra in questo intervallo. Se la parte relativa all\'anno dell\'argomento date_text viene omesso, la funzione DATA.VALORE usa l\'anno corrente dell\'orologio predefinito del computer. Le informazioni relative all\'ora nell\'argomento date_text vengono ignorate.' },
        },
    },
    DAY: {
        description: 'Restituisce il giorno di una data rappresentata da un numero seriale. I giorni vengono rappresentati con numeri interi compresi tra 1 e 31.',
        abstract: 'Restituisce il giorno di una data rappresentata da un numero seriale. I giorni vengono rappresentati con numeri interi compresi tra 1 e 31.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/day-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obbligatorio. Data del giorno da trovare. Le date devono essere immesse usando la funzione DATA o devono essere il risultato di altre formule o funzioni. Usare, ad esempio, DATA(2008;5;23) per il 23 maggio 2008. Potrebbero verificarsi problemi se le date vengono immesse come testo .' },
        },
    },
    DAYS: {
        description: 'Restituisce il numero di giorni compresi tra due date.',
        abstract: 'Restituisce il numero di giorni compresi tra due date.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/days-function',
            },
        ],
        functionParameter: {
            endDate: { name: 'end_date', detail: 'Obbligatorio. Data_inizio e data_fine sono le due date che delimitano il numero di giorni da trovare.' },
            startDate: { name: 'start_date', detail: 'Obbligatorio. Data_inizio e data_fine sono le due date che delimitano il numero di giorni da trovare.' },
        },
    },
    DAYS360: {
        description: 'La funzione GIORNO360 restituisce il numero di giorni compresi tra due date sulla base di un anno di 360 giorni (dodici mesi di 30 giorni), usato in alcuni sistemi di contabilità. Usare questa funzione per facilitare il calcolo dei pagamenti qualora il sistema di contabilità si basi su 12 mesi di 30 giorni.',
        abstract: 'La funzione GIORNO360 restituisce il numero di giorni compresi tra due date sulla base di un anno di 360 giorni (dodici mesi di 30 giorni), usato in alcuni sistemi di contabilità. Usare questa funzione per facilitare il calcolo dei pagamenti qualora il sistema di contabilità si basi su 12 mesi di 30 giorni.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/days360-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Le due date tra le quali si desidera conoscere il numero di giorni.' },
            endDate: { name: 'end_date', detail: 'Le due date tra le quali si desidera conoscere il numero di giorni.' },
            method: { name: 'method', detail: 'Valore logico che specifica se usare il metodo statunitense o europeo nel calcolo.' },
        },
    },
    EDATE: {
        description: 'Restituisce il numero seriale che rappresenta la data che cade il numero di mesi indicato prima o dopo la data specificata in data_iniziale. Utilizzare la funzione DATA.MESE per calcolare le date di scadenza che cadono nello stesso giorno del mese della data di emissione.',
        abstract: 'Restituisce il numero seriale che rappresenta la data che cade il numero di mesi indicato prima o dopo la data specificata in data_iniziale. Utilizzare la funzione DATA.MESE per calcolare le date di scadenza che cadono nello stesso giorno del mese della data di emissione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/edate-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obbligatorio. Data che rappresenta la data di inizio. Le date devono essere immesse usando la funzione DATA o devono essere il risultato di altre formule o funzioni. Usare, ad esempio, DATA(2008;5;23) per il 23 maggio 2008. Potrebbero verificarsi problemi se le date vengono immesse come testo .' },
            months: { name: 'months', detail: 'Obbligatorio. Numero di mesi precedenti o successivi a data_iniziale. Un valore positivo per mesi indica una data futura, mentre un valore negativo corrisponde a una data anteriore.' },
        },
    },
    EOMONTH: {
        description: 'Restituisce il numero seriale dell\'ultimo giorno del mese, vale a dire il numero indicato di mesi precedenti o successivi a data_iniziale. Utilizzare la funzione FINE.MESE per calcolare le scadenze che cadono nell\'ultimo giorno del mese.',
        abstract: 'Restituisce il numero seriale dell\'ultimo giorno del mese, vale a dire il numero indicato di mesi precedenti o successivi a data_iniziale. Utilizzare la funzione FINE.MESE per calcolare le scadenze che cadono nell\'ultimo giorno del mese.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/eomonth-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obbligatorio. Data che rappresenta la data di inizio. Le date devono essere immesse usando la funzione DATA o devono essere il risultato di altre formule o funzioni. Usare, ad esempio, DATA(2008;5;23) per il 23 maggio 2008. Potrebbero verificarsi problemi se le date vengono immesse come testo .' },
            months: { name: 'months', detail: 'Obbligatorio. Numero di mesi precedenti o successivi a data_iniziale. Un valore positivo per mesi indica una data futura, mentre un valore negativo corrisponde a una data anteriore. Nota Se mesi non è un numero intero, la parte decimale verrà troncata.' },
        },
    },
    EPOCHTODATE: {
        description: 'Converte un timestamp Unix epoch espresso in secondi, millisecondi o microsecondi in una data e ora nel Tempo Coordinato Universale (UTC).',
        abstract: 'Converte un timestamp Unix epoch espresso in secondi, millisecondi o microsecondi in una data e ora nel Tempo Coordinato Universale (UTC).',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/13193461?hl=it',
            },
        ],
        functionParameter: {
            timestamp: { name: 'timestamp', detail: 'Timestamp Unix epoch in secondi, millisecondi o microsecondi.' },
            unit: { name: 'unit', detail: '[FACOLTATIVO — 1 per impostazione predefinita]: l\'unità di tempo in cui è espresso il timestamp.' },
        },
    },
    HOUR: {
        description: 'Restituisce l\'ora di un valore di ora. L\'ora viene espressa come numero intero, compreso tra 0 (12:00) e 23 (23:00).',
        abstract: 'Restituisce l\'ora di un valore di ora. L\'ora viene espressa come numero intero, compreso tra 0 (12:00) e 23 (23:00).',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/hour-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obbligatorio. Orario che contiene l\'ora che si desidera trovare. Gli orari possono essere immessi come stringhe di testo racchiuse tra virgolette, ad esempio "18.45", come numeri decimali, ad esempio 0,78125 che rappresenta 18.45, oppure come risultati di altre formule o funzioni, ad esempio ORARIO.VALORE("18.45").' },
        },
    },
    ISOWEEKNUM: {
        description: 'Restituisce il numero della settimana ISO dell\'anno per una data specificata.',
        abstract: 'Restituisce il numero della settimana ISO dell\'anno per una data specificata.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/isoweeknum-function',
            },
        ],
        functionParameter: {
            date: { name: 'date', detail: 'Obbligatorio. L\'argomento data è il codice di data-ora usato da Excel per il calcolo della data e dell\'ora.' },
        },
    },
    MINUTE: {
        description: 'Restituisce i minuti di un valore ora. I minuti vengono espressi con un numero intero compreso tra 0 e 59.',
        abstract: 'Restituisce i minuti di un valore ora. I minuti vengono espressi con un numero intero compreso tra 0 e 59.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/minute-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obbligatorio. Orario che contiene il minuto che si desidera trovare. Gli orari possono essere immessi come stringhe di testo racchiuse tra virgolette, ad esempio "18.45", come numeri decimali, ad esempio 0,78125 che rappresenta 18.45, oppure come risultati di altre formule o funzioni, ad esempio ORARIO.VALORE("18.45").' },
        },
    },
    MONTH: {
        description: 'Restituisce il mese di una data rappresentata da un numero seriale. Il mese viene espresso con un numero intero compreso tra 1, corrispondente a gennaio, e 12, corrispondente a dicembre.',
        abstract: 'Restituisce il mese di una data rappresentata da un numero seriale. Il mese viene espresso con un numero intero compreso tra 1, corrispondente a gennaio, e 12, corrispondente a dicembre.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/month-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obbligatorio. Data del mese da trovare. Le date devono essere immesse usando la funzione DATA o devono essere il risultato di altre formule o funzioni. Usare, ad esempio, DATA(2008;5;23) per il 23 maggio 2008. Potrebbero verificarsi problemi se le date vengono immesse come testo .' },
        },
    },
    NETWORKDAYS: {
        description: 'Restituisce il numero di tutti i giorni lavorativi compresi tra data_iniziale e data_finale. I giorni lavorativi non comprendono i fine settimana e le festività. Utilizzare GIORNI.LAVORATIVI.TOT per calcolare le indennità dei dipendenti che vengono maturate in base al numero di giorni lavorativi compresi in un determinato periodo di tempo.',
        abstract: 'Restituisce il numero di tutti i giorni lavorativi compresi tra data_iniziale e data_finale. I giorni lavorativi non comprendono i fine settimana e le festività. Utilizzare GIORNI.LAVORATIVI.TOT per calcolare le indennità dei dipendenti che vengono maturate in base al numero di giorni lavorativi compresi in un determinato periodo di tempo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/networkdays-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obbligatorio. Data che rappresenta la data di inizio.' },
            endDate: { name: 'end_date', detail: 'Obbligatorio. Data che rappresenta la data finale.' },
            holidays: { name: 'holidays', detail: 'Opzionale. Intervallo opzionale di una o più date da escludere dal calendario lavorativo. L\'elenco può essere composto da un intervallo di celle contenenti le date o da una costante di matrice dei numeri seriali che rappresentano le date.' },
        },
    },
    NETWORKDAYS_INTL: {
        description: 'Restituisce il numero di tutti i giorni lavorativi compresi fra due date utilizzando parametri per indicare quali e quanti giorni sono giorni festivi. I giorni festivi e i giorni indicati come festività non sono considerati giorni lavorativi.',
        abstract: 'Restituisce il numero di tutti i giorni lavorativi compresi fra due date utilizzando parametri per indicare quali e quanti giorni sono giorni festivi. I giorni festivi e i giorni indicati come festività non sono considerati giorni lavorativi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/networkdays-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Data che rappresenta la data di inizio.' },
            endDate: { name: 'end_date', detail: 'Data che rappresenta la data di fine.' },
            weekend: { name: 'weekend', detail: 'Numero o stringa che specifica quando ricorrono i fine settimana.' },
            holidays: { name: 'holidays', detail: 'Intervallo facoltativo di una o più date da escludere dal calendario lavorativo, ad esempio festività nazionali, regionali o mobili.' },
        },
    },
    NOW: {
        description: 'Restituisce il numero seriale della data e dell\'ora correnti. Se prima dell\'immissione della funzione il formato di cella era Generale , verrà modificato in modo che corrisponda al formato di data e ora delle impostazioni internazionali. È possibile cambiare il formato di data e ora della cella utilizzando i comandi del gruppo Numeri nella scheda Home della barra multifunzione.',
        abstract: 'Restituisce il numero seriale della data e dell\'ora correnti. Se prima dell\'immissione della funzione il formato di cella era Generale , verrà modificato in modo che corrisponda al formato di data e ora delle impostazioni internazionali. È possibile cambiare il formato di data e ora della cella utilizzando i comandi del gruppo Numeri nella scheda Home della barra multifunzione.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/now-function',
            },
        ],
        functionParameter: {
        },
    },
    SECOND: {
        description: 'Restituisce i secondi di un valore ora. I secondi vengono espressi con un numero intero compreso tra 0 e 59.',
        abstract: 'Restituisce i secondi di un valore ora. I secondi vengono espressi con un numero intero compreso tra 0 e 59.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/second-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obbligatorio. Orario che contiene i secondi che si desidera trovare. Gli orari possono essere immessi come stringhe di testo racchiuse tra virgolette, ad esempio "18.45", come numeri decimali, ad esempio 0,78125 che rappresenta 18.45, oppure come risultati di altre formule o funzioni, ad esempio ORARIO.VALORE("18.45").' },
        },
    },
    TIME: {
        description: 'Restituisce il numero decimale di un\'ora specifica. Se prima dell\'immissione della funzione il formato di cella era Generale , il risultato viene formattato come una data.',
        abstract: 'Restituisce il numero decimale di un\'ora specifica. Se prima dell\'immissione della funzione il formato di cella era Generale , il risultato viene formattato come una data.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/time-function',
            },
        ],
        functionParameter: {
            hour: { name: 'hour', detail: 'Obbligatorio. Numero compreso tra 0 e 32767 che rappresenta l\'ora. Qualsiasi valore maggiore di 23 verrà diviso per 24 e il resto verrà considerato come il valore dell\'ora. Ad esempio, ORARIO(27;0;0) = ORARIO(3;0;0) = 0,125 o 3.00.' },
            minute: { name: 'minute', detail: 'Obbligatorio. Numero compreso tra 0 e 32767 che rappresenta i minuti. Qualsiasi valore maggiore di 59 verrà convertito in ore e minuti. Ad esempio, ORARIO(0;750;0) = ORARIO(12;30;0) = 0,520833 o 12.30.' },
            second: { name: 'second', detail: 'Obbligatorio. Numero compreso tra 0 e 32767 che rappresenta i secondi. Qualsiasi valore maggiore di 59 verrà convertito in ore, minuti e secondi. Ad esempio, ORARIO(0;0;2000) = ORARIO(0;33;22) = 0,023148 o 12.33.20.' },
        },
    },
    TIMEVALUE: {
        description: 'Restituisce il numero decimale dell\'ora rappresentata da una stringa di testo. Il numero decimale è un valore compreso tra 0 e 0,99988426 indicante un\'ora tra le 0.00.00 e le 23.59.59.',
        abstract: 'Restituisce il numero decimale dell\'ora rappresentata da una stringa di testo. Il numero decimale è un valore compreso tra 0 e 0,99988426 indicante un\'ora tra le 0.00.00 e le 23.59.59.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/timevalue-function',
            },
        ],
        functionParameter: {
            timeText: { name: 'time_text', detail: 'Obbligatorio. Stringa di testo che rappresenta un\'ora in uno dei formati ora disponibili in Microsoft Excel, ad esempio la stringa di testo "18.45" racchiusa tra virgolette che rappresenta l\'ora.' },
        },
    },
    TO_DATE: {
        description: 'Converte un numero specificato in una data.',
        abstract: 'Converte un numero specificato in una data.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3094239?hl=it',
            },
        ],
        functionParameter: {
            value: { name: 'value', detail: 'Argomento o riferimento a una cella da convertire in data. Se è numerico, viene interpretato come numero di giorni dal 30 dicembre 1899; i valori negativi sono giorni precedenti e le frazioni indicano l\'ora dopo la mezzanotte. I valori non numerici vengono restituiti senza modifiche.' },
        },
    },
    TODAY: {
        description: 'La funzione OGGI restituisce il numero seriale della data corrente. Il numero seriale è il codice data-ora usato da Excel per il calcolo della data e dell\'ora. Se prima dell\'immissione della funzione il formato di cella era Generale , il formato passerà a Data . Se si desidera visualizzare il numero seriale, sarà necessario impostare il formato di cella su Generale o Numero .',
        abstract: 'La funzione OGGI restituisce il numero seriale della data corrente. Il numero seriale è il codice data-ora usato da Excel per il calcolo della data e dell\'ora. Se prima dell\'immissione della funzione il formato di cella era Generale , il formato passerà a Data . Se si desidera visualizzare il numero seriale, sarà necessario impostare il formato di cella su Generale o Numero .',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/today-function',
            },
        ],
        functionParameter: {
        },
    },
    WEEKDAY: {
        description: 'Restituisce il giorno della settimana corrispondente a una data. In base all\'impostazione predefinita, i giorni vengono espressi con un numero intero compreso tra 1, domenica, e 7, sabato.',
        abstract: 'Restituisce il giorno della settimana corrispondente a una data. In base all\'impostazione predefinita, i giorni vengono espressi con un numero intero compreso tra 1, domenica, e 7, sabato.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/weekday-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obbligatorio. Numero sequenziale che rappresenta la data del giorno che si desidera trovare. Le date devono essere immesse utilizzando la funzione DATA o devono essere il risultato di altre formule o funzioni. Usare ad esempio DATA(2008;5;23) per il 23 maggio 2008. Possono verificarsi dei problemi se le date vengono immesse come testo.' },
            returnType: { name: 'return_type', detail: 'Opzionale. Numero che determina il tipo di valore restituito.' },
        },
    },
    WEEKNUM: {
        description: 'Restituisce il numero della settimana per una data specifica. La settimana che contiene la data 1 gennaio, ad esempio, è la prima dell\'anno e il numero della settimana è 1.',
        abstract: 'Restituisce il numero della settimana per una data specifica. La settimana che contiene la data 1 gennaio, ad esempio, è la prima dell\'anno e il numero della settimana è 1.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/weeknum-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obbligatorio. Data della settimana. Le date devono essere immesse utilizzando la funzione DATA o devono essere il risultato di altre formule o funzioni. Usare ad esempio DATA(2008;5;23) per il 23 maggio 2008. Possono verificarsi dei problemi se le date vengono immesse come testo.' },
            returnType: { name: 'return_type', detail: 'Opzionale. Numero che determina il giorno di inizio della settimana. Il valore predefinito è 1.' },
        },
    },
    WORKDAY: {
        description: 'Restituisce un numero che rappresenta una data che precede o segue un\'altra data, ovvero la data iniziale, di un numero di giorni specificato. I giorni lavorativi non includono i fine settimana o le festività. Utilizzare GIORNO.LAVORATIVO per escludere i fine settimana e le festività quando si calcolano le date di scadenza delle fatture, le date di consegna previste o il numero di giornate lavorative effettuate.',
        abstract: 'Restituisce un numero che rappresenta una data che precede o segue un\'altra data, ovvero la data iniziale, di un numero di giorni specificato. I giorni lavorativi non includono i fine settimana o le festività. Utilizzare GIORNO.LAVORATIVO per escludere i fine settimana e le festività quando si calcolano le date di scadenza delle fatture, le date di consegna previste o il numero di giornate lavorative effettuate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/workday-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obbligatorio. Data che rappresenta la data di inizio.' },
            days: { name: 'days', detail: 'Obbligatorio. Numero dei giorni che precedono o seguono data_iniziale, esclusi i fine settimana e le festività. Un valore positivo per giorni indica una data futura, mentre un valore negativo corrisponde a una data anteriore.' },
            holidays: { name: 'holidays', detail: 'Opzionale. Elenco di una o più date da escludere dal calendario lavorativo. L\'elenco può essere composto da un intervallo di celle contenenti le date o da una costante di matrice dei numeri seriali che rappresentano le date.' },
        },
    },
    WORKDAY_INTL: {
        description: 'Questa funzione restituisce il numero seriale della data precedente o successiva a un numero specificato di giorni lavorativi con parametri personalizzati per i fine settimana. I parametri facoltativi festivi possono indicare quali e quanti giorni sono giorni festivi. Si noti che i giorni festivi e i giorni specificati come festività non sono considerati giorni lavorativi.',
        abstract: 'Questa funzione restituisce il numero seriale della data precedente o successiva a un numero specificato di giorni lavorativi con parametri personalizzati per i fine settimana. I parametri facoltativi festivi possono indicare quali e quanti giorni sono giorni festivi. Si noti che i giorni festivi e i giorni specificati come festività non sono considerati giorni lavorativi.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/workday-intl-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Obbligatorio. Data di inizio, troncata a un numero intero.' },
            days: { name: 'days', detail: 'Obbligatorio. Numero di giorni lavorativi precedenti o successivi alla data_iniziale. Un valore positivo indica una data futura; un valore negativo indica una data passata; un valore zero indica la start_date già specificata . L\'offset dei giorni viene troncato a un numero intero.' },
            weekend: { name: 'weekend', detail: 'Opzionale. Se usato, indica i giorni della settimana che sono giorni festivi e non sono considerati giorni lavorativi. L\'argomento fine settimana è un numero di festivi o una stringa che specifica quando si verificano i fine settimana. I valori numerici dei fine settimana indicano i giorni festivi come illustrato di seguito.' },
            holidays: { name: 'holidays', detail: 'Questo argomento è facoltativo alla fine della sintassi. Specifica un set facoltativo di una o più date da escludere dal calendario lavorativo. Le festività sono un intervallo di celle contenenti le date o una costante di matrice dei valori seriali che rappresentano tali date. L\'ordinamento delle date o i valori seriali delle vacanze possono essere arbitrari.' },
        },
    },
    YEAR: {
        description: 'Restituisce l\'anno corrispondente a una data. Gli anni vengono restituiti come numeri interi compresi tra 1900 e 9999.',
        abstract: 'Restituisce l\'anno corrispondente a una data. Gli anni vengono restituiti come numeri interi compresi tra 1900 e 9999.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/year-function',
            },
        ],
        functionParameter: {
            serialNumber: { name: 'serial_number', detail: 'Obbligatorio. Data dell\'anno da trovare. Le date devono essere immesse usando la funzione DATA o devono essere il risultato di altre formule o funzioni. Ad esempio, usare DATA(2025,5,23) per il 23 maggio 2025. È possibile che si verifichino problemi se le date vengono immesse come testo.' },
        },
    },
    YEARFRAC: {
        description: 'FRAZIONE.ANNO calcola la frazione dell\'anno corrispondente al numero di giorni complessivi compresi tra due date ( data_iniziale e data_finale ). Ad esempio, utilizzare la funzione del foglio di lavoro FRAZIONE.ANNO per identificare la proporzione dei benefici o delle obbligazioni di un intero anno da assegnare a un termine specifico.',
        abstract: 'FRAZIONE.ANNO calcola la frazione dell\'anno corrispondente al numero di giorni complessivi compresi tra due date ( data_iniziale e data_finale ). Ad esempio, utilizzare la funzione del foglio di lavoro FRAZIONE.ANNO per identificare la proporzione dei benefici o delle obbligazioni di un intero anno da assegnare a un termine specifico.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/yearfrac-function',
            },
        ],
        functionParameter: {
            startDate: { name: 'start_date', detail: 'Data che rappresenta la data di inizio.' },
            endDate: { name: 'end_date', detail: 'Data che rappresenta la data di fine.' },
            basis: { name: 'basis', detail: 'Tipo di base per il conteggio dei giorni da usare.' },
        },
    },
};

export default locale;
