import {cloneObject} from "./util";

const Process: NodeJS.Process = cloneObject(process) as any;
Process.env.injDir = __dirname;

export default Process;