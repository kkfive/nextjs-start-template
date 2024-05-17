export interface BaseResponse<T> {
  code: number
  message: string
  datas: T
}

export interface GoodsRecommendedResponseData {
  goodsList: GoodsList[]
}

export interface GoodsDetailResponseData {
  goodsAttrVoList: GoodsAttrVoList[]
  rate: number
  goodsId: string
  isPostageType: string
  showSpecIds: string
  goodsDetail: GoodsDetail
  bundlingList: any[]
  error?: string
}
export interface GoodsAttrVoList {
  commitment: null
  goodsAttrVoList: GoodsAttrVoListElement[]
  goodsMobileBodyVoList: GoodsMobileBodyVoList[]
  howToUse: null
  protection: string
  [property: string]: any
}

export interface GoodsAttrVoListElement {
  name?: string
  value?: string
  [property: string]: any
}
export interface GoodsMobileBodyVoList {
  type?: string
  value?: string
  [property: string]: any
}
export interface GoodsDetail {
  addCart: number
  app: number
  appPrice0: number
  appPrice1: number
  appPrice2: number
  appPriceMin: number
  appUsable: number
  areaId1: number
  areaId2: number
  batchNum0: number
  batchNum0End: number
  batchNum1: number
  batchNum1End: number
  batchNum2: number
  batchPrice0: number
  batchPrice1: number
  batchPrice2: number
  bestSeller: number
  book: null
  bookList: string[]
  brandEnglish: string
  brandId: number
  brandImage: string
  brandName: string
  brandNameText: string
  buyNow: number
  categoryId: number
  colorId: number
  comboGoodsVo: null
  commonId: number
  conformList: ConformList[]
  contractVoList: string[]
  deliveryType: string
  deliveryTypeInt: number
  direction: null
  discount: null
  evaluateNum: number
  exclusiveLaunchAtKingPower: number
  foreignTaxRate: number
  gender: string
  giftImage: string
  giftVoList: string[]
  goodsClick: number
  goodsDetailCouponVoList: GoodsDetailCouponVoList[]
  goodsFavorite: number
  goodsId: number
  goodsIdStateListStr: string
  goodsImageList: GoodsImageList[]
  goodsImageListJson: string
  goodsList: GoodsList[]
  goodsListStr: string
  goodsModal: number
  goodsName: string
  goodsQRCode: string
  goodsRate: number
  goodsSaleNum: number
  goodsSerial: null
  goodsSpecNameList: string[]
  goodsSpecString: string
  goodsSpecValueJson: string[]
  goodsSpecValueJsonStr: string
  goodsSpecValues: string
  goodsState: number
  goodsStatus: number
  goodsStorage: number
  groupId: number
  hotItem: number
  imageSrc: string
  isBestSeller: number
  isGift: number
  isGroup: number
  isOrdinaryOrders: number
  isSeckill: number
  isWapMicroweOnline: number
  jingle: string
  joinBigSale: number
  joinConform: number
  kpArticleCode: string
  kpProductType: string
  limitAmount: number
  maxSaleQty: number
  microCrumbsVoList: string[]
  micrositeTag: null
  newGood: boolean
  promotionCountDownTime: number
  promotionCountDownTimeType: string
  promotionDiscountRate: number
  promotionEndTime: null
  promotionId: number
  promotionLanguage: string
  promotionStartTime: null
  promotionState: number
  promotionType: number
  promotionTypeText: string
  rmbAppPrice: number
  rmbWebPrice: number
  rmbWeChatPrice: number
  specialType: string
  specJson: string[]
  specJsonStr: string
  storeId: number
  unitName: string
  videoUrlSrc: string
  viewPriceFlag: number
  virtualOverdueRefund: number
  web: number
  webPrice0: number
  webPrice1: number
  webPrice2: number
  webPriceMin: number
  webUsable: number
  wechat: number
  wechatPrice0: number
  wechatPrice1: number
  wechatPrice2: number
  wechatPriceMin: number
  wechatUsable: number
  [property: string]: any
}

export interface ConformList {
  appChildContentCartRule?: string
  appContentCartRule?: string
  applicant?: string
  auditor?: string
  cartItemVoList?: null
  cartVoListMap?: { [key: string]: any }
  childConformVoList?: string[]
  conditionUnit?: number
  conformCondition?: string
  conformId?: number
  conformName?: string
  conformPrice?: number
  conformState?: number
  conformStateText?: string
  conformTileFinal?: string
  conformTitle?: string
  contentBuyRule?: string
  contentCartRule?: string
  contentOrderRule?: string
  contentRule?: string
  endTime?: string
  giftGroup?: GiftGroup
  giftVoList?: GiftVoList[]
  haveChildConform?: number
  isGift?: number
  isViewFroGoodsInfo?: number
  limitAmount?: number
  promotionConditionList?: PromotionConditionList[]
  shortRule?: string
  startTime?: string
  storeId?: number
  storeName?: null
  useGoodsRange?: number
  viewGiftImage?: number
  [property: string]: any
}

export interface GiftGroup {
  4500: The4500[]
  8500: The8500[]
  [property: string]: any
}

export interface The4500 {
  commonId: number
  conditionVal: number
  conformPromotionType: number
  deliveryType: number
  deliveryTypeStr: string
  dutyPaidCode: null
  endTime: string
  giftApplicant: null
  giftAuditor: null
  giftId: number
  giftNum: number
  giftState: number
  giftStateText: string
  giftType: number
  goodsFullSpecs: string
  goodsId: number
  goodsName: string
  goodsStorage: number
  imageSrc: string
  isImportGoods: number
  itemCommonId: number
  itemId: number
  kpArticleCode: string
  mainConformId: number
  randomNum: null
  startTime: string
  storeId: number
  unitName: string
  [property: string]: any
}

export interface The8500 {
  commonId: number
  conditionVal: number
  conformPromotionType: number
  deliveryType: number
  deliveryTypeStr: string
  dutyPaidCode: null
  endTime: string
  giftApplicant: null
  giftAuditor: null
  giftId: number
  giftNum: number
  giftState: number
  giftStateText: string
  giftType: number
  goodsFullSpecs: string
  goodsId: number
  goodsName: string
  goodsStorage: number
  imageSrc: string
  isImportGoods: number
  itemCommonId: number
  itemId: number
  kpArticleCode: string
  mainConformId: number
  randomNum: null
  startTime: string
  storeId: number
  unitName: string
  [property: string]: any
}

export interface GiftVoList {
  commonId: number
  conditionVal: number
  conformPromotionType: number
  deliveryType: number
  deliveryTypeStr: string
  dutyPaidCode: null
  endTime: string
  giftApplicant: null
  giftAuditor: null
  giftId: number
  giftNum: number
  giftState: number
  giftStateText: string
  giftType: number
  goodsFullSpecs: string
  goodsId: number
  goodsName: string
  goodsStorage: number
  imageSrc: string
  isImportGoods: number
  itemCommonId: number
  itemId: number
  kpArticleCode: string
  mainConformId: number
  randomNum: null
  startTime: string
  storeId: number
  unitName: string
  [property: string]: any
}

export interface PromotionConditionList {
  condition: number
  conditionLack: number
  conditionLimitAmountType: number
  conformPromotionType: number
  isSatisfyingActivity: number
  isSatisfyingActivityChecked: number
  randomNum: number
  val: string
  [property: string]: any
}

export interface GoodsDetailCouponVoList {
  activityId?: number
  activityType?: number
  btnStatus?: number
  couponPrice?: null
  couponPriceOrDiscount?: string
  couponPriceOrDiscount4Tag?: string
  discount?: null
  isDayLimit?: number
  isEndDay?: number
  isLimitUsedNum?: number
  isReceiveEnd?: number
  isRobOut?: number
  limitAmount?: number
  logoPic?: null
  newTemplateTitleList?: string[]
  orderConditionList?: null
  templateTitleList?: string[]
  usableClientTypeText?: string
  useGoodsRangeExplain?: string
  useTimeText?: string
  [property: string]: any
}

export interface GoodsImageList {
  colorId?: number
  commonId?: number
  goodsId?: number
  imageId?: number
  imageName?: string
  imageSort?: number
  imageSrc?: string
  isDefault?: number
  [property: string]: any
}

export interface GoodsList {
  app?: number
  appDiscountUsable?: number
  appEstimatedPrice?: number
  appPrice0?: number
  appPrice1?: number
  appPrice2?: number
  appUsable?: number
  colorId?: number
  commonId?: number
  deleteState?: number
  deliveryType?: number
  deliveryTypeStr?: string
  deliveryTypeText?: string
  deliveryTypeTipText?: string
  dimension?: null
  discountGoodsStorage?: number
  dutyPaidCode?: string
  extraLockingStorage?: number
  giftVoList?: string[]
  goodsBrandSerial?: null
  goodsFullSpecs?: string
  goodsId?: number
  goodsName?: string
  goodsNameEn?: string
  goodsPrice0?: number
  goodsPrice1?: number
  goodsPrice2?: number
  goodsSerial?: string
  goodsSpecs?: string
  goodsSpecString?: string
  goodsState?: number
  goodsStorage?: number
  groupPrice?: number
  imageName?: string
  imageSrc?: string
  isCash?: number
  isConformCouponGoods?: number
  isConformGoods?: number
  isCouponActivityGoods?: number
  isGift?: number
  isGroup?: null
  isImportGoods?: number
  isSeckill?: number
  kpArticleCode?: string
  kpStatus?: null
  kpSyncPrice?: number
  kpSyncStorage?: number
  limitAmount?: number
  liveRmbViewPrice?: null
  liveViewPrice?: null
  lockDiscountStorage?: number
  lockingStorage?: number
  maxSaleQty?: number
  metaKeyword?: null
  metaTitle?: null
  onlineTime?: null
  originalPrice?: number
  promotionEndTime?: null
  promotionId?: number
  promotionStartTime?: null
  promotionState?: number
  promotionSyncPrice?: number
  promotionTitle?: string
  promotionType?: number
  promotionTypeText?: string
  rmbAppEstimatedPrice?: number
  rmbAppPrice?: number
  rmbGoodsPrice?: number
  rmbWebEstimatedPrice?: number
  rmbWebPrice?: number
  rmbWechatEstimatedPrice?: number
  rmbWeChatPrice?: number
  specValueIds?: string
  supportDeliveryType?: number
  swithImg?: null
  swithImgColor?: null
  upcCode?: string
  viewPriceFlag?: number
  web?: number
  webDiscountUsable?: number
  webEstimatedPrice?: number
  webPrice0?: number
  webPrice1?: number
  webPrice2?: number
  webSalePrice?: number
  webUsable?: number
  wechat?: number
  wechatDiscountUsable?: number
  wechatEstimatedPrice?: number
  wechatPrice0?: number
  wechatPrice1?: number
  wechatPrice2?: number
  wechatUsable?: number
  [property: string]: any
}

export interface SpecialItem {

  alipayMini: number
  android: number
  deliveryType: number
  groupEndTime: null
  groupStartTime: null
  ios: number
  /**
   * 模块数据
   */
  itemData: string
  itemId: number
  itemSort: number
  /**
   * 模块类型
   */
  itemType: string
  /**
   * 模块名称
   */
  itemTypeText: string
  specialGroupId: number
  specialId: number
  status: number
  wap: number
  wechat: number
  wechatMini: number

}
export interface SpecialItemAd {
  adExpireShowState: number
  adShowEndTime: string
  adShowStartTime: string
  alipayMiniAdShowState: number
  alipayMiniData: string
  appAdShowState: number
  data: number | string | any
  goodsData: string
  image: string
  imageHeight: string
  imageUrl: string
  imageWidth: string
  lR: string
  text: string
  type: string
  wapAdShowState: number
  wechatMiniAdShowState: number
  wechatMiniData: string
}
export interface SpecialItemHome1 {
  image: string
  type: string
  data: string
  wechatMiniData: string
  alipayMiniData: string
  text: string
  goodsData: string
  imageHeight: string
  imageWidth: string
  adShowStartTime: null
  adShowEndTime: null
  adExpireShowState: number
  lR: string
  appAdShowState: number
  wapAdShowState: number
  wechatMiniAdShowState: number
  alipayMiniAdShowState: number
  imageUrl: string
}
