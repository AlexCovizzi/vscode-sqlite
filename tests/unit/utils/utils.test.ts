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
});
