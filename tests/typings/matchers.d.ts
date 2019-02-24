import { TreeDataProvider } from "vscode";
import { DatabaseFixture } from "../helpers/fixtureHelper";

declare global {
    namespace jest {
        interface Matchers<R> {
            toInclude(databaseFixture: DatabaseFixture): TreeDataProvider<any>;
        }
    }
}