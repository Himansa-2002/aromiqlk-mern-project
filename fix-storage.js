const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
    let results = [];
    fs.readdir(dir, (err, list) => {
        if (err) return done(err);
        let i = 0;
        (function next() {
            let file = list[i++];
            if (!file) return done(null, results);
            file = path.resolve(dir, file);
            fs.stat(file, (err, stat) => {
                if (stat && stat.isDirectory()) {
                    walk(file, (err, res) => {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    if (file.endsWith('.js') || file.endsWith('.jsx')) {
                        results.push(file);
                    }
                    next();
                }
            });
        })();
    });
};

walk(path.join(__dirname, 'frontend/src'), (err, results) => {
    if (err) throw err;
    results.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let needsWrite = false;

        // Only replace localStorage with sessionStorage for token and user
        if (content.includes('localStorage.getItem("token")') ||
            content.includes('localStorage.removeItem("token")') ||
            content.includes('localStorage.setItem("user"') ||
            content.includes('localStorage.getItem("user")') ||
            content.includes('localStorage.removeItem("user")')) {

            content = content.replace(/localStorage\.getItem\("token"\)/g, 'sessionStorage.getItem("token")');
            content = content.replace(/localStorage\.removeItem\("token"\)/g, 'sessionStorage.removeItem("token")');

            content = content.replace(/localStorage\.setItem\("user"/g, 'sessionStorage.setItem("user"');
            content = content.replace(/localStorage\.getItem\("user"\)/g, 'sessionStorage.getItem("user")');
            content = content.replace(/localStorage\.removeItem\("user"\)/g, 'sessionStorage.removeItem("user")');

            needsWrite = true;
        }

        if (needsWrite) {
            fs.writeFileSync(file, content, 'utf8');
            console.log('Fixed:', file);
        }
    });
});
