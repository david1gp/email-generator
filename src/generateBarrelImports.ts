import fs from 'fs/promises'
import path from 'path'

async function findTsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('generate_') || entry.name === 'demo_pages' || entry.name === 'bun') {
        continue;
      }
      files.push(...await findTsFiles(fullPath));
    } else if (
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.match(/\.test\./)
    ) {
      const relPath = path.relative('lib', fullPath).replace(/\.(ts|tsx)$/, '');
      if (relPath) {
        files.push(relPath);
      }
    }
  }
  return files;
}

async function main() {
  const libDir = path.resolve('lib');
  const tsFiles = await findTsFiles(libDir);
  tsFiles.sort();
  const barrelExports = tsFiles.map(filePath => `export * from './${filePath}';`).join('\n');

  await fs.writeFile(path.join(libDir, 'index.ts'), barrelExports + '\n', 'utf8');
  console.log(`Generated lib/index.ts with ${tsFiles.length} exports.`);

  const packageJsonPath = path.resolve('package.json');
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const pkg = JSON.parse(packageJsonContent);
  pkg.main = './dist/index.js';
  pkg.types = './dist/index.d.ts';
  await fs.writeFile(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('Updated package.json with main and types pointing to index.');
}

main().catch(console.error);