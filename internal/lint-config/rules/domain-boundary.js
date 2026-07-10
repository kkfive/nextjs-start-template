/**
 * Domain 层 import 边界约束工厂。
 *
 * 生成一个 ESLint config 对象，禁止 domain 目录导入 UI/app/hooks/store。
 *
 * @param {object} options
 * @param {string[]} [options.files] - domain glob（相对该 app 根），默认 ['domain/...', 'domain/...tsx']
 * @returns {object}
 */
export function domainBoundaryRules(options = {}) {
  const { files = ['domain/**/*.ts', 'domain/**/*.tsx'] } = options
  return {
    files,
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/components/*', '@/app/*', '@/hooks/*', '@/store/*', '@/lib/*'],
          message: 'Domain layer should not import React components, hooks, stores, or app infra (@/lib). Keep domain code framework-agnostic.',
        }],
      }],
    },
  }
}
