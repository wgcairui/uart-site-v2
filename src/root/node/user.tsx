import React, { useEffect, useMemo, useState } from "react";
import { RootMain } from "../../components/RootMain";
import { BindDev, getUserAlarmSetup, getUsersOnline, sendUserSocketInfo, users as getUsers } from "../../common/FecthRoot"
import { Button, Col, Collapse, Descriptions, Divider, Row, Space, Spin, Table, Tag } from "antd";
import { MehFilled, FrownFilled } from "@ant-design/icons";
import Avatar from "antd/lib/avatar/avatar";
import { getColumnSearchProp } from "../../common/tableCommon";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { pieConfig, pieData } from "../../common/charts";
import { Pie } from "@ant-design/charts";
import { MyInput } from "../../components/myInput";
import { TerminalsTable } from "../../components/terminalsTable";
import { prompt } from "../../common/prompt";

interface userEx extends Uart.UserInfo {
    alarm?: Uart.userSetup
    bind?: Uart.BindDevice
    online?: boolean
}

export const User: React.FC = () => {

    const [users, setUsers] = useState<userEx[]>([])

    useEffect(() => {
        getUsers().then(({ data }) => {
            getUsersOnline()
                .then(el => {
                    const onlineSet = new Set(el.data.map((el) => el.user));
                    setUsers(data.map(el => ({ ...el, key: el.user, online: onlineSet.has(el.user) })))
                })

        })
    }, [])


    const status = useMemo(() => {
        // 在线
        let on = 0

        // 用户分类
        const types = new Map<string, number>()

        users.forEach(el => {
            el.online && on++;

            {
                types.set(el.rgtype, (types.get(el.rgtype) || 0) + 1)
            }
        })

        return {
            onlines: [{ type: '离线', value: users.length - on }, { type: '在线', value: on },],
            types: [...types.entries()].map(([type, value]) => ({ type, value }))
        } as Record<string, pieData[]>
    }, [users])


    /**
     * 当展开用户详情时,获取用户配置
     * @param user 
     */
    const addExpend = (ex: boolean, user: userEx) => {
        if (ex && !user.alarm && !user.bind) {
            Promise.all([getUserAlarmSetup(user.user), BindDev(user.user)])
                .then(([alarm, bind]) => {
                    const index = users.findIndex(el => el.user === user.user)
                    users.splice(index, 1, { ...user, alarm: alarm.data, bind: bind.data })
                    setUsers([...users])
                })
        }

    }

    /**
     * 给在线用户发送消息
     * @param user 
     */
    const sendUserInfo = (user: string) => {
        prompt({
            title: `给[${user}]发送消息`,
            onOk(val) {
                if (val) {
                    sendUserSocketInfo(user, val)
                }
            }
        })
    }

    return (
        <>
            <Divider orientation="left">用户信息</Divider>

            <Row gutter={36}>
                <Col span={12} key="onlines">
                    <Pie data={status.onlines} {...pieConfig({ angleField: 'value', colorField: 'type', radius: .5 })}> </Pie>
                </Col>
                <Col span={12} key="types">
                    <Pie data={status.types} {...pieConfig({ angleField: 'value', colorField: 'type', radius: .5 })}> </Pie>
                </Col>
            </Row>
            <Table
                dataSource={users}
                columns={[
                    {
                        dataIndex: 'online',
                        title: '状态',
                        width: 30,
                        render: (val: boolean) => val ? <MehFilled style={{ color: 'green', fontSize: 24 }} /> : <FrownFilled style={{ fontSize: 24 }} />
                    },
                    {
                        dataIndex: 'avanter',
                        title: '头像',
                        width: 40,
                        render: (img?: string) => <Avatar src={img} alt="i"></Avatar>
                    },
                    {
                        dataIndex: 'user',
                        title: '用户',
                        width: 150,
                        ellipsis: true,
                        ...getColumnSearchProp("user")
                    },
                    {
                        dataIndex: 'name',
                        title: '昵称',
                        width: 120,
                        ellipsis: true,
                        ...getColumnSearchProp("name")
                    },
                    {
                        dataIndex: 'rgtype',
                        title: '注册类型',
                        width: 40,
                        render: (val) => <Tag>{val}</Tag>
                    },
                    {
                        dataIndex: 'userGroup',
                        title: '用户组',
                        width: 40,
                        render: (val) => <Tag>{val}</Tag>
                    },
                    {
                        key: 'gz',
                        title: 'wx状态',
                        width: 120,
                        render: (_, user) => <>
                            {
                                user.wxId && <Tag color="blue">公众号</Tag>
                            }
                            {
                                user.wpId && <Tag color="cyan">小程序</Tag>
                            }
                        </>
                    },
                    {
                        dataIndex: 'modifyTime',
                        title: '上次登录时间',
                        width: 100,
                        render: val => <span>{moment(val).format('YY/MM/DD H:m:s')}</span>
                    },
                    {
                        title: '操作',
                        key: 'oprate',
                        width: 120,
                        render: (_, user) => <>
                            {
                                user.online && <Button type="dashed" onClick={() => sendUserInfo(user.user)}>发送实时消息</Button>
                            }
                        </>
                    }
                ] as ColumnsType<userEx>}

                expandable={{
                    expandedRowRender: (user) => {
                        return (
                            <>
                                <Descriptions>
                                    <Descriptions.Item label="注册类型">{user.rgtype
                                    }</Descriptions.Item>
                                    <Descriptions.Item label="账号">{user.user
                                    }</Descriptions.Item>
                                    <Descriptions.Item label="昵称">{user.name
                                    }</Descriptions.Item>
                                    <Descriptions.Item label="用户组">{user.userGroup
                                    }</Descriptions.Item>
                                    <Descriptions.Item label="邮箱">{user.mail
                                    }</Descriptions.Item>
                                    <Descriptions.Item label="电话">{user.tel
                                    }</Descriptions.Item>
                                    <Descriptions.Item label="组织">{user.company
                                    }</Descriptions.Item>
                                    <Descriptions.Item label="开放Id">{user.userId
                                    }</Descriptions.Item>
                                    <Descriptions.Item label="公众号Id">{user.wxId
                                    }</Descriptions.Item>
                                    <Descriptions.Item label="小程序Id">{user.wpId
                                    }</Descriptions.Item>
                                    <Descriptions.Item label="创建时间">
                                        {moment(user.creatTime).format("YYYY-MM-DD H:m:s")}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="修改时间">
                                        {moment(user.modifyTime).format("YYYY-MM-DD H:m:s")}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="登陆IP">{user.address
                                    }</Descriptions.Item>
                                    <Descriptions.Item label="备注">
                                        <MyInput value={user.remark} textArea></MyInput>
                                    </Descriptions.Item>
                                </Descriptions>
                                {
                                    user.alarm ?
                                        <>
                                            <Divider plain>告警</Divider>
                                            <Descriptions>
                                                <Descriptions.Item label="手机号">
                                                    {
                                                        user.alarm.tels &&
                                                        <>
                                                            {
                                                                user.alarm.tels.map(el => <Tag key={el}>{el}</Tag>)
                                                            }
                                                        </>
                                                    }
                                                </Descriptions.Item>
                                                <Descriptions.Item label="邮箱">
                                                    {
                                                        user.alarm.mails &&
                                                        <>
                                                            {
                                                                user.alarm.mails.map(el => <Tag key={el}>{el}</Tag>)
                                                            }
                                                        </>
                                                    }
                                                </Descriptions.Item>
                                            </Descriptions>

                                            {
                                                user.alarm.ProtocolSetup &&
                                                <Collapse accordion>
                                                    {
                                                        user.alarm.ProtocolSetup.map(el =>
                                                            <Collapse.Panel header={el.Protocol} key={el.Protocol}>
                                                                <Divider orientation="center" plain>参数显示</Divider>
                                                                {
                                                                    el.ShowTag.map(el => <Tag key={el}>{el}</Tag>)
                                                                }
                                                                <Divider orientation="center" plain>参数限值</Divider>
                                                                <Table
                                                                    size="small"
                                                                    pagination={false}
                                                                    dataSource={el.Threshold.map(el => ({ ...el, key: el.name }))}
                                                                    columns={[
                                                                        {
                                                                            dataIndex: 'name',
                                                                            title: '参数'
                                                                        },
                                                                        {
                                                                            dataIndex: 'min',
                                                                            title: '最小值'
                                                                        },
                                                                        {
                                                                            dataIndex: 'max',
                                                                            title: '最大值'
                                                                        }
                                                                    ]}
                                                                />
                                                                <Divider orientation="center" plain>参数约束</Divider>
                                                                <Table
                                                                    size="small"
                                                                    pagination={false}
                                                                    dataSource={el.AlarmStat.map(el => ({ ...el, key: el.name }))}
                                                                    columns={[
                                                                        {
                                                                            dataIndex: 'name',
                                                                            title: '参数'
                                                                        },
                                                                        {
                                                                            dataIndex: 'alarmStat',
                                                                            title: '约束',
                                                                            render: (val: string[]) => val.join(',')
                                                                        }
                                                                    ]}
                                                                />
                                                            </Collapse.Panel>
                                                        )
                                                    }
                                                </Collapse>

                                            }
                                            {
                                                user.bind && <>
                                                    <Divider plain>绑定设备</Divider>
                                                    <TerminalsTable dataSource={user.bind.UTs.map(el => ({ ...el, key: el.DevMac }))} />
                                                </>
                                            }
                                        </>

                                        : <Spin />

                                }
                            </>
                        )
                    },
                    onExpand: addExpend
                }}
            />
        </>
    )
}