import React, { useState } from "react";
import { RootMain } from "../../components/RootMain";
import { ClientResultSingle as single, queryResultSave, ClientResult as getData, } from "../../common/FecthRoot"
import { Button, Card, DatePicker, Divider, Form, Table, Tag, TimePicker } from "antd";
import moment from "moment";
import { generateTableKey, getColumnSearchProp, tableColumnsFilter } from "../../common/tableCommon";
import { ColumnsType } from "antd/lib/table";
import { IusePromiseData, usePromise } from "../../hook/usePromise";
import { ResultDataOriginal } from "../../components/resultData";



/**
 * 展示展开设备解析数据和原始数据
 * @param li 
 * @returns 
 */
export const clientResultExpandableExpandedRowRender = (li: queryResultSave & Record<string, any>) =>
    <Card>
        <Divider orientation="center" plain>运行数据</Divider>
        <Table dataSource={generateTableKey(li.result, 'name')} pagination={{ hideOnSinglePage: true }}
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
        <ResultDataOriginal id={li.parentId} />
    </Card>


export const ClientResultSingle: React.FC = () => {

    const list = usePromise(async () => {
        const el = await single();
        return el.data.map(el => ({ ...el, content: [] as Uart.queryResult[] }));
    }, [])


    return (
        <>
            <Divider orientation="left">设备数据最新</Divider>
            <Table
                loading={list.loading}
                dataSource={generateTableKey(list.data, '_id')}
                columns={[
                    {
                        dataIndex: 'mac',
                        title: 'mac',
                        ...getColumnSearchProp('mac')
                    },
                    {
                        dataIndex: 'pid',
                        title: 'pid'
                    },
                    {
                        dataIndex: 'Interval',
                        title: 'Interval'
                    },
                    {
                        dataIndex: 'useTime',
                        title: 'useTime',
                    },
                    {
                        dataIndex: 'time',
                        title: 'time',
                        render: val => moment(val).format('YYYY-MM-DD H:m:s')
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



export const ClientResult: React.FC = () => {

    const [date, setDate] = useState(() => moment(new Date(), 'YYYY/MM/DD'))
    const [time, setTime] = useState(() => moment('00:00:00', 'HH:mm:ss'))

    const list = usePromise(async () => {
        const start = date.format('YYYY-MM-DD') + ' ' + time.format('H:m:s')
        const end = moment(start).add(10, 'minute').format('YYYY-MM-DD H:m:s')
        const { data } = await getData(start, end)
        return data
    }, [], [date, time])

    return (
        <>
            <Divider >设备解析数据</Divider>
            <Form layout="inline">
                <Form.Item label="查看日期">
                    <DatePicker value={date} onChange={val => setDate(val!)} />
                </Form.Item>
                <Form.Item label="查看时间(10分钟)">
                    <TimePicker value={time} onChange={val => setTime(val!)} />
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