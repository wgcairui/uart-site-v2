
import { EditFilled } from "@ant-design/icons";
import { Button, Input, message, Space } from "antd";
import React, { useState } from "react";

interface myInput {
    textArea?: boolean
    onSave?: (val: string) => void
    value?: string
    okText?: string

}

/**
 * 
 * @param props 
 * @returns 
 */
export const MyInput: React.FC<myInput> = props => {

    const [Edit, setEdit] = useState(false)

    const [val, setVal] = useState(() => props.value || '')

    /**
     * 保存内容
     */
    const save = () => {
        props.onSave && props.onSave(val)
        setEdit(false)
    }

    /**
     * 失去焦点
     */
    const blur = () => {
        setTimeout(() => setEdit(false), 100)
    }

    /**
     * 内容改变
     * @param e 
     */
    const change = (e: any) => {
        setVal(e.target.value)
    }


    return (
        props.textArea ?
            <Space>
                <Input.TextArea
                    autoSize
                    minLength={2}
                    allowClear
                    value={val}
                    onChange={change}
                    onFocus={() => setEdit(true)}
                    onPressEnter={save}
                    onBlur={blur}
                    size="small"
                >
                </Input.TextArea>
                {
                    Edit ?
                        <Button size="small" type="primary" onClick={save}>{props.okText || '保存'}</Button>
                        :
                        <span />
                }
            </Space>
            :
            <Input.Group compact style={{ width: 'auto', display: 'flex' }}>
                <Input
                    bordered={false}
                    value={val}
                    onChange={change}
                    onFocus={() => setEdit(true)}
                    onPressEnter={save}
                    onBlur={blur}
                >
                </Input>
                {
                    Edit ?
                        <Button size="small" shape="round" type="primary" onClick={save}>{props.okText || '保存'}</Button>
                        :
                        <Button size="small" shape="round" type="dashed" icon={<EditFilled />} ></Button>
                }
            </Input.Group>

    )
}