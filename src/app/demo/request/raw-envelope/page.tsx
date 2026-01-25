import { ScenarioCard } from '@domain/example/request/components/scenario-card'
import { Controller } from '@domain/example/request/controller'
import { httpTo } from '@/lib/utils'
import { httpServer } from '@/service/index.server'
import { DemoWrapper } from '../../components/demo-wrapper'
import { ClientScenarioCard } from '../components/client-scenario-card'

// Force dynamic rendering to ensure cookies() is called within request context
export const dynamic = 'force-dynamic'

export default async function RawEnvelopePage() {
  // Raw response: returns full response object
  const [successErr, successData] = await httpTo(
    Controller.rawScenario(httpServer, 'success'),
  )
  const [businessErr, businessData] = await httpTo(
    Controller.rawScenario(httpServer, 'business-error'),
  )

  return (
    <DemoWrapper>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Using
            {' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs dark:bg-gray-800">rawScenario</code>
            {' '}
            - Returns full response envelope
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ScenarioCard
            title="Server: Success → Full Envelope"
            description="Returns complete response with success, data, code, message"
            method="GET"
            endpoint="/api/example/request/success"
            mode="server"
            initialData={successData || successErr}
            expectedStatus="success"
          />
          <ClientScenarioCard
            title="Client: Success → Full Envelope"
            description="Click to see complete response envelope"
            method="GET"
            endpoint="/api/example/request/success"
            scenario="success"
            expectedStatus="success"
          />
          <ScenarioCard
            title="Server: Business Error → Full Envelope"
            description="Returns complete error response with all fields"
            method="POST"
            endpoint="/api/example/request/scenario"
            mode="server"
            initialData={businessData || businessErr}
            expectedStatus="business-error"
          />
          <ClientScenarioCard
            title="Client: Business Error → Full Envelope"
            description="Click to see complete error envelope"
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
