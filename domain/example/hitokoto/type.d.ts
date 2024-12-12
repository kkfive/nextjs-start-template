declare namespace Hitokoto {
  interface Hitokoto {
    id: number
    uuid: string
    hitokoto: string
    type: string
    from: string
    from_who: string
    creator: string
    creator_uid: number
    reviewer: number
    commit_from: string
    created_at: string
    length: number
  }

  interface GetDataAPI {
    Params: {
      c?: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | '其他'
      encode?: 'text' | 'js' | 'json' | '其他'
      charset?: 'utf-8' | 'gbk' | '其他'
    }
    Response: Hitokoto
  }

}
