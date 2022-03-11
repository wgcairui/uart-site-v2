import { universalResult } from "../typing"
import { Post } from "./Fetch"
import { QueryCardInfoResponseBodyCardInfo, QueryCardFlowInfoResponseBodyCardFlowInfosCardFlowInfo, QueryIotCardOfferDtlResponseBodyCardOfferDetailDetail, DoIotRechargeResponseBody } from "@alicloud/dyiotapi20171111"

import { DeleteMultiResult, ObjectMeta } from "ali-oss"

interface result<T = any> {
    code: number
    data: T
    msg: string
    [x: string]: any
}

export interface runInfo {
    Node: { online: number, all: number }
    Protocol: number
    SysInfo: {
        freemem: string
        hostname: string
        loadavg: number[]
        totalmem: string
        type: string
        uptime: string
        usecpu: number
        usemen: number
        version: string
    }
    Terminal: { online: number, all: number }
    TimeOutMonutDev: number
    User: { online: number, all: number }
    events: number
}

export type logAggs<T = number> = Pick<Uart.logTerminals, "type" | "msg"> & { timeStamp: T }


async function fecth<T = Uart.ApolloMongoResult>(type: string, datas?: any): Promise<universalResult<{ data: T }>> {
    const result = await Post<universalResult<{ data: T }>>("/api/root/" + type, datas)
    return result
}


/**
* 获取永久素材的列表
* @param type 素材的类型，图片（image）、视频（video）、语音 （voice）、图文（news）
* @param offset 从全部素材的该偏移位置开始返回，0表示从第一个素材 返回
* @param count 返回素材的数量，取值在1到20之间
 * @returns 
 */
export function materials_list(type: string, offset: number, count: number) {
    return fecth<Uart.WX.materials_list>("materials_list", { type, offset, count })
}

/**
 * 获取所有公众号用户
 * @returns 
 */
export function wx_users() {
    return fecth<Uart.WX.userInfoPublic[]>("wx_users")
}

/**
 * 更新公众号用户资料库
 * @returns 
 */
export function update_wx_users_all() {
    return fecth("update_wx_users_all")
}
/**
 * 向指定用户推送信息测试
 * @param type 0:告警测试
 * @returns 
 */
export function wx_send_info(type: number, openid: string, content?: string) {
    return fecth<Uart.WX.wxRequest>("wx_send_info", { type, openid, content })
}

/**
 * 获取微信推送事件记录
 * @returns 
 */
export function log_wxEvent() {
    return fecth<Uart.WX.WxEvent[]>('log_wxEvent')
}

/**
 * 设置第三方平台的密匙
 * @param opt 
 * @returns 
 */
export function set_Secret(opt: Uart.Secret_app) {
    return fecth('setSecret', opt)
}
/**
 * 获取第三方平台的密匙
 * @param type 平台类型
 * @returns 
 */
export function get_Secret(type: Uart.secretType) {
    return fecth<Uart.Secret_app | null>('getSecret', { type })
}

/**
 * 获取服务器运行状态
 * @returns 
 */
export function runingState() {
    return fecth<runInfo>("runingState")
}

/**
 * 获取节点状态
 * @returns 
 */
export function NodeInfo() {
    return fecth<Uart.nodeInfo[]>("NodeInfo")
}

/**
 * 获取所有节点
 * @param name 
 */
export function Nodes() {
    return fecth<Uart.NodeClient[]>("Nodes",)
}

/**
 * 获取指定节点
 * @param name 
 */
export function Node(name: string) {
    return fecth<Uart.NodeClient>("Node", { name })
}

/**
 * 获取所有终端信息
 * @returns 
 */
export function getTerminals(filter?: Partial<Record<keyof Uart.Terminal, 1 | 0>>) {
    return fecth<Uart.Terminal[]>("getTerminals", { filter })
}

/**
 * 获取所有协议
 */
export function getProtocols() {
    return fecth<Uart.protocol[]>("getProtocols")
}

/**
 * 添加设备协议常量配置
 * @param ProtocolType 
 * @param Protocol 
 * @param type 
 * @param arg 
 * @returns 
 */
export function addDevConstent(ProtocolType: string, Protocol: string, type: Uart.ConstantThresholdType, arg: any) {
    return fecth("addDevConstent", { ProtocolType, Protocol, type, arg })
}

/**
 * 删除协议
 * @param protocol 
 */
export function deleteProtocol(protocol: string) {
    return fecth<string[]>("deleteProtocol", { protocol })
}

/**
 * 根据文本内容更新协议
 * @param protocol 
 */
export function updateProtocol(protocol: Uart.protocol) {
    return fecth('updateProtocol', { protocol })
}

/**
 * 设置协议
 * @param Type 
 * @param ProtocolType 
 * @param Protocol 
 * @param instruct 
 * @returns 
 */
export function setProtocol(Type: number, ProtocolType: string, Protocol: string, instruct: Uart.protocolInstruct[]) {
    return fecth("setProtocol", { Type, Protocol, ProtocolType, instruct })
}

/**
 * 测试协议前置脚本
 * @returns 
 */
export function TestScriptStart(scriptStart: string, name: string) {
    return fecth("TestScriptStart", { scriptStart, name })
}

/**
 * 获取所有设备类型
 * @returns 
 */
export function DevTypes() {
    return fecth<(Uart.DevsType & { _id?: string })[]>('DevTypes')
}

/**
 * 获取指定设备类型
 * @returns 
 */
export function DevType(DevModel: string) {
    return fecth<Uart.DevsType>('DevType', { DevModel })
}

/**
 * 添加设备类型
 * @param Type 
 * @param DevModel 
 * @param Protocols 
 * @returns 
 */
export function addDevType(Type: string, DevModel: string, Protocols: Pick<Uart.protocol, "ProtocolType" | "Protocol">[]) {
    return fecth("addDevType", { Type, DevModel, Protocols })
}

/**
 * 删除设备类型
 */
export function deleteDevModel(DevModel: string) {
    return fecth<string[]>("deleteDevModel", { DevModel })
}

/**
 * 添加登记设备
 * @param DevMac 
 * @param mountNode 
 * @returns 
 */
export function addRegisterTerminal(DevMac: string, mountNode: string) {
    return fecth("addRegisterTerminal", { DevMac, mountNode })
}

/**
 * 删除登记设备
 */
export function deleteRegisterTerminal(DevMac: string) {
    return fecth<string>("deleteRegisterTerminal", { DevMac })
}

/**
 * 初始化设备
 */
export function initTerminal(mac: string) {
    return fecth<string>("initTerminal", { mac })
}

/**
     * 设置节点
     * @param Name 
     * @param IP 
     * @param Port 
     * @param MaxConnections 
     * @returns 
     */
export function setNode(Name: string, IP: string, Port: number, MaxConnections: number) {
    return fecth("setNode", { Name, IP, Port, MaxConnections })
}

/**
 * 删除节点
 */
export function deleteNode(Name: string) {
    return fecth<string[]>("deleteNode", { Name })
}

/**
 * 获取设备远程调试地址
 * @param mac 
 */
export function iotRemoteUrl(mac: string) {
    return fecth<string>("iotRemoteUrl", { mac })
}

/**
     * 获取设备使用流量
     */
export function getUseBtyes(mac: string) {
    return fecth<Uart.logTerminaluseBytes[]>("getUseBtyes", { mac })
}

/**
 * 获取设备指定时段繁忙状态
 * @param mac 
 * @param start 
 * @param end 
 */
export function getDtuBusy(mac: string, start: string, end: string) {
    return fecth<Uart.logDtuBusy[]>("getDtuBusy", { mac, start, end })
}

/**
 * 获取dtu发送指令记录
 * @param mac 
 * @returns 
 */
export function logInstructQuery(mac: string) {
    return fecth<Uart.instructQuery[]>("logInstructQuery", { mac })
}

/**
     * 固定发送DTU AT指令
     * @returns 
     */
export function sendATInstruct(mac: string, content: string) {
    return fecth("sendATInstruct", { mac, content })
}

/**
 * 查询注册终端设备的节点
 * @param DevMac 
 * @returns 
 */
export function RegisterTerminal(DevMac: string) {
    return fecth<Uart.RegisterTerminal>("RegisterTerminal", { DevMac })
}

/**
 * 查询所有终端
 */
export function RegisterTerminals() {
    return fecth<Uart.RegisterTerminal[]>("RegisterTerminals")
}


/**
 * 获取所有用户信息
 * @returns 
 */
export function users() {
    return fecth<Uart.UserInfo[]>("users")
}

/**
   * 删除用户信息
   * @param user 
   * @returns 
   */
export function deleteUser(user: string, hash: string) {
    return fecth("deleteUser", { user, hash })
}

/**
* 获取all用户告警配置
* @param user 
* @param filter 
* @returns 
*/
export function getUserAlarmSetup(user: string) {
    return fecth<Uart.userSetup>("getUserAlarmSetup", { user })
}

/**
* 获取all用户告警配置
* @param user 
* @param filter 
* @returns 
*/
export function getUserAlarmSetups() {
    return fecth<Uart.userSetup[]>("getUserAlarmSetups")
}


/**
* 初始化用户告警配置
* @param user 
*/
export function initUserAlarmSetup(user: string) {
    return fecth("initUserAlarmSetup", { user })

}

/**
 * 获取用户绑定设备
 * @returns 
 */
export function BindDev(user: string) {
    return fecth<Uart.BindDevice>("BindDev", { user })
}

/**
 * 获取节点指令发送运行状态
 * @returns 
 */
export function getNodeInstructQuery() {
    return fecth<Uart.TerminalMountDevsEX[]>("getNodeInstructQuery")
}

/**
 * 获取单个节点指令发送运行状态
 * @returns 
 */
export function getNodeInstructQueryMac(mac: string, pid: number | string) {
    return fecth<number>("getNodeInstructQueryMac", { mac, pid })
}

/**
 * 获取所有连接的socket客户端用户
 * @returns 
 */
export function getUsersOnline() {
    return fecth<Uart.UserInfo[]>("getUsersOnline")
}

/**
 * 获取指定用户在线状态
 * @param user 
 * @returns 
 */
export function getUserOnlineStat(user: string) {
    return fecth<boolean>("getUserOnlineStat", { user })
}

/**
 * 发送socket消息给用户
 * @param user 
 * @param msg 
 * @returns 
 */
export function sendUserSocketInfo(user: string, msg: string) {
    return fecth<any>("sendUserSocketInfo", { user, msg })
}



/**
 * 获取设备原始数据
 * @param start 
 * @param end 
 * @param id 
 * @returns 
 */
export function ClientResults(start?: string, end?: string, id?: string) {
    return fecth<Uart.queryResult[]>("ClientResults", { start, end, id })
}

export interface queryResultSave extends Uart.queryResultSave { _id: string, parentId: string, content?: any }

/**
 * 获取设备解析数据
 * @param start 
 * @param end 
 * @param id 
 * @returns 
 */
export function ClientResult(start?: string, end?: string, id?: string) {
    return fecth<queryResultSave[]>("ClientResult", { start, end, id })
}

/**
 * 获取设备单例数据
 * @returns 
 */
export function ClientResultSingle() {
    return fecth<queryResultSave[]>("ClientResultSingle")
}

/**
 * 获取节点日志
 * @param start 
 * @param end 
 * @returns 
 */
export function lognodes(start: string, end: string) {
    return fecth<Uart.logNodes[]>("lognodes", { start, end })
}

/**
 * 获取终端日志
 * @param start 
 * @param end 
 * @returns 
 */
export function logterminals(start: string, end: string) {
    return fecth<Uart.logTerminals[]>("logterminals", { start, end })
}

/**
 * 获取短信日志
 */
export function logsmssends(start: string, end: string) {
    return fecth<Uart.logSmsSend[]>("logsmssends", { start, end })
}

/**
 * 返回每个短信发送次数
 * @returns 
 */
export function logsmssendsCountInfo() {
    return fecth<{ _id: string, sum: number }[]>("logsmssendsCountInfo")
}

/**
 * 获取邮件日志
 */
export function logmailsends(start: string, end: string) {
    return fecth<Uart.logMailSend[]>("logmailsends", { start, end })
}

/**
 * 获取设备告警日志
 * @param start 
 * @param end 
 * @returns 
 */
export function loguartterminaldatatransfinites(start: string, end: string) {
    return fecth<Uart.uartAlarmObject[]>("loguartterminaldatatransfinites", { start, end })
}

/**
 * 获取用户登陆日志
 * @param start 
 * @param end 
 * @returns 
 */
export function loguserlogins(start: string, end: string) {
    return fecth<Uart.logUserLogins[]>("loguserlogins", { start, end })
}

/**
 * 获取用户请求日志
 * @param start 
 * @param end 
 * @returns 
 */
export function loguserrequsts(start: string, end: string) {
    return fecth<Uart.logUserRequst[]>("loguserrequsts", { start, end })
}

/**
 * 获取wx告警推送
 * @param start 
 * @param end 
 * @returns 
 * */
export function logwxsubscribes(start: string, end: string) {
    return fecth<Uart.WX.wxsubscribeMessage[]>("logwxsubscribes", { start, end })
}

/**
 * 获取定时清理记录
 * @param start 
 * @param end 
 * @returns 
 */
export function logdataclean(start: string, end: string) {
    return fecth<any[]>("logdataclean", { start, end })
}

/**
 * 获取指定设备聚合日志
 * @param start 
 * @param end 
 * @returns 
 */
export function logterminalAggs(mac: string, start: string, end: string) {
    return fecth<logAggs[]>("logterminalAggs", { mac, start, end })
}

/**
 * 获取指定用户聚合日志
 * @param start 
 * @param end 
 * @returns 
 */
export function logUserAggs(user: string, start: string, end: string) {
    return fecth<logAggs[]>("logUserAggs", { user, start, end })
}

/**
 * 变更用户组
 * @param user 
 */
export function toggleUserGroup(user: string) {
    return fecth<string>("toggleUserGroup", { user })
}

/**
 * 清空整个redis数据库
 * @returns 
 */
export function redisflushall() {
    return fecth("redisflushall")
}

/**
 * 清空当前库中的所有 key
 */
export function redisflushdb() {
    return fecth("redisflushdb")
}

/**
 * 获取redis中key
 */
export function rediskeys(pattern: string = "*") {
    return fecth<string[]>("rediskeys", { pattern })
}

export function rediskeysdValue(keys: string[]) {
    return fecth<string[]>("rediskeysdValue", { keys })
}

/**
 * 删除redis中指定key
 */
export function rediskeysdel(keys: string[]) {
    return fecth("rediskeysdel", { keys })
}

/** 
 * 数据清理
*/
export function DataClean() {
    return fecth("DataClean")
}

/**
* 固定发送设备操作指令
* @param query 
* @param item 
* @returns 
*/
export function SendProcotolInstructSet(query: Omit<Uart.instructQuery, "type" | 'events'>) {
    return fecth<Uart.ApolloMongoResult>("SendProcotolInstructSet", { query })
}


/**
 * 解绑复机
 * @param iccid 
 * @returns 
 */
export function IotDoIotUnbindResume(iccid: string) {
    return fecth<boolean>("IotDoIotUnbindResume", { iccid })
}

/**
 * 查询物联网卡的明细信息
 * @param iccid 
 * @returns 
 */
export function IotQueryCardInfo(iccid: string) {
    return fecth<QueryCardInfoResponseBodyCardInfo>("IotQueryCardInfo", { iccid })
}

/**
* 查询物联网卡的流量信息
* @param iccid 
* @returns 
*/
export function IotQueryCardFlowInfo(iccid: string) {
    return fecth<QueryCardFlowInfoResponseBodyCardFlowInfosCardFlowInfo>("IotQueryCardFlowInfo", { iccid })
}

/**
 * 查询物联网卡当前时间有效套餐的列表
 * @param iccid 
 * @returns 
 */
export function IotQueryIotCardOfferDtl(iccid: string) {
    return fecth<QueryIotCardOfferDtlResponseBodyCardOfferDetailDetail>("IotQueryIotCardOfferDtl", { iccid })
}



/**
 * 老版物联卡续订套餐
 * @param mac
 * @returns 
 */
export function IotRecharge(mac: string) {
    return fecth<DoIotRechargeResponseBody>("IotRecharge", { mac })
}

/**
 * 更新所有4G dtu iccid信息
 * @returns 
 */
export function UpdateIccids() {
    return fecth<{ time: number, length: number }>("UpdateIccids")
}

/**
* 删除绑定设备
* @param mac 
* @returns 
*/
export function delUserTerminal(user: string, mac: string) {
    return fecth("delUserTerminal", { user, mac })
}

/**
* 修改用户设备备注
* @param mac 
* @param remark 
* @returns 
*/
export const modifyTerminalRemark = (mac: string, remark: string) => {
    return fecth('modifyTerminalRemark', { mac, remark })
}

/**
* 修改用户备注
* @param user 
* @param remark 
* @returns 
*/
export const modifyUserRemark = (user: string, remark: string) => {
    return fecth('modifyUserRemark', { user, remark })
}

/**
 * 获取用户信息
 * @param user 
 * @returns 
 */
export const getUser = (user: string) => {
    return fecth<Uart.UserInfo>('getUser', { user })
}


/**
 * 获取用户告警
 * @param user 
 * @param start 
 * @param end 
 * @returns 
 */
export const getAlarm = (user: string, start: number, end: number) => {
    return fecth<Uart.uartAlarmObject[]>("userLoguartterminaldatatransfinites", { user, start, end })
}

/**
 * 根据设备id获取绑定用户
 * @param mac 
 * @returns 
 */
export const getTerminalUser = (mac: string) => {
    return fecth<string>('getTerminalUser', { mac })
}

/**
 * 修改协议备注
 * @param protocol 
 * @param remark 
 * @returns 
 */
export const modifyProtocolRemark = (protocol: string, remark: string) => {
    return fecth("modifyProtocolRemark", { protocol, remark })
}


export type ossfiles = Pick<ObjectMeta, 'name' | 'lastModified' | 'size' | 'url'>

/**
 * 获取oss数据列表
 * @param prefix 
 * @returns 
 */
export const ossFilelist = (prefix?: string) => {
    return fecth<ossfiles[]>("/ossFilelist", { prefix })
}

/**
 * 删除oss文件
 * @param names 
 * @returns 
 */
export const ossDelete = (names: string[]) => {
    return fecth<DeleteMultiResult>("/ossDelete", { names })
}


export const nodeRestart = (node: string) => {
    return fecth<any>("nodeRestart", { node })
}