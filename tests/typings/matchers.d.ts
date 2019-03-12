import { TreeDataProvider } from "vscode";
import { Fixture } from "../fixtures";

declare global {
    namespace jest {
        interface Matchers<R> {
            toRepresent(databases: Fixture.Database[]): TreeDataProvider<any>;
        }
    }
}