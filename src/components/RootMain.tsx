import React from "react"
import { Layout, Menu, Breadcrumb } from "antd"
import "./RootMain.css"
import { Link } from "react-router-dom"

interface navi {
  title: string
  ico: string;
  child: {
    to: {
      name: string
    }
    text: string;
    ico?: string;
  }[]
}

/**
 * root页面通用布局
 * @param props 
 * @returns 
 */
export const RootMain: React.FC = props => {

  const nav: navi[] =
    [{
      title: "基础数据",
      ico: "el-icon-menu",
      child: [
        {
          to: {
            name: "root/node/Secret",
          },
          text: "Secret",
        },
        {
          to: {
            name: "root/node/Protocols",
          },
          text: "协议",
        },
        {
          to: {
            name: "root/node/addDev",
          },
          text: "设备类型",
        },
        {
          to: {
            name: "root/node/addNode",
          },
          text: "节点",
        },
        {
          to: {
            name: "root/node/Terminal",
          },
          text: "终端",
          ico: "\uEB63",
        },
        {
          to: {
            name: "root/node/user",
          },
          text: "用户",
          ico: "\uEB6f",
        },
        {
          to: {
            name: "root/node/AT",
          },
          text: "DTU调试",
          ico: "\uEC63",
        },
      ],
    },
    {
      title: "微信数据",
      ico: "el-icon-chat-round",
      child: [
        {
          to: {
            name: "root/wx/users",
          },
          text: "公众号用户",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/wx/materials_list",
          },
          text: "素材列表",
          ico: "\uEB6f",
        },
      ],
    },
    {
      title: '在线状态',
      ico: "el-icon-connection",
      child: [
        {
          to: {
            name: "root/socket/nodeInstruct",
          },
          text: "节点指令状态",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/socket/user",
          },
          text: "用户",
          ico: "\uEB6f",
        },
      ],
    },
    {
      title: '设备数据',
      ico: "el-icon-coin",
      child: [
        {
          to: {
            name: "root/data/ClientResultSingle",
          },
          text: "单例数据",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/data/ClientResult",
          },
          text: "解析数据",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/data/redis",
          },
          text: "redis",
          ico: "\uEB64",
        },
      ],
    },
    {
      title: "日志记录",
      ico: "el-icon-coin",
      child: [
        {
          to: {
            name: "root/log/node",
          },
          text: "节点日志",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/log/terminal",
          },
          text: "终端日志",
          ico: "\uEB64",
        },
        {
          to: {
            name: "root/log/sms",
          },
          text: "短信日志",
          ico: "\uEB8b",
        },
        {
          to: {
            name: "root/log/mail",
          },
          text: "邮件日志",
          ico: "\uEB8b",
        },
        {
          to: {
            name: "root/log/uartterminaldatatransfinites",
          },
          text: "告警日志",
          ico: "\uEB68",
        },
        {
          to: {
            name: "root/log/userlogins",
          },
          text: "用户登陆日志",
          ico: "\uEB6b",
        },
        {
          to: {
            name: "root/log/userrequsts",
          },
          text: "用户请求日志",
          ico: "\uEB8c",
        },
        {
          to: {
            name: "root/log/dataClean",
          },
          text: "数据清洗日志",
          ico: "\uEB8c",
        },
        {
          to: {
            name: "root/log/wxEvent",
          },
          text: "微信推送事件日志",
          ico: "\uEB8c",
        },
        {
          to: {
            name: "root/log/wxSubscribe",
          },
          text: "微信告警事件日志",
          ico: "\uEB8c",
        },
      ]
    }]


  return (
    <Layout className="layout">
      <Layout.Header style={{ height: 56 }} >
        <h3 style={{ color: "white" }}>百事服后台</h3>
      </Layout.Header>
      <Layout>
        <Layout.Sider width={200} className="site-layout-background">
          <Menu
            theme="dark"
            mode="inline"
            style={{ height: '100%', borderRight: 0 }}
          >
            {
              nav.map(el =>
                <Menu.SubMenu key={el.title} title={el.title}>
                  {
                    el.child.map(child =>
                      <Menu.Item key={child.text+el.title} >
                        <Link to={'/'+child.to.name}>{child.text}</Link>
                      </Menu.Item>)
                  }
                </Menu.SubMenu>)
            }
          </Menu>
        </Layout.Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>
          <Layout.Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              overflow:"auto"
            }}
          >
            {
              props.children
            }
          </Layout.Content>
        </Layout>
      </Layout>
    </Layout>
  )
}