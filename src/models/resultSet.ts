interface Result {
    header: string[];
    rows: Row[];
}

interface Row {
    [x: string]: string;
}