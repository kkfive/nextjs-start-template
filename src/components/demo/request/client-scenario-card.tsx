'use client'

import type { HttpMethod } from '@/components/ui/method-badge'
import { Controller } from '@domain/example/request/controller'
import { ScenarioCard } from '@/components/domain/request/scenario-card'
import { httpClient } from '@/service/index.client'

type ScenarioType = 'success' | 'business-error' | 'error-400' | 'error-401' | 'error-404' | 'error-500' | 'error-503'

interface ClientScenarioCardProps {
  title: string
  description: string
  method: HttpMethod
  endpoint: string
  scenario: ScenarioType
  expectedStatus: 'success' | 'business-error' | 'http-error'
}

export function ClientScenarioCard({
  title,
  description,
  method,
  endpoint,
  scenario,
  expectedStatus,
}: ClientScenarioCardProps) {
  const requestAction = async () => {
    return Controller.rawScenario(httpClient, scenario)
  }

  return (
    <ScenarioCard
      title={title}
      description={description}
      method={method}
      endpoint={endpoint}
      mode="client"
      requestAction={requestAction}
      expectedStatus={expectedStatus}
    />
  )
}
