export interface Env {
  VERSION: string
  ENV_NAME: string
  HEADER_CORS_ALLOW_ORIGIN?: string
  HEADER_CORS_MAX_AGE?: string
  MARKDOWN_RENDER_TOKEN?: string
  CF_VERSION_METADATA?: WorkerVersionMetadata
}
