import { Card } from "antd"
import moment from "moment"
import { logbulls } from "../../common/FecthRoot"
import { DesList, Log } from "./log"

export const LogBull: React.FC = () => {

    
    return (
        <Log
            lastDay={120}
            dataFun={logbulls}
            columns={[
                {
                    dataIndex: 'timeStamp',
                    title: '日期',
                    render: val => moment(val).format('MM/DD')
                },
                {
                    dataIndex: 'jobName',
                    title: '队列'
                },
                {
                    dataIndex: 'id',
                    title: 'workId'
                },
                {
                    dataIndex: 'data',
                    title: 'message',
                    render:(val:any)=>val?.message || ''
                }
            ]}

            expandable={{
                expandedRowRender: (li: any) =>
                    <Card>
                        <DesList title="data" data={li.data} />
                    </Card>
            }}
        />
    )
}


export default LogBull