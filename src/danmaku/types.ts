import { ViewProps } from 'react-native'

export interface DanmakuRef {
    //播放
    play: () => void,
    //暂停
    pause: () => void,
    //停止
    stop: () => void,
    /**
     * @description 跳转至某时间点
     * @param time 时间点，毫秒
     * @param play 可选 跳转后是否播放 默认为false
     */
    jump: (time: number, play?: boolean) => void,
    /**
     * @description 发送弹幕
     * @param data 弹幕数据
     * @param time 可选 弹幕所在时间点，默认为当前时间
     */
    send: (data: DanmakuBaseData, time?: number) => void,
}

export interface DanmakuProps extends ViewProps {
    //弹幕数据
    data: Array<DanmakuData>,
    //是否显示，false时opacity为0
    visible: boolean,
    //弹幕最大行数，默认铺满所在区域，当值∈(0-1)时作为占屏百分比
    maxLine?: number,
    //弹幕字体大小，默认12
    itemFontSize?: number,
    //弹幕透明度，值∈[0,1]，默认1
    itemOpacity?: number,
    //弹幕速度，最好是值∈(0,1]，默认0.4
    itemSpeed?: number,
    //弹幕阴影是否隐藏，默认false
    itemShadowHidden?: boolean
}

export interface DanmakuData extends DanmakuBaseData {
    //弹幕所在时间点
    playTime: number,
}

export interface DanmakuBaseData {
    //弹幕内容
    msg: string,
    //弹幕模式 0: 滚动 1: 顶部 2: 底部，默认0
    mode?: number,
    //弹幕颜色，默认#fff
    color?: string,
    //弹幕外边框，发送弹幕时可能用到，默认false
    mark?: boolean
}

export interface DanmakuItemProps {
    msg: string,
    color?: string,
    fontSize: number,
    opacity: number,
    speed: number,
    shadowHidden: boolean,
    mark: boolean,
    initLeft: number,
    containerWidth: number,
    playState: boolean,
    initVertical: number,
    onEnd: () => void,
}

export interface DanmakuRollItemProps extends DanmakuItemProps {
    setRight: (value: boolean) => void
}

export interface DanmakuFixedItemProps extends DanmakuItemProps {
    positon: 'top' | 'bottom'
}
