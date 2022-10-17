const fs = require('fs');
const path = require('path');
const watch = require('node-watch');

class WatchingCustomizedFolderPlugin {

    // 获得个性化目录和源码目录
    constructor(options) {
        this.src = options && options.src ? options.src : 'customized';
        this.target = options && options.target ? options.target : 'src';
    }

    // 插件安装时会调用 apply，并传入 compiler
    apply(compiler) {
        // 初始化时候把customized目录下所有文件都复制到src目录中去
        let me = this;
        let src = me.src, target = me.target;
        me.copyDirectory(src, target);

        // 监视customized目录,有文件修改则复制到src目录
        watch(this.src, { recursive: true, delay: 500 }, function(evt, srcName) {
            console.log('%s %s.', srcName, evt);
            if (evt === 'update') {
                let targetName = srcName.replace(src + '/', target + '/');
                fs.copyFile(srcName, targetName, (err) => {
                    if (err) {
                        console.log("Error Found:", err);
                    }
                });
            }
        });
    }

    copyDirectory(src, dest) {
        let me = this;
        let files = fs.readdirSync(src);
        files.forEach((item, index) => {
            let itemPath = path.join(src, item);
            let itemStat = fs.statSync(itemPath);// 获取文件信息
            let savedPath = path.join(dest, itemPath.replace(src, ''));
            let savedDir = savedPath.substring(0, savedPath.lastIndexOf('/'));
            if (itemStat.isFile()) {
                // 如果目录不存在则进行创建
                if (!fs.existsSync(savedDir)) {
                    fs.mkdirSync(savedDir, {recursive: true});
                }
                console.log('overwrite %s to %s', itemPath, savedPath);
                // 写入到新目录下
                var data = fs.readFileSync(itemPath);
                fs.writeFileSync(savedPath, data);
            } else if (itemStat.isDirectory()) {
                me.copyDirectory(itemPath, path.join(savedDir, item));
            }
        });
    }
}

// export Plugin
module.exports = WatchingCustomizedFolderPlugin;