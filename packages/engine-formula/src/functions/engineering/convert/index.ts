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

import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';

type IUnitItem = Array<string | Array<string> | number | boolean | null>;

interface IFrom {
    _from: IUnitItem | null;
}

interface ITo {
    _to: IUnitItem | null;
}

interface IFromMultiplier extends IFrom {
    _fromMultiplier: number;
}

interface IToMultiplier extends ITo {
    _toMultiplier: number;
}

interface IPrefixesKey {
    [index: string]: Array<string | number>;
}

export class Convert extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(number: BaseValueObject, fromUnit: BaseValueObject, toUnit: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(number, fromUnit, toUnit);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numberObject, fromUnitObject, toUnitObject] = variants as BaseValueObject[];

        const numberValue = +numberObject.getValue();
        const fromUnitValue = `${fromUnitObject.getValue()}`;
        const toUnitValue = `${toUnitObject.getValue()}`;

        if (Number.isNaN(numberValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        // Initialize units and multipliers
        let from: IUnitItem | null;
        let fromMultiplier = 1;

        let to: IUnitItem | null;
        let toMultiplier = 1;

        // Lookup from and to units
        const { _from, _to } = this._lookupFromAndToUnits(fromUnitValue, toUnitValue);

        from = _from;
        to = _to;

        // Lookup from prefix
        if (from === null) {
            const { _from, _fromMultiplier } = this._lookupFromPrefix(fromUnitValue);
            from = _from;
            fromMultiplier = _fromMultiplier;
        }

        // Lookup to prefix
        if (to === null) {
            const { _to, _toMultiplier } = this._lookupToPrefix(toUnitValue);
            to = _to;
            toMultiplier = _toMultiplier;
        }

        // Return error if a unit does not exist
        if (from === null || to === null) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        // Return error if units represent different quantities
        if (from[3] !== to[3]) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        let result;

        if (from[3] === 'temperature') {
            result = this._getTemperatureConversion(numberValue, from[1] as string, to[1] as string);
            result = +result.toFixed(2);
        } else {
            result = (numberValue * (from[6] as number) * fromMultiplier) / ((to[6] as number) * toMultiplier);
        }

        return NumberValueObject.create(result);
    }

    private _lookupFromAndToUnits(fromUnitValue: string, toUnitValue: string): IFrom & ITo {
        let _from = null;
        let _to = null;
        let alt;

        for (let i = 0; i < this._units.length; i++) {
            alt = this._units[i][2] === null ? [] : this._units[i][2];

            if (this._units[i][1] === fromUnitValue || (alt as Array<string>).indexOf(fromUnitValue) >= 0) {
                _from = this._units[i];
            }

            if (this._units[i][1] === toUnitValue || (alt as Array<string>).indexOf(toUnitValue) >= 0) {
                _to = this._units[i];
            }
        }

        return {
            _from,
            _to,
        };
    }

    private _lookupFromPrefix(fromUnitValue: string): IFromMultiplier {
        let _from = null;
        let _fromMultiplier = 1;
        let baseFromUnit = fromUnitValue;
        let alt;

        const fromBinaryPrefix = this._binaryPrefixes[fromUnitValue.substring(0, 2)];
        let fromUnitPrefix = this._unitPrefixes[fromUnitValue.substring(0, 1)];

        // Handle dekao unit prefix (only unit prefix with two characters)
        if (fromUnitValue.substring(0, 2) === 'da') {
            fromUnitPrefix = ['dekao', 1e1, 'da'];
        }

        // Handle binary prefixes first (so that 'Yi' is processed before 'Y')
        if (fromBinaryPrefix) {
            _fromMultiplier = fromBinaryPrefix[2] as number;
            baseFromUnit = fromUnitValue.substring(2);
        } else if (fromUnitPrefix) {
            _fromMultiplier = fromUnitPrefix[1] as number;
            baseFromUnit = fromUnitValue.substring((fromUnitPrefix[2] as string).length);
        }

        // Lookup from unit
        for (let j = 0; j < this._units.length; j++) {
            alt = this._units[j][2] === null ? [] : this._units[j][2];

            if (this._units[j][1] === baseFromUnit || (alt as Array<string>).indexOf(baseFromUnit) >= 0) {
                _from = this._units[j];
            }
        }

        return {
            _from,
            _fromMultiplier,
        };
    }

    private _lookupToPrefix(toUnitValue: string): IToMultiplier {
        let _to = null;
        let _toMultiplier = 1;
        let baseToUnit = toUnitValue;
        let alt;

        const toBinaryPrefix = this._binaryPrefixes[toUnitValue.substring(0, 2)];
        let toUnitPrefix = this._unitPrefixes[toUnitValue.substring(0, 1)];

        // Handle dekao unit prefix (only unit prefix with two characters)
        if (toUnitValue.substring(0, 2) === 'da') {
            toUnitPrefix = ['dekao', 1e1, 'da'];
        }

        // Handle binary prefixes first (so that 'Yi' is processed before 'Y')
        if (toBinaryPrefix) {
            _toMultiplier = toBinaryPrefix[2] as number;
            baseToUnit = toUnitValue.substring(2);
        } else if (toUnitPrefix) {
            _toMultiplier = toUnitPrefix[1] as number;
            baseToUnit = toUnitValue.substring((toUnitPrefix[2] as string).length);
        }

        // Lookup to unit
        for (let k = 0; k < this._units.length; k++) {
            alt = this._units[k][2] === null ? [] : this._units[k][2];

            if (this._units[k][1] === baseToUnit || (alt as Array<string>).indexOf(baseToUnit) >= 0) {
                _to = this._units[k];
            }
        }

        return {
            _to,
            _toMultiplier,
        };
    }

    private _getTemperatureConversion(number: number, from: string, to: string): number {
        switch (from) {
            case 'C':
                return this._centigradeConversion(number, to);
            case 'F':
                return this._fahrenheitConversion(number, to);
            case 'K':
                return this._kelvinConversion(number, to);
            case 'Rank':
                return this._rankineConversion(number, to);
            case 'Reau':
                return this._reaumurConversion(number, to);
            default:
                return number;
        }
    }

    private _centigradeConversion(number: number, to: string): number {
        switch (to) {
            case 'F':
                return (number * 9 / 5) + 32;
            case 'K':
                return number + 273.15;
            case 'Rank':
                return (number + 273.15) * 9 / 5;
            case 'Reau':
                return number * 4 / 5;
            default:
                return number;
        }
    }

    private _fahrenheitConversion(number: number, to: string): number {
        switch (to) {
            case 'C':
                return (number - 32) * 5 / 9;
            case 'K':
                return (number - 32) * 5 / 9 + 273.15;
            case 'Rank':
                return number + 459.67;
            case 'Reau':
                return (number - 32) * 4 / 9;
            default:
                return number;
        }
    }

    private _kelvinConversion(number: number, to: string): number {
        switch (to) {
            case 'C':
                return number - 273.15;
            case 'F':
                return (number - 273.15) * 9 / 5 + 32;
            case 'Rank':
                return number * 9 / 5;
            case 'Reau':
                return (number - 273.15) * 4 / 5;
            default:
                return number;
        }
    }

    private _rankineConversion(number: number, to: string): number {
        switch (to) {
            case 'C':
                return (number - 491.67) * 5 / 9;
            case 'F':
                return number - 459.67;
            case 'K':
                return number * 5 / 9;
            case 'Reau':
                return (number - 491.67) * 4 / 9;
            default:
                return number;
        }
    }

    private _reaumurConversion(number: number, to: string): number {
        switch (to) {
            case 'C':
                return number * 5 / 4;
            case 'F':
                return (number * 9 / 4) + 32;
            case 'K':
                return (number * 5 / 4) + 273.15;
            case 'Rank':
                return (number * 9 / 4) + 491.67;
            default:
                return number;
        }
    }

    // List of units supported by CONVERT and units defined by the International System of Units
    // [Name, Symbol, Alternate symbols, Quantity, ISU, CONVERT, Conversion ratio]
    private _units: Array<IUnitItem> = [
        ['a.u. of action', '?', null, 'action', false, false, 1.05457168181818e-34],
        ['a.u. of charge', 'e', null, 'electric_charge', false, false, 1.60217653141414e-19],
        ['a.u. of energy', 'Eh', null, 'energy', false, false, 4.35974417757576e-18],
        ['a.u. of length', 'a?', null, 'length', false, false, 5.29177210818182e-11],
        ['a.u. of mass', 'm?', null, 'mass', false, false, 9.10938261616162e-31],
        ['a.u. of time', '?/Eh', null, 'time', false, false, 2.41888432650516e-17],
        ['admiralty knot', 'admkn', null, 'speed', false, true, 0.514773333],
        ['ampere', 'A', null, 'electric_current', true, false, 1],
        ['ampere per meter', 'A/m', null, 'magnetic_field_intensity', true, false, 1],
        ['ångström', 'Å', ['ang'], 'length', false, true, 1e-10],
        ['are', 'ar', null, 'area', false, true, 100],
        ['astronomical unit', 'ua', null, 'length', false, false, 1.49597870691667e-11],
        ['bar', 'bar', null, 'pressure', false, false, 100000],
        ['barn', 'b', null, 'area', false, false, 1e-28],
        ['becquerel', 'Bq', null, 'radioactivity', true, false, 1],
        ['bit', 'bit', ['b'], 'information', false, true, 1],
        ['btu', 'BTU', ['btu'], 'energy', false, true, 1055.05585262],
        ['byte', 'byte', null, 'information', false, true, 8],
        ['candela', 'cd', null, 'luminous_intensity', true, false, 1],
        ['candela per square metre', 'cd/m?', null, 'luminance', true, false, 1],
        ['centigrade', 'C', ['cel'], 'temperature', true, false, 1],
        ['cubic ångström', 'ang3', ['ang^3'], 'volume', false, true, 1e-30],
        ['cubic foot', 'ft3', ['ft^3'], 'volume', false, true, 0.028316846592],
        ['cubic inch', 'in3', ['in^3'], 'volume', false, true, 0.000016387064],
        ['cubic light-year', 'ly3', ['ly^3'], 'volume', false, true, 8.46786664623715e-47],
        ['cubic metre', 'm3', ['m^3'], 'volume', true, true, 1],
        ['cubic mile', 'mi3', ['mi^3'], 'volume', false, true, 4168181825.44058],
        ['cubic nautical mile', 'Nmi3', ['Nmi^3'], 'volume', false, true, 6352182208],
        ['cubic Pica', 'Pica3', ['Picapt3', 'Pica^3', 'Picapt^3'], 'volume', false, true, 7.58660370370369e-8],
        ['cubic yard', 'yd3', ['yd^3'], 'volume', false, true, 0.764554857984],
        ['cup', 'cup', null, 'volume', false, true, 0.0002365882365],
        ['dalton', 'Da', ['u'], 'mass', false, false, 1.66053886282828e-27],
        ['day', 'd', ['day'], 'time', false, true, 86400],
        ['degree', '°', null, 'angle', false, false, 0.0174532925199433],
        ['dyne', 'dyn', ['dy'], 'force', false, true, 0.00001],
        ['electronvolt', 'eV', ['ev'], 'energy', false, true, 1.60217656514141],
        ['ell', 'ell', null, 'length', false, true, 1.143],
        ['erg', 'erg', ['e'], 'energy', false, true, 1e-7],
        ['fahrenheit', 'F', ['fah'], 'temperature', true, false, 1],
        ['fluid ounce', 'oz', null, 'volume', false, true, 0.0000295735295625],
        ['foot', 'ft', null, 'length', false, true, 0.3048],
        ['foot-pound', 'flb', null, 'energy', false, true, 1.3558179483314],
        ['gal', 'Gal', null, 'acceleration', false, false, 0.01],
        ['gallon', 'gal', null, 'volume', false, true, 0.003785411784],
        ['gauss', 'G', ['ga'], 'magnetic_flux_density', false, true, 1],
        ['grain', 'grain', null, 'mass', false, true, 0.0000647989],
        ['gram', 'g', null, 'mass', false, true, 0.001],
        ['gray', 'Gy', null, 'absorbed_dose', true, false, 1],
        ['gross registered ton', 'GRT', ['regton'], 'volume', false, true, 2.8316846592],
        ['hectare', 'ha', null, 'area', false, true, 10000],
        ['henry', 'H', null, 'inductance', true, false, 1],
        ['hertz', 'Hz', null, 'frequency', true, false, 1],
        ['horsepower', 'HP', ['h'], 'power', false, true, 745.69987158227],
        ['horsepower-hour', 'HPh', ['hh', 'hph'], 'energy', false, true, 2684519.538],
        ['hour', 'h', ['hr'], 'time', false, true, 3600],
        ['imperial gallon (U.K.)', 'uk_gal', null, 'volume', false, true, 0.00454609],
        ['imperial hundredweight', 'lcwt', ['uk_cwt', 'hweight'], 'mass', false, true, 50.802345],
        ['imperial quart (U.K)', 'uk_qt', null, 'volume', false, true, 0.0011365225],
        ['imperial ton', 'brton', ['uk_ton', 'LTON'], 'mass', false, true, 1016.046909],
        ['inch', 'in', null, 'length', false, true, 0.0254],
        ['international acre', 'uk_acre', null, 'area', false, true, 4046.8564224],
        ['IT calorie', 'cal', null, 'energy', false, true, 4.1868],
        ['joule', 'J', null, 'energy', true, true, 1],
        ['katal', 'kat', null, 'catalytic_activity', true, false, 1],
        ['kelvin', 'K', ['kel'], 'temperature', true, true, 1],
        ['kilogram', 'kg', null, 'mass', true, true, 1],
        ['knot', 'kn', null, 'speed', false, true, 0.514444444444444],
        ['light-year', 'ly', null, 'length', false, true, 9460730472580800],
        ['litre', 'L', ['l', 'lt'], 'volume', false, true, 0.001],
        ['lumen', 'lm', null, 'luminous_flux', true, false, 1],
        ['lux', 'lx', null, 'illuminance', true, false, 1],
        ['maxwell', 'Mx', null, 'magnetic_flux', false, false, 1e-18],
        ['measurement ton', 'MTON', null, 'volume', false, true, 1.13267386368],
        ['meter per hour', 'm/h', ['m/hr'], 'speed', false, true, 0.00027777777777778],
        ['meter per second', 'm/s', ['m/sec'], 'speed', true, true, 1],
        ['meter per second squared', 'm?s??', null, 'acceleration', true, false, 1],
        ['parsec', 'pc', ['parsec'], 'length', false, true, 30856775814671900],
        ['meter squared per second', 'm?/s', null, 'kinematic_viscosity', true, false, 1],
        ['metre', 'm', null, 'length', true, true, 1],
        ['miles per hour', 'mph', null, 'speed', false, true, 0.44704],
        ['millimetre of mercury', 'mmHg', null, 'pressure', false, false, 133.322],
        ['minute', '?', null, 'angle', false, false, 0.000290888208665722],
        ['minute', 'min', ['mn'], 'time', false, true, 60],
        ['modern teaspoon', 'tspm', null, 'volume', false, true, 0.000005],
        ['mole', 'mol', null, 'amount_of_substance', true, false, 1],
        ['morgen', 'Morgen', null, 'area', false, true, 2500],
        ['n.u. of action', '?', null, 'action', false, false, 1.05457168181818e-34],
        ['n.u. of mass', 'm?', null, 'mass', false, false, 9.10938261616162e-31],
        ['n.u. of speed', 'c?', null, 'speed', false, false, 299792458],
        ['n.u. of time', '?/(me?c??)', null, 'time', false, false, 1.28808866778687e-21],
        ['nautical mile', 'M', ['Nmi'], 'length', false, true, 1852],
        ['newton', 'N', null, 'force', true, true, 1],
        ['œrsted', 'Oe ', null, 'magnetic_field_intensity', false, false, 79.5774715459477],
        ['ohm', 'Ω', null, 'electric_resistance', true, false, 1],
        ['ounce mass', 'ozm', null, 'mass', false, true, 0.028349523125],
        ['pascal', 'Pa', null, 'pressure', true, false, 1],
        ['pascal second', 'Pa?s', null, 'dynamic_viscosity', true, false, 1],
        ['pferdestärke', 'PS', null, 'power', false, true, 735.49875],
        ['phot', 'ph', null, 'illuminance', false, false, 0.0001],
        ['pica (1/6 inch)', 'pica', null, 'length', false, true, 0.00035277777777778],
        ['pica (1/72 inch)', 'Pica', ['Picapt'], 'length', false, true, 0.00423333333333333],
        ['poise', 'P', null, 'dynamic_viscosity', false, false, 0.1],
        ['pond', 'pond', null, 'force', false, true, 0.00980665],
        ['pound force', 'lbf', null, 'force', false, true, 4.4482216152605],
        ['pound mass', 'lbm', null, 'mass', false, true, 0.45359237],
        ['quart', 'qt', null, 'volume', false, true, 0.000946352946],
        ['radian', 'rad', null, 'angle', true, false, 1],
        ['rankine', 'Rank', null, 'temperature', false, true, 1],
        ['reaumur', 'Reau', null, 'temperature', false, true, 1],
        ['second', '?', null, 'angle', false, false, 0.00000484813681109536],
        ['second', 's', ['sec'], 'time', true, true, 1],
        ['short hundredweight', 'cwt', ['shweight'], 'mass', false, true, 45.359237],
        ['siemens', 'S', null, 'electrical_conductance', true, false, 1],
        ['sievert', 'Sv', null, 'equivalent_dose', true, false, 1],
        ['slug', 'sg', null, 'mass', false, true, 14.59390294],
        ['square ångström', 'ang2', ['ang^2'], 'area', false, true, 1e-20],
        ['square foot', 'ft2', ['ft^2'], 'area', false, true, 0.09290304],
        ['square inch', 'in2', ['in^2'], 'area', false, true, 0.00064516],
        ['square light-year', 'ly2', ['ly^2'], 'area', false, true, 8.95054210748189e31],
        ['square meter', 'm?', null, 'area', true, true, 1],
        ['square mile', 'mi2', ['mi^2'], 'area', false, true, 2589988.110336],
        ['square nautical mile', 'Nmi2', ['Nmi^2'], 'area', false, true, 3429904],
        ['square Pica', 'Pica2', ['Picapt2', 'Pica^2', 'Picapt^2'], 'area', false, true, 0.00001792111111111],
        ['square yard', 'yd2', ['yd^2'], 'area', false, true, 0.83612736],
        ['statute mile', 'mi', null, 'length', false, true, 1609.344],
        ['steradian', 'sr', null, 'solid_angle', true, false, 1],
        ['stilb', 'sb', null, 'luminance', false, false, 0.0001],
        ['stokes', 'St', null, 'kinematic_viscosity', false, false, 0.0001],
        ['stone', 'stone', null, 'mass', false, true, 6.35029318],
        ['tablespoon', 'tbs', null, 'volume', false, true, 0.0000147868],
        ['teaspoon', 'tsp', null, 'volume', false, true, 0.00000492892],
        ['tesla', 'T', null, 'magnetic_flux_density', true, true, 1],
        ['thermodynamic calorie', 'c', null, 'energy', false, true, 4.184],
        ['ton', 'ton', null, 'mass', false, true, 907.18474],
        ['tonne', 't', null, 'mass', false, false, 1000],
        ['U.K. pint', 'uk_pt', null, 'volume', false, true, 0.00056826125],
        ['U.S. bushel', 'bushel', null, 'volume', false, true, 0.03523907],
        ['U.S. oil barrel', 'barrel', null, 'volume', false, true, 0.158987295],
        ['U.S. pint', 'pt', ['us_pt'], 'volume', false, true, 0.000473176473],
        ['U.S. survey mile', 'survey_mi', null, 'length', false, true, 1609.347219],
        ['U.S. survey/statute acre', 'us_acre', null, 'area', false, true, 4046.87261],
        ['volt', 'V', null, 'voltage', true, false, 1],
        ['watt', 'W', null, 'power', true, true, 1],
        ['watt-hour', 'Wh', ['wh'], 'energy', false, true, 3600],
        ['weber', 'Wb', null, 'magnetic_flux', true, false, 1],
        ['yard', 'yd', null, 'length', false, true, 0.9144],
        ['year', 'yr', null, 'time', false, true, 31557600],
    ];

    // Binary prefixes
    // [Name, Prefix power of 2 value, Previx value, Abbreviation, Derived from]
    private _binaryPrefixes: IPrefixesKey = {
        Yi: ['yobi', 80, 1208925819614629174706176, 'Yi', 'yotta'],
        Zi: ['zebi', 70, 1180591620717411303424, 'Zi', 'zetta'],
        Ei: ['exbi', 60, 1152921504606846976, 'Ei', 'exa'],
        Pi: ['pebi', 50, 1125899906842624, 'Pi', 'peta'],
        Ti: ['tebi', 40, 1099511627776, 'Ti', 'tera'],
        Gi: ['gibi', 30, 1073741824, 'Gi', 'giga'],
        Mi: ['mebi', 20, 1048576, 'Mi', 'mega'],
        ki: ['kibi', 10, 1024, 'ki', 'kilo'],
    };

    // Unit prefixes
    // [Name, Multiplier, Abbreviation]
    private _unitPrefixes: IPrefixesKey = {
        Y: ['yotta', 1e24, 'Y'],
        Z: ['zetta', 1e21, 'Z'],
        E: ['exa', 1e18, 'E'],
        P: ['peta', 1e15, 'P'],
        T: ['tera', 1e12, 'T'],
        G: ['giga', 1e9, 'G'],
        M: ['mega', 1e6, 'M'],
        k: ['kilo', 1e3, 'k'],
        h: ['hecto', 1e2, 'h'],
        e: ['dekao', 1e1, 'e'],
        d: ['deci', 1e-1, 'd'],
        c: ['centi', 1e-2, 'c'],
        m: ['milli', 1e-3, 'm'],
        u: ['micro', 1e-6, 'u'],
        n: ['nano', 1e-9, 'n'],
        p: ['pico', 1e-12, 'p'],
        f: ['femto', 1e-15, 'f'],
        a: ['atto', 1e-18, 'a'],
        z: ['zepto', 1e-21, 'z'],
        y: ['yocto', 1e-24, 'y'],
    };
}
