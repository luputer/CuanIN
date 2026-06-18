// @ts-nocheck
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const replacements = {
    "~/hooks/use-upload": "~/hooks/shared/use-upload",
    "~/hooks/use-debounce": "~/hooks/shared/use-debounce",
    "~/hooks/use-data-table": "~/hooks/shared/use-data-table",
    "~/hooks/use-copy-product-link": "~/hooks/shared/use-copy-product-link",
    "~/hooks/use-webinar": "~/hooks/creator/use-webinar",
    "~/hooks/use-create-webinar": "~/hooks/creator/use-create-webinar",
    "~/hooks/use-produk-digital-kelas": "~/hooks/creator/use-produk-digital-kelas",
    "~/hooks/use-create-produk-digital": "~/hooks/creator/use-create-produk-digital",
    "~/hooks/use-create-kelas": "~/hooks/creator/use-create-kelas"
};

function walkDir(dir) {
    const files = readdirSync(dir);
    for (const file of files) {
        const fullPath = join(dir, file);
        if (statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules') {
                walkDir(fullPath);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = readFileSync(fullPath, 'utf8');
            let modified = false;
            for (const [oldPath, newPath] of Object.entries(replacements)) {
                const regex = new RegExp(`(['"\`])${oldPath}(['"\`])`, 'g');
                if (content.match(regex)) {
                    content = content.replace(regex, `$1${newPath}$2`);
                    modified = true;
                }
            }
            if (modified) {
                writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

walkDir('./src');
console.log('Finished.');
