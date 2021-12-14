import { createFromIconfontCN } from '@ant-design/icons';

/**
 * aliIcon
 */
export const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_1579455_0um9hviway6d.js',
});

/**
 * 设备类型
 */
export const devTypeIcon: { [x in string]: JSX.Element } = {
  '空调': <IconFont type="icon-kongdiao" color="#1296db" />,
  'IO': <IconFont type="icon-io" color="#13227a" />,
  '电量仪': <IconFont type="icon-dianliangyi" color="#d4237a" />,
  'UPS': <IconFont type="icon-upsdianyuan" color="#1296db" />,
  'TH': <IconFont type="icon-wenshidu" />
}