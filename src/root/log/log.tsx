import { Button, Card, DatePicker, Descriptions, Divider, Form, Table, Tag, } from "antd";
import { TableProps } from "antd/lib/table";
import moment from "moment";
import React, { useState } from "react";
import { logmailsends, lognodes, logsmssends, logterminals, loguartterminaldatatransfinites } from "../../common/FecthRoot";
import { ResultDataParse } from "../../common/resultData";
import { generateTableKey, getColumnSearchProp, tableColumnsFilter } from "../../common/tableCommon";
import { MyCopy } from "../../components/myCopy";
import { RootMain } from "../../components/RootMain";
import { usePromise } from "../../use/usePromise";

interface log<T = any> extends TableProps<T> {
    /**
     * 天数间隔,之前N天至今天
     */
    lastDay?: number
    /**
     * 数据获取函数,只能用于log api,参数已配置
     */
    dataFun: Function
    /**
     * 开启参数刷选的字段
     */
    cfilter?: string[]
}

/**
 * 日志组件通用页面配置
 * @param props 
 * @returns 
 */
const Log: React.FC<log> = (props) => {

    const [date, setDate] = useState([moment().subtract(props.lastDay || 1, 'day'), moment()])

    const list = usePromise(async () => {
        const { data } = await props.dataFun(date[0].format(), date[1].format())//lognodes(date[0].format(), date[1].format())
        return data
    }, [], [date])

    /**
     * 合并传入的col
     * @returns 
     */
    const columns = () => {
        const c = props.columns ? props.columns : []
        const arr = [
            c,
            {
                dataIndex: 'timeStamp',
                title: '时间',
                render: (val: string) => moment(val).format('YYYY-MM-DD HH:mm:ss'),

            },
        ].flat()

        if (props.cfilter) {
            const s = new Set(props.cfilter)
            s.add('type')
            arr.forEach((el: any) => {
                if (s.has(el.dataIndex)) {
                    Object.assign(el, { ...tableColumnsFilter(list.data, el.dataIndex) })
                }
            })
        }
        /* if (props.cfilterProps) {
            const s = new Set(props.cfilterProps)
            arr.forEach((el: any) => {
                if (s.has(el.dataIndex)) {
                    Object.assign(el, { ...getColumnSearchProp<any>(el.dataIndex) })
                }
            })
        } */

        return arr
    }

    return (
        <RootMain>
            <Form layout="inline" style={{ marginBottom: 12 }}>
                <Form.Item label="查询时间段">
                    <DatePicker.RangePicker
                        value={[date[0], date[1]]}
                        onChange={(_, d) => setDate(d.map(el => moment(el)))}
                    ></DatePicker.RangePicker>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" onClick={() => list.fecth()}>刷新</Button>
                </Form.Item>
            </Form>
            <Table
                {...props}
                loading={list.loading}
                dataSource={generateTableKey(list.data, '_id')}
                columns={columns()}
            ></Table>
        </RootMain>
    )
}

/**
 * 节点日志
 * @returns 
 */
export const LogNode: React.FC = () => {
    return (
        <Log lastDay={10} dataFun={lognodes}
            cfilter={['Name']}
            columns={[
                {
                    dataIndex: 'Name',
                    title: 'Name',

                },
                {
                    dataIndex: 'type',
                    title: '事件',
                },
                {
                    dataIndex: 'ID',
                    title: 'socketId'
                }
            ]}></Log>
    )
}

/**
 * 设备log
 * @returns 
 */
export const LogTerminal: React.FC = () => {
    return (
        <Log lastDay={5} dataFun={logterminals}
            columns={[
                {
                    dataIndex: 'TerminalMac',
                    title: 'mac',
                    ...getColumnSearchProp('TerminalMac')
                },
                {
                    dataIndex: 'NodeName',
                    title: 'NodeName'
                },
                {
                    dataIndex: 'type',
                    title: '事件',
                }
            ]}

            expandable={{
                rowExpandable: (li: Uart.logTerminals) => li.query,
                expandedRowRender: (li: Uart.logTerminals) =>
                    <Card>
                        <Divider orientation="center">Query</Divider>
                        <Descriptions>
                            {
                                Object.entries(li.query || {}).map(([key, val]) =>
                                    <Descriptions.Item label={key}>{val as any}</Descriptions.Item>
                                )
                            }
                        </Descriptions>
                        <Divider orientation="center">Result</Divider>
                        <Descriptions>
                            {
                                Object.entries(li.result || {}).map(([key, val]) =>
                                    <Descriptions.Item label={key}>{val as any}</Descriptions.Item>
                                )
                            }
                        </Descriptions>
                    </Card>

            }}
        >

        </Log>
    )
}


/**
 * smslog
 * @returns 
 */
export const LogSms: React.FC = () => {
    const parse = (str: string, keys: string[]) => {
        try {
            const j = JSON.parse(str)
            for (let index = 0; index < keys.length; index++) {
                const key = keys[index]
                if (key in j) return key + ':' + j[key]
            }
        } catch (error) {
            return str
        }
    }
    return (
        <Log
            lastDay={15}
            dataFun={logsmssends}
            columns={[
                {
                    dataIndex: 'tels',
                    title: 'tels',
                    render: (val: string[]) => val.join(","),
                    ...getColumnSearchProp('tels')
                },
                {
                    dataIndex: 'sendParams',
                    title: 'sendParams',
                    render: val => parse(val.TemplateParam, ['remind', 'code'])//.remind ||val.TemplateParam //
                },
                {
                    key: 'result',
                    title: 'result',
                    render: (_, sms: Uart.logSmsSend) => sms?.Success?.Message || sms?.Error?.message || 'null'
                }
            ]}

            expandable={{
                expandedRowRender: (li: Uart.logSmsSend) =>
                    <Card>
                        <Divider orientation="center">sendParams</Divider>
                        <Descriptions column={1}>
                            {
                                Object.entries(li.sendParams || {}).map(([key, val]) =>
                                    <Descriptions.Item label={key} key={key}>
                                        <MyCopy value={val as any} />
                                    </Descriptions.Item>
                                )
                            }
                        </Descriptions>
                        <Divider orientation="center">Success</Divider>
                        <Descriptions column={1}>
                            {
                                Object.entries(li.Success || {}).map(([key, val]) =>
                                    <Descriptions.Item label={key} key={key}>
                                        <MyCopy value={val as any} />
                                    </Descriptions.Item>
                                )
                            }
                        </Descriptions>
                        <Divider orientation="center">Error</Divider>
                        <Descriptions column={1}>
                            {
                                Object.entries(li.Error || {}).map(([key, val]) =>
                                    <Descriptions.Item label={key} key={key}>
                                        <MyCopy value={typeof val === 'string' ? val : JSON.stringify(val)} />
                                    </Descriptions.Item>
                                )
                            }
                        </Descriptions>
                    </Card>
            }}
        ></Log>
    )
}


export const LogMail: React.FC = () => {
    return (
        <Log
            lastDay={30}
            dataFun={logmailsends}
            columns={[
                {
                    dataIndex: 'mails',
                    title: 'mails',
                    render: (val: string[]) => val.join(","),
                    ...getColumnSearchProp('mails')
                },
                {
                    dataIndex: 'sendParams',
                    title: 'sendParams',
                    ellipsis: true,
                    render: val => val.html,
                },
                {
                    key: 'result',
                    title: 'result',
                    render: (_, sms: Uart.logMailSend) => sms?.Success?.response || sms?.Error?.message || 'null'
                }
            ]}

            expandable={{
                expandedRowRender: (li: Uart.logSmsSend) =>
                    <Card>
                        <Divider orientation="center">sendParams</Divider>
                        <Descriptions column={1}>
                            {
                                Object.entries(li.sendParams || {}).map(([key, val]) =>
                                    <Descriptions.Item label={key} key={key}>
                                        <MyCopy value={val as any} />
                                    </Descriptions.Item>
                                )
                            }
                        </Descriptions>
                        <Divider orientation="center">Success</Divider>
                        <Descriptions column={1}>
                            {
                                Object.entries(li.Success || {}).map(([key, val]) =>
                                    <Descriptions.Item label={key} key={key}>
                                        <MyCopy value={typeof val === 'string' ? val : JSON.stringify(val)} />
                                    </Descriptions.Item>
                                )
                            }
                        </Descriptions>
                        <Divider orientation="center">Error</Divider>
                        <Descriptions column={1}>
                            {
                                Object.entries(li.Error || {}).map(([key, val]) =>
                                    <Descriptions.Item label={key} key={key}>
                                        <MyCopy value={typeof val === 'string' ? val : JSON.stringify(val)} />
                                    </Descriptions.Item>
                                )
                            }
                        </Descriptions>
                    </Card>
            }}
        >

        </Log>
    )
}


export const LogUartTerminalDatatransfinites: React.FC = () => {
    return (
        <Log
            lastDay={10}
            dataFun={loguartterminaldatatransfinites}
            cfilter={['tag']}
            columns={[
                {
                    dataIndex: 'isOk',
                    title: 'isOk',
                    render: val => val ? <Tag color='green'>ok</Tag> : <Tag>未确认</Tag>,
                    width: 80
                },
                {
                    dataIndex: 'mac',
                    title: 'mac',
                    ...getColumnSearchProp('mac'),
                    width: 150
                },
                {
                    dataIndex: 'pid',
                    title: 'pid',
                    width: 60
                },
                {
                    dataIndex: 'tag',
                    title: 'tag',
                    width: 120
                },
                {
                    dataIndex: 'msg',
                    title: 'msg',
                    ...getColumnSearchProp('msg'),
                    ellipsis: true
                }
            ]}

            expandable={{
                rowExpandable:li=>li.parentId,
                expandedRowRender: li => <ResultDataParse id={li.parentId} />
            }}

        />
    )
}