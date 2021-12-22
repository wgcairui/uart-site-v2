import { Card, Divider, Table, Tag } from "antd"
import { ColumnsType } from "antd/lib/table"
import moment from "moment"
import { useState } from "react"
import { MyCopy } from "./myCopy"
import { usePromise } from "../use/usePromise"
import { ClientResult, ClientResults } from "../common/FecthRoot"
import { getTerminalDatas } from "../common/Fetch"
import { generateTableKey, getColumnSearchProp } from "../common/tableCommon"

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

    const [pid, setPid] = useState('')

    const { loading, data } = usePromise(async () => {
        if (id) {
            const time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
            const { data } = await ClientResult(time, time, id)
            setPid(data[0].parentId)
            return data[0].result
        } else {
            return []
        }
    }, [], [id])



    return (
        <Card>
            <Divider orientation="center" plain>解析数据</Divider>
            <Table loading={loading} dataSource={generateTableKey(data, 'name')}
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
                        title: '解析值'
                    },
                    {
                        dataIndex: 'alarm',
                        title: '告警',
                        render: val => <Tag color={val ? 'red' : 'success'}>{val ? '是' : '否'}</Tag>
                    }
                ]}
            />
            <Divider orientation="center" plain>原始数据</Divider>
            <ResultDataOriginal id={pid} />
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