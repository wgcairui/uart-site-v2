import { Card } from "antd"
import { logsmssends } from "../../common/FecthRoot"
import { getColumnSearchProp } from "../../common/tableCommon"
import { Log, DesList } from "./log"

/**
 * smslog
 * @returns 
 */
export const LogSms: React.FC = () => {
    const parse = (str: string, keys: string[]) => {
        try {
            const j = JSON.parse(str)
            for (let index = 0; index < keys.length; index++) {
                const key = keys[index]
                if (key in j) return key + ':' + j[key]
            }
        } catch (error) {
            return str
        }
    }
    return (
        <Log
            lastDay={15}
            dataFun={logsmssends}
            columns={[
                {
                    dataIndex: 'tels',
                    title: 'tels',
                    render: (val: string[]) => val.join(","),
                    ...getColumnSearchProp('tels')
                },
                {
                    dataIndex: 'sendParams',
                    title: 'sendParams',
                    render: val => parse(val.TemplateParam, ['remind', 'code'])//.remind ||val.TemplateParam //
                },
                {
                    key: 'result',
                    title: 'result',
                    render: (_, sms: Uart.logSmsSend) => sms?.Success?.Message || sms?.Error?.message || 'null'
                }
            ]}

            expandable={{
                expandedRowRender: (li: Uart.logSmsSend) =>
                    <Card>
                        <DesList title="sendParams" data={li.sendParams} />
                        <DesList title="Success" data={li.Success} />
                        <DesList title="Error" data={li.Error} />
                    </Card>
            }}
        ></Log>
    )
}

export default LogSms