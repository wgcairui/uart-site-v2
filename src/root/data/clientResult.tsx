import React from "react";
import { ClientResultSingle as single, queryResultSave, } from "../../common/FecthRoot"
import { Card, Divider, Table, Tag } from "antd";
import moment from "moment";
import { generateTableKey, getColumnSearchProp } from "../../common/tableCommon";
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

export default ClientResultSingle