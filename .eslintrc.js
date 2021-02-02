module.exports = {
    rules: {
        '@typescript-eslint/no-unused-vars': 'off', // 未使用值禁止掉警告
        'import/no-unresolved': 0,
        'import/extensions': 0,
        'import/no-extraneous-dependencies': 0,
        'class-methods-use-this': 0,
        'arrow-body-style': ['error', 'as-needed', { requireReturnForObjectLiteral: true }], // 箭头函数，当大括号是可以省略的，强制不使用它们 (默认)
        'consistent-return': 0, // 要return根据代码分支允许函数具有不同的行为，则可以安全地禁用此规则。
        'no-restricted-syntax': 0, // 禁止for of
        'no-param-reassign': 0,
        'no-continue': 0, // 关闭禁止使用continue
        'no-await-in-loop': 0, // 关闭循环中使用await
        'no-console': 0, // 关闭console
        'no-useless-constructor': 0, // 关闭禁用constructor函数
        'no-unused-expressions': 0,
        'no-control-regex': 0,
        'react-hooks/exhaustive-deps': 0,
        'array-callback-return': 0,
        'no-sequences': 0,
        'no-use-before-define': 0,
        'eqeqeq': 0,
        'prettier/prettier': 0
    },
};
