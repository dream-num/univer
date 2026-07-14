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
    ADDRESS: {
        description: 'È possibile usare la funzione INDIRIZZO per ottenere l\'indirizzo di una cella di un foglio di lavoro, in base a numeri di riga e di colonna specificati. Ad esempio, INDIRIZZO(2;3) restituisce $C$2 . Come altro esempio, INDIRIZZO(77.300) restituisce $KN$77 . È possibile usare altre funzioni, ad esempio RIF.RIGA e RIF.COLONNA , per fornire gli argomenti per i numeri di riga e di colonna per la funzione INDIRIZZO .',
        abstract: 'È possibile usare la funzione INDIRIZZO per ottenere l\'indirizzo di una cella di un foglio di lavoro, in base a numeri di riga e di colonna specificati. Ad esempio, INDIRIZZO(2;3) restituisce $C$2 . Come altro esempio, INDIRIZZO(77.300) restituisce $KN$77 . È possibile usare altre funzioni, ad esempio RIF.RIGA e RIF.COLONNA , per fornire gli argomenti per i numeri di riga e di colonna per la funzione INDIRIZZO .',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/address-function',
            },
        ],
        functionParameter: {
            row_num: { name: 'row number', detail: 'Obbligatorio. Valore numerico che specifica il numero di riga da usare nel riferimento di cella.' },
            column_num: { name: 'column number', detail: 'Obbligatorio. Valore numerico che specifica il numero di colonna da usare nel riferimento di cella.' },
            abs_num: { name: 'type of reference', detail: 'Opzionale. Valore numerico che specifica il tipo di riferimento da restituire.' },
            a1: { name: 'style of reference', detail: 'Opzionale. Valore logico che specifica lo stile di riferimento A1 o R1C1. Nello stile A1 le colonne sono etichettate alfabeticamente e le righe in ordine numerico. Nello stile di riferimento R1C1 sia le colonne che le righe vengono etichettate numericamente. Se l\'argomento A1 è VERO o è omesso, la funzione INDIRIZZO restituisce un riferimento in stile A1; se è FALSO, la funzione INDIRIZZO restituisce un riferimento di stile R1C1. Nota Per cambiare lo stile di riferimento usato da Excel, fare clic sulla scheda File , fare clic su Opzioni e quindi su Formule . In Utilizzo delle formule selezionare o deselezionare la casella di controllo Stile di riferimento R1C1 .' },
            sheet_text: { name: 'worksheet name', detail: 'Opzionale. Valore di testo che specifica il nome del foglio di lavoro da usare come riferimento esterno. Ad esempio, la formula =INDIRIZZO(1;1,,,"Foglio2") restituisce Foglio2!$A$1 . Se l\'argomento sheet_text viene omesso, non viene usato alcun nome di foglio e l\'indirizzo restituito dalla funzione fa riferimento a una cella del foglio corrente.' },
        },
    },
    AREAS: {
        description: 'Restituisce il numero di aree in un riferimento. Un\'area è un intervallo di celle contigue o una singola cella.',
        abstract: 'Restituisce il numero di aree in un riferimento. Un\'area è un intervallo di celle contigue o una singola cella.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/areas-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Obbligatorio. Riferimento a una cella o a un intervallo di celle e può riferirsi a più aree. Se si desidera specificare più riferimenti in un unico argomento, sarà necessario includere coppie supplementari di parentesi in modo che il punto e virgola non venga interpretato da Microsoft Excel come un separatore di campo. Vedere l\'esempio seguente.' },
        },
    },
    CHOOSE: {
        description: 'Usa indice per restituire un valore dall\'elenco degli argomenti valore. Usare la funzione SCEGLI per selezionare da uno a 254 valori in base al numero di indice. Ad esempio, se i valori da valore1 a valore7 sono i giorni della settimana, SCEGLI restituirà uno dei giorni quando verrà usato come indice un numero da 1 a 7.',
        abstract: 'Usa indice per restituire un valore dall\'elenco degli argomenti valore. Usare la funzione SCEGLI per selezionare da uno a 254 valori in base al numero di indice. Ad esempio, se i valori da valore1 a valore7 sono i giorni della settimana, SCEGLI restituirà uno dei giorni quando verrà usato come indice un numero da 1 a 7.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/choose-function',
            },
        ],
        functionParameter: {
            indexNum: { name: 'index_num', detail: 'Specifica quale argomento valore viene selezionato. Deve essere un numero da 1 a 254, una formula o un riferimento a una cella contenente tale numero.' },
            value1: { name: 'value1', detail: 'Valore o azione selezionata in base a index_num. Può essere un numero, riferimento di cella, nome definito, formula, funzione o testo.' },
            value2: { name: 'value2', detail: 'Da 1 a 254 argomenti valore.' },
        },
    },
    CHOOSECOLS: {
        description: 'Restituisce le colonne specificate da una matrice.',
        abstract: 'Restituisce le colonne specificate da una matrice.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/choosecols-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Matrice contenente le colonne da restituire nella nuova matrice. Obbligatorio.' },
            colNum1: { name: 'col_num1', detail: 'Prima colonna da restituire. Obbligatorio.' },
            colNum2: { name: 'col_num2', detail: 'Colonne aggiuntive da restituire. Facoltativo.' },
        },
    },
    CHOOSEROWS: {
        description: 'Restituisce le righe specificate da una matrice.',
        abstract: 'Restituisce le righe specificate da una matrice.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/chooserows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Matrice contenente le colonne da restituire nella nuova matrice. Obbligatorio.' },
            rowNum1: { name: 'row_num1', detail: 'Il numero della prima riga da restituire. Obbligatorio.' },
            rowNum2: { name: 'row_num2', detail: 'Ulteriori numeri di riga da restituire. Facoltativo.' },
        },
    },
    COLUMN: {
        description: 'La funzione RIF.COLONNA restituisce il numero di colonna del riferimento di cella specificato. Ad esempio, la formula =COLONNA(D10) restituisce 4, perché la colonna D è la quarta colonna.',
        abstract: 'La funzione RIF.COLONNA restituisce il numero di colonna del riferimento di cella specificato. Ad esempio, la formula =COLONNA(D10) restituisce 4, perché la colonna D è la quarta colonna.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/column-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Cella o intervallo di celle di cui si desidera restituire il numero di colonna.' },
        },
    },
    COLUMNS: {
        description: 'Restituisce il numero di colonne in una matrice o in un riferimento.',
        abstract: 'Restituisce il numero di colonne in una matrice o in un riferimento.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/columns-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Una formula matrice o matrice oppure un riferimento a un intervallo di celle di cui si desidera calcolare il numero di colonne.' },
        },
    },
    DROP: {
        description: 'Esclude un numero specificato di righe o colonne contigue dall\'inizio o dalla fine di una matrice. Questa funzione può risultare utile per rimuovere intestazioni e piè di pagina in un report di Excel per restituire solo i dati.',
        abstract: 'Esclude un numero specificato di righe o colonne contigue dall\'inizio o dalla fine di una matrice. Questa funzione può risultare utile per rimuovere intestazioni e piè di pagina in un report di Excel per restituire solo i dati.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/drop-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Matrice da cui rilasciare righe o colonne.' },
            rows: { name: 'rows', detail: 'Numero di righe da eliminare. Un valore negativo viene eliminato dalla fine della matrice.' },
            columns: { name: 'columns', detail: 'Numero di colonne da escludere. Un valore negativo viene eliminato dalla fine della matrice.' },
        },
    },
    EXPAND: {
        description: 'Espande o riempie una matrice in base alle dimensioni di riga e colonna specificate.',
        abstract: 'Espande o riempie una matrice in base alle dimensioni di riga e colonna specificate.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/expand-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Matrice da espandere.' },
            rows: { name: 'rows', detail: 'Numero di righe nella matrice espansa. Se mancano, le righe non verranno espanse.' },
            columns: { name: 'columns', detail: 'Numero di colonne nella matrice espansa. Se mancano, le colonne non verranno espanse.' },
            padWith: { name: 'pad_with', detail: 'Valore con cui inserire il tastierino. L\'impostazione predefinita è #N/A.' },
        },
    },
    FILTER: {
        description: 'Nell\'esempio seguente è stata usata la formula =FILTRO(A5:D20,C5:C20=H2,"") per restituire tutti i record per “Mela”, secondo quanto selezionato nella cella H2, e, se non ci sono "mele", restituire una stringa vuota ("").',
        abstract: 'Nell\'esempio seguente è stata usata la formula =FILTRO(A5:D20,C5:C20=H2,"") per restituire tutti i record per “Mela”, secondo quanto selezionato nella cella H2, e, se non ci sono "mele", restituire una stringa vuota ("").',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/filter-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'La matrice o l’intervallo da filtrare' },
            include: { name: 'include', detail: 'Una matrice booleana la cui altezza o larghezza equivale alla matrice' },
            ifEmpty: { name: 'if_empty', detail: 'Il valore da restituire se tutti i valori nella matrice inclusa sono vuoti (il filtro non restituisce nulla)' },
        },
    },
    FORMULATEXT: {
        description: 'Restituisce una formula sotto forma di stringa.',
        abstract: 'Restituisce una formula sotto forma di stringa.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Obbligatorio. Riferimento a una cella o un intervallo di celle.' },
        },
    },
    GETPIVOTDATA: {
        description: 'Restituisce i dati visibili archiviati in una tabella pivot.',
        abstract: 'Restituisce i dati visibili archiviati in una tabella pivot.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'dataField', detail: 'Nome del campo della tabella pivot contenente i dati che si desidera recuperare. Deve essere racchiuso tra virgolette. Esempio: =INFO.DATI.TAB.PIVOT("Vendite", A3). "Vendite" è il campo Valori che si desidera recuperare. Poiché non viene specificato nessun altro campo, INFO.DATI.TAB.PIVOT restituisce l\'importo totale delle vendite.' },
            pivotTable: { name: 'pivotTable', detail: 'Riferimento a una cella, a un intervallo di celle o a un intervallo di celle denominato all\'interno della tabella pivot. Questa informazione viene utilizzata per determinare quale tabella pivot contiene i dati che si desidera recuperare. Esempio: =INFO.DATI.TAB.PIVOT("Vendite", A3). Qui A3 è un riferimento all\'interno della tabella pivot e indica alla formula quale tabella pivot usare.' },
            field1: { name: 'field1', detail: 'Da 1 a 126 coppie di nomi di campi e nomi di elementi che descrivono i dati che si desidera recuperare. Le coppie possono trovarsi in qualsiasi ordine. I nomi di campi e di elementi diversi da date e numeri devono essere racchiusi tra virgolette. Esempio: =INFO.DATI.TAB.PIVOT("Vendite",A3, "Mese", "Mar"). Qui "Mese" è il campo e "Mar" è l\'elemento. Per specificare più elementi per un campo, racchiuderli tra parentesi graffe (ad esempio: {"Mar", "Apr"}). Per le tabelle pivot OLAP , gli elementi possono contenere il nome dell\'origine della dimensione e il nome dell\'origine dell\'elemento. Una coppia campo-elemento per una tabella pivot OLAP ha un aspetto simile al seguente: "[Prodotto]","[Prodotto].[Tutti i prodotti].[Alimenti].[Prodotti da forno]"' },
            item1: { name: 'item1', detail: 'Da 1 a 126 coppie di nomi di campi e nomi di elementi che descrivono i dati che si desidera recuperare. Le coppie possono trovarsi in qualsiasi ordine. I nomi di campi e di elementi diversi da date e numeri devono essere racchiusi tra virgolette. Esempio: =INFO.DATI.TAB.PIVOT("Vendite",A3, "Mese", "Mar"). Qui "Mese" è il campo e "Mar" è l\'elemento. Per specificare più elementi per un campo, racchiuderli tra parentesi graffe (ad esempio: {"Mar", "Apr"}). Per le tabelle pivot OLAP , gli elementi possono contenere il nome dell\'origine della dimensione e il nome dell\'origine dell\'elemento. Una coppia campo-elemento per una tabella pivot OLAP ha un aspetto simile al seguente: "[Prodotto]","[Prodotto].[Tutti i prodotti].[Alimenti].[Prodotti da forno]"' },
        },
    },
    HLOOKUP: {
        description: 'Cerca un valore nella riga superiore di una tabella o una matrice di valori e restituisce un valore nella stessa colonna dalla riga indicata nella tabella o nella matrice. Usare la funzione CERCA.ORIZZ quando i valori di confronto sono collocati in una riga superiore di una tabella di dati e si desidera estendere la ricerca verso il basso di un numero specifico di righe. Usare la funzione CERCA.VERT quando i valori di confronto sono collocati in una colonna a sinistra dei dati che si desidera cercare.',
        abstract: 'Cerca un valore nella riga superiore di una tabella o una matrice di valori e restituisce un valore nella stessa colonna dalla riga indicata nella tabella o nella matrice. Usare la funzione CERCA.ORIZZ quando i valori di confronto sono collocati in una riga superiore di una tabella di dati e si desidera estendere la ricerca verso il basso di un numero specifico di righe. Usare la funzione CERCA.VERT quando i valori di confronto sono collocati in una colonna a sinistra dei dati che si desidera cercare.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Obbligatorio. Valore da ricercare nella prima riga della tabella. Valore può essere un valore, un riferimento o una stringa di testo.' },
            tableArray: { name: 'table_array', detail: 'Obbligatorio. Tabella di informazioni nella quale vengono cercati i dati. Usare un riferimento a un intervallo o un nome di intervallo. I valori nella prima riga di tabella_matrice possono essere testo, numeri o valori logici. Se range_lookup è VERO, i valori nella prima riga di table_array devono essere disposti in ordine crescente: ...-2, -1, 0, 1, 2,... , A-Z, FALSO, VERO; in caso contrario, CERCA.ORIZZ potrebbe non fornire il valore corretto. Se range_lookup è FALSO, non è necessario ordinare table_array. La funzione non rileva le maiuscole. Disporre i valori in ordine crescente, da sinistra a destra. Per altre informazioni, vedere Ordinare i dati in un intervallo o in una tabella .' },
            rowIndexNum: { name: 'row_index_num', detail: 'Obbligatorio. Numero di riga in table_array da cui verrà restituito il valore corrispondente. Un row_index_num di 1 restituisce il valore della prima riga in table_array, un row_index_num di 2 restituisce il valore della seconda riga in table_array e così via. Se row_index_num è minore di 1, CERCA.ORIZZ restituirà il #VALUE! valore di errore; se row_index_num è maggiore del numero di righe in table_array, CERCA.ORIZZ restituirà il #REF! .' },
            rangeLookup: { name: 'range_lookup', detail: 'Opzionale. Valore logico che specifica se si vuole che CERCA.ORIZZ trovi una corrispondenza esatta o approssimativa. Se VERO o è omesso, verrà restituita una corrispondenza approssimativa. In altre parole, se non viene trovata una corrispondenza esatta, viene restituito il valore più grande successivo minore di lookup_value. Se è FALSO, CERCA.ORIZZ troverà una corrispondenza esatta. Se non ne viene trovato uno, viene restituito il valore di errore #N/D.' },
        },
    },
    HSTACK: {
        description: 'Accoda le matrici orizzontalmente e in sequenza per restituire una matrice più grande.',
        abstract: 'Accoda le matrici orizzontalmente e in sequenza per restituire una matrice più grande.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Matrici da accodare.' },
            array2: { name: 'array', detail: 'Matrici da accodare.' },
        },
    },
    HYPERLINK: {
        description: 'Crea un collegamento ipertestuale all\'interno di una cella.',
        abstract: 'Crea un collegamento ipertestuale all\'interno di una cella.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.google.com/docs/answer/3093313?hl=it',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'URL completo della destinazione del collegamento tra virgolette o riferimento a una cella che lo contiene. Sono consentiti solo protocolli specifici; se non specificato, viene usato http://.' },
            linkLabel: { name: 'link_label', detail: '[FACOLTATIVO — url per impostazione predefinita] Testo da visualizzare nella cella come collegamento, tra virgolette o riferimento a una cella che lo contiene.' },
        },
    },
    IMAGE: {
        description: 'La funzione IMAGE inserisce immagini nelle celle da una posizione di origine insieme a un testo alternativo. È quindi possibile spostare e ridimensionare le celle, ordinare e filtrare e usare le immagini all\'interno di una tabella di Excel. Usare questa funzione per migliorare visivamente elenchi di dati come inventari, giochi, dipendenti e concetti matematici.',
        abstract: 'La funzione IMAGE inserisce immagini nelle celle da una posizione di origine insieme a un testo alternativo. È quindi possibile spostare e ridimensionare le celle, ordinare e filtrare e usare le immagini all\'interno di una tabella di Excel. Usare questa funzione per migliorare visivamente elenchi di dati come inventari, giochi, dipendenti e concetti matematici.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'source', detail: 'Percorso URL, con protocollo "https", del file di immagine.' },
            altText: { name: 'alt_text', detail: 'Testo alternativo che descrive l\'immagine per l\'accessibilità.' },
            sizing: { name: 'sizing', detail: 'Specifica le dimensioni dell\'immagine.' },
            height: { name: 'height', detail: 'Altezza personalizzata dell\'immagine in pixel.' },
            width: { name: 'width', detail: 'Larghezza personalizzata dell\'immagine in pixel.' },
        },
    },
    INDEX: {
        description: 'Restituisce il valore di un elemento in una tabella o una freccia, selezionato mediante gli indici dei numeri di riga e colonna.',
        abstract: 'Restituisce il valore di un elemento in una tabella o una freccia, selezionato mediante gli indici dei numeri di riga e colonna.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/index-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Riferimento a uno o più intervalli di celle.' },
            rowNum: { name: 'row_num', detail: 'Numero della riga in riferimento da cui restituire un riferimento.' },
            columnNum: { name: 'column_num', detail: 'Numero della colonna in riferimento da cui restituire un riferimento.' },
            areaNum: { name: 'area_num', detail: 'Seleziona un intervallo in riferimento da cui restituire l\'intersezione di row_num e column_num.' },
        },
    },
    INDIRECT: {
        description: 'Restituisce il riferimento specificato da una stringa di testo. I riferimenti vengono calcolati immediatamente in modo da visualizzarne il contenuto. Usare la funzione INDIRETTO quando si desidera cambiare il riferimento a una cella all\'interno di una formula senza modificare la formula stessa.',
        abstract: 'Restituisce il riferimento specificato da una stringa di testo. I riferimenti vengono calcolati immediatamente in modo da visualizzarne il contenuto. Usare la funzione INDIRETTO quando si desidera cambiare il riferimento a una cella all\'interno di una formula senza modificare la formula stessa.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/indirect-function',
            },
        ],
        functionParameter: {
            refText: { name: 'ref_text', detail: 'Obbligatorio. Un riferimento a una cella che contiene un riferimento di tipo A1, un riferimento di tipo R1C1, un nome definito come riferimento oppure un riferimento a una cella come stringa di testo. Se rif non è un riferimento di cella valido, INDIRETTO restituirà il valore di errore #RIF! . Se rif si riferisce a un\'altra cartella di lavoro (un riferimento esterno), l\'altra cartella di lavoro deve essere aperta. Se la cartella di lavoro non è aperta, INDIRETTO restituirà il valore di errore #RIF! . Nota I riferimenti esterni non sono supportati in Excel Web App. Se rif si riferisce a un intervallo di celle esterno al limite di riga pari a 1.048.576 o al limite di colonna pari a 16.384 (XFD), INDIRETTO restituirà il valore di errore #RIF! .' },
            a1: { name: 'a1', detail: 'Opzionale. Valore logico che specifica il tipo di riferimento contenuto nella cella rif. Se a1 è VERO o è omesso, rif verrà interpretato come un riferimento di tipo A1. Se a1 è FALSO, rif verrà interpretato come un riferimento di tipo R1C1.' },
        },
    },
    LOOKUP: {
        description: 'La forma vettore di CERCA ricerca un valore in un intervallo di una sola riga o di una sola colonna, noto come vettore, e restituisce un valore nella stessa posizione in un secondo intervallo di una riga o di una colonna.',
        abstract: 'La forma vettore di CERCA ricerca un valore in un intervallo di una sola riga o di una sola colonna, noto come vettore, e restituisce un valore nella stessa posizione in un secondo intervallo di una riga o di una colonna.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/lookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Valore che CERCA cerca nel primo vettore. Può essere un numero, testo, valore logico, nome o riferimento a un valore.' },
            lookupVectorOrArray: { name: 'lookup_vectorOrArray', detail: 'Intervallo che contiene una sola riga o una sola colonna.' },
            resultVector: { name: 'result_vector', detail: 'Intervallo che contiene una sola riga o colonna e deve avere le stesse dimensioni di lookup_vector.' },
        },
    },
    MATCH: {
        description: 'La funzione CONFRONTA cerca un determinato elemento in un intervallo di celle e restituisce la posizione relativa di tale elemento nell\'intervallo. Ad esempio, se l\'intervallo A1:A3 include i valori 5, 25 e 38, la formula =CONFRONTA(25;A1:A3;0) restituisce il numero 2 perché 25 è il secondo elemento dell\'intervallo.',
        abstract: 'La funzione CONFRONTA cerca un determinato elemento in un intervallo di celle e restituisce la posizione relativa di tale elemento nell\'intervallo. Ad esempio, se l\'intervallo A1:A3 include i valori 5, 25 e 38, la formula =CONFRONTA(25;A1:A3;0) restituisce il numero 2 perché 25 è il secondo elemento dell\'intervallo.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/match-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'CONFRONTA trova il valore più grande minore o uguale a lookup_value . I valori nell\'argomento lookup_array devono essere disposti in ordine crescente, ad esempio...-2, -1, 0, 1, 2, ..., A-Z, FALSO, VERO.' },
            lookupArray: { name: 'lookup_array', detail: 'CONFRONTA trova il primo valore esattamente uguale a lookup_value . I valori nell\'argomento lookup_array possono essere in qualsiasi ordine.' },
            matchType: { name: 'match_type', detail: 'CONFRONTA trova il valore più piccolo maggiore o uguale a lookup_value . I valori nell\'argomento lookup_array devono essere disposti in ordine decrescente, ad esempio: VERO, FALSO, Z-A, ... 2, 1, 0, -1, -2, ..., e così via.' },
        },
    },
    OFFSET: {
        description: 'Restituisce un riferimento a un intervallo spostato rispetto a una cella o a un intervallo di celle di un numero specificato di righe e di colonne. Il riferimento restituito può riferirsi a una cella singola o a un intervallo. È possibile specificare il numero di righe e di colonne dell\'intervallo da restituire.',
        abstract: 'Restituisce un riferimento a un intervallo spostato rispetto a una cella o a un intervallo di celle di un numero specificato di righe e di colonne. Il riferimento restituito può riferirsi a una cella singola o a un intervallo. È possibile specificare il numero di righe e di colonne dell\'intervallo da restituire.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/offset-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Obbligatorio. Riferimento da cui si desidera che inizi lo spostamento. Rif deve essere un riferimento a una cella o a un intervallo di celle adiacenti. In caso contrario, SCARTO restituirà il valore di errore #VALORE!.' },
            rows: { name: 'rows', detail: 'Obbligatorio. Numero di righe, verso l\'alto o verso il basso, che si desidera come riferimento per la cella superiore sinistra. Se righe è uguale a 5, significa che la cella superiore sinistra del riferimento si trova cinque righe al di sotto di rif. Righe può essere un valore positivo, che indica le righe al di sotto del riferimento iniziale, o negativo, che indica le righe al di sopra del riferimento iniziale.' },
            cols: { name: 'columns', detail: 'Obbligatorio. Numero di colonne, a sinistra o a destra, che si desidera come riferimento per la cella superiore sinistra. Se colonne è uguale a 5, significa che la cella superiore sinistra del riferimento si trova cinque colonne a destra di rif. Colonne può essere un valore positivo, che indica le colonne a destra del riferimento iniziale, o negativo, che indica le colonne a sinistra del riferimento iniziale.' },
            height: { name: 'height', detail: 'Opzionale. Altezza del riferimento restituito espressa in numero di righe. Altezza deve essere un valore positivo.' },
            width: { name: 'width', detail: 'Opzionale. Larghezza del riferimento restituito espressa in numero di colonne. Largh deve essere un valore positivo.' },
        },
    },
    ROW: {
        description: 'Restituisce il numero di riga di un riferimento.',
        abstract: 'Restituisce il numero di riga di un riferimento.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/row-function',
            },
        ],
        functionParameter: {
            reference: { name: 'reference', detail: 'Opzionale. Cella o intervallo di celle di cui si desidera il numero di riga. Se rif è omesso, verrà considerato uguale al riferimento della cella contenente la funzione RIF.RIGA. Se rif è un intervallo di celle e se RIF.RIGA viene immesso come matrice verticale, RIF.RIGA restituirà i numeri di riga di riferimento come matrice verticale. Rif non può contenere riferimenti a più aree.' },
        },
    },
    ROWS: {
        description: 'Restituisce il numero di righe in un riferimento o in una matrice.',
        abstract: 'Restituisce il numero di righe in un riferimento o in una matrice.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Obbligatorio. Matrice, formula di matrice o riferimento a un intervallo di celle di cui si desidera calcolare il numero di righe.' },
        },
    },
    RTD: {
        description: 'Recupera dati in tempo reale da un programma che supporta l\'automazione COM.',
        abstract: 'Recupera dati in tempo reale da un programma che supporta l\'automazione COM.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: 'progId', detail: 'Obbligatorio. Nome dell\'IDProg di un componente aggiuntivo di automazione COM registrato installato nel computer locale. È necessario racchiudere il nome tra virgolette.' },
            server: { name: 'server', detail: 'Obbligatorio. Nome del server in cui deve essere eseguito il componente aggiuntivo. Se non vi sono server e il programma viene eseguito localmente, lasciare vuoto questo argomento. In caso contrario, racchiudere il nome del server tra virgolette (""). Se la funzione DATITEMPOREALE viene usata in Visual Basic, Applications Edition (VBA), anche se il server viene eseguito localmente è necessario usare le virgolette doppie o la proprietà VBA NullString .' },
            topic1: { name: 'topic1', detail: 'Argomento1 è obbligatorio, gli argomenti successivi sono facoltativi. Da 1 a 253 parametri che rappresentano nell\'insieme la porzione univoca di dati in tempo reale.' },
            topic2: { name: 'topic2', detail: 'Argomento1 è obbligatorio, gli argomenti successivi sono facoltativi. Da 1 a 253 parametri che rappresentano nell\'insieme la porzione univoca di dati in tempo reale.' },
        },
    },
    SORT: {
        description: 'In questo esempio si sta ordinando singolarmente per area geografica, agente di vendita e prodotto con =DATI.ORDINA(A2:A17), copiata nelle celle F2, H2 e J2.',
        abstract: 'In questo esempio si sta ordinando singolarmente per area geografica, agente di vendita e prodotto con =DATI.ORDINA(A2:A17), copiata nelle celle F2, H2 e J2.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/sort-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'L\'intervallo o matrice da ordinare' },
            sortIndex: { name: 'sort_index', detail: 'Numero che indica la riga o colonna in base a cui ordinare' },
            sortOrder: { name: 'sort_order', detail: 'Numero che indica il criterio di ordinamento desiderato, 1 per ordinamento crescente (impostazione predefinita), -1 per ordinamento decrescente' },
            byCol: { name: 'by_col', detail: 'Un valore logico che indica la direzione di ordinamento desiderata. FALSE per ordinare per riga (impostazione predefinita), TRUE per ordinare per colonna' },
        },
    },
    SORTBY: {
        description: 'In questo esempio abbiamo ordinato un elenco di nomi di utenti in base alla loro età, in ordine crescente.',
        abstract: 'In questo esempio abbiamo ordinato un elenco di nomi di utenti in base alla loro età, in ordine crescente.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/sortby-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'La matrice o l’intervallo da ordinare' },
            byArray1: { name: 'by_array1', detail: 'La matrice o l’intervallo in base a cui ordinare' },
            sortOrder1: { name: 'sort_order1', detail: 'L\'ordine da utilizzare per l\'ordinamento. 1 per ordine crescente, -1 per ordine decrescente. L\'impostazione predefinita è crescente.' },
            byArray2: { name: 'by_array2', detail: 'La matrice o l’intervallo in base a cui ordinare' },
            sortOrder2: { name: 'sort_order2', detail: 'L\'ordine da utilizzare per l\'ordinamento. 1 per ordine crescente, -1 per ordine decrescente. L\'impostazione predefinita è crescente.' },
        },
    },
    TAKE: {
        description: 'Restituisce un numero specificato di righe o colonne contigue dall\'inizio o fine di una matrice.',
        abstract: 'Restituisce un numero specificato di righe o colonne contigue dall\'inizio o fine di una matrice.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/take-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Matrice da cui prendere righe o colonne.' },
            rows: { name: 'rows', detail: 'Numero di righe da accettare. Un valore negativo viene prelevato dalla fine della matrice.' },
            columns: { name: 'columns', detail: 'Il numero di colonne da accettare. Un valore negativo viene prelevato dalla fine della matrice.' },
        },
    },
    TOCOL: {
        description: 'Restituisce la matrice in una singola colonna.',
        abstract: 'Restituisce la matrice in una singola colonna.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/tocol-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Matrice o riferimento da restituire come colonna.' },
            ignore: { name: 'ignore', detail: 'Indica se ignorare determinati tipi di valori. Per impostazione predefinita non viene ignorato alcun valore: 0 mantiene tutti, 1 ignora i vuoti, 2 gli errori, 3 entrambi.' },
            scanByColumn: { name: 'scan_by_column', detail: 'Analizza la matrice per colonna. Per impostazione predefinita viene analizzata per riga; ciò determina l\'ordinamento dei valori.' },
        },
    },
    TOROW: {
        description: 'Restituisce la matrice in una singola riga.',
        abstract: 'Restituisce la matrice in una singola riga.',
        links: [
            {
                title: 'Instruction',
                url: 'https://support.microsoft.com/it-it/excel/functions/torow-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'La matrice o il riferimento da restituire come una singola riga.' },
            ignore: { name: 'ignore', detail: 'Indica se ignorare determinati tipi di valori. Per impostazione predefinita non viene ignorato alcun valore. Specificare uno dei valori seguenti:\n0 Mantieni tutti i valori (impostazione predefinita)\n1 Ignora le celle vuote\n2 Ignora gli errori\n3 Ignora le celle vuote e gli errori' },
            scanByColumn: { name: 'scan_by_column', detail: 'Indica se analizzare la matrice per colonna. Per impostazione predefinita, la matrice viene analizzata per riga. L\'ordine di analisi determina se i valori vengono ordinati per riga o per colonna.' },
        },
    },
    TRANSPOSE: {
        description: 'Quando occorre trasporre o ruotare celle, è possibile farlo copiando, incollando e usando l\'opzione Trasponi . In questo modo si creano però dati duplicati. Per evitarlo, è possibile digitare una formula usando la funzione MATR.TRASPOSTA. Ad esempio, nell\'immagine seguente la formula =MATR.TRASPOSTA(A1:B4) dispone le celle da A1 a B4 in orizzontale.',
        abstract: 'Quando occorre trasporre o ruotare celle, è possibile farlo copiando, incollando e usando l\'opzione Trasponi . In questo modo si creano però dati duplicati. Per evitarlo, è possibile digitare una formula usando la funzione MATR.TRASPOSTA. Ad esempio, nell\'immagine seguente la formula =MATR.TRASPOSTA(A1:B4) dispone le celle da A1 a B4 in orizzontale.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/transpose-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'Intervallo di celle o matrice in un foglio di lavoro.' },
        },
    },
    UNIQUE: {
        description: 'Restituisce nomi univoci da un elenco di nomi',
        abstract: 'Restituisce nomi univoci da un elenco di nomi',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/unique-function',
            },
        ],
        functionParameter: {
            array: { name: 'array', detail: 'L\'intervallo o matrice da cui restituire righe o colonne univoche' },
            byCol: { name: 'by_col', detail: 'L\'argomento by_col è un valore logico che indica come eseguire il confronto. VERO confronta le colonne tra loro e restituisce le colonne univoche FALSO (o omesso) confronta le righe tra loro e restituisce le righe univoche' },
            exactlyOnce: { name: 'exactly_once', detail: 'L’argomento exactly_once è un valore logico che restituisce righe e colonne che ricorrono esattamente una volta in un intervallo o matrice. Questo è il concetto di database di UNICI. VERO restituisce tutte le righe e colonne univoche che ricorrono esattamente una volta in un intervallo o matrice FALSO (o omesso) restituisce tutte le righe e colonne univoche in un intervallo o matrice.' },
        },
    },
    VLOOKUP: {
        description: 'Usare la funzione CERCA.VERT per cercare un valore in una tabella.',
        abstract: 'Usare la funzione CERCA.VERT per cercare un valore in una tabella.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/vlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Valore da cercare, che deve trovarsi nella prima colonna dell\'intervallo specificato in table_array.' },
            tableArray: { name: 'table_array', detail: 'Intervallo di celle in cui CERCA.VERT cerca lookup_value e il valore da restituire. Può essere un intervallo denominato o una tabella.' },
            colIndexNum: { name: 'col_index_num', detail: 'Numero della colonna, iniziando da 1 per la colonna più a sinistra di table_array, che contiene il valore da restituire.' },
            rangeLookup: { name: 'range_lookup', detail: 'Valore logico che specifica se CERCA.VERT deve trovare una corrispondenza approssimativa (1/VERO) o esatta (0/FALSO).' },
        },
    },
    VSTACK: {
        description: 'Accoda le matrici in verticale e in sequenza per restituire una matrice più grande.',
        abstract: 'Accoda le matrici in verticale e in sequenza per restituire una matrice più grande.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/vstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'array', detail: 'Matrici da accodare.' },
            array2: { name: 'array', detail: 'Matrici da accodare.' },
        },
    },
    WRAPCOLS: {
        description: 'Esegue il wrapping della riga o della colonna di valori specificata per colonne dopo un numero specificato di elementi per formare una nuova matrice.',
        abstract: 'Esegue il wrapping della riga o della colonna di valori specificata per colonne dopo un numero specificato di elementi per formare una nuova matrice.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/wrapcols-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'Vettore o riferimento da mandare a capo.' },
            wrapCount: { name: 'wrap_count', detail: 'Numero massimo di valori per ogni colonna.' },
            padWith: { name: 'pad_with', detail: 'Valore con cui inserire il tastierino. L\'impostazione predefinita è #N/A.' },
        },
    },
    WRAPROWS: {
        description: 'Esegue il wrapping della riga o colonna di valori per righe dopo un numero specificato di elementi per formare una nuova matrice.',
        abstract: 'Esegue il wrapping della riga o colonna di valori per righe dopo un numero specificato di elementi per formare una nuova matrice.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/wraprows-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'Vettore o riferimento da mandare a capo.' },
            wrapCount: { name: 'wrap_count', detail: 'Numero massimo di valori per ogni riga.' },
            padWith: { name: 'pad_with', detail: 'Valore con cui inserire il tastierino. L\'impostazione predefinita è #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'Usare la funzione CERCA.X per trovare elementi in una tabella o in un intervallo per riga. Ad esempio è possibile cercare il prezzo di un componente di un’auto in base al numero del pezzo o trovare il nome di un dipendente in base al suo ID dipendente. Con CERCA.X è possibile cercare un termine di ricerca in una colonna e ottenere un risultato nella stessa riga ma in un\'altra colonna, indipendentemente dal lato in cui si trova la colonna del risultato.',
        abstract: 'Usare la funzione CERCA.X per trovare elementi in una tabella o in un intervallo per riga. Ad esempio è possibile cercare il prezzo di un componente di un’auto in base al numero del pezzo o trovare il nome di un dipendente in base al suo ID dipendente. Con CERCA.X è possibile cercare un termine di ricerca in una colonna e ottenere un risultato nella stessa riga ma in un\'altra colonna, indipendentemente dal lato in cui si trova la colonna del risultato.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/xlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Il valore da cercare *Se viene omesso, CERCA.X restituirà le celle vuote che trova in lookup_array .' },
            lookupArray: { name: 'lookup_array', detail: 'La matrice o l’intervallo in cui effettuare la ricerca' },
            returnArray: { name: 'return_array', detail: 'La matrice o l’intervallo da restituire' },
            ifNotFound: { name: 'if_not_found', detail: 'Se non è stata trovata una corrispondenza valida, restituire il testo [se_non_trovato] che si specifica. Se non viene trovata una corrispondenza valida e [se_non_trovato] manca, verrà restituito #N/A .' },
            matchMode: { name: 'match_mode', detail: 'Specificare il tipo di corrispondenza: 0 - Corrispondenza esatta. Se non trovata, restituisce #N/D. Questa è l’impostazione predefinita. -1 - Corrispondenza esatta. Se non trovata, restituisce l’elemento successivo più piccolo. 1 - Corrispondenza esatta. Se non trovata, restituisce l’elemento successivo più grande. 2 - Una corrispondenza jolly in cui *, ? e ~ hanno un significato speciale .' },
            searchMode: { name: 'search_mode', detail: 'Specificare la modalità di ricerca da usare: 1 - Effettuare una ricerca a partire dal primo elemento. Questa è l’impostazione predefinita. -1 - Effettuare una ricerca inversa a partire dall’ultimo elemento. 2 - Effettuare una ricerca binaria basata sulla matrice di ricerca classificata in ordine crescente . Se non è classificata, vengono restituiti risultati non validi. - 2 - Effettuare una ricerca binaria basata sulla matrice di ricerca classificata in ordine decrescente . Se non è classificata, vengono restituiti risultati non validi.' },
        },
    },
    XMATCH: {
        description: 'Supponiamo di avere un elenco di prodotti nelle celle da C3 a C7 e di voler determinare dove si trova il prodotto della cella E3. Qui useremo CONFRONTA.X per determinare la posizione di un elemento all\'interno di un elenco.',
        abstract: 'Supponiamo di avere un elenco di prodotti nelle celle da C3 a C7 e di voler determinare dove si trova il prodotto della cella E3. Qui useremo CONFRONTA.X per determinare la posizione di un elemento all\'interno di un elenco.',
        links: [
            {
                title: 'Istruzioni',
                url: 'https://support.microsoft.com/it-it/excel/functions/xmatch-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'lookup_value', detail: 'Il valore' },
            lookupArray: { name: 'lookup_array', detail: 'La matrice o l’intervallo in cui effettuare la ricerca' },
            matchMode: { name: 'match_mode', detail: 'Specificare il tipo di corrispondenza: 0 - Corrispondenza esatta (impostazione predefinita) -1 - Corrispondenza esatta o elemento successivo più piccolo 1 - Corrispondenza esatta o elemento successivo più grande 2 - Una corrispondenza jolly in cui *, ? e ~ hanno un significato speciale .' },
            searchMode: { name: 'search_mode', detail: 'Specificare il tipo di ricerca: 1 - Ricerca dal primo all\'ultimo (impostazione predefinita) -1 - Ricerca dall\'ultimo al primo (ricerca inversa). 2 - Effettuare una ricerca binaria basata sulla matrice di ricerca classificata in ordine crescente . Se non è classificata, vengono restituiti risultati non validi. - 2 - Effettuare una ricerca binaria basata sulla matrice di ricerca classificata in ordine decrescente . Se non è classificata, vengono restituiti risultati non validi.' },
        },
    },
};

export default locale;
