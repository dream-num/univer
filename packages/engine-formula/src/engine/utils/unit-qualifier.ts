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

const A1_UNIT_QUALIFIER = /('?)\[([^\]]+)\]((?:[^']|'')+)\1!(?=\$?[A-Z]{1,3}\$?\d+)/gi;
const TABLE_UNIT_QUALIFIER = /(^|[^\w.])(?:'((?:[^']|'')+)'|\[([^\]]+)\]|([A-Za-z0-9_.-]+))!(?=[^\s!\[\]]+\[)/g;
const INDIRECT_LITERAL = /\bINDIRECT\s*\(\s*"((?:[^"]|"")*)"/gi;

function equalsQualifier(actual: string, expected: string): boolean {
    return actual.replace(/''/g, "'").toLocaleLowerCase() === expected.toLocaleLowerCase();
}

function quoteQualifier(name: string): string {
    return /^[A-Za-z0-9_.-]+$/.test(name) ? name : `'${name.replace(/'/g, "''")}'`;
}

function refactorReferenceSegment(segment: string, oldName: string, newName: string): string {
    const withA1 = segment.replace(
        A1_UNIT_QUALIFIER,
        (token, quote: string, qualifier: string, sheetName: string) => {
            if (!equalsQualifier(qualifier, oldName)) return token;
            const escapedName = newName.replace(/'/g, "''");
            return quote ? `'[${escapedName}]${sheetName}'!` : `[${newName}]${sheetName}!`;
        }
    );
    return withA1.replace(
        TABLE_UNIT_QUALIFIER,
        (token, boundary: string, quoted: string | undefined, bracketed: string | undefined, plain: string | undefined) => {
            const qualifier = quoted ?? bracketed ?? plain ?? '';
            if (!equalsQualifier(qualifier, oldName)) return token;
            if (quoted != null) return `${boundary}'${newName.replace(/'/g, "''")}'!`;
            if (bracketed != null) return `${boundary}[${newName}]!`;
            return `${boundary}${quoteQualifier(newName)}!`;
        }
    );
}

function refactorOutsideStrings(formula: string, oldName: string, newName: string): string {
    let result = '';
    let chunk = '';
    let inString = false;
    for (let index = 0; index < formula.length; index++) {
        const character = formula[index];
        if (character !== '"') {
            chunk += character;
            continue;
        }
        if (inString && formula[index + 1] === '"') {
            chunk += '""';
            index++;
            continue;
        }
        result += inString ? chunk : refactorReferenceSegment(chunk, oldName, newName);
        result += '"';
        chunk = '';
        inString = !inString;
    }
    return result + (inString ? chunk : refactorReferenceSegment(chunk, oldName, newName));
}

/** Refactors only parsed reference qualifiers and INDIRECT literal references, never arbitrary text. */
export function refactorFormulaUnitQualifier(formula: string, oldName: string, newName: string): string {
    if (!oldName || oldName === newName) return formula;
    const withIndirect = formula.replace(INDIRECT_LITERAL, (token, literal: string) => {
        const next = refactorReferenceSegment(literal.replace(/""/g, '"'), oldName, newName).replace(/"/g, '""');
        return token.replace(literal, next);
    });
    return refactorOutsideStrings(withIndirect, oldName, newName);
}
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
