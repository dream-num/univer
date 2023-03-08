import { EPOCH_1317, EPOCH_1904 } from './constants';

const floor = Math.floor;

// https://www.codeproject.com/Articles/2750/Excel-Serial-Date-to-Day-Month-Year-and-Vice-Versa
export function toYMD_1900(ord, leap1900 = true) {
    if (leap1900 && ord >= 0) {
        if (ord === 0) {
            return [1900, 1, 0];
        }
        if (ord === 60) {
            return [1900, 2, 29];
        }
        if (ord < 60) {
            return [1900, ord < 32 ? 1 : 2, ((ord - 1) % 31) + 1];
        }
    }
    let l = ord + 68569 + 2415019;
    const n = floor((4 * l) / 146097);
    l -= floor((146097 * n + 3) / 4);
    const i = floor((4000 * (l + 1)) / 1461001);
    l = l - floor((1461 * i) / 4) + 31;
    const j = floor((80 * l) / 2447);
    const nDay = l - floor((2447 * j) / 80);
    l = floor(j / 11);
    const nMonth = j + 2 - 12 * l;
    const nYear = 100 * (n - 49) + i + l;
    return [nYear | 0, nMonth | 0, nDay | 0];
}

export function toYMD_1904(ord) {
    return toYMD_1900(ord + 1462);
}

// https://web.archive.org/web/20080209173858/https://www.microsoft.com/globaldev/DrIntl/columns/002/default.mspx
// > [algorithm] is used in many Microsoft products, including all operating systems that
// > support Arabic locales, Microsoft Office, COM, Visual Basics, VBA, and SQL Server 2000.
export function toYMD_1317(ord) {
    if (ord === 60) {
        throw new Error('#VALUE!');
    }
    if (ord <= 1) {
        return [1317, 8, 29];
    }
    if (ord < 60) {
        return [1317, ord < 32 ? 9 : 10, 1 + ((ord - 2) % 30)];
    }
    const y = 10631 / 30;
    const shift1 = 8.01 / 60;
    let z = ord + 466935;
    const cyc = floor(z / 10631);
    z -= 10631 * cyc;
    const j = floor((z - shift1) / y);
    z -= floor(j * y + shift1);
    const m = floor((z + 28.5001) / 29.5);
    if (m === 13) {
        return [30 * cyc + j, 12, 30];
    }
    return [30 * cyc + j, m, z - floor(29.5001 * m - 29)];
}

export function toYMD(ord, system = 0, leap1900 = true) {
    const int = floor(ord);
    if (system === EPOCH_1317) {
        return toYMD_1317(int);
    }
    if (system === EPOCH_1904) {
        return toYMD_1904(int);
    }
    return toYMD_1900(int, leap1900);
}
