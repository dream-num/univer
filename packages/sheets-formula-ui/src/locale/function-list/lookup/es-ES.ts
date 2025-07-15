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
        description: 'Obtiene la dirección de una celda en una hoja de cálculo, dados los números de fila y columna especificados. Por ejemplo, DIRECCION(2,3) devuelve $C$2. Como otro ejemplo, DIRECCION(77,300) devuelve $KN$77. Puede usar otras funciones, como las funciones FILA y COLUMNA, para proporcionar los argumentos de número de fila y columna para la función DIRECCION.',
        abstract: 'Devuelve una referencia como texto a una celda única en una hoja de cálculo',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/address-function-d0c26c0d-3991-446b-8de4-ab46431d4f89',
            },
        ],
        functionParameter: {
            row_num: {
                name: 'número de fila',
                detail: 'Un valor numérico que especifica el número de fila a usar en la referencia de celda.',
            },
            column_num: {
                name: 'número de columna',
                detail: 'Un valor numérico que especifica el número de columna a usar en la referencia de celda.',
            },
            abs_num: {
                name: 'tipo de referencia',
                detail: 'Un valor numérico que especifica el tipo de referencia a devolver.',
            },
            a1: {
                name: 'estilo de referencia',
                detail: 'Un valor lógico que especifica el estilo de referencia A1 o F1C1. En el estilo A1, las columnas se etiquetan alfabéticamente y las filas numéricamente. En el estilo de referencia F1C1, tanto las columnas como las filas se etiquetan numéricamente. Si el argumento A1 es VERDADERO o se omite, la función DIRECCION devuelve una referencia de estilo A1; si es FALSO, la función DIRECCION devuelve una referencia de estilo F1C1.',
            },
            sheet_text: {
                name: 'nombre de la hoja',
                detail: 'Un valor de texto que especifica el nombre de la hoja de cálculo que se utilizará como referencia externa. Por ejemplo, la fórmula =DIRECCION(1,1,,,"Hoja2") devuelve Hoja2!$A$1. Si se omite el argumento nombre_hoja, no se usa ningún nombre de hoja y la dirección devuelta por la función se refiere a una celda en la hoja actual.',
            },
        },
    },
    AREAS: {
        description: 'Devuelve el número de áreas en una referencia',
        abstract: 'Devuelve el número de áreas en una referencia',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/areas-function-8392ba32-7a41-43b3-96b0-3695d2ec6152',
            },
        ],
        functionParameter: {
            reference: { name: 'referencia', detail: 'Una referencia a una celda o rango de celdas y puede referirse a múltiples áreas.' },
        },
    },
    CHOOSE: {
        description: 'Elige un valor de una lista de valores.',
        abstract: 'Elige un valor de una lista de valores',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/choose-function-fc5c184f-cb62-4ec7-a46e-38653b98f5bc',
            },
        ],
        functionParameter: {
            indexNum: { name: 'núm_índice', detail: 'Especifica qué argumento de valor se selecciona. Núm_índice debe ser un número entre 1 y 254, o una fórmula o referencia a una celda que contenga un número entre 1 y 254.\nSi núm_índice es 1, ELEGIR devuelve valor1; si es 2, ELEGIR devuelve valor2; y así sucesivamente.\nSi núm_índice es menor que 1 o mayor que el número del último valor de la lista, ELEGIR devuelve el valor de error #¡VALOR!.\nSi núm_índice es una fracción, se trunca al entero inferior antes de ser utilizado.' },
            value1: { name: 'valor1', detail: 'ELEGIR selecciona un valor o una acción a realizar en función de núm_índice. Los argumentos pueden ser números, referencias de celda, nombres definidos, fórmulas, funciones o texto.' },
            value2: { name: 'valor2', detail: 'De 1 a 254 argumentos de valor.' },
        },
    },
    CHOOSECOLS: {
        description: 'Devuelve las columnas especificadas de una matriz',
        abstract: 'Devuelve las columnas especificadas de una matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/choosecols-function-bf117976-2722-4466-9b9a-1c01ed9aebff',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz que contiene las columnas que se devolverán en la nueva matriz.' },
            colNum1: { name: 'col_núm1', detail: 'La primera columna que se devolverá.' },
            colNum2: { name: 'col_núm2', detail: 'Columnas adicionales que se devolverán.' },
        },
    },
    CHOOSEROWS: {
        description: 'Devuelve las filas especificadas de una matriz',
        abstract: 'Devuelve las filas especificadas de una matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/chooserows-function-51ace882-9bab-4a44-9625-7274ef7507a3',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz que contiene las filas que se devolverán en la nueva matriz.' },
            rowNum1: { name: 'fila_núm1', detail: 'El número de la primera fila que se devolverá.' },
            rowNum2: { name: 'fila_núm2', detail: 'Números de filas adicionales que se devolverán.' },
        },
    },
    COLUMN: {
        description: 'Devuelve el número de columna de la referencia de celda dada.',
        abstract: 'Devuelve el número de columna de una referencia',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/column-function-44e8c754-711c-4df3-9da4-47a55042554b',
            },
        ],
        functionParameter: {
            reference: { name: 'referencia', detail: 'La celda o rango de celdas para el cual desea devolver el número de columna.' },
        },
    },
    COLUMNS: {
        description: 'Devuelve el número de columnas en una matriz o referencia.',
        abstract: 'Devuelve el número de columnas en una referencia',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/columns-function-4e8e7b4e-e603-43e8-b177-956088fa48ca',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'Una matriz o fórmula de matriz, o una referencia a un rango de celdas para el cual desea el número de columnas.' },
        },
    },
    DROP: {
        description: 'Excluye un número especificado de filas o columnas desde el inicio o el final de una matriz',
        abstract: 'Excluye un número especificado de filas o columnas desde el inicio o el final de una matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/drop-function-1cb4e151-9e17-4838-abe5-9ba48d8c6a34',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz de la que se soltarán filas o columnas.' },
            rows: { name: 'filas', detail: 'El número de filas a soltar. Un valor negativo suelta desde el final de la matriz.' },
            columns: { name: 'columnas', detail: 'El número de columnas a excluir. Un valor negativo suelta desde el final de la matriz.' },
        },
    },
    EXPAND: {
        description: 'Expande o rellena una matriz a las dimensiones de fila y columna especificadas',
        abstract: 'Expande o rellena una matriz a las dimensiones de fila y columna especificadas',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/expand-function-7433fba5-4ad1-41da-a904-d5d95808bc38',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz a expandir.' },
            rows: { name: 'filas', detail: 'El número de filas en la matriz expandida. Si falta, las filas no se expandirán.' },
            columns: { name: 'columnas', detail: 'El número de columnas en la matriz expandida. Si falta, las columnas no se expandirán.' },
            padWith: { name: 'rellenar_con', detail: 'El valor con el que rellenar. El valor predeterminado es #N/A.' },
        },
    },
    FILTER: {
        description: 'Filtra un rango de datos en función de los criterios que defina',
        abstract: 'Filtra un rango de datos en función de los criterios que defina',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/filter-function-f4f7cb66-82eb-4767-8f7c-4877ad80c759',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'El rango o matriz a filtrar.' },
            include: { name: 'incluir', detail: 'Una matriz de valores booleanos donde VERDADERO indica que se debe retener una fila o columna.' },
            ifEmpty: { name: 'si_vacío', detail: 'Si no se reservan elementos, devolver.' },
        },
    },
    FORMULATEXT: {
        description: 'Devuelve la fórmula en la referencia dada como texto',
        abstract: 'Devuelve la fórmula en la referencia dada como texto',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/formulatext-function-0a786771-54fd-4ae2-96ee-09cda35439c8',
            },
        ],
        functionParameter: {
            reference: { name: 'referencia', detail: 'Una referencia a una celda o rango de celdas.' },
        },
    },
    GETPIVOTDATA: {
        description: 'Devuelve datos almacenados en un informe de tabla dinámica',
        abstract: 'Devuelve datos almacenados en un informe de tabla dinámica',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/getpivotdata-function-8c083b99-a922-4ca0-af5e-3af55960761f',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    HLOOKUP: {
        description: 'Busca en la fila superior de una matriz y devuelve el valor de la celda indicada',
        abstract: 'Busca en la fila superior de una matriz y devuelve el valor de la celda indicada',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/hlookup-function-a3034eec-b719-4ba3-bb65-e1ad662ed95f',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'valor_buscado',
                detail: 'El valor que se buscará en la primera fila de la tabla. Valor_buscado puede ser un valor, una referencia o una cadena de texto.',
            },
            tableArray: {
                name: 'tabla_matriz',
                detail: 'Una tabla de información en la que se buscan datos. Use una referencia a un rango o un nombre de rango.',
            },
            rowIndexNum: {
                name: 'índice_fila_núm',
                detail: 'El número de fila en tabla_matriz desde el cual se devolverá el valor coincidente. Un índice_fila_núm de 1 devuelve el valor de la primera fila en tabla_matriz, un índice_fila_núm de 2 devuelve el valor de la segunda fila en tabla_matriz, y así sucesivamente.',
            },
            rangeLookup: {
                name: 'búsqueda_rango',
                detail: 'Un valor lógico que especifica si desea que BUSCARH encuentre una coincidencia exacta o una coincidencia aproximada.',
            },
        },
    },
    HSTACK: {
        description: 'Anexa matrices horizontalmente y en secuencia para devolver una matriz más grande',
        abstract: 'Anexa matrices horizontalmente y en secuencia para devolver una matriz más grande',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/hstack-function-98c4ab76-10fe-4b4f-8d5f-af1c125fe8c2',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz', detail: 'Las matrices a anexar.' },
            array2: { name: 'matriz', detail: 'Las matrices a anexar.' },
        },
    },
    HYPERLINK: {
        description: 'Crea un hipervínculo dentro de una celda.',
        abstract: 'Crea un hipervínculo dentro de una celda.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.google.com/docs/answer/3093313?sjid=14131674310032162335-NC&hl=es',
            },
        ],
        functionParameter: {
            url: { name: 'url', detail: 'La URL completa de la ubicación del enlace entre comillas, o una referencia a una celda que contenga dicha URL.' },
            linkLabel: { name: 'etiqueta_enlace', detail: 'El texto que se mostrará en la celda como el enlace, entre comillas, o una referencia a una celda que contenga dicha etiqueta.' },
        },
    },
    IMAGE: {
        description: 'Devuelve una imagen de una fuente determinada',
        abstract: 'Devuelve una imagen de una fuente determinada',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/image-function-7e112975-5e52-4f2a-b9da-1d913d51f5d5',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    INDEX: {
        description: 'Devuelve la referencia de la celda en la intersección de una fila y columna particulares. Si la referencia está compuesta por selecciones no adyacentes, puede elegir la selección en la que buscar.',
        abstract: 'Usa un índice para elegir un valor de una referencia o matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/index-function-a5dcf0dd-996d-40a4-a822-b56b061328bd',
            },
        ],
        functionParameter: {
            reference: { name: 'referencia', detail: 'Una referencia a uno o más rangos de celdas.' },
            rowNum: { name: 'fila_núm', detail: 'El número de la fila en la referencia desde la cual devolver una referencia.' },
            columnNum: { name: 'columna_núm', detail: 'El número de la columna en la referencia desde la cual devolver una referencia.' },
            areaNum: { name: 'área_núm', detail: 'Selecciona un rango en la referencia desde el cual devolver la intersección de fila_núm y columna_núm.' },
        },
    },
    INDIRECT: {
        description: 'Devuelve la referencia especificada por una cadena de texto. Las referencias se evalúan inmediatamente para mostrar su contenido.',
        abstract: 'Devuelve una referencia indicada por un valor de texto',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/indirect-function-474b3a3a-8a26-4f44-b491-92b6306fa261',
            },
        ],
        functionParameter: {
            refText: { name: 'ref_texto', detail: 'Una referencia a una celda que contiene una referencia de estilo A1, una referencia de estilo F1C1, un nombre definido como una referencia o una referencia a una celda como una cadena de texto.' },
            a1: { name: 'a1', detail: 'Un valor lógico que especifica qué tipo de referencia está contenida en la celda ref_texto.' },
        },
    },
    LOOKUP: {
        description: 'Cuando necesite buscar en una sola fila o columna y encontrar un valor desde la misma posición en una segunda fila o columna',
        abstract: 'Busca valores en un vector o matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/lookup-function-446d94af-663b-451d-8251-369d5e3864cb',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'valor_buscado',
                detail: 'Un valor que BUSCAR busca en el primer vector. Valor_buscado puede ser un número, texto, un valor lógico, o un nombre o referencia que se refiera a un valor.',
            },
            lookupVectorOrArray: {
                name: 'vector_o_matriz_buscado',
                detail: 'Un rango que contiene solo una fila o una columna',
            },
            resultVector: {
                name: 'vector_resultado',
                detail: 'Un rango que contiene solo una fila o columna. El argumento vector_resultado debe tener el mismo tamaño que vector_buscado.',
            },
        },
    },
    MATCH: {
        description: 'La función COINCIDIR busca un elemento especificado en un rango de celdas y luego devuelve la posición relativa de ese elemento en el rango.',
        abstract: 'Busca valores en una referencia o matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/match-function-e8dffd45-c762-47d6-bf89-533f4a37673a',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'valor_buscado', detail: 'El valor que desea hacer coincidir en matriz_buscada.' },
            lookupArray: { name: 'matriz_buscada', detail: 'El rango de celdas que se está buscando.' },
            matchType: { name: 'tipo_coincidencia', detail: 'El número -1, 0 o 1.' },
        },
    },
    OFFSET: {
        description: 'Devuelve una referencia desplazada desde una referencia dada',
        abstract: 'Devuelve una referencia desplazada desde una referencia dada',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/offset-function-c8de19ae-dd79-4b9b-a14e-b4d906d11b66',
            },
        ],
        functionParameter: {
            reference: { name: 'referencia', detail: 'La referencia desde la que desea basar el desplazamiento.' },
            rows: { name: 'filas', detail: 'El número de filas, hacia arriba o hacia abajo, a las que desea que se refiera la celda superior izquierda.' },
            cols: { name: 'columnas', detail: 'El número de columnas, a la izquierda o a la derecha, a las que desea que se refiera la celda superior izquierda del resultado.' },
            height: { name: 'altura', detail: 'La altura, en número de filas, que desea que tenga la referencia devuelta. La altura debe ser un número positivo.' },
            width: { name: 'anchura', detail: 'La anchura, en número de columnas, que desea que tenga la referencia devuelta. La anchura debe ser un número positivo.' },
        },
    },
    ROW: {
        description: 'Devuelve el número de fila de una referencia',
        abstract: 'Devuelve el número de fila de una referencia',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/row-function-3a63b74a-c4d0-4093-b49a-e76eb49a6d8d',
            },
        ],
        functionParameter: {
            reference: { name: 'referencia', detail: 'La celda o rango de celdas para el cual desea el número de fila.' },
        },
    },
    ROWS: {
        description: 'Devuelve el número de filas en una matriz o referencia.',
        abstract: 'Devuelve el número de filas en una referencia',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/rows-function-b592593e-3fc2-47f2-bec1-bda493811597',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'Una matriz, una fórmula de matriz o una referencia a un rango de celdas para el cual desea el número de filas.' },
        },
    },
    RTD: {
        description: 'Recupera datos en tiempo real de un programa que admite la automatización COM',
        abstract: 'Recupera datos en tiempo real de un programa que admite la automatización COM',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/rtd-function-e0cc001a-56f0-470a-9b19-9455dc0eb593',
            },
        ],
        functionParameter: {
            number1: { name: 'número1', detail: 'primero' },
            number2: { name: 'número2', detail: 'segundo' },
        },
    },
    SORT: {
        description: 'Ordena el contenido de un rango o matriz',
        abstract: 'Ordena el contenido de un rango o matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/sort-function-22f63bd0-ccc8-492f-953d-c20e8e44b86c',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'El rango o matriz a ordenar.' },
            sortIndex: { name: 'índice_ordenación', detail: 'Un número que indica el orden de clasificación (por fila o por columna).' },
            sortOrder: { name: 'orden_clasificación', detail: 'Un número que representa el orden de clasificación deseado; 1 para ascendente (predeterminado), -1 para descendente.' },
            byCol: { name: 'por_col', detail: 'Valor lógico que indica la dirección de clasificación deseada; FALSO ordena por filas (predeterminado), VERDADERO ordena por columnas.' },
        },
    },
    SORTBY: {
        description: 'Ordena el contenido de un rango o matriz en función de los valores en un rango o matriz correspondiente',
        abstract: 'Ordena el contenido de un rango o matriz en función de los valores en un rango o matriz correspondiente',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/sortby-function-cd2d7a62-1b93-435c-b561-d6a35134f28f',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'El rango o matriz a ordenar.' },
            byArray1: { name: 'por_matriz1', detail: 'El rango o matriz en función del cual ordenar.' },
            sortOrder1: { name: 'orden_clasificación1', detail: 'Un número que representa el orden de clasificación deseado; 1 para ascendente (predeterminado), -1 para descendente.' },
            byArray2: { name: 'por_matriz2', detail: 'El rango o matriz en función del cual ordenar.' },
            sortOrder2: { name: 'orden_clasificación2', detail: 'Un número que representa el orden de clasificación deseado; 1 para ascendente (predeterminado), -1 para descendente.' },
        },
    },
    TAKE: {
        description: 'Devuelve un número especificado de filas o columnas contiguas desde el inicio o el final de una matriz',
        abstract: 'Devuelve un número especificado de filas o columnas contiguas desde el inicio o el final de una matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/take-function-25382ff1-5da1-4f78-ab43-f33bd2e4e003',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz de la que se tomarán filas o columnas.' },
            rows: { name: 'filas', detail: 'El número de filas a tomar. Un valor negativo toma desde el final de la matriz.' },
            columns: { name: 'columnas', detail: 'El número de columnas a tomar. Un valor negativo toma desde el final de la matriz.' },
        },
    },
    TOCOL: {
        description: 'Devuelve la matriz en una sola columna',
        abstract: 'Devuelve la matriz en una sola columna',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/tocol-function-22839d9b-0b55-4fc1-b4e6-2761f8f122ed',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o referencia a devolver como una columna.' },
            ignore: { name: 'ignorar', detail: 'Si se deben ignorar ciertos tipos de valores. Por defecto, no se ignora ningún valor. Especifique uno de los siguientes:\n0 Mantener todos los valores (predeterminado)\n1 Ignorar espacios en blanco\n2 Ignorar errores\n3 Ignorar espacios en blanco y errores' },
            scanByColumn: { name: 'escanear_por_columna', detail: 'Escanear la matriz por columna. Por defecto, la matriz se escanea por fila. El escaneo determina si los valores se ordenan por fila o por columna.' },
        },
    },
    TOROW: {
        description: 'Devuelve la matriz en una sola fila',
        abstract: 'Devuelve la matriz en una sola fila',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/torow-function-b90d0964-a7d9-44b7-816b-ffa5c2fe2289',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'La matriz o referencia a devolver como una fila.' },
            ignore: { name: 'ignorar', detail: 'Si se deben ignorar ciertos tipos de valores. Por defecto, no se ignora ningún valor. Especifique uno de los siguientes:\n0 Mantener todos los valores (predeterminado)\n1 Ignorar espacios en blanco\n2 Ignorar errores\n3 Ignorar espacios en blanco y errores' },
            scanByColumn: { name: 'escanear_por_columna', detail: 'Escanear la matriz por columna. Por defecto, la matriz se escanea por fila. El escaneo determina si los valores se ordenan por fila o por columna.' },
        },
    },
    TRANSPOSE: {
        description: 'Devuelve la transpuesta de una matriz',
        abstract: 'Devuelve la transpuesta de una matriz',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/transpose-function-ed039415-ed8a-4a81-93e9-4b6dfac76027',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'Un rango de celdas o una matriz en una hoja de cálculo.' },
        },
    },
    UNIQUE: {
        description: 'Devuelve una lista de valores únicos en una lista o rango',
        abstract: 'Devuelve una lista de valores únicos en una lista o rango',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/unique-function-c5ab87fd-30a3-4ce9-9d1a-40204fb85e1e',
            },
        ],
        functionParameter: {
            array: { name: 'matriz', detail: 'El rango o matriz desde el cual se devuelven filas o columnas únicas.' },
            byCol: { name: 'por_col', detail: 'Es un valor lógico: compara filas entre sí y devuelve valores únicos = FALSO, o se omite; compara columnas entre sí y devuelve valores únicos = VERDADERO.' },
            exactlyOnce: { name: 'exactamente_una_vez', detail: 'Es un valor lógico: devuelve filas o columnas de la matriz que aparecen solo una vez = VERDADERO; devuelve todas las filas o columnas distintas de la matriz = FALSO, o se ha omitido.' },
        },
    },
    VLOOKUP: {
        description: 'Use BUSCARV cuando necesite encontrar cosas en una tabla o un rango por fila. Por ejemplo, busque el precio de una pieza de automóvil por el número de pieza, o encuentre el nombre de un empleado en función de su ID de empleado.',
        abstract: 'Busca en la primera columna de una matriz y se mueve a través de la fila para devolver el valor de una celda',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/vlookup-function-0bbc8083-26fe-4963-8ab8-93a18ad188a1',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'valor_buscado',
                detail: 'El valor que desea buscar. El valor que desea buscar debe estar en la primera columna del rango de celdas que especifique en el argumento tabla_matriz.',
            },
            tableArray: {
                name: 'tabla_matriz',
                detail: 'El rango de celdas en el que BUSCARV buscará el valor_buscado y el valor de retorno. Puede usar un rango con nombre o una tabla, y puede usar nombres en el argumento en lugar de referencias de celda.',
            },
            colIndexNum: {
                name: 'col_índice_núm',
                detail: 'El número de columna (comenzando con 1 para la columna más a la izquierda de tabla_matriz) que contiene el valor de retorno.',
            },
            rangeLookup: {
                name: 'búsqueda_rango',
                detail: 'Un valor lógico que especifica si desea que BUSCARV encuentre una coincidencia aproximada o exacta: Coincidencia aproximada - 1/VERDADERO, Coincidencia exacta - 0/FALSO',
            },
        },
    },
    VSTACK: {
        description: 'Anexa matrices verticalmente y en secuencia para devolver una matriz más grande',
        abstract: 'Anexa matrices verticalmente y en secuencia para devolver una matriz más grande',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/vstack-function-a4b86897-be0f-48fc-adca-fcc10d795a9c',
            },
        ],
        functionParameter: {
            array1: { name: 'matriz', detail: 'Las matrices a anexar.' },
            array2: { name: 'matriz', detail: 'Las matrices a anexar.' },
        },
    },
    WRAPCOLS: {
        description: 'Envuelve la fila o columna de valores proporcionada por columnas después de un número específico de elementos',
        abstract: 'Envuelve la fila o columna de valores proporcionada por columnas después de un número específico de elementos',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/wrapcols-function-d038b05a-57b7-4ee0-be94-ded0792511e2',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'El vector o referencia a envolver.' },
            wrapCount: { name: 'conteo_envoltura', detail: 'El número máximo de valores para cada columna.' },
            padWith: { name: 'rellenar_con', detail: 'El valor con el que rellenar. El valor predeterminado es #N/A.' },
        },
    },
    WRAPROWS: {
        description: 'Envuelve la fila o columna de valores proporcionada por filas después de un número específico de elementos',
        abstract: 'Envuelve la fila o columna de valores proporcionada por filas después de un número específico de elementos',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/wraprows-function-796825f3-975a-4cee-9c84-1bbddf60ade0',
            },
        ],
        functionParameter: {
            vector: { name: 'vector', detail: 'El vector o referencia a envolver.' },
            wrapCount: { name: 'conteo_envoltura', detail: 'El número máximo de valores para cada fila.' },
            padWith: { name: 'rellenar_con', detail: 'El valor con el que rellenar. El valor predeterminado es #N/A.' },
        },
    },
    XLOOKUP: {
        description: 'Busca un rango o una matriz, y devuelve un elemento correspondiente a la primera coincidencia que encuentra. Si no existe una coincidencia, entonces BUSCARX puede devolver la coincidencia más cercana (aproximada).',
        abstract: 'Busca un rango o una matriz, y devuelve un elemento correspondiente a la primera coincidencia que encuentra. Si no existe una coincidencia, entonces BUSCARX puede devolver la coincidencia más cercana (aproximada).',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929',
            },
        ],
        functionParameter: {
            lookupValue: {
                name: 'valor_buscado',
                detail: 'El valor a buscar. Si se omite, BUSCARX devuelve las celdas en blanco que encuentra en matriz_buscada.',
            },
            lookupArray: { name: 'matriz_buscada', detail: 'La matriz o rango a buscar' },
            returnArray: { name: 'matriz_devuelta', detail: 'La matriz o rango a devolver' },
            ifNotFound: {
                name: 'si_no_encontrado',
                detail: 'Donde no se encuentra una coincidencia válida, devuelve el texto [si_no_encontrado] que proporcione. Si no se encuentra una coincidencia válida, y [si_no_encontrado] falta, se devuelve #N/A.',
            },
            matchMode: {
                name: 'modo_coincidencia',
                detail: 'Especifique el tipo de coincidencia: 0 - Coincidencia exacta. Si no se encuentra ninguna, devuelve #N/A. Este es el predeterminado. -1 - Coincidencia exacta. Si no se encuentra ninguna, devuelve el siguiente elemento más pequeño. 1 - Coincidencia exacta. Si no se encuentra ninguna, devuelve el siguiente elemento más grande. 2 - Una coincidencia con comodines donde *, ?, y ~ tienen un significado especial.',
            },
            searchMode: {
                name: 'modo_búsqueda',
                detail: 'Especifique el modo de búsqueda a usar: 1 - Realiza una búsqueda comenzando en el primer elemento. Este es el predeterminado. -1 - Realiza una búsqueda inversa comenzando en el último elemento. 2 - Realiza una búsqueda binaria que depende de que matriz_buscada esté ordenada en orden ascendente. Si no está ordenada, se devolverán resultados no válidos. -2 - Realiza una búsqueda binaria que depende de que matriz_buscada esté ordenada en orden descendente. Si no está ordenada, se devolverán resultados no válidos.',
            },
        },
    },
    XMATCH: {
        description: 'Busca un elemento especificado en una matriz o rango de celdas, y luego devuelve la posición relativa del elemento.',
        abstract: 'Devuelve la posición relativa de un elemento en una matriz o rango de celdas.',
        links: [
            {
                title: 'Instrucción',
                url: 'https://support.microsoft.com/es-es/office/xmatch-function-d966da31-7a6b-4a13-a1c6-5a33ed6a0312',
            },
        ],
        functionParameter: {
            lookupValue: { name: 'valor_buscado', detail: 'El valor de búsqueda' },
            lookupArray: { name: 'matriz_buscada', detail: 'La matriz o rango a buscar' },
            matchMode: { name: 'modo_coincidencia', detail: 'Especifique el tipo de coincidencia:\n0 - Coincidencia exacta (predeterminado)\n-1 - Coincidencia exacta o siguiente elemento más pequeño\n1 - Coincidencia exacta o siguiente elemento más grande\n2 - Una coincidencia con comodines donde *, ?, y ~ tienen un significado especial.' },
            searchMode: { name: 'modo_búsqueda', detail: 'Especifique el tipo de búsqueda:\n1 - Buscar de primero a último (predeterminado)\n-1 - Buscar de último a primero (búsqueda inversa).\n2 - Realizar una búsqueda binaria que depende de que matriz_buscada esté ordenada en orden ascendente. Si no está ordenada, se devolverán resultados no válidos.\n-2 - Realizar una búsqueda binaria que depende de que matriz_buscada esté ordenada en orden descendente. Si no está ordenada, se devolverán resultados no válidos.' },
        },
    },
};

export default locale;
