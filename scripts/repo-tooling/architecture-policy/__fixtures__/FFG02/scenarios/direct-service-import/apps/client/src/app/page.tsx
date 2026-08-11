import { httpServer } from '@/service/http-server'

export default function Page() {
  return <div>{String(httpServer)}</div>
}
