import React, { useEffect, useState } from "react";
import { RootMain } from "../../components/RootMain";
import { ClientResults, ClientResultSingle as single, queryResultSave } from "../../common/FecthRoot"
import { Card, Divider, Spin, Table, Tag } from "antd";
import moment from "moment";
import { MyCopy } from "../../components/myCopy";
import { getColumnSearchProp } from "../../common/tableCommon";
import { ColumnsType } from "antd/lib/table";

type save = queryResultSave & { content?: Uart.queryResult }

export const ClientResultSingle: React.FC = () => {

    const [list, setList] = useState<save[]>([])

    /**
     * 获取数据
     */
    const getData = () => {
        single().then(el => {
            setList(el.data.map(el => ({ ...el, key: el._id })))
        })
    }

    useEffect(() => {
        getData()
    }, [])

    /**
     * 获取id对应原始数据
     * @param id 
     */
    const getContent = (id: string) => {
        const time = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        ClientResults(time, time, id).then(el => {
            if (el.data.length > 0 && el.data[0]) {
                const lists = [...list]
                const index = lists.findIndex(el => el.parentId === id)
                lists.splice(index, 1, { ...lists[index], content: el.data[0] })
                setList([...lists])
            }
        })
    }


    return (
        <RootMain>
            <Divider orientation="left">设备数据最新</Divider>
            <Table dataSource={list}
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
                ] as ColumnsType<save>}

                expandable={{
                    expandedRowRender: li =>
                        <Card>
                            <Divider orientation="center" plain>运行数据</Divider>
                            <Table dataSource={li.result}
                                columns={[
                                    {
                                        dataIndex: 'name',
                                        title: '参数'
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
                            {
                                li.content ?
                                    <Table dataSource={li.content.contents.map(el => ({ ...el, key: el.content }))}
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
                                    : <Spin />
                            }
                        </Card>
                    ,
                    onExpand: (ex, li) => {
                        if (ex && !li.content) getContent(li.parentId)
                    }
                }}
            />
        </RootMain>
    )
}