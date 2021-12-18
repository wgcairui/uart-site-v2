import { SearchOutlined } from "@ant-design/icons";
import { Input, Space, Button, TableProps } from "antd";
import { ColumnFilterItem, ColumnType, FilterDropdownProps } from "antd/lib/table/interface";
import Highlighter from 'react-highlight-words';


type index = keyof Uart.uartAlarmObject
/**
 * 用于table表格刷选数据
 * @param dataIndex 表格col字段
 * @param val 留空,作为临时变量使用
 * @returns Partial<ColumnType<any>
 */

export function getColumnSearchProp<T,>(dataIndex: keyof T, val: string = ''): Partial<ColumnType<T>> {
    return {
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: FilterDropdownProps) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => {
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                        val = e.target.value || ''
                    }}
                    onPressEnter={() => confirm({ closeDropdown: false })}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => confirm({ closeDropdown: true })}
                        size="small"
                        style={{ width: 90 }}
                    >
                        查找
                    </Button>
                    <Button onClick={() => {
                        clearFilters!()
                        confirm({ closeDropdown: true })
                        val = ''
                    }} size="small" style={{ width: 90 }}>
                        重置
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record: any) =>
            record[dataIndex]
                ? record[dataIndex]!.toString().toLowerCase().includes((value as string).toLowerCase())
                : false,
        render: text =>
            val ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[val]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            )
    }
}


/**
 * table默认配置
 */
export const tableConfig: Partial<TableProps<any>> = {

    /**
     * 分页器配置
     * @see https://ant-design.gitee.io/components/pagination-cn/#API
     */
    pagination: {
        defaultPageSize: 10,
        hideOnSinglePage: true
    },
    sticky: true
}


/**
 * table表格刷选
 * @param data 数据
 * @param key 
 * @returns 
 */
export const tableColumnsFilter = <T extends Record<string, any>>(data: T[], key: keyof T) => {
    const vals = data.map(el => typeof el[key] === 'string' ? el[key] : false).filter(el => el)
    const set = new Set<string>(vals as any)
    return {
        filters: [...set].map((el) => ({ text: el, value: el })) as ColumnFilterItem[],
        onFilter: (value: string | number | boolean, record: T) => record[key] === value
    }
}


type tableData<T> = T extends Array<infer P> ? (P & { key: string })[] : T

/**
 * antd table生成key键
 * @param tableData 
 * @param key 
 * @returns 
 */
export const generateTableKey = <T extends Array<any>>(tableData: T, key: T extends Array<infer P> ? keyof P : string): tableData<T> => {
    try {
        return tableData.map(el => ({ ...el, key: el[key] })) as any
    } catch (error) {
        console.log('[]');
        
        return [] as any
    }

}



