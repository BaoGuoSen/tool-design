/**
 * 转换为接口的最终格式
 * @param content 内容
 * @param name 类型名称
 * @param isExport 是否导出
 * @returns 类型模版
 */
const wrapper = (content: string, name: string, isExport: boolean): string => {
  return `${isExport ? 'export ' : ''}interface ${name} {
${content}
}`
}

/**
 * 转换为mock模版的最终格式
 * @param content 内容
 * @param type 小程序 or 后台
 * @returns
 */
const mockWrapper = (content: string, type?: 'mini' | 'pc'): string => {
  if (type === 'mini') {
    return `"data": {
${content}
}`
  }

  return `data: {
${content}
}`
}

/**
 * 枚举值类型处理
 * @param content 内容
 * @param isString 是否是字符串
 * @returns
 */
const enumerateSwitch = (content?: string, isString?: boolean): string | undefined => {
  if (!content) {
    return
  }

  if (isString) {
    return content.split('|').map(item => `'${item}'`).join(' | ')
  }

  return content.split('|').join(' | ')
}

/**
 * mock数据根据类型生成理想随机数据
 * @param type
 * @param value
 * @returns
 */
const mockTypeConvert = (type: string, value: string, enums?: string, targetType?: 'mini' | 'pc'): string | boolean => {
  if (targetType === 'pc') {
    if (enums) return `'@pick([${enums.split('|').map(item => `"${item}"`).join(',')}])'`

    if (type === 'string') {
      if (/id/i.test(value)) return `'@id'`
      if (/url/i.test(value)) return `'@url'`
      if (/name/i.test(value)) return `'@name'`
      if (/count|price|amount/i.test(value)) return `'@integer(1, 1000)'`
      if (/date|time/i.test(value)) return `'@datetime'`

      return `'${value}'`
    }

    if (type === 'number' && /id/i.test(value)) return `'@id'`

    if (type === 'boolean') return `'@boolean'`

    return `'${value}'`
  }

  if (enums) return `"@pick([${enums.split('|').map(item => `'${item}'`).join(',')}])"`

  if (type === 'string') {
    if (/id/i.test(value)) return `"@id"`
    if (/url/i.test(value)) return `"@url"`
    if (/name/i.test(value)) return `"@name"`
    if (/count|price|amount/i.test(value)) return `"@integer(1, 1000)"`
    if (/date|time/i.test(value)) return `"@datetime"`

    return `"${value}"`
  }

  if (type === 'number' && /id/i.test(value)) return `"@id"`

  if (type === 'boolean') return `"@boolean"`

  return `"${value}"`
}

// 表格模型数据
const tableColums = (model: string[][]) => {
  const colums = model.map(([key, value]) => {
    return `  {
    title: '${value}',
    dataIndex: '${key}'
  },`
  })

  return `const columns: TableColumnProps<T>[] = [
${colums.join('\n')}
]
`
}

// 搜索框模型数据
const searchBarFields = (model: string[][]) => {
  const fields = model.map(([key, value]) => {
    return `  { label: '${value}', name: '${key}' },`
  })

  return `const searchBarFields: IFormItemProps[] = [
${fields.join('\n')}
]
`
}

// 弹窗表单模型数据
const formComponents = (model: string[][]) => {
  const components = model.map(([key, value]) => {
    return `  { label: '${value}', name: '${key}' },`
  })

  return `const formComponents: IComponentsConfig = [
${components.join('\n')}
]
`
}

/**
 * 静态模型数据处理
 * @param model [[key, value], [key, value]]
 * @returns 处理后的静态数据
 */
const modelDataConvert = (model: string[][]) => {
  const columns = tableColums(model)
  const fields = searchBarFields(model)
  const components = formComponents(model)

  return `import type { TableColumnProps } from "antd";
import { IComponentsConfig, IFormItemProps } from "@/utils/createForm/types";

${columns}
${fields}
${components}
export { colums, searchBarFields, formComponents };
`
}

export { wrapper, mockWrapper, enumerateSwitch, mockTypeConvert, modelDataConvert }