import { PlusSquareFilled } from "@ant-design/icons";
import { Avatar, Button, Col, Descriptions, Divider, Modal, Row, Tag, Image, message, Space, Form } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { prompt } from "../common/prompt";
import { RegexMail, RegexTel } from "../common/util";
import { getUserAlarmSetup, modifyUserAlarmSetupTel, mpTicket, wpTicket } from "../common/Fetch";
import { State } from "../store";
import { storeUser } from "../store/user";
import "./userInfo.css"

/**
 * 显示用户信息
 * @param props 
 * @returns 
 */
const UserInfo: React.FC = props => {

    const { user } = useSelector<State, storeUser>(state => state.User)

    const [tels, setTels] = useState<string[]>([])
    const [mails, setMails] = useState<string[]>([])

    useEffect(() => {
        getUserAlarmSetup().then(el => {
            setTels(el.data.tels || [])
            setMails(el.data.mails || [])
        })
    }, [])

    const showQR = async (type: 'wx' | 'wp') => {
        const loading = message.loading({ content: 'loading' })
        const { data } = type === 'wp' ? await wpTicket() : await mpTicket()
        loading()
        Modal.info({
            title: type === 'wp' ? '小程序二维码' : '公众号二维码',
            content: (
                <Image src={data}></Image>
            )
        })
    }

    const delTel = (key: number) => {
        tels.splice(key, 1)
        setTels(tels)
    }

    const addTel = async () => {
        const data = await prompt({ title: '添加新的告警号码' })
        if (data && RegexTel(data)) {
            setTels([...new Set([...tels, data])])
        } else {
            message.error("号码格式错误")
        }
    }

    const delMail = (key: number) => {
        mails.splice(key, 1)
        setMails(mails)
    }

    const addMail = async () => {
        const data = await prompt({ title: '添加新的告警邮箱' })
        if (data && RegexMail(data)) {
            setMails([...new Set([...mails, data])])
        } else {
            message.error("邮箱格式错误")
        }
    }

    /**
     * 保存告警配置
     */
    const saveAlarm = () => {
        const key = 'sadsxdssaa'
        message.loading({ content: '保存配置', key })
        modifyUserAlarmSetupTel(tels, mails).then(el => {
            el.code ? message.success({ content: '保存成功', key }) : message.warn({ content: '保存失败' + el.msg, key })
        })
    }


    return (
        <>
            <Row justify="center" align="middle">
                <Col span={24} md={12} style={{padding:12}}>
                    <Space direction="vertical">
                        <Divider orientation="center">用户信息</Divider>
                        <p>修改用户信息请使用小程序操作</p>
                        <Descriptions title={user.user}>
                            <Descriptions.Item label="avanter" >
                                <Avatar src={user.avanter} />
                            </Descriptions.Item>
                            <Descriptions.Item label="昵称">{user.name}</Descriptions.Item>
                            <Descriptions.Item label="创建时间">{moment(user.creatTime).format("YYYY/MM/D")}</Descriptions.Item>

                            <Descriptions.Item label="电话">{user.tel}</Descriptions.Item>
                            <Descriptions.Item label="邮箱">{user.mail}</Descriptions.Item>
                            <Descriptions.Item label="组织">{user.company}</Descriptions.Item>
                            <Descriptions.Item label="小程序">{
                                user.wpId ?
                                    <Tag color="green">已绑定</Tag>
                                    : <Button size="small" type="primary" shape="round" onClick={() => showQR("wp")}>点击绑定小程序</Button>
                            }</Descriptions.Item>
                            <Descriptions.Item label="公众号">{
                                user.wxId ?
                                    <Tag color="green">已绑定</Tag>
                                    : <Button size="small" type="primary" shape="round" onClick={() => showQR("wx")}>点击绑定公众号</Button>
                            }</Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="center">告警联系方式</Divider>
                        <Form>
                            <Form.Item label="告警通知电话">
                                {
                                    tels.map((el, key) => <Tag closable color="green" onClose={() => delTel(key)} key={key}>{el}</Tag>)
                                }
                                <PlusSquareFilled style={{ color: "green" }} onClick={addTel} />
                            </Form.Item>
                            <Form.Item label="告警通知邮箱">
                                {
                                    mails.map((el, key) => <Tag closable color="green" onClose={() => delMail(key)} key={key}>{el}</Tag>)
                                }
                                <PlusSquareFilled style={{ color: "green" }} onClick={addMail} />
                            </Form.Item>
                            <Form.Item >
                                <Button type="primary" onClick={saveAlarm}>保存配置</Button>
                            </Form.Item>
                        </Form>
                    </Space>
                </Col>
            </Row>
        </>
    )
}

export default UserInfo