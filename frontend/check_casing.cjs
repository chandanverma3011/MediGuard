const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.resolve(__dirname, 'src');
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.svg', '.png', '.jpg'];

// Helper to get actual casing of a file/dir on disk
function getActualPath(filePath) {
    const dir = path.dirname(filePath);
    const file = path.basename(filePath);

    try {
        const files = fs.readdirSync(dir);
        // Find exact match (case-sensitive)
        const actual = files.find(f => f === file);
        // Find case-insensitive match
        const rough = files.find(f => f.toLowerCase() === file.toLowerCase());

        if (actual) return path.join(dir, actual);
        if (rough) return path.join(dir, rough); // Mismatch found
        return null; // Not found
    } catch (e) {
        return null; // Directory might not exist
    }
}

// Recursive file walker
function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const issues = [];

console.log('Scanning for case sensitivity issues...');

walkDir(SRC_DIR, (filePath) => {
    // Only process JS/JSX files for imports
    if (!['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(filePath))) return;

    const content = fs.readFileSync(filePath, 'utf-8');

    // Regex to capture import paths: import ... from "path"; or require("path");
    const importRegex = /from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1] || match[2];

        // Skip node_modules (non-relative imports)
        if (!importPath.startsWith('.')) continue;

        // Resolve absolute path of the imported file
        const dir = path.dirname(filePath);

        // We need to check each segment of the relative path against the file system
        try {
            // Split import path by /
            const parts = importPath.split('/');
            let cursor = dir; // start at importing file's dir

            for (const part of parts) {
                if (part === '.' || part === '..') {
                    cursor = path.join(cursor, part);
                    continue;
                }

                // Read directory at cursor
                const entries = fs.readdirSync(cursor);

                // Check if 'part' exists in 'cursor'
                const exact = entries.find(e => e === part);
                const rough = entries.find(e => e.toLowerCase() === part.toLowerCase());

                let actualName = exact || rough;

                // Handle file extensions if it's the last part and not found as directory
                if (!actualName) {
                    // Maybe it's a file without extension in import
                    // Check entries for file.ext
                    const exactFile = entries.find(e => e.startsWith(part) && EXTENSIONS.includes(path.extname(e)));
                    const roughFile = entries.find(e => e.toLowerCase().startsWith(part.toLowerCase()) && EXTENSIONS.includes(path.extname(e)));

                    if (exactFile) actualName = exactFile;
                    else if (roughFile) actualName = roughFile;
                }

                if (actualName) {
                    // Check for case mismatch
                    // If it's a directory or a file with extension match
                    if (actualName !== part && !EXTENSIONS.includes(path.extname(actualName))) {
                        // potential mismatch if it's not just missing extension
                        // e.g. import "Auth" but dir is "auth" -> actualName="auth", part="Auth"
                        // But if import is "file" and disk is "file.js", actualName="file.js", part="file" -> this is OK
                        if (actualName.toLowerCase() === part.toLowerCase()) {
                            issues.push({
                                file: path.relative(SRC_DIR, filePath),
                                import: importPath,
                                segment: part,
                                actualOnDisk: actualName
                            });
                        }
                    } else if (actualName.startsWith(part) && actualName !== part) {
                        // file with extension case
                        // check if base name matches case
                        const nameWithoutExt = path.parse(actualName).name;
                        if (nameWithoutExt !== part && nameWithoutExt.toLowerCase() === part.toLowerCase()) {
                            issues.push({
                                file: path.relative(SRC_DIR, filePath),
                                import: importPath,
                                segment: part,
                                actualOnDisk: nameWithoutExt // Suggest the correct casing for the segment
                            });
                        }
                    }

                    // Move cursor
                    cursor = path.join(cursor, actualName);
                } else {
                    // Path not found, might be an alias or error, skip
                }
            }
        } catch (e) {
            // ignore errors
        }
    }
});

// Remove duplicates
const uniqueIssues = issues.filter((v, i, a) => a.findIndex(t => (t.file === v.file && t.import === v.import && t.segment === v.segment)) === i);

const reportLines = [];
if (uniqueIssues.length > 0) {
    reportLines.push('❌ Case mismatches found:');
    uniqueIssues.forEach(i => {
        reportLines.push(`File: src/${i.file}`);
        reportLines.push(`  Import: "${i.import}"`);
        reportLines.push(`  Issue: Segment "${i.segment}" should be "${i.actualOnDisk}"\n`);
    });
} else {
    reportLines.push('✅ No case sensitivity issues found!');
}

fs.writeFileSync('casing_report.txt', reportLines.join('\n'));
console.log('Report written to casing_report.txt');
