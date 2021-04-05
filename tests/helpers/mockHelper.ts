export function getMockCallWhereParamEquals<T>(
    mock: any,
    paramIndex: number,
    value: any
) {
    for (let i = 0; i < mock.calls.length; i++) {
        let call = mock.calls[i];
        let param = call[paramIndex];
        if (param === value) {
            return call;
        }
    }
}
