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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

type Unit = [symbol: string, aliases: string[], quantity: string, factor: number, metricPower: number];

// Each quantity uses a common base unit. Square and cubic units raise metric prefixes to their dimension.
const units: Unit[] = [
    ['g', [], 'mass', 1.0, 1],
    ['sg', [], 'mass', 14593.902937206363, 0],
    ['lbm', [], 'mass', 453.59237, 0],
    ['u', [], 'mass', 1.660538782e-24, 1],
    ['ozm', [], 'mass', 28.349523125, 0],
    ['grain', [], 'mass', 0.06479891, 0],
    ['cwt', ['shweight'], 'mass', 45359.237, 0],
    ['uk_cwt', ['lcwt', 'hweight'], 'mass', 50802.34544, 0],
    ['stone', [], 'mass', 6350.29318, 0],
    ['ton', [], 'mass', 907184.74, 0],
    ['uk_ton', ['LTON', 'brton'], 'mass', 1016046.9088, 0],
    ['m', [], 'length', 1.0, 1],
    ['mi', [], 'length', 1609.344, 0],
    ['Nmi', [], 'length', 1852.0, 0],
    ['in', [], 'length', 0.0254, 0],
    ['ft', [], 'length', 0.3048, 0],
    ['yd', [], 'length', 0.9144, 0],
    ['ang', [], 'length', 1e-10, 1],
    ['ell', [], 'length', 1.143, 0],
    ['ly', [], 'length', 9460730472580800.0, 1],
    ['parsec', ['pc'], 'length', 3.0856775812815532e+16, 1],
    ['Picapt', ['Pica'], 'length', 0.0003527777777777778, 0],
    ['pica', [], 'length', 0.004233333333333334, 0],
    ['survey_mi', [], 'length', 1609.3472186944373, 0],
    ['yr', [], 'time', 31557600.0, 0],
    ['day', ['d'], 'time', 86400.0, 0],
    ['hr', [], 'time', 3600.0, 0],
    ['mn', ['min'], 'time', 60.0, 0],
    ['sec', ['s'], 'time', 1.0, 1],
    ['Pa', ['p'], 'pressure', 1.0, 1],
    ['atm', ['at'], 'pressure', 101325.0, 1],
    ['mmHg', [], 'pressure', 133.322, 1],
    ['psi', [], 'pressure', 6894.757293168362, 0],
    ['Torr', [], 'pressure', 133.32236842105263, 0],
    ['N', [], 'force', 1.0, 1],
    ['dyn', ['dy'], 'force', 1e-05, 1],
    ['lbf', [], 'force', 4.4482216152605005, 0],
    ['pond', [], 'force', 0.00980665, 1],
    ['J', [], 'energy', 1.0, 1],
    ['e', [], 'energy', 1e-07, 1],
    ['c', [], 'energy', 4.184, 1],
    ['cal', [], 'energy', 4.1868, 1],
    ['eV', ['ev'], 'energy', 1.602176487e-19, 1],
    ['HPh', ['hh'], 'energy', 2684519.537696173, 0],
    ['Wh', ['wh'], 'energy', 3600.0, 1],
    ['flb', [], 'energy', 1.3558179483314003, 0],
    ['BTU', ['btu'], 'energy', 1055.05585262, 0],
    ['HP', ['h'], 'power', 745.6998715822702, 0],
    ['PS', [], 'power', 735.49875, 0],
    ['W', ['w'], 'power', 1.0, 1],
    ['T', [], 'magnetic_flux_density', 1.0, 1],
    ['ga', [], 'magnetic_flux_density', 0.0001, 1],
    ['C', ['cel'], 'temperature', 1.0, 0],
    ['F', ['fah'], 'temperature', 1.0, 0],
    ['K', ['kel'], 'temperature', 1.0, 1],
    ['Rank', [], 'temperature', 1.0, 0],
    ['Reau', [], 'temperature', 1.0, 0],
    ['tsp', [], 'volume', 0.00492892159375, 0],
    ['tspm', [], 'volume', 0.005, 0],
    ['tbs', [], 'volume', 0.01478676478125, 0],
    ['oz', [], 'volume', 0.0295735295625, 0],
    ['cup', [], 'volume', 0.2365882365, 0],
    ['pt', ['us_pt'], 'volume', 0.473176473, 0],
    ['uk_pt', [], 'volume', 0.56826125, 1],
    ['qt', [], 'volume', 0.946352946, 0],
    ['uk_qt', [], 'volume', 1.1365225, 0],
    ['gal', [], 'volume', 3.785411784, 0],
    ['uk_gal', [], 'volume', 4.54609, 0],
    ['l', ['L', 'lt'], 'volume', 1.0, 1],
    ['ang3', ['ang^3'], 'volume', 1e-27, 3],
    ['barrel', [], 'volume', 158.987294928, 0],
    ['bushel', [], 'volume', 35.23907016688, 0],
    ['ft3', ['ft^3'], 'volume', 28.316846592, 0],
    ['in3', ['in^3'], 'volume', 0.016387064, 0],
    ['ly3', ['ly^3'], 'volume', 8.467866646237152e+50, 0],
    ['m3', ['m^3'], 'volume', 1000.0, 3],
    ['mi3', ['mi^3'], 'volume', 4168181825440.5796, 0],
    ['yd3', ['yd^3'], 'volume', 764.554857984, 0],
    ['Nmi3', ['Nmi^3'], 'volume', 6352182208000.0, 0],
    ['Picapt3', ['Picapt^3', 'Pica3', 'Pica^3'], 'volume', 4.39039566186557e-08, 0],
    ['GRT', ['regton'], 'volume', 2831.6846592, 0],
    ['MTON', [], 'volume', 1132.67386368, 0],
    ['uk_acre', [], 'area', 4046.8564224, 0],
    ['us_acre', [], 'area', 4046.8726098742522, 0],
    ['ang2', ['ang^2'], 'area', 1e-20, 2],
    ['ar', [], 'area', 100.0, 1],
    ['ft2', ['ft^2'], 'area', 0.09290304, 0],
    ['ha', [], 'area', 10000.0, 0],
    ['in2', ['in^2'], 'area', 0.00064516, 0],
    ['ly2', ['ly^2'], 'area', 8.95054210748189e+31, 0],
    ['m2', ['m^2'], 'area', 1.0, 2],
    ['Morgen', [], 'area', 2500.0, 0],
    ['mi2', ['mi^2'], 'area', 2589988.110336, 0],
    ['Nmi2', ['Nmi^2'], 'area', 3429904.0, 0],
    ['Picapt2', ['Picapt^2', 'Pica2', 'Pica^2'], 'area', 1.2445216049382715e-07, 0],
    ['yd2', ['yd^2'], 'area', 0.83612736, 0],
    ['bit', [], 'information', 1.0, 1],
    ['byte', [], 'information', 8.0, 1],
    ['admkn', [], 'speed', 0.5147733333333333, 0],
    ['kn', [], 'speed', 0.5144444444444445, 0],
    ['m/h', ['m/hr'], 'speed', 0.0002777777777777778, 1],
    ['m/s', ['m/sec'], 'speed', 1.0, 1],
    ['mph', [], 'speed', 0.44704, 1],
];

const unitsBySymbol = new Map(units.flatMap((unit) => [unit[0], ...unit[1]].map((symbol) => [symbol, unit] as const)));

const prefixes: Array<[prefix: string, factor: number, binary?: true]> = [
    ['Yi', 2 ** 80, true], ['Zi', 2 ** 70, true], ['Ei', 2 ** 60, true], ['Pi', 2 ** 50, true],
    ['Ti', 2 ** 40, true], ['Gi', 2 ** 30, true], ['Mi', 2 ** 20, true], ['ki', 2 ** 10, true],
    ['da', 1e1], ['Y', 1e24], ['Z', 1e21], ['E', 1e18], ['P', 1e15], ['T', 1e12],
    ['G', 1e9], ['M', 1e6], ['k', 1e3], ['h', 1e2], ['e', 1e1], ['d', 1e-1],
    ['c', 1e-2], ['m', 1e-3], ['u', 1e-6], ['n', 1e-9], ['p', 1e-12], ['f', 1e-15],
    ['a', 1e-18], ['z', 1e-21], ['y', 1e-24],
];

function lookupUnit(symbol: string): [Unit, number] | undefined {
    const direct = unitsBySymbol.get(symbol);
    if (direct) {
        return [direct, 1];
    }
    for (const [prefix, factor, binary] of prefixes) {
        if (!symbol.startsWith(prefix)) {
            continue;
        }
        const unit = unitsBySymbol.get(symbol.slice(prefix.length));
        if (unit && (binary ? unit[2] === 'information' : unit[4] !== 0)) {
            return [unit, binary ? factor : factor ** unit[4]];
        }
    }
}

export class Convert extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override needsReferenceObject = true;

    override rejectsMultiCellReference = true;

    override calculate(number: FunctionVariantType, fromUnit: FunctionVariantType, toUnit: FunctionVariantType): BaseValueObject {
        const inputs = [number, fromUnit, toUnit].map((argument) => argument.isReferenceObject()
            ? (argument as BaseReferenceObject).getFirstCell()
            : argument as BaseValueObject
        );
        const arrays = inputs.filter((input): input is ArrayValueObject => input.isArray());
        if (arrays.length === 0) {
            return this._convert(inputs[0], inputs[1], inputs[2]);
        }

        const rows = Math.max(...arrays.map((input) => input.getRowCount()));
        const columns = Math.max(...arrays.map((input) => input.getColumnCount()));
        const missing = ErrorValueObject.create(ErrorType.NA);
        const [values, sources, targets] = inputs.map((input) => expandArrayValueObject(rows, columns, input, missing));
        return values.mapValue((value, row, column) =>
            this._convert(value ?? missing, sources.getValueOrDefault(row, column), targets.getValueOrDefault(row, column))
        );
    }

    private _convert(number: BaseValueObject, fromUnit: BaseValueObject, toUnit: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(number, fromUnit, toUnit);
        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [input, fromInput, toInput] = variants as BaseValueObject[];
        const value = +input.getValue();
        if (Number.isNaN(value)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const source = lookupUnit(String(fromInput.getValue()));
        const target = lookupUnit(String(toInput.getValue()));
        if (!source || !target || source[0][2] !== target[0][2]) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const [from, fromPrefix] = source;
        const [to, toPrefix] = target;
        const result = from[2] === 'temperature' && from[0] !== to[0]
            ? this._getTemperatureConversion(value * fromPrefix, from[0], to[0]) / toPrefix
            : value * ((from[3] * fromPrefix) / (to[3] * toPrefix));
        return Number.isFinite(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
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
}
