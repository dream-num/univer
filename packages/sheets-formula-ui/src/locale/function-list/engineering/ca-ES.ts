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
                url: 'https://support.microsoft.com/en-us/office/besseli-function-8d33855c-9a8d-444b-98e0-852267b1c0df',
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
                url: 'https://support.microsoft.com/en-us/office/besselj-function-839cb181-48de-408b-9d80-bd02982d94f7',
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
                url: 'https://support.microsoft.com/en-us/office/besselk-function-606d11bc-06d3-4d53-9ecb-2803e2b90b70',
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
                url: 'https://support.microsoft.com/en-us/office/bessely-function-f3a356b3-da89-42c3-8974-2da54d6353a2',
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
                url: 'https://support.microsoft.com/en-us/office/bin2dec-function-63905b57-b3a0-453d-99f4-647bb519cd6c',
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
                url: 'https://support.microsoft.com/en-us/office/bin2hex-function-0375e507-f5e5-4077-9af8-28d84f9f41cc',
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
                url: 'https://support.microsoft.com/en-us/office/bin2oct-function-0a4e01ba-ac8d-4158-9b29-16c25c4c23fd',
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
                url: 'https://support.microsoft.com/en-us/office/bitand-function-8a2be3d7-91c3-4b48-9517-64548008563a',
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
                url: 'https://support.microsoft.com/en-us/office/bitlshift-function-c55bb27e-cacd-4c7c-b258-d80861a03c9c',
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
                url: 'https://support.microsoft.com/en-us/office/bitor-function-f6ead5c8-5b98-4c9e-9053-8ad5234919b2',
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
                url: 'https://support.microsoft.com/en-us/office/bitrshift-function-274d6996-f42c-4743-abdb-4ff95351222c',
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
                url: 'https://support.microsoft.com/en-us/office/bitxor-function-c81306a1-03f9-4e89-85ac-b86c3cba10e4',
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
                url: 'https://support.microsoft.com/en-us/office/complex-function-f0b8f3a9-51cc-4d6d-86fb-3a9362fa4128',
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
                url: 'https://support.microsoft.com/en-us/office/convert-function-d785bef1-808e-4aac-bdcd-666c810f9af2',
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
                url: 'https://support.microsoft.com/en-us/office/dec2bin-function-0f63dd0e-5d1a-42d8-b511-5bf5c6d43838',
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
                url: 'https://support.microsoft.com/en-us/office/dec2hex-function-6344ee8b-b6b5-4c6a-a672-f64666704619',
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
                url: 'https://support.microsoft.com/en-us/office/dec2oct-function-c9d835ca-20b7-40c4-8a9e-d3be351ce00f',
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
                url: 'https://support.microsoft.com/en-us/office/delta-function-2f763672-c959-4e07-ac33-fe03220ba432',
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
                url: 'https://support.microsoft.com/en-us/office/erf-function-c53c7e7b-5482-4b6c-883e-56df3c9af349',
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
                url: 'https://support.microsoft.com/en-us/office/erf-precise-function-9a349593-705c-4278-9a98-e4122831a8e0',
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
                url: 'https://support.microsoft.com/en-us/office/erfc-function-736e0318-70ba-4e8b-8d08-461fe68b71b3',
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
                url: 'https://support.microsoft.com/en-us/office/erfc-precise-function-e90e6bab-f45e-45df-b2ac-cd2eb4d4a273',
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
                url: 'https://support.microsoft.com/en-us/office/gestep-function-f37e7d2a-41da-4129-be95-640883fca9df',
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
                url: 'https://support.microsoft.com/en-us/office/hex2bin-function-a13aafaa-5737-4920-8424-643e581828c1',
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
                url: 'https://support.microsoft.com/en-us/office/hex2dec-function-8c8c3155-9f37-45a5-a3ee-ee5379ef106e',
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
                url: 'https://support.microsoft.com/en-us/office/hex2oct-function-54d52808-5d19-4bd0-8a63-1096a5d11912',
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
                url: 'https://support.microsoft.com/en-us/office/imabs-function-b31e73c6-d90c-4062-90bc-8eb351d765a1',
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
                url: 'https://support.microsoft.com/en-us/office/imaginary-function-dd5952fd-473d-44d9-95a1-9a17b23e428a',
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
                url: 'https://support.microsoft.com/en-us/office/imargument-function-eed37ec1-23b3-4f59-b9f3-d340358a034a',
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
                url: 'https://support.microsoft.com/en-us/office/imconjugate-function-2e2fc1ea-f32b-4f9b-9de6-233853bafd42',
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
                url: 'https://support.microsoft.com/en-us/office/imcos-function-dad75277-f592-4a6b-ad6c-be93a808a53c',
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
                url: 'https://support.microsoft.com/en-us/office/imcosh-function-053e4ddb-4122-458b-be9a-457c405e90ff',
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
                url: 'https://support.microsoft.com/en-us/office/imcot-function-dc6a3607-d26a-4d06-8b41-8931da36442c',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir la cotangent.' },
        },
    },
    IMCOTH: {
        description: 'Retorna la cotangent hiperbòlica d\'un nombre complex',
        abstract: 'Retorna la cotangent hiperbòlica d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/9366256?hl=en&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir la cotangent hiperbòlica.' },
        },
    },
    IMCSC: {
        description: 'Retorna la cosecant d\'un nombre complex',
        abstract: 'Retorna la cosecant d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/imcsc-function-9e158d8f-2ddf-46cd-9b1d-98e29904a323',
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
                url: 'https://support.microsoft.com/en-us/office/imcsch-function-c0ae4f54-5f09-4fef-8da0-dc33ea2c5ca9',
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
                url: 'https://support.microsoft.com/en-us/office/imdiv-function-a505aff7-af8a-4451-8142-77ec3d74d83f',
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
                url: 'https://support.microsoft.com/en-us/office/imexp-function-c6f8da1f-e024-4c0c-b802-a60e7147a95f',
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
                url: 'https://support.microsoft.com/en-us/office/imln-function-32b98bcf-8b81-437c-a636-6fb3aad509d8',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir el logaritme natural.' },
        },
    },
    IMLOG: {
        description: 'Retorna el logaritme d\'un nombre complex per a una base especificada',
        abstract: 'Retorna el logaritme d\'un nombre complex per a una base especificada',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/9366486?hl=zh-Hans&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex el logaritme del qual a una base específica s\'ha de calcular.' },
            base: { name: 'base', detail: 'La base que es fa servir en calcular el logaritme.' },
        },
    },
    IMLOG10: {
        description: 'Retorna el logaritme en base 10 d\'un nombre complex',
        abstract: 'Retorna el logaritme en base 10 d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/imlog10-function-58200fca-e2a2-4271-8a98-ccd4360213a5',
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
                url: 'https://support.microsoft.com/en-us/office/imlog2-function-152e13b4-bc79-486c-a243-e6a676878c51',
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
                url: 'https://support.microsoft.com/en-us/office/impower-function-210fd2f5-f8ff-4c6a-9d60-30e34fbdef39',
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
                url: 'https://support.microsoft.com/en-us/office/improduct-function-2fb8651a-a4f2-444f-975e-8ba7aab3a5ba',
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
                url: 'https://support.microsoft.com/en-us/office/imreal-function-d12bc4c0-25d0-4bb3-a25f-ece1938bf366',
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
                url: 'https://support.microsoft.com/en-us/office/imsec-function-6df11132-4411-4df4-a3dc-1f17372459e0',
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
                url: 'https://support.microsoft.com/en-us/office/imsech-function-f250304f-788b-4505-954e-eb01fa50903b',
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
                url: 'https://support.microsoft.com/en-us/office/imsin-function-1ab02a39-a721-48de-82ef-f52bf37859f6',
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
                url: 'https://support.microsoft.com/en-us/office/imsinh-function-dfb9ec9e-8783-4985-8c42-b028e9e8da3d',
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
                url: 'https://support.microsoft.com/en-us/office/imsqrt-function-e1753f80-ba11-4664-a10e-e17368396b70',
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
                url: 'https://support.microsoft.com/en-us/office/imsub-function-2e404b4d-4935-4e85-9f52-cb08b9a45054',
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
                url: 'https://support.microsoft.com/en-us/office/imsum-function-81542999-5f1c-4da6-9ffe-f1d7aaa9457f',
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
                url: 'https://support.microsoft.com/en-us/office/imtan-function-8478f45d-610a-43cf-8544-9fc0b553a132',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir la tangent.' },
        },
    },
    IMTANH: {
        description: 'Retorna la tangent hiperbòlica d\'un nombre complex',
        abstract: 'Retorna la tangent hiperbòlica d\'un nombre complex',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.google.com/docs/answer/9366655?hl=en&sjid=1719420110567985051-AP',
            },
        ],
        functionParameter: {
            inumber: { name: 'núm_imaginari', detail: 'Un nombre complex del qual voleu obtenir la tangent hiperbòlica.' },
        },
    },
    OCT2BIN: {
        description: 'Converteix un nombre octal a binari',
        abstract: 'Converteix un nombre octal a binari',
        links: [
            {
                title: 'Instruccions',
                url: 'https://support.microsoft.com/en-us/office/oct2bin-function-55383471-3c56-4d27-9522-1a8ec646c589',
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
                url: 'https://support.microsoft.com/en-us/office/oct2dec-function-87606014-cb98-44b2-8dbb-e48f8ced1554',
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
                url: 'https://support.microsoft.com/en-us/office/oct2hex-function-912175b4-d497-41b4-a029-221f051b858f',
            },
        ],
        functionParameter: {
            number: { name: 'nombre', detail: 'El nombre octal que voleu convertir.' },
            places: { name: 'posicions', detail: 'El nombre de caràcters que es faran servir.' },
        },
    },
};

export default locale;
