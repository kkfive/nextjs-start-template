import { ScenarioCard } from '@domain/example/request/components/scenario-card'
import { Controller } from '@domain/example/request/controller'
import { httpTo } from '@/lib/utils'
import { httpServer } from '@/service/index.server'
import { DemoWrapper } from '../../components/demo-wrapper'
import { InterceptedClientCard } from '../components/intercepted-client-card'

// Force dynamic rendering to ensure cookies() is called within request context
export const dynamic = 'force-dynamic'

export default async function InterceptorPage() {
  // Interceptor applied: returns data directly or throws BusinessError
  const [interceptedSuccessErr, interceptedSuccessData] = await httpTo(
    Controller.unifiedScenario(httpServer, 'success'),
  )
  const [interceptedBusinessErr, interceptedBusinessData] = await httpTo(
    Controller.unifiedScenario(httpServer, 'business-error'),
  )

  return (
    <DemoWrapper>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Using
            {' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">unifiedScenario</code>
            {' '}
            - Success returns data directly, errors throw BusinessError
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ScenarioCard
            title="Server: Success → Data Only"
            description="Interceptor extracts data field from response"
            method="GET"
            endpoint="/api/example/request/success"
            mode="server"
            initialData={interceptedSuccessData || interceptedSuccessErr}
            expectedStatus="success"
          />
          <InterceptedClientCard
            title="Client: Success → Data Only"
            description="Click to see interceptor extract data field"
            method="GET"
            endpoint="/api/example/request/success"
            scenario="success"
            expectedStatus="success"
          />
          <ScenarioCard
            title="Server: Business Error → BusinessError"
            description="Interceptor converts to BusinessError object"
            method="POST"
            endpoint="/api/example/request/scenario"
            mode="server"
            initialData={interceptedBusinessData || interceptedBusinessErr}
            expectedStatus="business-error"
          />
          <InterceptedClientCard
            title="Client: Business Error → BusinessError"
            description="Click to see interceptor convert to BusinessError"
            method="POST"
            endpoint="/api/example/request/scenario"
            scenario="business-error"
            expectedStatus="business-error"
          />
        </div>
      </div>
    </DemoWrapper>
  )
}
