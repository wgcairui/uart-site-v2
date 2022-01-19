import { Card, Divider, Empty, Table, Tag, Tooltip } from "antd"
import { ColumnsType } from "antd/lib/table"
import moment from "moment"
import { useState } from "react"
import { MyCopy } from "./myCopy"
import { usePromise } from "../hook/usePromise"
import { ClientResult, ClientResults } from "../common/FecthRoot"
import { getTerminalDatas } from "../common/Fetch"
import { generateTableKey, getColumnSearchProp } from "../common/tableCommon"
import { FundFilled, InfoCircleFilled } from "@ant-design/icons"
import { Link } from "react-router-dom"
import user from "../user"

/**
 * 展示设备原始数据
 * @param param0 
 * @returns 
 */
export const ResultDataOriginal: React.FC<{ id: string }> = ({ id }) => {

    const { loading, data } = usePromise(async () => {
        if (id) {
            const time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            const { data } = await ClientResults(time, time, id)
            return data[0].contents
        } else {
            return []
        }
    }, [], [id])

    return (
        <Table loading={loading} dataSource={generateTableKey(data, 'content')} pagination={false}
            columns={[
                {
                    dataIndex: 'content',
                    title: '指令'
                },
                {
                    dataIndex: 'data',
                    title: '数据',
                    render: (val: number[]) => <MyCopy value={val.map(el => el.toString(16).padStart(2, '0')).join(' ')} />
                }
            ]}
        />
    )
}

/**
 * 展示设备解析数据
 * @param param0 
 * @returns 
 */
export const ResultDataParse: React.FC<{ id: string }> = ({ id }) => {

    //const [pid, setPid] = useState('')

    const { loading, data } = usePromise(async () => {
        if (id) {
            const time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            const { data } = await ClientResult(time, time, id)
            //setPid(data[0].parentId)
            return data[0]
        } else {
            return undefined
        }
    }, undefined, [id])



    return (
        !data ? <Empty />
            : <Card>
                <Divider orientation="center" plain>解析数据</Divider>
                <Table loading={loading} dataSource={generateTableKey(data.result, 'name')}
                    columns={[
                        {
                            dataIndex: 'name',
                            title: '参数',
                            ...getColumnSearchProp('name')
                        },
                        {
                            dataIndex: 'value',
                            title: '值'
                        },
                        {
                            dataIndex: 'parseValue',
                            title: '解析值',
                            render: (value, record) => (
                                <span>{value }
                                    <Tooltip color="cyan" title={`查看[${record.name}]的历史记录`}>
                                        <Link
                                            to={`/root/node/terminal/devline?name=${record.name}&mac=${data.mac}&pid=${data.pid}`}>
                                            <FundFilled style={{ marginLeft: 8 }} />
                                        </Link>
                                    </Tooltip>

                                    {
                                        record.alarm ? <InfoCircleFilled style={{ color: "#E6A23C" }} /> : <a />
                                    }

                                </span>
                            )
                        },
                        {
                            dataIndex: 'alarm',
                            title: '告警',
                            render: val => <Tag color={val ? 'red' : 'success'}>{val ? '是' : '否'}</Tag>
                        }
                    ] as ColumnsType<Uart.queryResultArgument>}
                />
                <Divider orientation="center" plain>原始数据</Divider>
                <ResultDataOriginal id={data.parentId} />
            </Card>
    )
}


interface timeline {
    mac: string
    name: string
    pid: string
}

/**
 * 展示设备参数运行时间线
 * @returns 
 */
export const TimeLine: React.FC<timeline> = ({ mac, pid, name }) => {

    const [date, setDate] = useState(moment())

    const list = usePromise(async () => {
        const { data } = await getTerminalDatas(mac, pid, name, date.format('YYYY-MM-DD'))
        return data
    }, [], [date])

    return (
        <>
        </>
    )
}