import { MehFilled, FrownFilled, ReloadOutlined, SyncOutlined } from "@ant-design/icons";
import { Spin, Empty, Divider, Descriptions, Tag, Collapse, Table, Button, Space, Modal, message, Card, Timeline, Row, Col } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import { useState } from "react";
import { getUserOnlineStat, getUserAlarmSetup, toggleUserGroup, modifyUserRemark, initUserAlarmSetup, logUserAggs, getAlarm } from "../common/FecthRoot";
import { generateTableKey, getColumnSearchProp, tableColumnsFilter, tableConfig } from "../common/tableCommon";
import { usePromise } from "../hook/usePromise";
import { MyDatePickerRange } from "./myDatePickerRange";
import { MyInput } from "./myInput";
import { ResultDataParse } from "./resultData";
import "./userData.css"

interface props<T extends string | Uart.UserInfo = string> {
    /**
     * 用户或用户名
     */
    user: T,
    /**
     * 更新用户信息
     */
    updateUser?: (user: string) => void
}

/**
 * 显示用户状态
 * @param param0 
 * @returns 
 */
export const UserStat: React.FC<props> = ({ user }) => {

    const { data, fecth } = usePromise(async () => {
        const el = await getUserOnlineStat(user);
        return el.data;
    }, false, [])

    return (
        <>
            {
                data ? <MehFilled style={{ color: 'green', fontSize: 24 }} onClick={() => fecth()} /> : <FrownFilled style={{ fontSize: 24 }} onClick={() => fecth()} />
            }
        </>
    )
}


/**
 * 用户信息
 * @param param0 
 * @returns 
 */
export const UserDes: React.FC<props<Uart.UserInfo>> = ({ user, updateUser }) => {

    /**
     * 切换用户组
     */
    const swicthGroup = () => {
        Modal.confirm({
            content: `是否变更用户${user.name} 为 [${user.userGroup === "admin" ? "user" : "admin"
                }]`,
            onOk() {
                toggleUserGroup(user.user).then((el) => {
                    if (el.code) {
                        message.success(el.data)
                        updateUser && updateUser(user.user)
                    }
                })
            }
        })
    }

    /**
     * 用户备注信息
     * @param val 
     */
    const remark = (val: string) => {
        modifyUserRemark(user.user, val).then(() => {
            message.success('success')
            updateUser && updateUser(user.user)
        })
    }

    return (
        <>
            <Space style={{ marginBottom: 16 }}>
                <Button size="small" type="primary" onClick={() => swicthGroup()}>
                    切换为{user.userGroup === 'user' ? 'admin' : 'user'}
                </Button>
            </Space>
            <Descriptions>
                <Descriptions.Item label="注册类型">{user.rgtype
                }</Descriptions.Item>
                <Descriptions.Item label="账号">{user.user
                }</Descriptions.Item>
                <Descriptions.Item label="昵称">{user.name
                }</Descriptions.Item>
                <Descriptions.Item label="用户组">
                    <Space>
                        <Tag>{user.userGroup}</Tag>

                    </Space>
                </Descriptions.Item>
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
                    <MyInput value={user.remark} onSave={remark}></MyInput>
                </Descriptions.Item>
            </Descriptions>
        </>

    )
}

/**
 * 显示用户告警信息
 * @param param0 
 * @returns 
 */
export const UserAlarmPage: React.FC<{ user: string }> = ({ user }) => {

    const { data, loading, fecth } = usePromise(async () => {
        const { data } = await getUserAlarmSetup(user)
        return data
    }, undefined)

    /**
     * 初始化配置
     */
    const initSetup = async () => {
        const load = message.loading('loading')
        await initUserAlarmSetup(user)
        fecth()
        load()
    }

    return (
        loading ? <Spin />
            : (
                !data ? <Empty />
                    :
                    <>
                        <Space style={{ marginBottom: 16 }}>
                            <Button type="primary" size="small" onClick={() => fecth()} icon={<SyncOutlined />}>更新信息</Button>
                            <Button danger size="small" onClick={() => initSetup()} icon={<SyncOutlined />}>初始化告警配置</Button>
                        </Space>
                        <Descriptions>
                            <Descriptions.Item label="手机号">
                                {
                                    data.tels &&
                                    <>
                                        {
                                            data.tels.map(el => <Tag key={el}>{el}</Tag>)
                                        }
                                    </>
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="邮箱">
                                {
                                    data.mails &&
                                    <>
                                        {
                                            data.mails.map(el => <Tag key={el}>{el}</Tag>)
                                        }
                                    </>
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="微信">
                                {
                                    data.wxs &&
                                    <>
                                        {
                                            data.wxs.map(el => <Tag key={el}>{el}</Tag>)
                                        }
                                    </>
                                }
                            </Descriptions.Item>
                        </Descriptions>

                        {
                            data.ProtocolSetup &&
                            <Collapse accordion ghost>
                                {
                                    data.ProtocolSetup.map(el =>
                                        <Collapse.Panel header={el.Protocol} key={el.Protocol}>
                                            <Divider orientation="center" plain>参数显示</Divider>
                                            {
                                                el.ShowTag.map(el => <Tag key={el}>{el}</Tag>)
                                            }
                                            <Divider orientation="center" plain>参数限值</Divider>
                                            <Table
                                                size="small"
                                                pagination={false}
                                                dataSource={generateTableKey(el.Threshold, 'name')}
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
                                                dataSource={generateTableKey(el.AlarmStat, 'name')}
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
                    </>
            )

    )
}



/**
 * 展示用户日志信息
 * @param param0 
 * @returns 
 */
export const UserLog: React.FC<props> = ({ user }) => {

    const [date, setDate] = useState<moment.Moment[]>()

    const { data, loading, fecth } = usePromise(async () => {
        if (date) {
            const { data } = await logUserAggs(user, date[0].toString(), date[1].toString())
            return data
        } else {
            return []
        }
    }, [], [date])

    const alarm = usePromise(async () => {
        if (date) {
            const { data } = await getAlarm(user, date[0].valueOf(), date[1].valueOf())
            return data
        } else {
            return []
        }
    }, [], [date])

    return (
        <>
            <MyDatePickerRange lastDay={30} onChange={(r) => setDate(r)}>
                <Button type="primary" onClick={() => fecth()}>刷新</Button>
            </MyDatePickerRange>
            <Card >
                <Row>
                    <Col span={16} style={{ maxHeight: 600, overflow: 'auto' }}>
                        <Table 
                        {...tableConfig}
                        dataSource={generateTableKey(alarm.data.reverse(), "timeStamp")} 
                        loading={alarm.loading}
                            rowClassName={re => re.isOk ? '' : 'alarm'}
                            columns={[
                                {
                                    dataIndex: 'devName',
                                    title: 'name',
                                    width: 120,
                                    ...tableColumnsFilter(alarm.data, 'devName'),
                                    ellipsis: true
                                },
                                {
                                    dataIndex: 'mac',
                                    title: 'mac',
                                    ...tableColumnsFilter(alarm.data, 'mac'),
                                    width: 150
                                },
                                {
                                    dataIndex: 'pid',
                                    title: 'pid',
                                    width: 60
                                },
                                {
                                    dataIndex: 'tag',
                                    title: 'tag',
                                    width: 120,
                                    ...tableColumnsFilter(alarm.data, 'tag'),
                                },
                                {
                                    dataIndex: 'msg',
                                    title: 'msg',
                                    ...getColumnSearchProp('msg'),
                                    ellipsis: true
                                },
                                {
                                    dataIndex: 'timeStamp',
                                    title: '时间',
                                    render: (val: string) => moment(val).format('YYYY-MM-DD HH:mm:ss'),
                    
                                }
                            ] as ColumnsType<Uart.uartAlarmObject>}

                            expandable={{
                                rowExpandable: li => Boolean(li.parentId),
                                expandedRowRender: li => <ResultDataParse id={li.parentId!} />
                            }}
                        />
                    </Col>
                    <Col span={8} style={{ maxHeight: 600, overflow: 'auto' }}>
                        <Timeline mode='left'>
                            {
                                data.map(({ msg, type, timeStamp }, i) =>
                                    <Timeline.Item
                                        color={type === '请求' as any ? 'blue' : 'green'}
                                        key={timeStamp + i}
                                        label={moment(timeStamp).format('MM-DD H:m:s:SSS')}>
                                        <p>{msg || type}</p>
                                    </Timeline.Item>)
                            }
                        </Timeline>
                    </Col>
                </Row>
            </Card>
        </>
    )
}