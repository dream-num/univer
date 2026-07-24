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
    BESSELI: {
        description: 'Retorna la funció de Bessel modificada In(x)',
        abstract: 'Retorna la funció de Bessel modificada In(x)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/besseli-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'El valor en què s\'avalua la funció.' },
            n: { name: 'N', detail: 'L\'ordre de la funció de Bessel. Si n no és un enter, es trunca.' },
        },
    },
    BESSELJ: {
        description: 'Retorna la funció de Bessel Jn(x)',
        abstract: 'Retorna la funció de Bessel Jn(x)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/besselj-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'El valor en què s\'avalua la funció.' },
            n: { name: 'N', detail: 'L\'ordre de la funció de Bessel. Si n no és un enter, es trunca.' },
        },
    },
    BESSELK: {
        description: 'Retorna la funció de Bessel modificada Kn(x)',
        abstract: 'Retorna la funció de Bessel modificada Kn(x)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/besselk-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'El valor en què s\'avalua la funció.' },
            n: { name: 'N', detail: 'L\'ordre de la funció de Bessel. Si n no és un enter, es trunca.' },
        },
    },
    BESSELY: {
        description: 'Retorna la funció de Bessel Yn(x)',
        abstract: 'Retorna la funció de Bessel Yn(x)',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/bessely-function',
            },
        ],
        functionParameter: {
            x: { name: 'X', detail: 'El valor en què s\'avalua la funció.' },
            n: { name: 'N', detail: 'L\'ordre de la funció de Bessel. Si n no és un enter, es trunca.' },
        },
    },
    BIN2DEC: {
        description: 'Converteix un nombre binari a decimal',
        abstract: 'Converteix un nombre binari a decimal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/bin2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre binari que voleu convertir.' },
        },
    },
    BIN2HEX: {
        description: 'Converteix un nombre binari a hexadecimal',
        abstract: 'Converteix un nombre binari a hexadecimal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/bin2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre binari que voleu convertir.' },
            places: { name: 'posicions', detail: 'El nombre de caràcters que es faran servir.' },
        },
    },
    BIN2OCT: {
        description: 'Converteix un nombre binari a octal',
        abstract: 'Converteix un nombre binari a octal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/bin2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre binari que voleu convertir.' },
            places: { name: 'posicions', detail: 'El nombre de caràcters que es faran servir.' },
        },
    },
    BITAND: {
        description: 'Retorna una "Y bit a bit" de dos nombres',
        abstract: 'Retorna una "Y bit a bit" de dos nombres',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/bitand-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Ha d\'estar en forma decimal i ser major o igual a 0.' },
            number2: { name: 'nombre2', detail: 'Ha d\'estar en forma decimal i ser major o igual a 0.' },
        },
    },
    BITLSHIFT: {
        description: 'Retorna un nombre de valor desplaçat a l\'esquerra per quantitat_desplaçament bits',
        abstract: 'Retorna un nombre de valor desplaçat a l\'esquerra per quantitat_desplaçament bits',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/bitlshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Nombre ha de ser un enter major o igual a 0.' },
            shiftAmount: { name: 'quantitat_desplaçament', detail: 'Quantitat_desplaçament ha de ser un enter.' },
        },
    },
    BITOR: {
        description: 'Retorna un O bit a bit de 2 nombres',
        abstract: 'Retorna un O bit a bit de 2 nombres',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/bitor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Ha d\'estar en forma decimal i ser major o igual a 0.' },
            number2: { name: 'nombre2', detail: 'Ha d\'estar en forma decimal i ser major o igual a 0.' },
        },
    },
    BITRSHIFT: {
        description: 'Retorna un nombre de valor desplaçat a la dreta per quantitat_desplaçament bits',
        abstract: 'Retorna un nombre de valor desplaçat a la dreta per quantitat_desplaçament bits',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/bitrshift-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'Nombre ha de ser un enter major o igual a 0.' },
            shiftAmount: { name: 'quantitat_desplaçament', detail: 'Quantitat_desplaçament ha de ser un enter.' },
        },
    },
    BITXOR: {
        description: 'Retorna un "O exclusiu" bit a bit de dos nombres',
        abstract: 'Retorna un "O exclusiu" bit a bit de dos nombres',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/bitxor-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'Ha d\'estar en forma decimal i ser major o igual a 0.' },
            number2: { name: 'nombre2', detail: 'Ha d\'estar en forma decimal i ser major o igual a 0.' },
        },
    },
    COMPLEX: {
        description: 'Converteix coeficients reals i imaginaris en un nombre complex',
        abstract: 'Converteix coeficients reals i imaginaris en un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/complex-function',
            },
        ],
        functionParameter: {
            realNum: { name: 'núm_real', detail: 'El coeficient real del nombre complex.' },
            iNum: { name: 'núm_i', detail: 'El coeficient imaginari del nombre complex.' },
            suffix: { name: 'sufix', detail: 'El sufix per al component imaginari del nombre complex. Si s\'omet, se suposa que el sufix és "i".' },
        },
    },
    CONVERT: {
        description: 'Converteix un nombre d\'un sistema de mesura a un altre',
        abstract: 'Converteix un nombre d\'un sistema de mesura a un altre',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/convert-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'és el valor en unitats_origen que es convertirà.' },
            fromUnit: { name: 'unitat_origen', detail: 'són les unitats de nombre.' },
            toUnit: { name: 'unitat_destí', detail: 'són les unitats per al resultat.' },
        },
    },
    DEC2BIN: {
        description: 'Converteix un nombre decimal a binari',
        abstract: 'Converteix un nombre decimal a binari',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/dec2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre decimal que voleu convertir.' },
            places: { name: 'posicions', detail: 'El nombre de caràcters que es faran servir.' },
        },
    },
    DEC2HEX: {
        description: 'Converteix un nombre decimal a hexadecimal',
        abstract: 'Converteix un nombre decimal a hexadecimal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/dec2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre decimal que voleu convertir.' },
            places: { name: 'posicions', detail: 'El nombre de caràcters que es faran servir.' },
        },
    },
    DEC2OCT: {
        description: 'Converteix un nombre decimal a octal',
        abstract: 'Converteix un nombre decimal a octal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/dec2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre decimal que voleu convertir.' },
            places: { name: 'posicions', detail: 'El nombre de caràcters que es faran servir.' },
        },
    },
    DELTA: {
        description: 'Comprova si dos valors són iguals',
        abstract: 'Comprova si dos valors són iguals',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/delta-function',
            },
        ],
        functionParameter: {
            number1: { name: 'nombre1', detail: 'El primer nombre.' },
            number2: { name: 'nombre2', detail: 'El segon nombre. Si s\'omet, se suposa que nombre2 és zero.' },
        },
    },
    ERF: {
        description: 'Retorna la funció d\'error',
        abstract: 'Retorna la funció d\'error',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/erf-function',
            },
        ],
        functionParameter: {
            lowerLimit: { name: 'límit_inferior', detail: 'El límit inferior per integrar ERF.' },
            upperLimit: { name: 'límit_superior', detail: 'El límit superior per integrar ERF. Si s\'omet, ERF integra entre zero i límit_inferior.' },
        },
    },
    ERF_PRECISE: {
        description: 'Retorna la funció d\'error',
        abstract: 'Retorna la funció d\'error',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/erf-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El límit inferior per integrar ERF.PRECÍS.' },
        },
    },
    ERFC: {
        description: 'Retorna la funció d\'error complementària',
        abstract: 'Retorna la funció d\'error complementària',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/erfc-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El límit inferior per integrar ERFC.' },
        },
    },
    ERFC_PRECISE: {
        description: 'Retorna la funció ERF complementària integrada entre x i infinit',
        abstract: 'Retorna la funció ERF complementària integrada entre x i infinit',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/erfc-precise-function',
            },
        ],
        functionParameter: {
            x: { name: 'x', detail: 'El límit inferior per integrar ERFC.PRECÍS.' },
        },
    },
    GESTEP: {
        description: 'Comprova si un nombre és major que un valor llindar',
        abstract: 'Comprova si un nombre és major que un valor llindar',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/gestep-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El valor que es provarà contra escaló.' },
            step: { name: 'escaló', detail: 'El valor llindar. Si ometeu un valor per escaló, GESTEP utilitza zero.' },
        },
    },
    HEX2BIN: {
        description: 'Converteix un nombre hexadecimal a binari',
        abstract: 'Converteix un nombre hexadecimal a binari',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/hex2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre hexadecimal que voleu convertir.' },
            places: { name: 'posicions', detail: 'El nombre de caràcters que es faran servir.' },
        },
    },
    HEX2DEC: {
        description: 'Converteix un nombre hexadecimal a decimal',
        abstract: 'Converteix un nombre hexadecimal a decimal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/hex2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre hexadecimal que voleu convertir.' },
        },
    },
    HEX2OCT: {
        description: 'Converteix un nombre hexadecimal a octal',
        abstract: 'Converteix un nombre hexadecimal a octal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/hex2oct-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre hexadecimal que voleu convertir.' },
            places: { name: 'posicions', detail: 'El nombre de caràcters que es faran servir.' },
        },
    },
    IMABS: {
        description: 'Retorna el valor absolut (mòdul) d\'un nombre complex',
        abstract: 'Retorna el valor absolut (mòdul) d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imabs-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el valor absolut.' },
        },
    },
    IMAGINARY: {
        description: 'Retorna el coeficient imaginari d\'un nombre complex',
        abstract: 'Retorna el coeficient imaginari d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imaginary-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el coeficient imaginari.' },
        },
    },
    IMARGUMENT: {
        description: 'Retorna l\'argument theta, un angle expressat en radians',
        abstract: 'Retorna l\'argument theta, un angle expressat en radians',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imargument-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir l\'argument theta.' },
        },
    },
    IMCONJUGATE: {
        description: 'Retorna el conjugat complex d\'un nombre complex',
        abstract: 'Retorna el conjugat complex d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imconjugate-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el conjugat.' },
        },
    },
    IMCOS: {
        description: 'Retorna el cosinus d\'un nombre complex',
        abstract: 'Retorna el cosinus d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imcos-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el cosinus.' },
        },
    },
    IMCOSH: {
        description: 'Retorna el cosinus hiperbòlic d\'un nombre complex',
        abstract: 'Retorna el cosinus hiperbòlic d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imcosh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el cosinus hiperbòlic.' },
        },
    },
    IMCOT: {
        description: 'Retorna la cotangent d\'un nombre complex',
        abstract: 'Retorna la cotangent d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imcot-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir la cotangent.' },
        },
    },
    IMCOTH: {
        description: 'La funció IMCOTH torna la cotangent hiperbòlica del nombre complex determinat. Per exemple, un nombre complex determinat "x+yi" torna "coth(x+yi)".',
        abstract: 'La funció IMCOTH torna la cotangent hiperbòlica del nombre complex determinat. Per exemple, un nombre complex determinat "x+yi" torna "coth(x+yi)".',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/9366256?hl=ca',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Nombre complex de què es vol calcular la cotangent hiperbòlica. Pot ser el resultat de la funció COMPLEX, un nombre real interpretat com a nombre complex amb parts imaginàries iguals a 0 o una cadena amb el format "x+yi" on "x" i "y" són valors numèrics.' },
        },
    },
    IMCSC: {
        description: 'Retorna la cosecant d\'un nombre complex',
        abstract: 'Retorna la cosecant d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imcsc-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir la cosecant.' },
        },
    },
    IMCSCH: {
        description: 'Retorna la cosecant hiperbòlica d\'un nombre complex',
        abstract: 'Retorna la cosecant hiperbòlica d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imcsch-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir la cosecant hiperbòlica.' },
        },
    },
    IMDIV: {
        description: 'Retorna el quocient de dos nombres complexos',
        abstract: 'Retorna el quocient de dos nombres complexos',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imdiv-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'núm_imaginari1', detail: 'El numerador o dividend complex.' },
            inumber2: { name: 'núm_imaginari2', detail: 'El denominador o divisor complex.' },
        },
    },
    IMEXP: {
        description: 'Retorna l\'exponencial d\'un nombre complex',
        abstract: 'Retorna l\'exponencial d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imexp-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir l\'exponencial.' },
        },
    },
    IMLN: {
        description: 'Retorna el logaritme natural d\'un nombre complex',
        abstract: 'Retorna el logaritme natural d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imln-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el logaritme natural.' },
        },
    },
    IMLOG: {
        description: 'La funció IMLOG torna el logaritme d\'un nombre complex amb una base especificada.',
        abstract: 'La funció IMLOG torna el logaritme d\'un nombre complex amb una base especificada.',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/9366486?hl=ca',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Valor d\'entrada de la funció logarítmica. El nombre es pot escriure sense format, per exemple, 1, per interpretar-lo com un nombre real. El nombre es pot escriure com a text citat per especificar tant el coeficient real com el complex.' },
            base: { name: 'base', detail: 'Base que cal utilitzar en calcular el logaritme. Ha de ser un nombre real positiu.' },
        },
    },
    IMLOG10: {
        description: 'Retorna el logaritme en base 10 d\'un nombre complex',
        abstract: 'Retorna el logaritme en base 10 d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imlog10-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el logaritme comú.' },
        },
    },
    IMLOG2: {
        description: 'Retorna el logaritme en base 2 d\'un nombre complex',
        abstract: 'Retorna el logaritme en base 2 d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imlog2-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el logaritme en base 2.' },
        },
    },
    IMPOWER: {
        description: 'Retorna un nombre complex elevat a una potència entera',
        abstract: 'Retorna un nombre complex elevat a una potència entera',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/impower-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex que voleu elevar a una potència.' },
            number: { name: 'nombre', detail: 'La potència a la qual voleu elevar el nombre complex.' },
        },
    },
    IMPRODUCT: {
        description: 'Retorna el producte de 1 a 255 nombres complexos',
        abstract: 'Retorna el producte de 1 a 255 nombres complexos',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/improduct-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'núm_imaginari1', detail: 'D\'1 a 255 nombres complexos per multiplicar.' },
            inumber2: { name: 'núm_imaginari2', detail: 'D\'1 a 255 nombres complexos per multiplicar.' },
        },
    },
    IMREAL: {
        description: 'Retorna el coeficient real d\'un nombre complex',
        abstract: 'Retorna el coeficient real d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imreal-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el coeficient real.' },
        },
    },
    IMSEC: {
        description: 'Retorna la secant d\'un nombre complex',
        abstract: 'Retorna la secant d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imsec-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir la secant.' },
        },
    },
    IMSECH: {
        description: 'Retorna la secant hiperbòlica d\'un nombre complex',
        abstract: 'Retorna la secant hiperbòlica d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imsech-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir la secant hiperbòlica.' },
        },
    },
    IMSIN: {
        description: 'Retorna el sinus d\'un nombre complex',
        abstract: 'Retorna el sinus d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imsin-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el sinus.' },
        },
    },
    IMSINH: {
        description: 'Retorna el sinus hiperbòlic d\'un nombre complex',
        abstract: 'Retorna el sinus hiperbòlic d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imsinh-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el sinus hiperbòlic.' },
        },
    },
    IMSQRT: {
        description: 'Retorna l\'arrel quadrada d\'un nombre complex',
        abstract: 'Retorna l\'arrel quadrada d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imsqrt-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir l\'arrel quadrada.' },
        },
    },
    IMSUB: {
        description: 'Retorna la diferència entre dos nombres complexos',
        abstract: 'Retorna la diferència entre dos nombres complexos',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imsub-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'núm_imaginari1', detail: 'núm_imaginari1.' },
            inumber2: { name: 'núm_imaginari2', detail: 'núm_imaginari2.' },
        },
    },
    IMSUM: {
        description: 'Retorna la suma de nombres complexos',
        abstract: 'Retorna la suma de nombres complexos',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imsum-function',
            },
        ],
        functionParameter: {
            inumber1: { name: 'núm_imaginari1', detail: 'D\'1 a 255 nombres complexos per sumar.' },
            inumber2: { name: 'núm_imaginari2', detail: 'D\'1 a 255 nombres complexos per sumar.' },
        },
    },
    IMTAN: {
        description: 'Retorna la tangent d\'un nombre complex',
        abstract: 'Retorna la tangent d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/imtan-function',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir la tangent.' },
        },
    },
    IMTANH: {
        description: 'La funció IMTANH torna la tangent hiperbòlica del nombre complex determinat. Per exemple, un nombre complex determinat "x+yi" torna "tanh(x+yi)".',
        abstract: 'La funció IMTANH torna la tangent hiperbòlica del nombre complex determinat. Per exemple, un nombre complex determinat "x+yi" torna "tanh(x+yi)".',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/9366655?hl=ca',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'El nombre complex per al qual es vol calcular la tangent hiperbòlica. Pot ser el resultat de la funció COMPLEX, un nombre real interpretat com a nombre complex amb parts imaginàries iguals a 0 o una cadena amb el format "x+yi" on x i y són valors numèrics.' },
        },
    },
    OCT2BIN: {
        description: 'Converteix un nombre octal a binari',
        abstract: 'Converteix un nombre octal a binari',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/oct2bin-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre octal que voleu convertir.' },
            places: { name: 'posicions', detail: 'El nombre de caràcters que es faran servir.' },
        },
    },
    OCT2DEC: {
        description: 'Converteix un nombre octal a decimal',
        abstract: 'Converteix un nombre octal a decimal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/oct2dec-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre octal que voleu convertir.' },
        },
    },
    OCT2HEX: {
        description: 'Converteix un nombre octal a hexadecimal',
        abstract: 'Converteix un nombre octal a hexadecimal',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/ca-es/excel/functions/oct2hex-function',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre octal que voleu convertir.' },
            places: { name: 'posicions', detail: 'El nombre de caràcters que es faran servir.' },
        },
    },
};

export default locale;
