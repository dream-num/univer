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
        description: 'Obté l\'adreça d\'una cel·la en un full de càlcul, donats uns números de fila i columna especificats. Per exemple, ADREÇA(2,3) retorna $C$2. Com a un altre exemple, ADREÇA(77,300) retorna $KN$77. Podeu utilitzar altres funcions, com les funcions FILA i COLUMNA, per proporcionar els arguments de número de fila i columna per a la funció ADREÇA.',
        abstract: 'Retorna una referència com a text a una única cel·la en un full de càlcul',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/address-function',
            },
        ],
        functionParameter: {
            row_num: {
                name: 'número_de_fila',
                detail: 'Un valor numèric que especifica el número de fila a utilitzar en la referència de cel·la.',
            },
            column_num: {
                name: 'número_de_columna',
                detail: 'Un valor numèric que especifica el número de columna a utilitzar en la referència de cel·la.',
            },
            abs_num: {
                name: 'tipus_de_referència',
                detail: 'Un valor numèric que especifica el tipus de referència a retornar.',
            },
            a1: {
                name: 'estil_de_referència',
                detail: 'Un valor lògic que especifica l\'estil de referència A1 o F1C1. En l\'estil A1, les columnes s\'etiqueten alfabèticament i les files numèricament. En l\'estil de referència F1C1, tant les columnes com les files s\'etiqueten numèricament. Si l\'argument A1 és CERT o s\'omet, la funció ADREÇA retorna una referència d\'estil A1; si és FALS, la funció ADREÇA retorna una referència d\'estil F1C1.',
            },
            sheet_text: {
                name: 'nom_del_full',
                detail: 'Un valor de text que especifica el nom del full de càlcul que s\'ha d\'utilitzar com a referència externa. Per exemple, la fórmula =ADREÇA(1,1,,,"Full2") retorna Full2!$A$1. Si s\'omet l\'argument nom_del_full, no s\'utilitza cap nom de full i l\'adreça retornada per la funció es refereix a una cel·la del full actual.',
            },
        },
    },
    AREAS: {
        description: 'Retorna el nombre d\'àrees en una referència',
        abstract: 'Retorna el nombre d\'àrees en una referència',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/areas-function',
            },
        ],
        functionParameter: {
            reference: { name: 'referència', detail: 'Una referència a una cel·la o un rang de cel·les i pot referir-se a múltiples àrees.' },
        },
    },
    CHOOSE: {
        description: 'Tria un valor d\'una llista de valors.',
        abstract: 'Tria un valor d\'una llista de valors',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/choose-function',
            },
        ],
        functionParameter: {
            indexNum: { name: 'núm_índex', detail: 'Especifica quin argument de valor se selecciona. Núm_índex ha de ser un número entre 1 i 254, o una fórmula o referència a una cel·la que contingui un número entre 1 i 254.\nSi núm_índex és 1, Tria retorna valor1; si és 2, Tria retorna valor2; i així successivament.\nSi núm_índex és menor que 1 o més gran que el número de l\'últim valor de la llista, Tria retorna el valor d\'error #VALOR!.\nSi núm_índex és una fracció, es trunca a l\'enter més baix abans d\'utilitzar-lo.' },
            value1: { name: 'valor1', detail: 'Tria selecciona un valor o una acció a realitzar basant-se en núm_índex. Els arguments poden ser números, referències de cel·la, noms definits, fórmules, funcions o text.' },
            value2: { name: 'valor2', detail: 'D\'1 a 254 arguments de valor.' },
        },
    },
    CHOOSECOLS: {
        description: 'Retorna les columnes especificades d\'una matriu',
        abstract: 'Retorna les columnes especificades d\'una matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/choosecols-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu que conté les columnes que es retornaran a la nova matriu.' },
            colNum1: { name: 'col_núm1', detail: 'La primera columna que es retornarà.' },
            colNum2: { name: 'col_núm2', detail: 'Columnes addicionals que es retornaran.' },
        },
    },
    CHOOSEROWS: {
        description: 'Retorna les files especificades d\'una matriu',
        abstract: 'Retorna les files especificades d\'una matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/chooserows-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu que conté les files que es retornaran a la nova matriu.' },
            rowNum1: { name: 'fila_núm1', detail: 'El número de la primera fila que es retornarà.' },
            rowNum2: { name: 'fila_núm2', detail: 'Números de fila addicionals que es retornaran.' },
        },
    },
    COLUMN: {
        description: 'Retorna el número de columna de la referència de cel·la donada.',
        abstract: 'Retorna el número de columna d\'una referència',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/column-function',
            },
        ],
        functionParameter: {
            reference: { name: 'referència', detail: 'La cel·la o el rang de cel·les del qual voleu retornar el número de columna.' },
        },
    },
    COLUMNS: {
        description: 'Retorna el nombre de columnes en una matriu o referència.',
        abstract: 'Retorna el nombre de columnes en una referència',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/columns-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'Una matriu o fórmula de matriu, o una referència a un rang de cel·les del qual voleu el nombre de columnes.' },
        },
    },
    DROP: {
        description: 'Exclou un nombre especificat de files o columnes des de l\'inici o el final d\'una matriu',
        abstract: 'Exclou un nombre especificat de files o columnes des de l\'inici o el final d\'una matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/drop-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu de la qual es deixaran anar files o columnes.' },
            rows: { name: 'files', detail: 'El nombre de files a deixar anar. Un valor negatiu deixa anar des del final de la matriu.' },
            columns: { name: 'columnes', detail: 'El nombre de columnes a excloure. Un valor negatiu deixa anar des del final de la matriu.' },
        },
    },
    EXPAND: {
        description: 'Expandeix o omple una matriu a les dimensions de fila i columna especificades',
        abstract: 'Expandeix o omple una matriu a les dimensions de fila i columna especificades',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/expand-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu a expandir.' },
            rows: { name: 'files', detail: 'El nombre de files a la matriu expandida. Si falta, les files no s\'expandiran.' },
            columns: { name: 'columnes', detail: 'El nombre de columnes a la matriu expandida. Si falta, les columnes no s\'expandiran.' },
            padWith: { name: 'omplir_amb', detail: 'El valor amb el qual omplir. El valor per defecte és #N/A.' },
        },
    },
    FILTER: {
        description: 'Filtra un rang de dades basant-se en els criteris que definiu',
        abstract: 'Filtra un rang de dades basant-se en els criteris que definiu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/filter-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'El rang o matriu a filtrar.' },
            include: { name: 'incloure', detail: 'Una matriu de valors booleans on CERT indica que s\'ha de retenir una fila o columna.' },
            ifEmpty: { name: 'si_buit', detail: 'Si no es reserven elements, retorna.' },
        },
    },
    FORMULATEXT: {
        description: 'Retorna la fórmula a la referència donada com a text',
        abstract: 'Retorna la fórmula a la referència donada com a text',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/formulatext-function',
            },
        ],
        functionParameter: {
            reference: { name: 'referència', detail: 'Una referència a una cel·la o un rang de cel·les.' },
        },
    },
    GETPIVOTDATA: {
        description: 'Retorna dades emmagatzemades en un informe de taula dinàmica',
        abstract: 'Retorna dades emmagatzemades en un informe de taula dinàmica',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/getpivotdata-function',
            },
        ],
        functionParameter: {
            dataField: { name: 'Camp de dades', detail: 'Nom del camp de dades que conté les dades que voleu recuperar.' },
            pivotTable: { name: 'Taula dinàmica', detail: 'Referència a una cel·la, un interval o un interval amb nom d’una taula dinàmica.' },
            field1: { name: 'Camp 1', detail: 'Opcional. Nom del primer camp que descriu les dades.' },
            item1: { name: 'Element 1', detail: 'Opcional. Nom del primer element del camp.' },
        },
    },
    HLOOKUP: {
        description: 'Busca a la fila superior d\'una matriu i retorna el valor de la cel·la indicada',
        abstract: 'Busca a la fila superior d\'una matriu i retorna el valor de la cel·la indicada',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/hlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'valor_buscat',
                detail: 'El valor a trobar a la primera fila de la taula. Valor_buscat pot ser un valor, una referència o una cadena de text.',
            },
            tableArray: {
                name: 'taula_matriu',
                detail: 'Una taula d\'informació en la qual es busquen dades. Utilitzeu una referència a un rang o un nom de rang.',
            },
            rowIndexNum: {
                name: 'índex_fila_núm',
                detail: 'El número de fila a taula_matriu des del qual es retornarà el valor coincident. Un índex_fila_núm d\'1 retorna el valor de la primera fila a taula_matriu, un índex_fila_núm de 2 retorna el valor de la segona fila a taula_matriu, i així successivament.',
            },
            rangeLookup: {
                name: 'cerca_rang',
                detail: 'Un valor lògic que especifica si voleu que HLOOKUP trobi una coincidència exacta o una coincidència aproximada.',
            },
        },
    },
    HSTACK: {
        description: 'Afegeix matrius horitzontalment i en seqüència per retornar una matriu més gran',
        abstract: 'Afegeix matrius horitzontalment i en seqüència per retornar una matriu més gran',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/hstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu', detail: 'Les matrius a afegir.' },
            array2: { name: 'matriu', detail: 'Les matrius a afegir.' },
        },
    },
    HYPERLINK: {
        description: 'Crea un enllaç dins d\'una cel·la.',
        abstract: 'Crea un enllaç dins d\'una cel·la.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.google.com/docs/answer/3093313?hl=ca',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'URL complet de la ubicació de l\'enllaç entre cometes o referència a una cel·la que conté l\'URL. Només es permeten determinats tipus d\'enllaç. Es permeten http:// , https:// , mailto: , aim: , ftp:// , gopher:// , telnet:// i news:// ; la resta estan explícitament prohibits. Si s\'especifica un altre protocol, es mostrarà link_label a la cel·la, però no estarà enllaçat. Si no s\'especifica cap protocol, s\'assumeix que és http:// i es col·loca davant d\' url .' },
            linkLabel: { name: 'etiqueta_enllaç', detail: '( OPCIONAL: url de manera predeterminada ) : text que es mostra a la cel·la com a enllaç, entre cometes, o bé referència a una cel·la que contingui aquesta etiqueta. Si etiqueta_enllaç és una referència a una cel·la buida, url es mostrarà com a enllaç si és vàlid o com a text sense format en cas contrari. Si link_label és el literal de cadena buida (""), la cel·la es mostrarà buida, però igualment podreu accedir a l\'enllaç fent clic a la cel·la o movent-vos-hi.' },
        },
    },
    IMAGE: {
        description: 'Retorna una imatge d\'una font donada',
        abstract: 'Retorna una imatge d\'una font donada',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/image-function',
            },
        ],
        functionParameter: {
            source: { name: 'origen', detail: 'La ruta de acceso URL, mediante un protocolo "https", del archivo de imagen.' },
            altText: { name: 'texto_alternativo', detail: 'Texto alternativo que describe la imagen para accesibilidad.' },
            sizing: { name: 'dimensiones', detail: 'Especifica las dimensiones de la imagen.' },
            height: { name: 'alto', detail: 'La altura personalizada de la imagen en píxeles.' },
            width: { name: 'ancho', detail: 'La anchura personalizada de la imagen en píxeles.' },
        },
    },
    INDEX: {
        description: 'Retorna la referència de la cel·la a la intersecció d\'una fila i columna particulars. Si la referència està formada per seleccions no adjacents, podeu triar la selecció on buscar.',
        abstract: 'Utilitza un índex per triar un valor d\'una referència o matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/index-function',
            },
        ],
        functionParameter: {
            reference: { name: 'referència', detail: 'Una referència a un o més rangs de cel·les.' },
            rowNum: { name: 'fila_núm', detail: 'El número de la fila a la referència des de la qual es vol retornar una referència.' },
            columnNum: { name: 'columna_núm', detail: 'El número de la columna a la referència des de la qual es vol retornar una referència.' },
            areaNum: { name: 'àrea_núm', detail: 'Selecciona un rang a la referència des del qual es vol retornar la intersecció de fila_núm i columna_núm.' },
        },
    },
    INDIRECT: {
        description: 'Retorna la referència especificada per una cadena de text. Les referències s\'avaluen immediatament per mostrar el seu contingut.',
        abstract: 'Retorna una referència indicada per un valor de text',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/indirect-function',
            },
        ],
        functionParameter: {
            refText: { name: 'ref_text', detail: 'Una referència a una cel·la que conté una referència d\'estil A1, una referència d\'estil F1C1, un nom definit com a referència, o una referència a una cel·la com a cadena de text.' },
            a1: { name: 'a1', detail: 'Un valor lògic que especifica quin tipus de referència conté la cel·la ref_text.' },
        },
    },
    LOOKUP: {
        description: 'Quan necessiteu buscar en una sola fila o columna i trobar un valor des de la mateixa posició en una segona fila o columna',
        abstract: 'Busca valors en un vector o matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/lookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'valor_buscat',
                detail: 'Un valor que LOOKUP cerca al primer vector. Valor_buscat pot ser un número, text, un valor lògic, o un nom o referència que es refereixi a un valor.',
            },
            lookupVectorOrArray: {
                name: 'vector_o_matriu_buscat',
                detail: 'Un rang que conté només una fila o una columna',
            },
            resultVector: {
                name: 'vector_resultat',
                detail: 'Un rang que conté només una fila o columna. L\'argument vector_resultat ha de tenir la mateixa mida que vector_buscat.',
            },
        },
    },
    MATCH: {
        description: 'La funció MATCH cerca un element especificat en un rang de cel·les i, a continuació, retorna la posició relativa d\'aquest element en el rang.',
        abstract: 'Busca valors en una referència o matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/match-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'valor_buscat', detail: 'El valor que voleu fer coincidir a matriu_buscada.' },
            lookupArray: { name: 'matriu_buscada', detail: 'El rang de cel·les que s\'està cercant.' },
            matchType: { name: 'tipus_coincidència', detail: 'El número -1, 0 o 1.' },
        },
    },
    OFFSET: {
        description: 'Retorna una referència desplaçada des d\'una referència donada',
        abstract: 'Retorna una referència desplaçada des d\'una referència donada',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/offset-function',
            },
        ],
        functionParameter: {
            reference: { name: 'referència', detail: 'La referència des de la qual voleu basar el desplaçament.' },
            rows: { name: 'files', detail: 'El nombre de files, amunt o avall, a les quals voleu que es refereixi la cel·la superior esquerra.' },
            cols: { name: 'columnes', detail: 'El nombre de columnes, a l\'esquerra o a la dreta, a les quals voleu que es refereixi la cel·la superior esquerra del resultat.' },
            height: { name: 'alçada', detail: 'L\'alçada, en nombre de files, que voleu que tingui la referència retornada. L\'alçada ha de ser un número positiu.' },
            width: { name: 'amplada', detail: 'L\'amplada, en nombre de columnes, que voleu que tingui la referència retornada. L\'amplada ha de ser un número positiu.' },
        },
    },
    ROW: {
        description: 'Retorna el número de fila d\'una referència',
        abstract: 'Retorna el número de fila d\'una referència',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/row-function',
            },
        ],
        functionParameter: {
            reference: { name: 'referència', detail: 'La cel·la o el rang de cel·les del qual voleu el número de fila.' },
        },
    },
    ROWS: {
        description: 'Retorna el nombre de files en una matriu o referència.',
        abstract: 'Retorna el nombre de files en una referència',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/rows-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'Una matriu, una fórmula de matriu o una referència a un rang de cel·les del qual voleu el nombre de files.' },
        },
    },
    RTD: {
        description: 'Recupera dades en temps real d\'un programa que admet l\'automatització COM',
        abstract: 'Recupera dades en temps real d\'un programa que admet l\'automatització COM',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/rtd-function',
            },
        ],
        functionParameter: {
            progId: { name: 'Identificador de programa', detail: 'Nom de l’identificador de programa del complement d’automatització COM instal·lat localment.' },
            server: { name: 'Servidor', detail: 'Nom del servidor on s’executa el complement; useu una cadena buida per al servidor local.' },
            topic1: { name: 'Tema 1', detail: 'Primer text que especifica les dades en temps real que s’han de recuperar.' },
            topic2: { name: 'Tema 2', detail: 'Opcional. Textos addicionals que especifiquen les dades en temps real.' },
        },
    },
    SORT: {
        description: 'Ordena el contingut d\'un rang o matriu',
        abstract: 'Ordena el contingut d\'un rang o matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sort-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'El rang o matriu a ordenar.' },
            sortIndex: { name: 'índex_ordenació', detail: 'Un número que indica l\'ordre de classificació (per fila o per columna).' },
            sortOrder: { name: 'ordre_classificació', detail: 'Un número que representa l\'ordre de classificació desitjat; 1 per a ascendent (per defecte), -1 per a descendent.' },
            byCol: { name: 'per_col', detail: 'Valor lògic que indica la direcció de classificació desitjada; FALS ordena per files (per defecte), CERT ordena per columnes.' },
        },
    },
    SORTBY: {
        description: 'Ordena el contingut d\'un rang o matriu basant-se en els valors d\'un rang o matriu corresponent',
        abstract: 'Ordena el contingut d\'un rang o matriu basant-se en els valors d\'un rang o matriu corresponent',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/sortby-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'El rang o matriu a ordenar.' },
            byArray1: { name: 'per_matriu1', detail: 'El rang o matriu en funció del qual ordenar.' },
            sortOrder1: { name: 'ordre_classificació1', detail: 'Un número que representa l\'ordre de classificació desitjat; 1 per a ascendent (per defecte), -1 per a descendent.' },
            byArray2: { name: 'per_matriu2', detail: 'El rang o matriu en funció del qual ordenar.' },
            sortOrder2: { name: 'ordre_classificació2', detail: 'Un número que representa l\'ordre de classificació desitjat; 1 per a ascendent (per defecte), -1 per a descendent.' },
        },
    },
    TAKE: {
        description: 'Retorna un nombre especificat de files o columnes contigües des de l\'inici o el final d\'una matriu',
        abstract: 'Retorna un nombre especificat de files o columnes contigües des de l\'inici o el final d\'una matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/take-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu de la qual es prendran files o columnes.' },
            rows: { name: 'files', detail: 'El nombre de files a prendre. Un valor negatiu pren des del final de la matriu.' },
            columns: { name: 'columnes', detail: 'El nombre de columnes a prendre. Un valor negatiu pren des del final de la matriu.' },
        },
    },
    TOCOL: {
        description: 'Retorna la matriu en una sola columna',
        abstract: 'Retorna la matriu en una sola columna',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/tocol-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o referència a retornar com a columna.' },
            ignore: { name: 'ignorar', detail: 'Si s\'han d\'ignorar certs tipus de valors. Per defecte, no s\'ignora cap valor. Especifiqueu un dels següents:\n0 Mantenir tots els valors (per defecte)\n1 Ignorar espais en blanc\n2 Ignorar errors\n3 Ignorar espais en blanc i errors' },
            scanByColumn: { name: 'escanejar_per_columna', detail: 'Escanejar la matriu per columna. Per defecte, la matriu s\'escaneja per fila. L\'escaneig determina si els valors s\'ordenen per fila o per columna.' },
        },
    },
    TOROW: {
        description: 'Retorna la matriu en una sola fila',
        abstract: 'Retorna la matriu en una sola fila',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/torow-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'La matriu o referència a retornar com a fila.' },
            ignore: { name: 'ignorar', detail: 'Si s\'han d\'ignorar certs tipus de valors. Per defecte, no s\'ignora cap valor. Especifiqueu un dels següents:\n0 Mantenir tots els valors (per defecte)\n1 Ignorar espais en blanc\n2 Ignorar errors\n3 Ignorar espais en blanc i errors' },
            scanByColumn: { name: 'escanejar_per_columna', detail: 'Escanejar la matriu per columna. Per defecte, la matriu s\'escaneja per fila. L\'escaneig determina si els valors s\'ordenen per fila o per columna.' },
        },
    },
    TRANSPOSE: {
        description: 'Retorna la transposada d\'una matriu',
        abstract: 'Retorna la transposada d\'una matriu',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/transpose-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'Un rang de cel·les o una matriu en un full de càlcul.' },
        },
    },
    UNIQUE: {
        description: 'Retorna una llista de valors únics en una llista o rang',
        abstract: 'Retorna una llista de valors únics en una llista o rang',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/unique-function',
            },
        ],
        functionParameter: {
            array: { name: 'matriu', detail: 'El rang o matriu des del qual es retornen files o columnes úniques.' },
            byCol: { name: 'per_col', detail: 'És un valor lògic: compara files entre si i retorna valors únics = FALS, o s\'omet; compara columnes entre si i retorna valors únics = CERT.' },
            exactlyOnce: { name: 'exactament_una_vegada', detail: 'És un valor lògic: retorna files o columnes de la matriu que apareixen només una vegada = CERT; retorna totes les files o columnes diferents de la matriu = FALS, o s\'ha omès.' },
        },
    },
    VLOOKUP: {
        description: 'Utilitzeu VLOOKUP quan necessiteu trobar coses en una taula o un rang per fila. Per exemple, cerqueu el preu d\'una peça d\'automòbil pel número de peça, o trobeu el nom d\'un empleat basant-vos en el seu ID d\'empleat.',
        abstract: 'Busca a la primera columna d\'una matriu i es mou a través de la fila per retornar el valor d\'una cel·la',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/vlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'valor_buscat',
                detail: 'El valor que voleu buscar. El valor que voleu buscar ha d\'estar a la primera columna del rang de cel·les que especifiqueu a l\'argument taula_matriu.',
            },
            tableArray: {
                name: 'taula_matriu',
                detail: 'El rang de cel·les en què VLOOKUP cercarà el valor_buscat i el valor de retorn. Podeu utilitzar un rang amb nom o una taula, i podeu utilitzar noms a l\'argument en lloc de referències de cel·la.',
            },
            colIndexNum: {
                name: 'col_índex_núm',
                detail: 'El número de columna (començant per 1 per a la columna més a l\'esquerra de taula_matriu) que conté el valor de retorn.',
            },
            rangeLookup: {
                name: 'cerca_rang',
                detail: 'Un valor lògic que especifica si voleu que VLOOKUP trobi una coincidència aproximada o exacta: Coincidència aproximada - 1/CERT, Coincidència exacta - 0/FALS',
            },
        },
    },
    VSTACK: {
        description: 'Afegeix matrius verticalment i en seqüència per retornar una matriu més gran',
        abstract: 'Afegeix matrius verticalment i en seqüència per retornar una matriu més gran',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/vstack-function',
            },
        ],
        functionParameter: {
            array1: { name: 'matriu', detail: 'Les matrius a afegir.' },
            array2: { name: 'matriu', detail: 'Les matrius a afegir.' },
        },
    },
    WRAPCOLS: {
        description: 'Embolcalla la fila o columna de valors proporcionada per columnes després d\'un nombre específic d\'elements',
        abstract: 'Embolcalla la fila o columna de valors proporcionada per columnes després d\'un nombre específic d\'elements',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/wrapcols-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'El vector o referència a embolcallar.' },
            wrapCount: { name: 'recompte_embolcall', detail: 'El nombre màxim de valors per a cada columna.' },
            padWith: { name: 'omplir_amb', detail: 'El valor amb el qual omplir. El valor per defecte és #N/A.' },
        },
    },
    WRAPROWS: {
        description: 'Embolcalla la fila o columna de valors proporcionada per files després d\'un nombre específic d\'elements',
        abstract: 'Embolcalla la fila o columna de valors proporcionada per files després d\'un nombre específic d\'elements',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/wraprows-function',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'El vector o referència a embolcallar.' },
            wrapCount: { name: 'recompte_embolcall', detail: 'El nombre màxim de valors per a cada fila.' },
            padWith: { name: 'omplir_amb', detail: 'El valor amb el qual omplir. El valor per defecte és #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'Cerca un rang o una matriu, i retorna un element corresponent a la primera coincidència que troba. Si no existeix una coincidència, llavors XLOOKUP pot retornar la coincidència més propera (aproximada).',
        abstract: 'Cerca un rang o una matriu, i retorna un element corresponent a la primera coincidència que troba. Si no existeix una coincidència, llavors XLOOKUP pot retornar la coincidència més propera (aproximada).',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/xlookup-function',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'valor_buscat',
                detail: 'El valor a cercar. Si s\'omet, XLOOKUP retorna les cel·les en blanc que troba a matriu_buscada.',
            },
            lookupArray: { name: 'matriu_buscada', detail: 'La matriu o rang a cercar' },
            returnArray: { name: 'matriu_retornada', detail: 'La matriu o rang a retornar' },
            ifNotFound: {
                name: 'si_no_trobat',
                detail: 'On no es troba una coincidència vàlida, retorna el text [si_no_trobat] que proporcioneu. Si no es troba una coincidència vàlida, i [si_no_trobat] falta, es retorna #N/A.',
            },
            matchMode: {
                name: 'mode_coincidència',
                detail: 'Especifiqueu el tipus de coincidència: 0 - Coincidència exacta. Si no se\'n troba cap, retorna #N/A. Aquest és el valor per defecte. -1 - Coincidència exacta. Si no se\'n troba cap, retorna l\'element següent més petit. 1 - Coincidència exacta. Si no se\'n troba cap, retorna l\'element següent més gran. 2 - Una coincidència amb comodins on *, ?, i ~ tenen un significat especial.',
            },
            searchMode: {
                name: 'mode_cerca',
                detail: 'Especifiqueu el mode de cerca a utilitzar: 1 - Realitza una cerca començant pel primer element. Aquest és el valor per defecte. -1 - Realitza una cerca inversa començant per l\'últim element. 2 - Realitza una cerca binària que depèn que matriu_buscada estigui ordenada en ordre ascendent. Si no està ordenada, es retornaran resultats no vàlids. -2 - Realitza una cerca binària que depèn que matriu_buscada estigui ordenada en ordre descendent. Si no està ordenada, es retornaran resultats no vàlids.',
            },
        },
    },
    XMATCH: {
        description: 'Cerca un element especificat en una matriu o rang de cel·les, i després retorna la posició relativa de l\'element.',
        abstract: 'Retorna la posició relativa d\'un element en una matriu o rang de cel·les.',
        links: [
            {
                title: 'Instrucció',
                url: 'https://support.microsoft.com/ca-es/excel/functions/xmatch-function',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'valor_buscat', detail: 'El valor de cerca' },
            lookupArray: { name: 'matriu_buscada', detail: 'La matriu o rang a cercar' },
            matchMode: { name: 'mode_coincidència', detail: 'Especifiqueu el tipus de coincidència:\n0 - Coincidència exacta (per defecte)\n-1 - Coincidència exacta o següent element més petit\n1 - Coincidència exacta o següent element més gran\n2 - Una coincidència amb comodins on *, ?, i ~ tenen un significat especial.' },
            searchMode: { name: 'mode_cerca', detail: 'Especifiqueu el tipus de cerca:\n1 - Cerca de primer a últim (per defecte)\n-1 - Cerca d\'últim a primer (cerca inversa).\n2 - Realitzar una cerca binària que depèn que matriu_buscada estigui ordenada en ordre ascendent. Si no està ordenada, es retornaran resultats no vàlids.\n-2 - Realitzar una cerca binària que depèn que matriu_buscada estigui ordenada en ordre descendent. Si no està ordenada, es retornaran resultats no vàlids.' },
        },
    },
};

export default locale;
