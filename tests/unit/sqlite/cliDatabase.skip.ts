import { CliDatabase } from "../../../src/sqlite/cliDatabase";
import { isRunning, wait } from "../../helpers/utils";
import { join } from "path";

describe('CliDatabase Tests', () => {

    test('new should start a new database without errors and close should close the database without errors', (done) => {
        expect.assertions(1);

        let database = new CliDatabase("sqlite3", ":memory:", (err) => {
            fail(err);
        });

        database.close((err) => {
            expect(err).toBeFalsy();
            done();
        });
    });
    
    test('new with a non existing command should callback with an error, subsequent calls should not callback', (done) => {
        expect.assertions(2);
        
        let database = new CliDatabase("non_existing_command", ":memory:", (err) => {
            expect(err).toBeTruthy();
            expect(isRunning(database.pid)).toBeFalsy();
        });

        database.execute("select 'row';", fail);
        database.close(fail);

        wait(100).then(done);
    });

    test('new with an invalid command should callback with an error, subsequent calls should not callback', (done) => {
        expect.assertions(2);
        
        let database = new CliDatabase(__filename, ":memory:", (err) => {
            expect(err).toBeTruthy();
            expect(isRunning(database.pid)).toBeFalsy();
        });

        database.execute("select 'row';", fail);
        database.close(fail);

        wait(100).then(done);
    });

    test('new with a non existing database path should callback with an error, subsequent calls should not callback', (done) => {
        expect.assertions(2);

        let path = join(__dirname, "non_existing_dir", "non_existing_database.db");
        
        let database = new CliDatabase("sqlite3", path, (err) => {
            expect(err).toBeTruthy();
            expect(isRunning(database.pid)).toBeFalsy();
        });

        database.execute("select 'row';", fail);
        database.close(fail);

        wait(100).then(done);
    });

    test('new with a non valid database should callback with an error, subsequent calls should not callback', (done) => {
        expect.assertions(2);

        let path = __filename;
        
        let database = new CliDatabase("sqlite3", path, (err) => {
            expect(err).toBeTruthy();
            expect(isRunning(database.pid)).toBeFalsy();
        });

        database.execute("select 'row';", fail);
        database.close(fail);

        wait(100).then(done);
    });

    test('select should callback with the rows', (done) => {
        expect.assertions(3);
        
        let database = new CliDatabase("sqlite3", ":memory:", fail);

        let val = "this is the value in the first field of the second row";

        database.execute(`select '${val}';`, (rows, err) => {
            if (err) {
                fail(err);
            } else {
                expect(rows[0][0]).toBe(`'${val}'`); // Note: the first row should be the header, that (in this case) is the same string with quotes around
                expect(rows[1][0]).toBe(val);
            }
        });

        database.close((err) => {
            expect(err).toBeFalsy();
            done();
        });
    });

    test("select should callback in the same order they are called", (done) => {
        expect.assertions(1);

        let database = new CliDatabase("sqlite3", ":memory:", fail);

        let callbackOrder: number[] = [];
        let callback_1 = jest.fn().mockImplementation(() => callbackOrder.push(1));
        let callback_2 = jest.fn().mockImplementation(() => callbackOrder.push(2));
        let callback_3 = jest.fn().mockImplementation(() => callbackOrder.push(3));
        
        database.execute(`select 'ciao';`, callback_1);
        database.execute(`select 'ciao';`, callback_2);
        database.execute(`select 'ciao';`, callback_3);

        database.close(() => {
            expect(callbackOrder).toEqual([1, 2, 3]);
            done();
        });
    });

    test('select should callback with an error and close the database without errors if there is an error in the query', (done) => {
        expect.assertions(3);

        let database = new CliDatabase("sqlite3", ":memory:", fail);

        database.execute(`select 'hello';`, (_rows, err) => {
            expect(err).toBeFalsy();
        });

        database.execute(`invalid_query;`, (_rows, err) => {
            expect(err).toBeTruthy();
        });

        database.execute(`select 'row2';`, fail);

        database.close((err) => {
            expect(err).toBeFalsy();
            done();
        });
    });
    
    test('close should callback after every query is finished, subsequent calls should callback with an error', (done) => {
        expect.assertions(5);

        let database = new CliDatabase("sqlite3", ":memory:", fail);

        let callbackOrder: number[] = [];
        let callback_1 = jest.fn().mockImplementation(() => callbackOrder.push(1));
        let callback_2 = jest.fn().mockImplementation(() => callbackOrder.push(2));
        let callback_3 = jest.fn().mockImplementation(() => callbackOrder.push(3));

        database.execute(`select 'row1';`, callback_1);

        database.execute(`select 'row2';`, callback_2);

        database.execute(`select 'row3';`, callback_3);

        database.close((err) => {
            expect(isRunning(database.pid)).toBeFalsy();
            expect(err).toBeFalsy();
            expect(callbackOrder).toEqual([1,2,3]);
        });

        database.execute(`select 'row2';`, (_rows, err) => expect(err).toBeTruthy());
        database.close((err) => expect(err).toBeTruthy());

        wait(100).then(done);
    });
    
    test('close should callback after there is an error in the query', (done) => {
        expect.assertions(4);

        let database = new CliDatabase("sqlite3", ":memory:", fail);

        let callbackOrder: number[] = [];
        let callback_1 = jest.fn().mockImplementation(() => callbackOrder.push(1));
        let callback_2 = jest.fn().mockImplementation(() => callbackOrder.push(2));
        let callback_3 = jest.fn().mockImplementation(() => callbackOrder.push(3));

        database.execute(`select 'row';`, callback_1);

        database.execute(`select 'hello';`, callback_2);

        database.execute(`select hello row2;`, (_rows, err) => {
            expect(err).toBeTruthy();
            callback_3();
        });

        database.close((err) => {
            expect(isRunning(database.pid)).toBeFalsy();
            expect(err).toBeFalsy();
            expect(callbackOrder).toEqual([1,2,3]);
            done();
        });
    });

});