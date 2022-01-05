import React, { useMemo } from "react";
import { deleteUser, getUser, sendUserSocketInfo, users as getUsers } from "../../common/FecthRoot"
import { Button, Col, Divider, message, Modal, Progress, Row, Table, Tag } from "antd";
import Avatar from "antd/lib/avatar/avatar";
import { generateTableKey, getColumnSearchProp, tableColumnsFilter } from "../../common/tableCommon";
import { ColumnsType } from "antd/lib/table";
import { pieConfig, pieData } from "../../common/charts";
import { Pie } from "@ant-design/charts";
import { prompt } from "../../common/prompt";
import { usePromise } from "../../hook/usePromise";
import { MyCopy } from "../../components/myCopy";
import { UserStat } from "../../components/userData";
import { useNav } from "../../hook/useNav";

export const User: React.FC = () => {

    const nav = useNav()

    const { data: users, loading, setData, fecth } = usePromise(async () => {
        const { data } = await getUsers()
        return data
    }, [])


    /**
     * 
     */
    const status = useMemo(() => {
        // 用户分类
        const types = new Map<string, number>()
        users.forEach(el => {
            {
                types.set(el.rgtype, (types.get(el.rgtype) || 0) + 1)
            }
        })
        return {

            types: [...types.entries()].map(([type, value]) => ({ type, value }))
        } as Record<string, pieData[]>
    }, [users])


    const progress = useMemo(() => {
        return [
            /* {
                text: '在线用户',
                value: users.filter((el: any) => el.online).length,
            }, */
            {
                text: "所有用户",
                value: users.length,
            },
            {
                text: "百事服用户",
                value: users.filter(el => el.rgtype === "pesiv").length,
            },
            {
                text: "微信用户",
                value: users.filter(el => el.rgtype === "wx").length,
            },
            {
                text: "web用户",
                value: users.filter(el => el.rgtype === "web").length,
            }
        ]
    }, [users])

    /**
     * 更新单个用户信息
     * @param user 
     */
    const updateUser = async (user: string) => {
        getUser(user).then(el => {
            setData((users: any) => {
                const i = users.findIndex((u: { user: string; }) => u.user === user)
                users.splice(i, 1, { ...users[i], ...el.data })
                return [...users]
            })
        })
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

    /**
     * 删除用户
     * @param user 
     */
    const deletUser = async (user: Uart.UserInfo) => {
        const p = await prompt({ title: '删除用户' + user.name, placeholder: '输入独立校验密码' })
        if (p) {
            deleteUser(user.user, p).then((el) => {
                if (el.code) {
                    fecth()
                    message.success("删除成功");
                } else Modal.info({ content: "删除失败" });
            })
        } else {
            message.error('取消操作')
        }
    }

    return (
        <>
            <Divider orientation="left">用户信息</Divider>

            <Row gutter={36}>
                <Col span={12} key="types">
                    <Pie data={status.types} {...pieConfig({ angleField: 'value', colorField: 'type', radius: .5 })}> </Pie>
                </Col>
                <Col span={12}>
                    {
                        progress.map(el => <section key={el.text}>
                            <span>{el.text}</span>
                            <Progress percent={el.value * 100 / users.length} format={val => el.value} size="small" />
                        </section>)
                    }
                </Col>
            </Row>
            <Table
                loading={loading}
                dataSource={generateTableKey(users, 'user')}
                columns={[
                    {
                        key: 'online',
                        title: '状态',
                        width: 40,
                        render: (_, re) => <UserStat user={re.user} />
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
                        ...getColumnSearchProp("user"),
                        render: val => <MyCopy value={val} />
                    },
                    {
                        dataIndex: 'name',
                        title: '昵称',
                        width: 120,
                        ellipsis: true,
                        ...getColumnSearchProp("name"),
                        render: val => <MyCopy value={val} />
                    },
                    {
                        dataIndex: 'tel',
                        title: '手机',
                        width: 120,
                        ellipsis: true,
                        ...getColumnSearchProp("tel"),
                        render: val => <MyCopy value={val} />
                    },
                    {
                        dataIndex: 'mail',
                        title: '邮箱',
                        width: 120,
                        ellipsis: true,
                        ...getColumnSearchProp("mail"),
                        render: val => <MyCopy value={val} />
                    },
                    {
                        dataIndex: 'rgtype',
                        title: '注册类型',
                        width: 70,
                        ...tableColumnsFilter(users, 'rgtype'),
                        render: (val) => <Tag>{val}</Tag>
                    },
                    {
                        dataIndex: 'userGroup',
                        title: '用户组',
                        width: 50,
                        render: (val) => <Tag>{val}</Tag>
                    },
                    {
                        key: 'gz',
                        title: 'wx状态',
                        width: 60,
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
                        title: '操作',
                        key: 'oprate',
                        width: 120,
                        render: (_, user) => <>
                            <Button type="link" onClick={() => nav('/root/node/user/userInfo', { user: user.user })}>查看</Button>
                            <Button type="link" onClick={() => updateUser(user.user)}>更新</Button>
                            {
                                user.userGroup !== 'root' && <Button type="link" onClick={() => deletUser(user)}>删除</Button>
                            }
                            {
                                (user as any).online && <Button type="link" onClick={() => sendUserInfo(user.user)}>发送实时消息</Button>
                            }

                        </>
                    }
                ] as ColumnsType<Uart.UserInfo>}

            /* expandable={{
                expandedRowRender: (user) => {
                    return (
                        <>
                            <UserDes user={user} updateUser={updateUser} />
                            <UserAlarmPage user={user.user} />
                            <TerminalsTable user={user.user} />
                        </>
                    )
                }
            }} */
            />
        </>
    )
}