import * as utils from '../../../src/utils/utils';

describe("utils.ts", () => {

    describe("replaceEscapedOctetsWithChar", function () {

        test("should replace escaped octets with corresponding unicode char", function() {
            let str = "hello\\303\\247world";
            let expected = "helloçworld";

            let actual = utils.replaceEscapedOctetsWithChar(str);
            
            expect(actual).toEqual(expected);
        });

        test("should replace escaped octets at the start of the string with corresponding unicode char", function() {
            let str = "\\303\\247";
            let expected = "ç";

            let actual = utils.replaceEscapedOctetsWithChar(str);
            
            expect(actual).toEqual(expected);
        });

        test("should ignore escaped escaped octets", function() {
            let str = "\\\\403\\303\\247\\346\\261\\211";
            let expected = "\\\\403ç汉";

            let actual = utils.replaceEscapedOctetsWithChar(str);
            
            expect(actual).toEqual(expected);
        });

        test("should ignore invalid escaped octets", function() {
            let str = "\\\\403\\2";
            let expected = str;

            let actual = utils.replaceEscapedOctetsWithChar(str);
            
            expect(actual).toEqual(expected);
        });
    });

    describe("uniqueBy", function () {

        test("should filter out elements with the same value on the property passed as argument", function() {
            let arr = [{name: "alex"}, {name: "alessio"}, {name: "alessandro"}, {name: "simone"}, {name: "mirko"}, {name: "alex"}, {name: "alessio"}];
            let expected = [{name: "alex"}, {name: "alessio"}, {name: "alessandro"}, {name: "simone"}, {name: "mirko"}];
            let actual = utils.uniqueBy(arr, "name");

            expect(actual).toStrictEqual(expected);
        });

        test("should return the same array if there are no duplicate property values", function() {
            let arr = [{name: "alex"}, {name: "alessio"}, {name: "alessandro"}, {name: "simone"}, {name: "mirko"}];
            let expected = [{name: "alex"}, {name: "alessio"}, {name: "alessandro"}, {name: "simone"}, {name: "mirko"}];
            let actual = utils.uniqueBy(arr, "name");

            expect(actual).toStrictEqual(expected);
        });

        test("should return the same array if the property passed as argument is not a property of the elements in the array", function() {
            let arr = [{name: "alex"}, {name: "alessio"}, {name: "alessandro"}, {name: "simone"}, {name: "mirko"}];
            let expected = [{name: "alex"}, {name: "alessio"}, {name: "alessandro"}, {name: "simone"}, {name: "mirko"}];
            let actual = utils.uniqueBy(arr, "age");

            expect(actual).toStrictEqual(expected);
        });

        test("empty array", function() {
            let arr = [];
            let expected = [];
            let actual = utils.uniqueBy(arr, "age");

            expect(actual).toStrictEqual(expected);
        });

    });
});
