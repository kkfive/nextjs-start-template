// apps/api Domain 适配层：re-export @kkfive/domain-core
// api 同进程直调 controller，无 hooks、无 HttpService 注入
export * from '@kkfive/domain-core/example/request'
