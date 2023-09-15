export function binarySearchArray(arr: number[], pos: number) {
    let low: number = 0;
    let high = arr.length - 1;

    while (low <= high) {
        const mid = Math.floor((high + low) / 2);

        if (pos < arr[mid] && (mid === 0 || pos >= arr[mid - 1])) {
            return mid;
        }
        if (pos >= arr[mid]) {
            low = mid + 1;
        } else if (pos < arr[mid]) {
            high = mid - 1;
        } else {
            return -1;
        }
    }

    return -1;
}

export function orderSearchArray(arr: number[], pos: number) {
    let i = 0;
    let cur = 0;
    let cur_pre = 0;
    let cur_index = -1;
    let i_ed = arr.length - 1;

    while (i < arr.length && i_ed >= 0 && i_ed >= i) {
        cur = arr[i_ed];

        if (i_ed === 0) {
            cur_pre = 0;
        } else {
            cur_pre = arr[i_ed - 1];
        }

        if (pos >= cur_pre && pos < cur) {
            cur_index = i_ed;
            break;
        }

        cur = arr[i];

        if (i === 0) {
            cur_pre = 0;
        } else {
            cur_pre = arr[i - 1];
        }

        if (pos >= cur_pre && pos < cur) {
            cur_index = i;
            break;
        }

        i++;
        i_ed--;
    }

    return cur_index;
}

export function searchArray(arr: number[], num: number) {
    let index: number = arr.length - 1;

    if (arr.length < 40 || num <= arr[20] || num >= arr[index - 20]) {
        index = orderSearchArray(arr, num);
    } else {
        index = binarySearchArray(arr, num);
    }

    return index;
}
