const fs = require('fs');
const path = require('path');

function forceDeleteDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            try {
                if (fs.lstatSync(curPath).isDirectory()) {
                    // Recursively delete contents
                    forceDeleteDir(curPath);
                } else {
                    // Forcefully change permissions then delete file
                    try {
                        fs.chmodSync(curPath, 0o777);
                    } catch (e) { /* ignore chmod error if we can't do it */ }
                    fs.unlinkSync(curPath);
                }
            } catch (err) {
                console.error(`Failed on ${curPath}: ${err.message}`);
            }
        });

        // Change permission of dir then delete
        try {
            fs.chmodSync(dirPath, 0o777);
        } catch (e) { /* ignore */ }

        try {
            fs.rmdirSync(dirPath);
        } catch (err) {
            console.error(`Failed to rmdir ${dirPath}: ${err.message}`);
        }
    }
}

// Delete node_modules
const nmPath = path.join(__dirname, 'node_modules');
console.log(`Force deleting ${nmPath}...`);
forceDeleteDir(nmPath);
console.log('Done.');

// Delete package-lock if exists
try {
    const lockPath = path.join(__dirname, 'package-lock.json');
    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
} catch (e) { }
