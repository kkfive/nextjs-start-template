import type { AppType } from 'api'
import 'client-only'

export const httpClient = new HttpService<AppType>()
