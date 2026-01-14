// Extend the Cloudflare Env interface to include our custom secrets
declare namespace Cloudflare {
  interface Env {
    OPENAI_API_KEY: string;
  }
}
