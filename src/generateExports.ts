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
  const exportsObj: Record<string, { types: string; default: string }> = {};
  for (const filePath of tsFiles) {
    const exportPath = `./${filePath}`;
    exportsObj[exportPath] = {
      types: `./dist/${filePath}.d.ts`,
      default: `./dist/${filePath}.js`,
    };
  }

  const packageJsonPath = path.resolve('package.json');
  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
  const pkg = JSON.parse(packageJsonContent);
  pkg.exports = exportsObj;
  pkg.files = ['dist'];
  if (pkg.main) {
    delete pkg.main;
  }

  await fs.writeFile(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`Updated package.json. Exported ${tsFiles.length} modules.`);
}

main().catch(console.error);
