import { Button } from '@kkfive/ui/components/button'
import { ConfigProvider } from 'antd'

type ThemedButtonProps = {
  label?: string
  onPress: () => void
}

export function ThemedButton({ label = 'Save', onPress }: ThemedButtonProps) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1677ff' } }}>
      <Button onClick={onPress} variant="default">{label}</Button>
    </ConfigProvider>
  )
}
