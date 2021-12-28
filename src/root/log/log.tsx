import { Button, Card, Col, DatePicker, Descriptions, Divider, Empty, Form, Row, Space, Table, Tag, } from "antd";
import { TableProps } from "antd/lib/table";
import moment from "moment";
import React, { useMemo, useState } from "react";
import { logdataclean, logmailsends, lognodes, logsmssends, logterminals, loguartterminaldatatransfinites, loguserlogins, loguserrequsts, logwxsubscribes, log_wxEvent } from "../../common/FecthRoot";
import { ResultDataParse } from "../../components/resultData";
import { generateTableKey, getColumnSearchProp, tableColumnsFilter } from "../../common/tableCommon";
import { MyCopy } from "../../components/myCopy";
import { usePromise } from "../../hook/usePromise";
import { Pie, Plot } from "@ant-design/charts";
import { pieConfig, pieData } from "../../common/charts";
import { MyDatePickerRange } from "../../components/myDatePickerRange";

interface pieArg {
    key: string
    event: (data: pieData, plot: Plot<any>) => void
}

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
    /**
     * pie饼图参数显示
     */
    cPie?: (string | pieArg)[]
}

/**
 * 日志组件通用页面配置
 * @param props 
 * @returns 
 */
const Log: React.FC<log> = (props) => {

    const [date, setDate] = useState([moment().subtract(props.lastDay || 1, 'day'), moment()])

    const [filter, setFilter] = useState<Record<string, string[] | null>>(() => {
        return props.cPie ?
            Object.assign({}, ...props.cPie.map(el => {
                const key = typeof el === 'string' ? el : el.key
                return { [key]: [] }
            }))
            : {}
    })

    const list = usePromise(async () => {
        const { data } = await props.dataFun(date[0].format(), date[1].format())
        return data
    }, [], [date])

    /**
     * 合并传入的col
     * @returns 
     */
    const columns = useMemo(() => {
        /**
         * 合并col
         */
        const arr = [
            props.columns ? props.columns : [],
            {
                dataIndex: 'timeStamp',
                title: '时间',
                render: (val: string) => moment(val).format('YYYY-MM-DD HH:mm:ss'),

            },
        ].flat()

        /**
         * 检查是否包含饼图配置,包含的话给相关字段添加filter配置
         */
        /*  if (props.cPie) {
             const fSet = new Set(props.cPie?.map(el => typeof el === 'string' ? el : el.key))
             arr.forEach((el: any) => {
                 if (fSet.has(el.dataIndex)) {
                     Object.assign(el, { filteredValue: filter[el.dataIndex], ...tableColumnsFilter(list.data, el.dataIndex) })
                 }
             })
         } */

        /**
         * 检查是否包含刷选配置
         */
        const s = new Set([...props.cfilter || [], ...props.cPie?.map(el => typeof el === 'string' ? el : el.key) || []])
        arr.forEach((el: any) => {
            if (s.has(el.dataIndex)) {
                Object.assign(el, { filteredValue: filter[el.dataIndex] || [], ...tableColumnsFilter(list.data, el.dataIndex) })
            }
        })

        return arr
    }, [filter])

    /**
     * 获取饼图配置
     */
    const pies = useMemo(() => {
        if (props.cPie && list.data.length > 0) {
            const hasPies = props.cPie.filter(el => ((typeof el === 'string') ? el : el.key) in list.data[0])
            if (hasPies.length !== props.cPie.length) console.log('piekey有未包含的键');

            return hasPies.map(el => {
                const m = new Map<string, number>();
                const [k, event] = typeof el === 'string' ? [el, undefined] : [el.key, el.event];
                (list.data as Record<string, any>[]).forEach(li => {
                    const key = li[k]
                    m.set(key, (m.get(key) || 0) + 1)
                })

                return {
                    data: [...m.entries()].map(([type, value]) => ({ type, value })),
                    key: k,
                    event
                }
            })

        } else {
            return []
        }
    }, [list.data])


    /**
     * 响应pie图点击事件,修改filterValue
     * @param type 
     * @param key 
     */
    const target = (type: string, key: string) => {
        setFilter(filter => ({ ...filter, [type]: [key] }))
    }

    const clearFilter = () => {
        setFilter(() => {
            return props.cPie ?
                Object.assign({}, ...props.cPie.map(el => {
                    const key = typeof el === 'string' ? el : el.key
                    return { [key]: [] }
                }))
                : {}
        })
    }

    return (
        <>
            <MyDatePickerRange lastDay={props.lastDay} onChange={setDate}>
                <Space>
                    <Button type="primary" onClick={() => list.fecth()}>刷新</Button>
                    <Button type="default" onClick={() => clearFilter()}>清除刷选配置</Button>
                </Space>
            </MyDatePickerRange>

            <Row >
                {
                    pies.map(el =>
                        <Col span={24 / pies.length} key={el.data[0].type} style={{ padding: 12 }}>
                            <Pie
                                data={el.data}
                                {...pieConfig({ angleField: 'value', colorField: 'type', radius: .6 })}
                                onReady={(p) => {
                                    p.on('plot:click', (e: any) => {
                                        if (el.event) el.event!(e.data.data, p)
                                        else {
                                            target(el.key, e.data.data.type)
                                        }
                                    })
                                }}
                            ></Pie>
                        </Col>)
                }
            </Row>
            <Table
                {...props}
                loading={list.loading}
                dataSource={generateTableKey(list.data, '_id')}
                columns={columns}
            ></Table>
        </>
    )
}

/**
 * 展示数据
 * @param param0 
 * @returns 
 */
const DesList: React.FC<{ title: string, data: Record<string, any> | undefined }> = ({ title, data }) => {
    return (
        <>
            <Divider orientation="center">{title}</Divider>
            {
                data ?
                    <Descriptions column={1}>
                        {
                            Object.entries(data).map(([key, val]) =>
                                <Descriptions.Item label={key} key={key}>
                                    <MyCopy value={typeof val === 'string' ? val : JSON.stringify(val)} />
                                </Descriptions.Item>
                            )
                        }
                    </Descriptions>
                    : <Empty />
            }
        </>
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
            cPie={['Name', 'type']}
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
        <Log lastDay={5}
            dataFun={logterminals}
            cPie={['type', 'TerminalMac']}
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
                        <DesList title="Query" data={li.query} />
                        <DesList title="Result" data={li.result} />
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
                        <DesList title="sendParams" data={li.sendParams} />
                        <DesList title="Success" data={li.Success} />
                        <DesList title="Error" data={li.Error} />
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
                        <DesList title="sendParams" data={li.sendParams} />
                        <DesList title="Success" data={li.Success} />
                        <DesList title="Error" data={li.Error} />
                    </Card>
            }}
        >

        </Log>
    )
}

/**
 * 设备告警提醒
 * @returns 
 */
export const LogUartTerminalDatatransfinites: React.FC = () => {
    return (
        <Log
            lastDay={10}
            dataFun={loguartterminaldatatransfinites}
            cfilter={['tag']}
            cPie={['mac', 'tag']}
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
                rowExpandable: li => li.parentId,
                expandedRowRender: li => <ResultDataParse id={li.parentId} />
            }}

        />
    )
}

/**
 * 用户登录日志
 * @returns 
 */
export const LogUserlogins: React.FC = () => {
    return (
        <Log
            lastDay={20}
            dataFun={loguserlogins}
            cfilter={['type']}
            cPie={['user', 'type']}
            columns={[
                {
                    dataIndex: 'user',
                    title: 'user',
                    ...getColumnSearchProp('user')
                },
                {
                    dataIndex: 'type',
                    title: 'type'
                },
                {
                    dataIndex: 'msg',
                    title: 'msg'
                },
                {
                    dataIndex: 'address',
                    title: 'address'
                }
            ]}
        >
        </Log>
    )
}


export const LogUserrequsts: React.FC = () => {
    return (
        <Log
            lastDay={5}
            dataFun={loguserrequsts}
            cfilter={['type']}
            cPie={['user', 'type']}
            columns={[
                {
                    dataIndex: 'user',
                    title: 'user',
                    ...getColumnSearchProp('user')
                },
                {
                    dataIndex: 'type',
                    title: 'type'
                },
            ]}

            expandable={{
                expandedRowRender: (li: Uart.logUserRequst) =>
                    <Card>
                        <DesList title="argument" data={li.argument} />
                    </Card>
            }}
        />
    )
}


export const LogDataClean: React.FC = () => {
    return (
        <Log
            lastDay={120}
            dataFun={logdataclean}
            columns={[
                {
                    dataIndex: 'timeStamp',
                    title: '日期',
                    render: val => moment(val).format('MM/DD')
                },
                {
                    dataIndex: 'CleanClientresultsTimeOut',
                    title: '超期数据'
                },
                {
                    dataIndex: 'NumClientresults',
                    title: '重复设备数据'
                },
                {
                    dataIndex: 'NumUserRequst',
                    title: '重复请求数据'
                },
                {
                    dataIndex: 'useTime',
                    title: '耗时'
                }
            ]}
        />
    )
}


export const LogWxEvent: React.FC = () => {
    return (
        <Log
            dataFun={log_wxEvent}
            cfilter={['MsgType', 'Event']}
            cPie={[
                'MsgType',
                'Event',
                'FromUserName']}
            columns={[
                {
                    dataIndex: 'FromUserName',
                    title: '用户',
                    ...getColumnSearchProp('FromUserName')
                },
                {
                    dataIndex: 'MsgType',
                    title: '类型'
                },
                {
                    dataIndex: 'Content',
                    title: 'Content'
                },
                {
                    dataIndex: 'Event',
                    title: '事件'
                }
            ]}

            expandable={{
                expandedRowRender: li => <DesList title="Data" data={li} />
            }}
        />
    )
}


export const LogWxSubscribe: React.FC = () => {
    return (
        <Log
            lastDay={10}
            dataFun={logwxsubscribes}
            cPie={['touser']}
            columns={[
                {
                    dataIndex: 'touser',
                    title: '用户'
                },
                {
                    dataIndex: 'data',
                    title: '消息',
                    render: val => val?.remark?.value || ''
                },
                {
                    dataIndex: 'result',
                    title: '状态',
                    render: val => val.errmsg
                }
            ]}

            expandable={{
                expandedRowRender: li =>
                    <Card>
                        <DesList title="data" data={li.data} />
                        <DesList title="result" data={li.result} />
                    </Card>
            }}
        />
    )
}