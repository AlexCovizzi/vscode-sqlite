import * as objects from "../../../../src/base/common/objects";

describe("objects.ts", () => {

    describe("mixin", function () {

        test("should replace number, string, boolean in the destination object", function() {
            let dest = {
                enableForeignKeys: true,
                when: 10,
                beforeExecute: "select * from helloo;",
                tableQuery: {
                    limit: 10
                }
            };
            let source = {
                enableForeignKeys: false,
                when: 2,
                beforeExecute: ".print hello"
            };

            let expected = {
                enableForeignKeys: false,
                when: 2,
                beforeExecute: ".print hello",
                tableQuery: {
                    limit: 10
                }
            };

            let actual = objects.mixin(dest, source);
            
            expect(actual).toEqual(expected);
        });

        test("should replace number, string, boolean in the property of destination object", function() {
            let dest = {
                beforeExecute: ["select * from helloo;", "insert into {};", ".print"],
                tableQuery: {
                    limit: 10,
                    enable: false,
                    after: "nothing"
                }
            };
            let source = {
                tableQuery: {
                    limit: 2,
                    enable: true,
                    after: "all"
                }
            };

            let expected = {
                beforeExecute: ["select * from helloo;", "insert into {};", ".print"],
                tableQuery: {
                    limit: 2,
                    enable: true,
                    after: "all"
                }
            };

            let actual = objects.mixin(dest, source);
            
            expect(actual).toEqual(expected);
        });

        test("should add number, string, boolean not in the destination object", function() {
            let dest = {
                beforeExecute: ["select * from helloo;", "insert into {};", ".print"],
                tableQuery: {
                    limit: 10,
                    enable: false
                }
            };
            let source = {
                enableForeignKeys: false,
                when: 2,
                before: ".print hello"
            };

            let expected = {
                enableForeignKeys: false,
                when: 2,
                before: ".print hello",
                beforeExecute: ["select * from helloo;", "insert into {};", ".print"],
                tableQuery: {
                    limit: 10,
                    enable: false
                }
            };

            let actual = objects.mixin(dest, source);
            
            expect(actual).toEqual(expected);
        });

        test("should add number, string, boolean not in the property of the destination object", function() {
            let dest = {
                beforeExecute: ["select * from helloo;", "insert into {};", ".print"],
                tableQuery: {
                    enable: false
                }
            };
            let source = {
                tableQuery: {
                    limit: 2,
                    keys: true,
                    after: "all"
                }
            };

            let expected = {
                beforeExecute: ["select * from helloo;", "insert into {};", ".print"],
                tableQuery: {
                    enable: false,
                    limit: 2,
                    keys: true,
                    after: "all"
                }
            };

            let actual = objects.mixin(dest, source);
            
            expect(actual).toEqual(expected);
        });

        test("should", function() {
            let dest = {};

            let source1 = {
                enableForeignKeys: true,
                tableQuery: {
                    columnsMap: [
                        {
                            map: "hex(${column})",
                            when: "type == binary"
                        }
                    ]
                }
            };
            let source2 = {
                enableForeignKeys: false,
                tableQuery: {
                    limit: 100,
                    columnsMap: [
                        {
                            map: "s",
                            when: "table == ciao"
                        }
                    ]
                }
            };

            let expected = {
                enableForeignKeys: false,
                tableQuery: {
                    limit: 100,
                    columnsMap: [
                        {
                            map: "hex(${column})",
                            when: "type == binary"
                        },
                        {
                            map: "s",
                            when: "table == ciao"
                        }
                    ]
                }
            };

            let res1 = objects.mixin(dest, source1);
            let actual = objects.mixin(res1, source2);
            
            expect(actual).toEqual(expected);
        });

        test("should", function() {
            let dest = {};

            let source1 = {
                enableForeignKeys: true,
                tableQuery: {
                    columnsMap: [
                        {
                            map: "hex(${column})",
                            when: "type == binary"
                        }
                    ]
                }
            };
            let source2 = {
                enableForeignKeys: false,
                tableQuery: {
                    limit: 100,
                    columnsMap: [
                        {
                            map: "hex(${column})",
                            when: "type == binary"
                        }
                    ]
                }
            };

            let expected = {
                enableForeignKeys: false,
                tableQuery: {
                    limit: 100,
                    columnsMap: [
                        {
                            map: "hex(${column})",
                            when: "type == binary"
                        }
                    ]
                }
            };

            let res1 = objects.mixin(dest, source1);
            let actual = objects.mixin(res1, source2);
            
            expect(actual).toEqual(expected);
        });
    });
});