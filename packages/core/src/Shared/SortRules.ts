export function sortRules(oa: any, ob: any) {
    if (oa.zIndex > ob.zIndex) {
        return 1;
    }
    if (oa.zIndex === ob.zIndex) {
        return 0;
    }
    return -1;
}

export function sortRulesByDesc(oa: any, ob: any) {
    if (oa.zIndex > ob.zIndex) {
        return -1;
    }
    if (oa.zIndex === ob.zIndex) {
        return 0;
    }
    return 1;
}
