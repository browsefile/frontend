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
                    let basePath = arguments[4]

                    compiler.plugin("done", function () {
                        let p = basePath + '/dist/index.html'

                        fs.readFile(p, 'utf8', function (err, data) {
                            if (err) {
                                return console.log(err);
                            }
                            let result = data.replace(/\/\[/g, '[')
                            setTimeout(() => {
                                console.dir('Apply patch to ' + p)
                                fs.writeFile(p, result, 'utf8', (err) => {
                                    if (err) return console.log(err)
                                })
                                p = basePath.split('/').slice(0, -1).join('/') + "/src/lib/"

                                //have to install go rice tool before use this
                                exec('rm rice-box.go; rice embed-go', {cwd: p, shell: '/bin/sh', env: process.env},
                                    (err, stdout, stderr) => {
                                        console.dir('ricebox gen done at ' + p)
                                        if (stdout) process.stdout.write(stdout)
                                        if (stderr) process.stderr.write(stderr)
                                    })
                            }, 100)

                        })


                    });
                }
            }
        ]
    }


}
