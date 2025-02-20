export default function StackPage() {
  return (
    <div className="box-border relative h-full">
      <div className="relative z-1">
        <div className="mt-2 break-all overflow-hidden px-4 box-border w-full">
          start 1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sa
          dsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1
          sadsad1sadsad1sadsad1sadsad1sadsad
          1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad
          1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad
          1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad
          1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad
          1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad
          1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad
          1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad
          1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad
          1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad
          1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad1sadsad
        </div>

        <div className="px-4 box-border">

          余幼时即嗜学2。家贫，无从致书以观3，每假借于藏书之家4，手自笔录，计日以还。天大寒，砚冰坚，手指不可屈伸，弗之怠5。录毕，走送之6，不敢稍逾约7。以是人多以书假余，余因得遍观群书。既加冠8，益慕圣贤之道9，又患无硕师、名人与游10，尝趋百里外11，从乡之先达执经叩问12。先达德隆望尊，门人弟子填其室，未尝稍降辞色13。余立侍左右，援疑质理14，俯身倾耳以请；或遇其叱咄15，色愈恭，礼愈至，不敢出一言以复；俟其欣悦16，则又请焉。故余虽愚，卒获有所闻17。
          当余之从师也，负箧曳屣18，行深山巨谷中，穷冬烈风19，大雪深数尺，足肤皲裂而不知20。至舍，四支僵劲不能动21，媵人持汤沃灌22，以衾拥覆23，久而乃和。寓逆旅24，主人日再食25，无鲜肥滋味之享。同舍生皆被绮绣26，戴朱缨宝饰之帽27，腰白玉之环28，左佩刀，右备容臭29，烨然若神人30；余则缊袍敝衣处其间31，略无慕艳意。以中有足乐者，不知口体之奉不若人也。盖余之勤且艰若此，今虽耄老32，未有所成，犹幸预君子之列33，而承天子之宠光，缀公卿之后34，日侍坐备顾问，四海亦谬称其氏名35，况才之过于余者乎？
          今诸生学于太学36，县官日有廪稍之供37，父母岁有裘葛之遗，无冻馁之患矣38；坐大厦之下而诵《诗》《书》，无奔走之劳矣；有司业、博士为之师39，未有问而不告，求而不得者也；凡所宜有之书，皆集于此，不必若余之手录，假诸人而后见也。其业有不精，德有不成者，非天质之卑40，则心不若余之专耳，岂他人之过哉！
          东阳马生君则，在太学已二年，流辈甚称其贤41。余朝京师42，生以乡人子谒余43，撰长书以为贽44，辞甚畅达，与之论辨45，言和而色夷46。自谓少时用心于学甚劳，是可谓善学者矣！其将归见其亲也47，余故道为学之难以告之。谓余勉乡人以学者，余之志也48；诋我夸际遇之盛而骄乡人者49，岂知余者哉！ [2]
        </div>

        <div>1</div>

        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(item => (<div className="size-32" key={item}>{item}</div>))}
        <div>123</div>
      </div>
      <BackgroundCircle />

    </div>
  )
}

function BackgroundCircle() {
  return (
    <div className="fixed bottom-auto left-auto right-0 top-0 size-[500px] translate-x-[-30%] translate-y-[20%] rounded-full bg-[rgba(173,109,244,0.5)] opacity-50 blur-[80px]">
    </div>
  )
}
