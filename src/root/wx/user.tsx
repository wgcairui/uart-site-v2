import { DownOutlined } from "@ant-design/icons";
import { Button, Divider, Dropdown, Menu, message, Modal, Table } from "antd";
import Avatar from "antd/lib/avatar/avatar";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { update_wx_users_all, wx_send_info, wx_users } from "../../common/FecthRoot";
import { getColumnSearchProp } from "../../common/tableCommon";
import { MyCopy } from "../../components/myCopy";
import { RootMain } from "../../components/RootMain";

export const WxUser: React.FC = () => {

    const [users, setUsers] = useState<Uart.WX.userInfoPublic[]>([])

    useEffect(() => {
        wx_users()
            .then(el => {
                setUsers(el.data.map(el => ({ ...el, key: el.openid })))
            })
    }, [])

    /**
     * 更新所有用户
     */
    const updateUsers = () => {
        Modal.confirm({
            content: '确定更新微信用户库?更新将耗时3~10分钟',
            onOk() {
                const now = Date.now()
                message.loading({ key: 'update_wx_users_all' })
                update_wx_users_all()
                    .then(el => {
                        message.success({ content: 'update success,耗时:' + ((Date.now() - now) / 1000).toFixed(0) + '秒', key: 'update_wx_users_all' })
                    })
            }
        })
    }

    /**
     * 发送测试信息
     * 
     */
    const alarmTest = (openid: string) => {
        Modal.confirm({
            content: '确定发送测试信息?',
            onOk() {
                wx_send_info(0, openid)
                    .then(el => {
                        message.success("send success,请注意查收")
                    })
            }
        })
    }


    return (
        <>
            <Divider orientation="right">
                所有微信关注用户
                <Button shape="round" type="primary" size="small" onClick={() => updateUsers()} style={{ marginLeft: 8 }}>更新用户库</Button>
            </Divider>
            <Table
                dataSource={users}
                columns={[
                    {
                        title: 'avater',
                        dataIndex: 'headimgurl',
                        width: 60,
                        render: val => <Avatar src={val} size={38} />
                    },
                    {
                        dataIndex: 'nickname',
                        title: "nickname",
                        ...getColumnSearchProp("nickname"),
                        render: val => <MyCopy value={val}></MyCopy>
                    },
                    {
                        dataIndex: 'sex',
                        title: '性别',
                        render: val => val ? '男' : '女'
                    },
                    {
                        title: 'city',
                        key: 'city',
                        render: (_, user) => `${user.country}-${user.province}-${user.city || user.province}`
                    },
                    {
                        dataIndex: 'openid',
                        title: "openid",
                        ...getColumnSearchProp("openid"),
                        render: val => <MyCopy value={val}></MyCopy>
                    },

                    {
                        dataIndex: 'unionid',
                        title: 'unionid',
                        ...getColumnSearchProp("unionid"),
                        render: val => <MyCopy value={val}></MyCopy>
                    },
                    {
                        dataIndex: 'subscribe_time',
                        title: '关注时间',
                        render: val => moment(val * 1000).format("YYYY-MM-DD")
                    },
                    {
                        key: 'test',
                        title: '测试',
                        render: (_, user) =>
                            <Dropdown
                                overlay={
                                    <Menu>
                                        <Menu.Item>
                                            <Button onClick={() => alarmTest(user.openid)}>告警推送测试</Button>
                                        </Menu.Item>
                                    </Menu>
                                }
                            >
                                <a>测试<DownOutlined /></a>
                            </Dropdown>
                    }
                ] as ColumnsType<Uart.WX.userInfoPublic>}>

            </Table>

        </>
    )
}