import type { InterObj, Item, FormLabel } from './types'
import type { DraggingStyle, DropResult, NotDraggingStyle } from 'react-beautiful-dnd'

import { useState } from 'react'
import copy from 'copy-to-clipboard'
import CodeMirror from '@uiw/react-codemirror'
import { arrayMoveImmutable } from 'array-move'
import { CopyOutlined } from '@ant-design/icons'
// import ReactCanvasNest from 'react-canvas-nest'
import { javascript } from '@codemirror/lang-javascript'
import { Form, Input, Button, Radio, message } from 'antd'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

import BackMapFront from './type.map'
import styles from './index.module.less'
import classMerge from '../../utils/mergeClassName'
import { enumerateSwitch, mockTypeConvert, mockWrapper, modelDataConvert, wrapper } from './utils'

const { TextArea } = Input

const Index = () => {
  const [paramsList, setParmsList] = useState<Item[]>([
    { id: 1, name: '参数' },
    { id: 2, name: '类型' },
    { id: 3, name: '是否必填' },
    { id: 4, name: '描述' },
    { id: 5, name: '枚举' }
  ])

  const [reqTemplate, setReqTemplate] = useState<string>()
  const [staticModel, setStaticModel] = useState<string>()
  const [mockTemplatePc, setMockTemplatePc] = useState<string>()
  const [mockTemplateMini, setMockTemplateMini] = useState<string>()

  const onFinish = (values: FormLabel) => {
    if (!values.reqParams) {
      message.warn('请输入接口文档数据')
    }

    const { interName, isExport, reqParams, reqIsString } = values

    const mockTemplatePc = mockConvert(reqParams, 'pc')
    const mockTemplateMini = mockConvert(reqParams, 'mini')
    const staticModel = modelConvert(reqParams)
    const reqTemplate = paramsConvert(reqParams, reqIsString)

    setStaticModel(modelDataConvert(staticModel))
    setMockTemplatePc(mockWrapper(mockTemplatePc, 'pc'))
    setMockTemplateMini(mockWrapper(mockTemplateMini, 'mini'))
    setReqTemplate(wrapper(reqTemplate, interName || 'REQ', isExport))
  }

  /**
   * 请求响应参数处理
   * params: 参数内容
   * isString: 枚举类型是否为string
   **/
  const paramsConvert = (params: string, isString: boolean): string => {
    if (!params) {
      return ''
    }

    const ReqInter = (params?.split(/\n/).reduce((pre, cur) => {
      // 'id string desc' => ['id', 'string', 'desc']
      const itemArr = cur.split(/\s+/)

      const nameIndex = paramsList.findIndex(item => item.name === '参数')
      const typeIndex = paramsList.findIndex(item => item.name === '类型')
      const descIndex = paramsList.findIndex(item => item.name === '描述')
      const isRequireIndex = paramsList.findIndex(item => item.name === '是否必填')
      const valueIndex = paramsList.findIndex(item => item.name === '枚举')

      const name = itemArr[nameIndex]
      const type = BackMapFront.get(itemArr[typeIndex]) as string || `请添加此类型映射-${itemArr[typeIndex]}`
      const desc = itemArr[descIndex]
      const isRequire = BackMapFront.get(itemArr[isRequireIndex]) || 'true'

      // 枚举类型处理
      const value = enumerateSwitch(itemArr[valueIndex], isString)

      const obj: InterObj = {
        name,
        type,
        desc,
        isRequire,
        value
      }

      pre.push(obj)
      return [...pre]
    }, [] as InterObj[]))

    const template = ReqInter?.map(item => {
      if (!item.desc) {
        return `  ${item.name}${item.isRequire === 'true' ? '' : '?'}: ${item.value ? item.value : item.type};`
      }

      return `  /**
   * ${item.desc}
   */
  ${item.name}${item.isRequire === 'true' ? '' : '?'}: ${item.value ? item.value : item.type};`
    }).join('\n')

    return template
  }

  const mockConvert = (resParams: string, targetType?: 'pc' | 'mini'): string => {
    if (!resParams) {
      return ''
    }

    const MockData = (resParams?.split(/\n/).reduce((pre, cur) => {
      // 'id string desc' => ['id', 'string', 'desc']
      const itemArr = cur.split(/\s+/)

      const nameIndex = paramsList.findIndex(item => item.name === '参数')
      const typeIndex = paramsList.findIndex(item => item.name === '类型')
      const valueIndex = paramsList.findIndex(item => item.name === '枚举')

      const name = itemArr[nameIndex]
      const type = BackMapFront.get(itemArr[typeIndex]) as string || `请添加此类型映射-${itemArr[typeIndex]}`

      const mockValue = mockTypeConvert(type, name, itemArr[valueIndex], targetType)

      const obj: InterObj = {
        name,
        type,
        mockValue
      }

      pre.push(obj)
      return [...pre]
    }, [] as InterObj[]))

    const template = MockData?.map(item => {
      if (targetType === 'mini') return `  "${item.name}": ${item.mockValue},`

      return `  ${item.name}: ${item.mockValue},`
    })

    return template.join('\n')
  }

  const modelConvert = (resParams: string) => {
    const model = (resParams?.split(/\n/).reduce((pre, cur) => {
      // 'id string desc' => ['id', 'string', 'desc']
      const itemArr = cur.split(/\s+/)

      const nameIndex = paramsList.findIndex(item => item.name === '参数')
      const descIndex = paramsList.findIndex(item => item.name === '描述')

      const name = itemArr[nameIndex]
      const desc = itemArr[descIndex]

      const temp = [name, desc]

      pre.push(temp)
      return [...pre]
    }, [] as string[][]))

    return model
  }

  const handleCopy = (text: string, title = 'title') => {
    if (!text) {
      message.warn('暂无可复制内容')
    }

    copy(text) && message.success(`${title}复制成功`)
  }

  const onParamsDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const newList = arrayMoveImmutable(
      paramsList,
      result.source.index,
      result.destination.index
    )

    setParmsList(newList)
  }

  const getListStyle = (isDraggingOver: boolean) => ({
    boxShadow: isDraggingOver ? 'lightblue' : 'lightgrey',
    background: '#f1f2f5',
    padding: '8px 16px',
    display: 'flex'
  })

  const getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined) => ({
    transition: 'all 0.35s ease-in-out',
    boxShadow: isDragging ? '0 3px 8px 3px rgba(0, 0, 0, 0.16)' : 'none',
    background: 'white',
    margin: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    ...draggableStyle
  })

  return (
    <div className={styles.container}>
      {/* <ReactCanvasNest
        config={{ pointColor: ' 255, 255, 255 ', pointOpacity: 0.3 }}
        style={{ opacity: 0.3 }}
      /> */}

      <h1>接口转化器</h1>
      <Form
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 20 }}
        initialValues={{
          remember: true,
          isExport: false,
          reqIsString: true,
          resIsString: true
        }}
        onFinish={onFinish}
        autoComplete="on"
      >
        <Button className={styles.btn} type="primary" htmlType="submit">
          生成接口代码
        </Button>

        <Form.Item
          wrapperCol={{ span: 8 }}
          label="接口名称"
          name="interName"
        >
          <Input />
        </Form.Item>

        <Form.Item
          wrapperCol={{ span: 8 }}
          label="是否导出"
          name="isExport"
        >
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          wrapperCol={{ span: 8 }}
          label="入参字段顺序"
          name="paramsSort"
        >
          <DragDropContext onDragEnd={onParamsDragEnd}>
            <Droppable direction="horizontal" droppableId="droppableParams">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {paramsList.map((item, index) => (
                    <Draggable key={item.id} draggableId={`${item.id}`} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <span>{item.name}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Form.Item>

        <Form.Item
          wrapperCol={{ span: 8 }}
          label="枚举是否字符串"
          name="reqIsString"
        >
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          wrapperCol={{ span: 14 }}
          label="接口文档"
          name="reqParams"
        >
          <TextArea rows={10} />
        </Form.Item>
      </Form>

      <div className={styles.resultContainer}>
        {
          reqTemplate &&
          <div className={classMerge(styles.interContainer, styles.resultItem)}>
            <div className={styles.copyContainer}>
              <h3>请求</h3>
              <CopyOutlined onClick={() => handleCopy(reqTemplate, '类型')} />
            </div>

            <CodeMirror
              value={reqTemplate}
              height="100%"
              theme='light'
              extensions={[javascript({ jsx: true })]}
            />
          </div>
        }
        {
          mockTemplateMini &&
          <div className={classMerge(styles.mockContainer, styles.resultItem)}>
            <div className={styles.copyContainer}>
              <h3>oneapi(小程序)</h3>
              <CopyOutlined onClick={() => handleCopy(mockTemplateMini, 'oneapi(小程序)')} />
            </div>

            <CodeMirror
              value={mockTemplateMini}
              height="100%"
              theme='light'
              extensions={[javascript({ jsx: true })]}
            />
          </div>
        }
        {
          mockTemplatePc &&
          <div className={classMerge(styles.mockContainer, styles.resultItem)}>
            <div className={styles.copyContainer}>
              <h3>mockjs(PC)</h3>
              <CopyOutlined onClick={() => handleCopy(mockTemplatePc, 'mockjs(PC)')} />
            </div>

            <CodeMirror
              value={mockTemplatePc}
              height="100%"
              theme='light'
              extensions={[javascript({ typescript: true })]}
            />
          </div>
        }
      </div>
      <div>
        {
          staticModel &&
          <div>
            <div className={styles.copyContainer}>
              <h3>静态模型(PC)</h3>
              <CopyOutlined onClick={() => handleCopy(staticModel, '静态模型')} />
            </div>

            <CodeMirror
              value={staticModel}
              height="100%"
              theme='light'
              extensions={[javascript({ typescript: true })]}
            />
          </div>
        }
      </div>
    </div>
  )
}

export default Index