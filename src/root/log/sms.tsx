import { Card, Divider, Table, Tabs } from "antd"
import { getUserAlarmSetups, logsmssends, logsmssendsCountInfo } from "../../common/FecthRoot"
import { generateTableKey, getColumnSearchProp } from "../../common/tableCommon"
import { UserDes } from "../../components/userData"
import { usePromise } from "../../hook/usePromise"
import { Log, DesList } from "./log"

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

    const { data, loading, err } = usePromise(async () => {
        const sms = await logsmssendsCountInfo()
        const users = await getUserAlarmSetups()
        const smsMap = new Map(sms.data.map(el => [el._id, el.sum]))
        const count = users.data.map(el => ({ user: el.user, map: el.tels.map(el2 => ({ tel: el2, count: smsMap.get(el2) || 0 })) }))
        const res = count.map(el => ({ ...el, count: el.map.length > 0 ? el.map.map(e2 => e2.count).reduce((p, c) => p + c) : 0 }))
        return res
    }, [])

    return (
        <Tabs>
            <Tabs.TabPane tab="日志" key="log">
                <Log
                    lastDay={15}
                    dataFun={logsmssends}
                    cPie={["tels"]}
                    columns={[
                        {
                            dataIndex: 'tels',
                            title: 'tels',
                            //render: (val: string[]) => val.join(","),
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
            </Tabs.TabPane>
            <Tabs.TabPane tab="短信消耗排布" key="count">
                <Table dataSource={generateTableKey(data, "user")} loading={loading} columns={[
                    {
                        dataIndex: 'user',
                        title: '用户',
                        ...getColumnSearchProp('user')
                    },
                    {
                        dataIndex: "count",
                        title: '合计',
                        defaultSortOrder: 'descend',
                        sorter: (a: any, b: any) => a.count - b.count
                    }
                ]}


                    expandable={{
                        expandedRowRender: (re: any) => {
                            return <Card>
                                <Divider plain>用户信息</Divider>
                                <UserDes user={re.user}></UserDes>
                                <Divider plain>使用情况</Divider>
                                <Table dataSource={generateTableKey(re.map, "tel")}
                                    columns={[
                                        {
                                            dataIndex: 'tel',
                                            title: '告警手机'
                                        },
                                        {
                                            dataIndex: 'count',
                                            title: "count",
                                            defaultSortOrder: 'descend',
                                            sorter: (a: any, b: any) => a.count - b.count
                                        }
                                    ]}
                                ></Table>
                            </Card>
                        }
                    }}
                ></Table>
            </Tabs.TabPane>
        </Tabs>
    )
}

export default LogSms