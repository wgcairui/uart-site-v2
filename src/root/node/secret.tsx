import { Tabs, Form, Input, Button, Spin, message, Modal } from "antd";
import React, {  } from "react";
import { get_Secret, set_Secret } from "../../common/FecthRoot";
import { usePromise } from "../../use/usePromise";

interface key {
    remark: string;
    type: Uart.secretType;
    text: string;
    appid?: string
    secret?: string
}

const Content: React.FC<{ type: Uart.secretType }> = ({ type }) => {

    const { loading, data, fecth } = usePromise(async () => {
        const { data } = await get_Secret(type)
        return data
    })

    const submit = (newType: Uart.Secret_app) => {
        const oldType = data
        if (newType.appid !== oldType.appid || newType.secret !== oldType.secret) {
            Modal.confirm({
                content: `appid:${newType.appid} \n
                         secret:${newType.secret}`,
                onOk() {
                    set_Secret({ ...newType, type })
                        .then(() => {
                            message.success("更新成功")
                            fecth()
                        })
                }
            })
        } else {
            message.info('没有修改')
        }

    }


    return (
        loading
            ? <Spin />
            :
            <Form
                onFinish={submit}
                initialValues={data}
            >
                <Form.Item label="appId" name='appid'>
                    <Input ></Input>
                </Form.Item>
                <Form.Item label="secret" name='secret'>
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form.Item>
            </Form>
    )
}

export const Secret: React.FC = () => {
    const types = [
        {
            remark: '阿里云短信平台',
            type: 'aliSms',
            text: 'aliyunSMS',
        },
        {
            type: "mail",
            text: 'Mail',
            remark: '通用邮件平台'
        },
        {
            type: "hf",
            text: "HfIOT",
            remark: '汉枫IOT管理账号'
        },
        {
            type: 'wxopen',
            text: 'WeiXinOPEN',
            remark: '微信开放平台网站应用密匙'
        },
        {
            type: "wxmp",
            text: 'WeiXinMP',
            remark: '微信公众平台密匙'
        },
        {
            type: 'wxmpValidaton',
            text: 'WeiXinMPCode',
            remark: '微信公众号开发者接口校验Token'
        },
        {
            type: 'wxwp',
            text: "WeiXinWP",
            remark: '微信小程序密匙'
        }
    ]

    return (
        <>
            <Tabs>
                {
                    types.map(type =>
                        <Tabs.TabPane key={type.type} tab={type.remark}>
                            <Content type={type.type as any} />
                        </Tabs.TabPane>)
                }
            </Tabs>
        </>
    )
}


