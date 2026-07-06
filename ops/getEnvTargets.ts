import { existsSync } from "node:fs"
import { readdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))

export type EnvTarget = {
  name: string
  envFile: string
  wranglerConfig: string
}

// Run the function if script is executed directly
// @ts-ignore
if (import.meta.main) {
  getEnvTargets().then((targets) => {
    console.log(`Found environments: ${targets.map((target) => target.name).join(", ")}`)
  })
}

export async function getEnvTargets(): Promise<EnvTarget[]> {
  const entries = await readdir(projectRoot)
  const envFiles = entries.filter((entry) => entry.startsWith(".env.")).sort()

  return envFiles.flatMap((envFile) => {
    const name = envFile.slice(".env.".length)
    const wranglerConfig = `wrangler.${name}.toml`

    if (!existsSync(join(projectRoot, wranglerConfig))) {
      return []
    }

    return [
      {
        name,
        envFile,
        wranglerConfig,
      },
    ]
  })
}
