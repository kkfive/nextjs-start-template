import axios from 'axios'

export default async function Page() {
  await axios.get('/api/example')
  return null
}
