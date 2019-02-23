import { DatabaseFixture } from "../helpers/fixtureHelper";
import { TreeDataProvider } from "vscode";

declare global {
    namespace jest {
        interface Matchers<R> {
            toInclude(databaseFixture: DatabaseFixture): TreeDataProvider<any>;
        }
    }
}