import { DeleteFilled, EditFilled } from "@ant-design/icons";
import { Button, Checkbox, CheckboxOptionType, Col, Divider, Form, Input, InputNumber, message, Modal, Row, Select, Space, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import React, { useEffect, useMemo, useState } from "react";
import { addDevConstant } from "../common/FecthRoot";
import { getProtocol, getProtocolSetup, setUserSetupProtocol } from "../common/Fetch";
import { generateTableKey } from "../common/tableCommon";
import { ProtocolInstructFormrizeParse } from "../common/util";
import { usePromise } from "../hook/usePromise";
import { ProtocolInstructSelect } from "./Selects";

interface props {
    protocolName: string

    user?: string
}


/**
 * 配置协议操作指令
 * @param param0 
 * @returns 
 */
export const ProtocolOprate: React.FC<props> = ({ protocolName }) => {


    const opt = {
        io: ["断开", "闭合"],
        air: ["开机", "关机", "制冷", "制热", "湿度", "除湿"],
        ups: ["开机", "关机", "测试"],
        em: [],
        th: []
    } as Record<Uart.protocolType, string[]>

    const initData: Uart.OprateInstruct = {
        name: '',
        value: '',
        tag: '',
        bl: '1',
        readme: ''
    }

    const [form] = Form.useForm()

    const Protocol = usePromise(async () => {
        const el = await getProtocol(protocolName);
        return el.data;
    })

    const { data, loading, fecth, setData } = usePromise(async () => {
        const { data } = await getProtocolSetup<Uart.OprateInstruct>(protocolName, 'OprateInstruct')
        return data.sys
    }, [])


    const tags = useMemo(() => {
        if (Protocol.data) {
            const type = Protocol.data.ProtocolType
            return opt[type]
        } else {
            return []
        }
    }, [Protocol.data])

    /**
     * 编辑已有指令
     * @param item 
     */
    const edit = (item: Uart.OprateInstruct) => {
        form.setFieldsValue(item)
    }

    /**
     * 删除已有指令
     * @param item 
     */
    const deleteOprate = (item: Uart.OprateInstruct) => {
        Modal.confirm({
            content: `确定删除指令:${item.name}??`,
            onOk() {
                const index = data.findIndex(el => el.name === item.name)
                data.splice(index, 1)
                setData([...data])
            }
        })
    }


    /**
     * 保存操作指令
     */
    const saveOprates = () => {
        const load = message.loading({ content: 'loading' })
        addDevConstant(Protocol.data.ProtocolType, Protocol.data.Protocol, 'OprateInstruct', data)
            .then(el => {
                load()
                message.success("保存操作指令成功")
            })
    }


    /**
     * 保存form
     * @param item 
     */
    const save = (item: Uart.OprateInstruct) => {
        const index = data.findIndex(el => el.name === item.name)
        if (index === -1) {
            setData([item, ...data])
        } else {
            data.splice(index, 1, item)
            setData([...data])
        }
        form.setFieldsValue(initData)
    }



    return (
        <>
            <Form form={form} onFinish={save} labelCol={{ span: 3 }} initialValues={initData}>
                <Form.Item name="name" label="指令名称" required>
                    <Input />
                </Form.Item>
                <Form.Item name="value" label="指令值" required>
                    <Input />
                </Form.Item>
                <Form.Item name="tag" label="指令标签">
                    <Select>
                        {
                            tags.map(el => <Select.Option value={el} key={el}>{el}</Select.Option>)
                        }
                    </Select>
                </Form.Item>
                <Form.Item name="bl" label="系数" extra="" required>
                    <Select inputValue="1">
                        {
                            [1, 0.1, 10, 100, 1000, 0.01, 0.001].map(String).map(el => <Select.Option value={el} key={el}>{el}</Select.Option>)
                        }
                    </Select>
                </Form.Item>
                <Form.Item name="readme" label="指令说明">
                    <Input.TextArea autoSize />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 3, span: 16 }}>
                    <Button type="primary" htmlType="submit">保存</Button>
                </Form.Item>
            </Form>
            <Divider plain>指令列表</Divider>
            <Space>
                <Button type="primary" onClick={() => saveOprates()}>上传保存</Button>
            </Space>
            <Table
                loading={loading}
                dataSource={generateTableKey(data, "name")}
                pagination={false}
                columns={[
                    {
                        dataIndex: 'name',
                        title: '指令名称'
                    },
                    {
                        dataIndex: 'value',
                        title: '指令值'
                    },
                    {
                        dataIndex: 'tag',
                        title: '指令标签'
                    },
                    {
                        dataIndex: 'bl',
                        title: '系数'
                    },
                    {
                        dataIndex: 'readme',
                        title: '说明'
                    },
                    {
                        key: 'oprate',
                        title: '操作',
                        render: (_, re) => <Space>
                            <EditFilled onClick={() => edit(re)}></EditFilled>
                            <DeleteFilled onClick={() => deleteOprate(re)}></DeleteFilled>
                        </Space>
                    }
                ] as ColumnsType<Uart.OprateInstruct>}
            ></Table>

        </>
    )
}


type devs = keyof Uart.DevConstant

/**
 * 配置协议常量
 * @param param0 
 * @returns 
 */
export const ProtocolContant: React.FC<props> = ({ protocolName }) => {


    const opt: Record<Uart.protocolType, Partial<Record<keyof Uart.DevConstant, string>>> = {
        air: {
            Switch: "开关",
            WorkMode: "工作模式",
            //热通道温度
            HeatChannelTemperature: "热通道温度",
            HeatChannelHumidity: "热通道湿度",
            //冷通道湿度
            ColdChannelTemperature: "冷通道温度",
            ColdChannelHumidity: "冷通道湿度",
            //制冷温度
            RefrigerationTemperature: "制冷温度",
            RefrigerationHumidity: "制冷湿度",
            // 风速
            Speed: "风速",
        },
        ups: {
            Switch: "开关",
            WorkMode: "工作模式",
            UpsStat: "UPS状态",
            BettyStat: "电池状态",
            InputStat: "输入状态",
            OutStat: "输出状态",
        },
        em: {
            battery: "电池电量",
            voltage: "电压",
            current: "电流",
            factor: "因数",
        },
        th: {
            Temperature: "温度",
            Humidity: "湿度",
        },
        io: {
            di: "DI",
            do: "DO",
        },
    }

    const [form] = Form.useForm<Uart.DevConstant>()

    const [filterOptions, setFilterOptions] = useState<string[]>([])

    const Protocol = usePromise(async () => {
        const el = await getProtocol(protocolName);
        return el.data;
    })

    const { data, loading, fecth } = usePromise(async () => {
        const { data } = await getProtocolSetup(protocolName, "Constant")
        return data.sys as any as Uart.DevConstant
    })


    const vals = useMemo(() => {
        if (Protocol.data && data) {
            const type = opt[Protocol.data.ProtocolType]
            const keys = Object.keys(type) as devs[]
            const contants = keys.map(el => ({ value: data[el], label: el, text: type[el] }))
            return contants
        } else {
            return []
        }

    }, [Protocol.data, data])

    useEffect(() => {
        const da = Object.assign({}, ...vals.map(el => ({ [el.label]: el.value }))) as Record<string, string[]>
        form.setFieldsValue(da)
        setFilterOptions([...new Set([...filterOptions, ...Object.values(da).flat()])])
    }, [vals])


    const options = useMemo(() => {
        const Instructs = Protocol.data?.instruct
        if (Instructs) {
            return Instructs.map(el => el.formResize.map(e2 => e2.name)).flat().filter(el => !filterOptions.includes(el))
        } else {
            return []
        }
    }, [filterOptions, Protocol.data])


    const change = (val: Partial<Uart.DevConstant>) => {
        setFilterOptions(Object.values(form.getFieldsValue()).flat())
    }

    const submit = (val: Partial<Uart.DevConstant>) => {
        console.log(val);
        const load = message.loading({ content: 'loading' })
        addDevConstant(Protocol.data.ProtocolType, Protocol.data.Protocol, "Constant", val)
            .then(el => {
                load()
                message.success("保存常量成功")
            })
    }

    return (
        <>
            <Form form={form} labelCol={{ span: 3 }} onValuesChange={change} onFinish={submit}>
                {
                    vals.map(el => <Form.Item name={el.label} label={el.text} key={el.text}>
                        <Select
                            mode={typeof el.value === "object" ? "multiple" : undefined}
                            loading={loading}
                            showSearch
                        >
                            {
                                options.map(el => <Select.Option value={el} key={el} >{el}</Select.Option>)
                            }
                        </Select>
                    </Form.Item>)
                }
                <Form.Item wrapperCol={{ offset: 3 }}>
                    <Button type="primary" htmlType="submit">上传保存</Button>
                </Form.Item>
            </Form>
        </>
    )
}


/**
 * 协议阈值配置
 * @param param0 
 * @returns 
 */
export const ProtocolThreshold: React.FC<props> = ({ protocolName }) => {

    const initData: Uart.Threshold = {
        name: '',
        min: 0,
        max: 100
    }

    const [form] = Form.useForm()

    const Protocol = usePromise(() => {
        return getProtocol(protocolName).then(el => el.data)
    })

    const { data, loading, fecth, setData } = usePromise(async () => {
        const { data } = await getProtocolSetup<Uart.Threshold>(protocolName, "Threshold")
        return data.sys
    }, [])

    const options = useMemo(() => {
        const Instructs = Protocol.data?.instruct
        if (Instructs) {
            return Instructs.map(el => el.formResize.filter(e2 => !e2.isState).map(e2 => e2.name)).flat()
        } else {
            return []
        }
    }, [Protocol.data])


    /**
     * 编辑已有指令
     * @param item 
     */
    const edit = (item: Uart.Threshold) => {
        form.setFieldsValue(item)
    }

    /**
     * 删除已有指令
     * @param item 
     */
    const deleteOprate = (item: Uart.Threshold) => {
        Modal.confirm({
            content: `确定删除阈值:${item.name}??`,
            onOk() {
                const index = data.findIndex(el => el.name === item.name)
                data.splice(index, 1)
                setData([...data])
            }
        })
    }


    /**
     * 保存操作指令
     */
    const saveOprates = () => {
        const load = message.loading({ content: 'loading' })
        addDevConstant(Protocol.data.ProtocolType, Protocol.data.Protocol, "Threshold", data)
            .then(el => {
                load()
                message.success("保存阈值配置成功")

            })
    }


    /**
     * 保存form
     * @param item 
     */
    const save = (item: Uart.Threshold) => {
        const index = data.findIndex(el => el.name === item.name)
        if (index === -1) {
            setData([item, ...data])
        } else {
            data.splice(index, 1, item)
            setData([...data])
        }
        form.setFieldsValue(initData)
    }

    return (
        <>
            <Form form={form} initialValues={initData} onFinish={save} layout="inline">
                <Form.Item name="name" label="参数" required
                    rules={[
                        {
                            required: true
                        }
                    ]}
                >
                    <Select
                        loading={loading}
                        showSearch
                        placeholder="选择参数"
                        style={{ minWidth: 120 }}
                    >
                        {
                            options.map(el => <Select.Option value={el} key={el} >{el}</Select.Option>)
                        }
                    </Select>
                </Form.Item>
                <Form.Item name="min" label="最小值" required
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                return value < getFieldValue("max") ? Promise.resolve() : Promise.reject(new Error('必须小于最大值'))
                            }
                        })
                    ]}
                >
                    <InputNumber></InputNumber>
                </Form.Item>
                <Form.Item name="max" label="最大值" required
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                return value > getFieldValue("min") ? Promise.resolve() : Promise.reject(new Error('必须大于最小值'))
                            }
                        })
                    ]}
                >
                    <InputNumber></InputNumber>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 3 }}>
                    <Button type="primary" htmlType="submit">保存</Button>
                </Form.Item>
            </Form>
            <Divider plain>阈值列表</Divider>
            <Space >
                <Button type="primary" onChange={() => setData([])}>清除所有</Button>
                <Button type="primary" onClick={() => saveOprates()}>上传保存</Button>
            </Space>
            <Table
                loading={loading}
                dataSource={generateTableKey(data, "name")}
                pagination={false}
                columns={[
                    {
                        dataIndex: 'name',
                        title: '指令名称'
                    },
                    {
                        dataIndex: 'min',
                        title: '最小值'
                    },
                    {
                        dataIndex: 'max',
                        title: '最大值'
                    },
                    {
                        key: 'oprate',
                        title: '操作',
                        render: (_, re) => <Space>
                            <EditFilled onClick={() => edit(re)}></EditFilled>
                            <DeleteFilled onClick={() => deleteOprate(re)}></DeleteFilled>
                        </Space>
                    }
                ] as ColumnsType<Uart.Threshold>}
            ></Table>
        </>
    )
}


/**
 * 协议状态配置
 * @param param0 
 * @returns 
 */
export const ProtocolAlarmStat: React.FC<props> = ({ protocolName }) => {

    const [form] = Form.useForm()

    const Protocol = usePromise(async () => {
        const el = await getProtocol(protocolName);
        return el.data;
    })

    const { data, loading, fecth, setData } = usePromise(async () => {
        const { data } = await getProtocolSetup<Uart.ConstantAlarmStat>(protocolName, "AlarmStat")
        return data.sys
    }, [])

    const options = useMemo(() => {
        const Instructs = Protocol.data?.instruct
        if (Instructs) {
            const args = new Map(Instructs.map(el => el.formResize.filter(e2 => e2.isState)).flat().map(el => [el.name, { ...ProtocolInstructFormrizeParse(el), value: [] as string[] }]))
            data.forEach(el => {
                args.get(el.name)!.value = el.alarmStat
            })

            return [...args.values()]
                .map(el => ({
                    name: el.name,
                    value: el.value,
                    options: Object.entries((el.parse)).map(e2 => ({ label: e2.join("/"), value: e2[0] }))
                }))
            // console.log(args);

        } else {
            return []
        }
    }, [Protocol.data, data])

    useEffect(() => {
        if (options.length > 0) {
            form.setFieldsValue(Object.assign({}, ...options.map(el => ({ [el.name]: el.value }))))
        }
    }, [options])



    /**
     * 保存配置
     * @param values 
     */
    const save = (values: Record<string, string[]>) => {
        const Threld = Object.entries(values).map(([name, alarmStat]) => ({ name, alarmStat }))
        const load = message.loading({ content: 'loading' })
        addDevConstant(Protocol.data.ProtocolType, Protocol.data.Protocol, "AlarmStat", Threld)
            .then(el => {
                load()
                message.success("保存状态配置成功")
            })
    }


    return (
        <>
            <Form form={form} labelCol={{ span: 8 }} size="small" onFinish={save}>
                {
                    options.map(el =>
                        <Form.Item name={el.name} label={<Tag>{el.name}</Tag>} key={el.name}>
                            <Checkbox.Group options={el.options}></Checkbox.Group>
                        </Form.Item>
                    )
                }
                <Form.Item wrapperCol={{ offset: 8 }}>
                    <Button type="primary" htmlType="submit">上传提交</Button>
                </Form.Item>
            </Form>
        </>
    )
}


/**
 * 显示参数配置
 * @param param0 
 * @returns 
 */
export const ProtocolShowTag: React.FC<props> = ({ protocolName }) => {

    const Protocol = usePromise(async () => {
        const el = await getProtocol(protocolName);
        return el.data;
    })

    const { data, loading, fecth, setData } = usePromise(async () => {
        const { data } = await getProtocolSetup<string>(protocolName, "ShowTag")
        return data.sys
    }, [])

    const options = useMemo<CheckboxOptionType[]>(() => {
        const Instructs = Protocol.data?.instruct
        return Instructs ? Instructs.map(el => el.formResize.map(e2 => e2.name)).flat().map(el => ({ label: el, value: el })) : []
    }, [Protocol.data, data])


    /**
     * 保存配置
     * @param values 
     */
    const save = () => {
        const load = message.loading({ content: 'loading' })
        addDevConstant(Protocol.data.ProtocolType, Protocol.data.Protocol, "ShowTag", data)
            .then(el => {
                load()
                message.success("保存显示参数配置成功")
            })
    }

    return (
        <>
            <Button type="primary" onClick={() => save()} style={{ marginBottom: 22 }}>上传保存</Button>
            <Checkbox.Group value={data} style={{ width: '100%' }} onChange={(val: any[]) => setData(val)}>
                <Row>
                    {
                        options.map(el =>
                            <Col span={24} md={12} xl={8} key={el.label as any}>
                                <Checkbox value={el.value}>{el.label}</Checkbox>
                            </Col>
                        )
                    }
                </Row>
            </Checkbox.Group>
        </>
    )
}


/**
 * 协议阈值配置
 * @param param0 
 * @returns 
 */
export const ProtocolThresholdUser: React.FC<Required<props>> = ({ protocolName, user }) => {

    const initData: Uart.Threshold = {
        name: '',
        min: 0,
        max: 100
    }

    const [form] = Form.useForm()

    const Protocol = usePromise(async () => {
        const el = await getProtocol(protocolName);
        return el.data;
    })

    const { data, loading, fecth, setData } = usePromise(async () => {
        const { data } = await getProtocolSetup<Uart.Threshold>(protocolName, "Threshold", user)
        const alarmMap = new Map(data.sys.map(el => [el.name, el]))
        data.user.forEach(el => {
            if (el?.name) alarmMap.set(el.name, el)
        })
        return [...alarmMap.values()]
    }, [])

    const options = useMemo(() => {
        const Instructs = Protocol.data?.instruct
        if (Instructs) {
            return Instructs.map(el => el.formResize.filter(e2 => !e2.isState).map(e2 => e2.name)).flat()
        } else {
            return []
        }
    }, [Protocol.data])


    /**
     * 编辑已有指令
     * @param item 
     */
    const edit = (item: Uart.Threshold) => {
        form.setFieldsValue(item)
    }

    /**
     * 删除已有指令
     * @param item 
     */
    const deleteOprate = (item: Uart.Threshold) => {
        Modal.confirm({
            content: `确定删除阈值:${item.name}??`,
            onOk() {
                const index = data.findIndex(el => el.name === item.name)
                data.splice(index, 1)
                setData([...data])
            }
        })
    }


    /**
     * 保存操作指令
     */
    const saveOprates = () => {
        const load = message.loading({ content: 'loading' })
        setUserSetupProtocol(Protocol.data.Protocol, "Threshold", data)
            .then(el => {
                fecth()
                load()
                message.success("保存阈值配置成功")

            })
    }


    /**
     * 保存form
     * @param item 
     */
    const save = (item: Uart.Threshold) => {
        const index = data.findIndex(el => el.name === item.name)
        if (index === -1) {
            setData([item, ...data])
        } else {
            data.splice(index, 1, item)
            setData([...data])
        }
        form.setFieldsValue(initData)
    }

    return (
        <>
            <Form form={form} initialValues={initData} onFinish={save} layout="inline">
                <Form.Item name="name" label="参数" required
                    rules={[
                        {
                            required: true
                        }
                    ]}
                >
                    <Select
                        loading={loading}
                        showSearch
                        placeholder="选择参数"
                        style={{ minWidth: 120 }}
                    >
                        {
                            options.map(el => <Select.Option value={el} key={el} >{el}</Select.Option>)
                        }
                    </Select>
                </Form.Item>
                <Form.Item name="min" label="最小值" required
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                return value < getFieldValue("max") ? Promise.resolve() : Promise.reject(new Error('必须小于最大值'))
                            }
                        })
                    ]}
                >
                    <InputNumber></InputNumber>
                </Form.Item>
                <Form.Item name="max" label="最大值" required
                    rules={[
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                return value > getFieldValue("min") ? Promise.resolve() : Promise.reject(new Error('必须大于最小值'))
                            }
                        })
                    ]}
                >
                    <InputNumber></InputNumber>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 3 }}>
                    <Button type="primary" htmlType="submit">保存</Button>
                </Form.Item>
            </Form>
            <Divider plain>阈值列表</Divider>
            <Space >
                <Button type="primary" onChange={() => setData([])}>清除所有</Button>
                <Button type="primary" onClick={() => saveOprates()}>上传保存</Button>
            </Space>
            <Table
                loading={loading}
                dataSource={generateTableKey(data, "name")}
                pagination={false}
                columns={[
                    {
                        dataIndex: 'name',
                        title: '指令名称'
                    },
                    {
                        dataIndex: 'min',
                        title: '最小值'
                    },
                    {
                        dataIndex: 'max',
                        title: '最大值'
                    },
                    {
                        key: 'oprate',
                        title: '操作',
                        render: (_, re) => <Space>
                            <EditFilled onClick={() => edit(re)}></EditFilled>
                            <DeleteFilled onClick={() => deleteOprate(re)}></DeleteFilled>
                        </Space>
                    }
                ] as ColumnsType<Uart.Threshold>}
            ></Table>
        </>
    )
}


/**
 * 协议状态配置
 * @param param0 
 * @returns 
 */
export const ProtocolAlarmStatUser: React.FC<Required<props>> = ({ protocolName, user }) => {

    const [form] = Form.useForm()

    const Protocol = usePromise(async () => {
        const el = await getProtocol(protocolName);
        return el.data;
    })

    const { data, loading, fecth, setData } = usePromise(async () => {
        const { data } = await getProtocolSetup<Uart.ConstantAlarmStat>(protocolName, "AlarmStat", user)
        const alarmMap = new Map(data.sys.map(el => [el.name, el]))
        data.user.forEach(el => {
            if (el?.name) alarmMap.set(el.name, el)
        })
        return [...alarmMap.values()]
    }, [])

    const options = useMemo(() => {
        const Instructs = Protocol.data?.instruct
        if (Instructs) {
            const args = new Map(Instructs.map(el => el.formResize.filter(e2 => e2.isState)).flat().map(el => [el.name, { ...ProtocolInstructFormrizeParse(el), value: [] as string[] }]))
            data.forEach(el => {
                args.get(el.name)!.value = el.alarmStat
            })

            return [...args.values()]
                .map(el => ({
                    name: el.name,
                    value: el.value,
                    options: Object.entries((el.parse)).map(e2 => ({ label: e2.join("/"), value: e2[0] }))
                }))
        } else {
            return []
        }
    }, [Protocol.data, data])

    useEffect(() => {
        if (options.length > 0) {
            form.setFieldsValue(Object.assign({}, ...options.map(el => ({ [el.name]: el.value }))))
        }
    }, [options])



    /**
     * 保存配置
     * @param values 
     */
    const save = (values: Record<string, string[]>) => {
        const Threld = Object.entries(values).map(([name, alarmStat]) => ({ name, alarmStat }))
        const load = message.loading({ content: 'loading' })
        console.log({ values, Threld });

        setUserSetupProtocol(Protocol.data.Protocol, "AlarmStat", Threld)
            .then(() => {
                fecth()
                load()
                message.success("保存状态配置成功")
            })
    }

    return (
        <>
            <Form form={form} labelCol={{ span: 8 }} size="small" onFinish={save}>
                {
                    options.map(el =>
                        <Form.Item name={el.name} label={<Tag>{el.name}</Tag>} key={el.name}>
                            <Checkbox.Group options={el.options}></Checkbox.Group>
                        </Form.Item>
                    )
                }
                <Form.Item wrapperCol={{ offset: 8 }}>
                    <Button type="primary" htmlType="submit">上传提交</Button>
                </Form.Item>
            </Form>
        </>
    )
}


/**
 * 显示参数配置
 * @param param0 
 * @returns 
 */
export const ProtocolShowTagUser: React.FC<Required<props>> = ({ protocolName, user }) => {

    const Protocol = usePromise(async () => {
        const el = await getProtocol(protocolName);
        return el.data;
    })

    const { data, fecth, setData } = usePromise(async () => {
        const { data } = await getProtocolSetup<string>(protocolName, "ShowTag", user)
        return [...new Set([...data.sys, ...data.user])]
    }, [])

    const options = useMemo<CheckboxOptionType[]>(() => {
        const Instructs = Protocol.data?.instruct
        return Instructs ? Instructs.map(el => el.formResize.map(e2 => e2.name)).flat().map(el => ({ label: el, value: el })) : []
    }, [Protocol.data, data])


    /**
     * 保存配置
     */
    const save = () => {
        const load = message.loading({ content: 'loading' })

        setUserSetupProtocol(Protocol.data.Protocol, "ShowTag", data)
            .then(el => {
                load()
                fecth()
                message.success("保存显示参数配置成功")
            })
    }

    return (
        <>
            <Button type="primary" onClick={() => save()} style={{ marginBottom: 22 }}>上传保存</Button>
            <Checkbox.Group value={data} style={{ width: '100%' }} onChange={(val: any[]) => setData(val)}>
                <Row>
                    {
                        options.map(el =>
                            <Col span={24} md={12} xl={8} key={el.label as any}>
                                <Checkbox value={el.value}>{el.label}</Checkbox>
                            </Col>
                        )
                    }
                </Row>
            </Checkbox.Group>
        </>
    )
}