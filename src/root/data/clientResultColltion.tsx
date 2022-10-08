import { Divider, Form, DatePicker, TimePicker, Button, Table, Tag } from "antd"
import { ColumnsType } from "antd/lib/table"
import moment from "moment"
import React, { useState } from "react"
import { ClientResult, queryResultSave } from "../../common/FecthRoot"
import { generateTableKey, getColumnSearchProp, tableColumnsFilter } from "../../common/tableCommon"
import { usePromise, IusePromiseData } from "../../hook/usePromise"
import { clientResultExpandableExpandedRowRender } from "./clientResult"

export const ClientResultColtion: React.FC = () => {

    const [date, setDate] = useState(() => moment(new Date(), 'YYYY/MM/DD'))
    const [time, setTime] = useState(() => moment('00:00:00', 'HH:mm:ss'))

    const list = usePromise(async () => {
        const start = date.format('YYYY-MM-DD') + ' ' + time.format('H:m:s')
        const end = moment(start).add(10, 'minute').format('YYYY-MM-DD H:m:s')
        const { data } = await ClientResult(start, end)
        return data
    }, [], [date, time])

    return (
        <>
            <Divider >设备解析数据</Divider>
            <Form layout="inline">
                <Form.Item label="查看日期">
                    <DatePicker value={date as any} onChange={val => setDate(val!)} />
                </Form.Item>
                <Form.Item label="查看时间(10分钟)">
                    <TimePicker value={time as any} onChange={val => setTime(val!)} />
                </Form.Item>
                <Form.Item >
                    <Button onClick={() => list.fecth()}>获取</Button>
                </Form.Item>
            </Form>
            <Table
                dataSource={generateTableKey(list.data, '_id')}
                loading={list.loading}
                columns={[
                    {
                        dataIndex: 'mac',
                        title: 'mac',
                        ...getColumnSearchProp('mac')
                    },
                    {
                        dataIndex: 'pid',
                        title: 'pid',
                        ...tableColumnsFilter(list.data, 'pid')
                    },
                    {
                        dataIndex: 'hasAlarm',
                        title: '告警',
                        render: val => <Tag color={val ? 'red' : 'success'}>{val ? '是' : '否'}</Tag>
                    },
                    {
                        dataIndex: 'useTime',
                        title: 'useTime',
                    },
                    {
                        dataIndex: 'timeStamp',
                        title: '时间',
                        render: val => moment(val).format("YYYY/MM/DD H:m:s")
                    }
                ] as ColumnsType<IusePromiseData<queryResultSave>>}

                expandable={{
                    expandRowByClick: true,
                    expandedRowRender: clientResultExpandableExpandedRowRender
                }}
            />
        </>
    )
}

export default ClientResultColtion