import request from '@/service/request'

async function getHitokoto(options?: RequestInit): Promise<{ hitokoto: string }> {
  return await (await request.request('https://v1.hitokoto.cn', options)).json()
}

const hitokotoApi = {
  getHitokoto,
}

export default hitokotoApi
