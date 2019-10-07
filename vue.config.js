module.exports = {
    runtimeCompiler: true,
    publicPath: '[{[ .StaticURL ]}]',
    productionSourceMap: true,
    configureWebpack: {
        plugins: [
            {
                apply: (compiler) => {
                    const exec = require('child_process').exec
                    const fs = require('fs')
                    compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                        let p = arguments[4] + '/dist/index.html'
                        console.dir('Apply patch to ' + p)
                        fs.readFile(p, 'utf8', function (err, data) {
                            if (err) {
                                return console.log(err);
                            }
                            let result = data.replace(/\/\[/g, '[')
                            fs.writeFile(p, result, 'utf8', function (err) {
                                if (err) return console.log(err);
                            });
                        })
                        p = arguments[4].split('/').slice(0, -1).join('/') + "/src/lib/"

                        //have to install go rice tool before use this
                        exec('rm rice-box.go; rice embed-go', {cwd: p, shell: '/bin/sh', env: process.env},
                            (err, stdout, stderr) => {
                                console.dir('ricebox gen done at ' + p)
                                if (stdout) process.stdout.write(stdout);
                                if (stderr) process.stderr.write(stderr);
                            });
                    });
                }
            }
        ]
    }


}
