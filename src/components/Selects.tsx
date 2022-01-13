import React, { useMemo, useState } from "react";
import { getDevTypes, getProtocol } from "../common/Fetch";
import { Cascader, Select, SelectProps } from "antd";
import { usePromise } from "../hook/usePromise";
import { getProtocols, Nodes } from "../common/FecthRoot";

interface DataNode {
    label: React.ReactNode;
    /** Customize hover title */
    title?: string;
    value: string | number;
    disabled?: boolean;
    children?: DataNode[];
    isLeaf?: boolean;
}

interface cascaderProps {
    "onChange": (value: React.Key[], selectOptions: DataNode[]) => void
    multiple?: boolean
}

/**
 * 通用设备级联选择模板
 * @param props 
 * @returns 
 */
export const DevTypesCascader: React.FC<cascaderProps> = props => {

    const [cascader, setCascader] = useState<DataNode[]>([
        { value: 'UPS', label: "UPS", isLeaf: false, },
        { value: '空调', label: "空调", isLeaf: false, },
        { value: '电量仪', label: "电量仪", isLeaf: false, },
        { value: '温湿度', label: "温湿度", isLeaf: false, },
        { value: 'IO', label: "IO", isLeaf: false, },
    ])

    const loadData = (opts: DataNode[]) => {
        if (opts.length === 1) {
            const target = opts[opts.length - 1];
            (target as any).loading = true
            getDevTypes(target.value as string).then(el => {
                (target as any).loading = false
                target.children = el.data.map(type => ({
                    value: type.DevModel,
                    label: type.DevModel,
                    children: type.Protocols.map(p => ({
                        value: p.Protocol,
                        label: p.Protocol,
                    }))
                }))
                setCascader([...cascader])
            })
        }
    }

    return (
        <Cascader options={cascader} loadData={loadData as any} multiple={props.multiple} onChange={props.onChange as any} />
    )
}


/**
 * 通用协议级联选择模板
 * @param props 
 * @returns 
 */
export const ProtocolsCascader: React.FC<cascaderProps> = props => {

    const [cascader, setCascader] = useState<DataNode[]>([
        { value: 'ups', label: "UPS", isLeaf: false, },
        { value: 'air', label: "空调", isLeaf: false, },
        { value: 'em', label: "电量仪", isLeaf: false, },
        { value: 'th', label: "温湿度", isLeaf: false, },
        { value: 'io', label: "IO", isLeaf: false, },
    ])

    const loadData = (opts: DataNode[]) => {
        if (opts.length === 1) {
            const target = opts[opts.length - 1];
            (target as any).loading = true
            getProtocols().then(el => {
                (target as any).loading = false
                target.children = el.data.filter(el => el.ProtocolType === target.value).map(type => ({
                    value: type.Protocol,
                    label: type.Protocol,
                }))
                setCascader([...cascader])
            })
        }
    }

    return (
        <Cascader options={cascader} loadData={loadData as any} multiple={props.multiple} onChange={props.onChange as any} />
    )
}


interface selectProps {
    label: string
    value: string | number
}
/**
 * 节点选择器
 * @returns 
 */
export const NodesSelects: React.FC<SelectProps<selectProps>> = (props) => {

    const { data } = usePromise(async () => {
        const { data } = await Nodes()
        return data
    }, [])

    return (
        <Select {...props}>
            {
                data.map(node => <Select.Option value={node.Name} key={node.IP}>{node.Name}</Select.Option>)
            }
        </Select>
    )
}


interface ProtocolInstructSelectProps {
    defaultValue?: string | string[]
    /**
     * 协议名称
     */
    protocolName: string
    onChange?: (data: string | string[]) => void

    multiple?: boolean
    /**
     * 刷选选项
     */
    filterOptions?: string[]
}
/**
 * 协议参数select
 * @param param0 
 * @returns 
 */
export const ProtocolInstructSelect: React.FC<ProtocolInstructSelectProps> = ({ defaultValue, protocolName, onChange, filterOptions, multiple }) => {

    const { data, loading } = usePromise(async () => {
        const { data } = await getProtocol(protocolName)
        return data.instruct || []
    }, [])

    const options = useMemo(() => {
        const args = data.map(el => el.formResize.map(e2 => e2.name)).flat()
        return filterOptions ? args.filter(el => !filterOptions.includes(el)) : args
    }, [filterOptions, data])

    return (
        <Select defaultValue={defaultValue} onChange={onChange} mode={multiple ? "multiple" : undefined} loading={loading} style={{ minWidth: 150 }}>
            {
                options.map((el, i) => <Select.Option value={el} key={el + i} >{el}</Select.Option>)
            }
        </Select>
    )
}