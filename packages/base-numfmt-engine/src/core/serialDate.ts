import { toYMD } from './toYMD';

const floor = Math.floor;
const DAYSIZE = 86400;

export function dateToSerial(value, opts) {
    let ts = null;
    if (Array.isArray(value)) {
        const [y, m, d, hh, mm, ss] = value;
        ts = Date.UTC(y, m == null ? 0 : m - 1, d ?? 1, hh || 0, mm || 0, ss || 0);
    }
    // dates are changed to serial
    else if (value instanceof Date) {
        ts = value.getTime();
        if (!opts || !opts.ignoreTimezone) {
            ts -= value.getTimezoneOffset() * 60 * 1000;
        }
    }
    if (ts != null && isFinite(ts)) {
        const d = ts / 864e5;
        return d - (d <= -25509 ? -25568 : -25569);
    }
    // everything else is passed through
    return value;
}

export function dateFromSerial(value, opts) {
    let date = value | 0;
    const t = DAYSIZE * (value - date);
    let time = floor(t); // in seconds
    // date "epsilon" correction
    if (t - time > 0.9999) {
        time += 1;
        if (time === DAYSIZE) {
            time = 0;
            date += 1;
        }
    }
    // serial date/time to gregorian calendar
    const x = time < 0 ? DAYSIZE + time : time;
    const [y, m, d] = toYMD(value, 0, opts && opts.leap1900);
    const hh = floor(x / 60 / 60) % 60;
    const mm = floor(x / 60) % 60;
    const ss = floor(x) % 60;
    // return it as a native date object
    if (opts && opts.nativeDate) {
        const dt = new Date(0);
        dt.setUTCFullYear(y, m - 1, d);
        dt.setUTCHours(hh, mm, ss);
        return dt;
    }
    // return the parts
    return [y, m, d, hh, mm, ss];
}
