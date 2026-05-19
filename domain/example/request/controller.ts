import type { HttpService } from '@/lib/request'
import type { RequestOptions } from '@/lib/request/type'
import { service } from './service'

type ScenarioType = 'success' | 'business-error' | 'error-400' | 'error-401' | 'error-404' | 'error-500' | 'error-503'

export async function unifiedScenario(
  client: HttpService,
  scenario: ScenarioType,
  config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
) {
  return service.unifiedScenario(client, scenario, config)
}

export async function rawScenario(
  client: HttpService,
  scenario: ScenarioType,
  config?: RequestOptions & { method?: 'GET' | 'POST' | 'PUT' | 'DELETE' },
) {
  return service.rawScenario(client, scenario, config)
}

// ===== 基础请求方法演示 =====

export async function getExample(client: HttpService, params?: Record<string, string>, config?: RequestOptions) {
  return service.getExample(client, params, config)
}

export async function postExample(client: HttpService, body?: unknown, config?: RequestOptions) {
  return service.postExample(client, body, config)
}

export async function putExample(client: HttpService, body?: unknown, config?: RequestOptions) {
  return service.putExample(client, body, config)
}

export async function deleteExample(client: HttpService, id?: string, config?: RequestOptions) {
  return service.deleteExample(client, id, config)
}

export async function patchExample(client: HttpService, body?: unknown, config?: RequestOptions) {
  return service.patchExample(client, body, config)
}

// ===== 配置参数演示 =====

export async function configExample(
  client: HttpService,
  delay?: number,
  failRate?: number,
  config?: RequestOptions,
) {
  return service.configExample(client, delay, failRate, config)
}

// ===== 认证演示 =====

export async function authExample(client: HttpService, mode?: 'default' | 'success' | 'skip', config?: RequestOptions) {
  return service.authExample(client, mode, config)
}
