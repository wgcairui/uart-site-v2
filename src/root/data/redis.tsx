import { Button, Form, Input, message, Modal, Space, Table } from "antd"
import React, { useState } from "react";
import { redisflushall, redisflushdb, rediskeys, rediskeysdel, rediskeysdValue } from "../../common/FecthRoot";
import { generateTableKey, getColumnSearchProp } from "../../common/tableCommon";
import { RootMain } from "../../components/RootMain";
import { usePromise } from "../../use/usePromise";

export const Redis: React.FC = () => {

    const [key, setKey] = useState("")

    const list = usePromise(async () => {
        const { data } = await rediskeys(key + "*")
        return data.map(el => ({ key: el, value: '' }))
    }, [], [key])

    /**
     * 获取键值
     * @param row 
     */
    const getValue = (key: string) => {
        rediskeysdValue([key]).then(el => {
            const index = list.data.findIndex(el => el.key === key)
            list.data.splice(index, 1, { ...list.data[index], value: el.data[0] })
            list.setData([...list.data])
        })
    }


    /**
     * 删除键值
     */
    const delValue = (key: string) => {
        rediskeysdel([key]).then(el => {
            const index = list.data.findIndex(el => el.key === key)
            list.data.splice(index, 1)
            list.setData([...list.data])
        })
    }

    const redisflushdbs = () => {
        Modal.confirm({
            content: `此操作不可逆,只有在服务器缓存出错并且找不到出错的问题时执行,清理完将会重启服务程序,确定清除整个数据库??`,
            onOk() {
                redisflushdb().then(el => {
                    message.success("清除成功" + el.data)
                })
            }
        })
    }

    return (
        <>
            <Form layout="inline">
                <Form.Item label="key">
                    <Input value={key} placeholder="输入键+*匹配" onChange={e => setKey(e.target.value)} />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" >查找</Button>
                        <Button type="ghost" onClick={() => redisflushdbs()}>清空redis</Button>
                    </Space>
                </Form.Item>
            </Form>
            <Table
                loading={list.loading}
                dataSource={generateTableKey(list.data, 'key')}
                columns={[
                    {
                        dataIndex: 'key',
                        title: 'key',
                        ...getColumnSearchProp('key')
                    },
                    {
                        dataIndex: 'value',
                        title: 'value',
                        ...getColumnSearchProp('value') as any
                    },
                    {
                        key: 'oprayte',
                        title: '操作',
                        render: (_, li) => <Space>
                            <Button onClick={() => getValue(li.key)} type="primary" >获取值</Button>
                            <Button onClick={() => delValue(li.key)}>删除值</Button>
                        </Space>
                    }
                ]}
            >
            </Table>
        </>
    )
}