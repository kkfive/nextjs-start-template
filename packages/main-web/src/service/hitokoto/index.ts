import request from '@/service/request'

async function getHitokoto(): Promise<{ hitokoto: string }> {
  return await (await request.request('https://v1.hitokoto.cn')).json()
}

export const hitokotoApi = {
  getHitokoto,
}
