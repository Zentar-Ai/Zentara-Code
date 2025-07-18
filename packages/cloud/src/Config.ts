// Production constants
export const PRODUCTION_CLERK_BASE_URL = "https://clerk.zentar.ai"
export const PRODUCTION_ROO_CODE_API_URL = "https://app.zentar.ai"

// Functions with environment variable fallbacks
export const getClerkBaseUrl = () => process.env.CLERK_BASE_URL || PRODUCTION_CLERK_BASE_URL
export const getZentaraCodeApiUrl = () => process.env.ROO_CODE_API_URL || PRODUCTION_ROO_CODE_API_URL
