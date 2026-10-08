const {spawn}=require('node:child_process')
// Preserve TLS verification; use the Windows trust store on supported Node versions.
const trust=process.platform==='win32'&&process.allowedNodeEnvironmentFlags.has('--use-system-ca')?['--use-system-ca']:[]
const child=spawn(process.execPath,[...trust,require.resolve('next/dist/bin/next'),...process.argv.slice(2)],{stdio:'inherit',env:process.env})
child.on('exit',code=>process.exit(code||0))
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal))
