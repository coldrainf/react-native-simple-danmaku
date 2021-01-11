import * as React from 'react'
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from 'react'
import {
    View,
    LayoutChangeEvent
} from 'react-native'

import DanmakuRollItem from './DanmakuRollItem'
import DanmakuFixedItem from './DanmakuFixedItem'
import { useRafLoop } from './hooks'
import {
    DanmakuRef,
    DanmakuProps,
    DanmakuBaseData,
    DanmakuData
} from './types'


const defaultProps = {
    playSpeed: 1,
    itemFontSize: 12,
    itemOpacity: 1,
    itemSpeed: 0.4,
}

const Danmaku = forwardRef<DanmakuRef, DanmakuProps>((props, ref) => {
    useImperativeHandle(ref, () => ({
        play,
        pause,
        jump,
        stop,
        send,
    }))
    const play = () => {
        setPlayState(true)
    }
    const pause = () => {
        setPlayState(false)
    }
    const jump = (time: number, play?: boolean) => {
        playTime.current = time
        setTunnel(Array(props.data.length).fill(''))
        itemInState.current = Array(props.data.length).fill(false)
        let indexTemp = 0
        while (initData[indexTemp] && initData[indexTemp].playTime <= time) {
            indexTemp++
        }
        itemIndex.current = indexTemp
        setPlayState(!!play)
    }
    const stop = () => {
        jump(0)
    }
    const send = (data: DanmakuBaseData, time?: number) => {
        setInitData(initData => {
            if (typeof time == 'undefined') time = playTime.current
            let t: Array<DanmakuData> = JSON.parse(JSON.stringify(initData))
            let indexTemp = 0
            while (initData[indexTemp] && initData[indexTemp].playTime <= time) {
                indexTemp++
            }
            t.splice(indexTemp, 0, {
                ...data,
                playTime: playTime.current
            })
            setTunnel(tunnel => {
                let t1 = [...tunnel]
                t1.splice(indexTemp, 0, '')
                return t1
            })
            return t
        })
    }

    //存储容器的位置与宽高
    const [containerLayout, setContainerLayout] = useState({
        width: 0,
        height: 0,
        x: 0,
        y: 0
    })
    //最大弹幕行数
    const maxLine = useRef(1)
    //存储弹幕所在轨道
    const [tunnel, setTunnel] = useState<Array<string>>(Array(props.data.length).fill(''))
    //弹幕高度
    const ihTmp = props.itemFontSize ? props.itemFontSize * 1.5 : defaultProps.itemFontSize * 1.5
    const [itemHeight, setItemHeight] = useState(ihTmp)
    useEffect(() => {
        if (!containerLayout.height) return

        const defaultMaxLine = Math.floor(containerLayout.height / itemHeight)
        if (props.maxLine && props.maxLine >= 1 && props.maxLine <= defaultMaxLine) maxLine.current = props.maxLine
        //0-1之间将作为百分比
        else if (props.maxLine && props.maxLine < 1 && props.maxLine > 0) maxLine.current = Math.ceil(props.maxLine * defaultMaxLine)
        else maxLine.current = defaultMaxLine

    }, [props.maxLine, containerLayout, itemHeight])
    useEffect(() => {
        if (!containerLayout.height) return
        let ih = props.itemFontSize ? props.itemFontSize * 1.5 : defaultProps.itemFontSize * 1.5
        setItemHeight(ih)
        maxLine.current = Math.floor(containerLayout.height / ih)
    }, [props.itemFontSize])

    //弹幕数据
    const [initData, setInitData] = useState<Array<DanmakuData>>([])
    const onContainerLayout = (event: LayoutChangeEvent) => {
        setContainerLayout({
            ...event.nativeEvent.layout
        })
        maxLine.current = Math.floor(event.nativeEvent.layout.height / itemHeight)
    }
    useEffect(() => {
        let t = [...props.data]
        t.sort((a, b) => a.playTime - b.playTime)
        setTunnel(Array(props.data.length).fill(''))
        setInitData(t)
        itemInState.current = Array(props.data.length).fill(false)
        itemIndex.current = 0
        playTime.current = 0
    }, [props.data])

    //下一个要发射的弹幕位置
    const itemIndex = useRef(0)
    //当前时间
    const playTime = useRef(0)
    const lastTime = useRef(0)
    //播放状态
    const [playState, setPlayState] = useState(false)

    const loop = (time: number, init: boolean) => {
        //设置当前播放时间
        if (init) lastTime.current = time
        playTime.current = (time - lastTime.current) * (props.playSpeed ?? defaultProps.playSpeed) + playTime.current
        lastTime.current = time

        //找到当前时间内所有未发射弹幕并计算其应在轨道
        let t = [...tunnel]
        let itemIndexTemp = itemIndex.current
        while (initData[itemIndexTemp] && initData[itemIndexTemp].playTime <= playTime.current) {
            let res = -1
            let mode = initData[itemIndexTemp].mode || 0
            if ([0, 1, 2].indexOf(mode) == -1) mode = 0
            for (let i = 0; i < maxLine.current; i++) {
                let arr = t.map((v, i) => ({ v, i })).filter(v => v.v == mode + '-' + i)
                if (arr.length == 0) {
                    res = i
                    break
                }
                if (mode == 0 && itemInState.current[arr[arr.length - 1].i]) {
                    res = i
                    break
                } else continue
            }
            if (res != -1) t[itemIndexTemp] = mode + '-' + res
            else break
            itemIndexTemp++
        }
        if (t.join() != tunnel.join()) {
            itemIndex.current = itemIndexTemp
            setTunnel(t)
        }
        return playState
    }
    //requestAnimationFrame的自定义hook
    useRafLoop({
        state: playState && !!initData.length,
        callback: loop
    })

    //存储某弹幕是否完全出现在屏幕内
    const itemInState = useRef<Array<boolean>>(Array(props.data.length).fill(false))
    const setRight = (index: number, value: boolean) => {
        let tmp = [...itemInState.current]
        if (!value || tmp[index]) return
        tmp[index] = value
        itemInState.current = tmp
    }

    //弹幕动画结束时从轨道上移出
    const onEnd = (index: number) => {
        setTunnel(tunnel => {
            let t = [...tunnel]
            t[index] = ''
            return t
        })
    }

    return (
        <View {...props} >
            <View
                style={[
                    {
                        flex: 1,
                        position: 'relative',
                        overflow: 'hidden',
                    },
                ]}
                onLayout={onContainerLayout}
            >
                {
                    tunnel.map((v, i) => ({ v, i })).filter(v => v.v).map(v => {
                        const [mode, t] = v.v.split('-').map(Number)
                        let opacity = 0
                        if (props.visible) opacity = typeof props.itemOpacity != 'undefined' ? props.itemOpacity : defaultProps.itemOpacity
                        const commonProps = {
                            msg: initData[v.i].msg,
                            color: initData[v.i].color,
                            fontSize: props.itemFontSize || defaultProps.itemFontSize,
                            opacity: opacity,
                            speed: props.itemSpeed || defaultProps.itemSpeed,
                            shadowHidden: props.itemShadowHidden || false,
                            mark: initData[v.i].mark || false,
                            playState: playState,
                            initLeft: containerLayout.x + containerLayout.width,
                            initVertical: containerLayout.y + t * itemHeight,
                            containerWidth: containerLayout.width,
                            onEnd: () => onEnd(v.i),
                            key: v.i,
                        }
                        if (mode == 0) {
                            return <DanmakuRollItem
                                {...commonProps}
                                setRight={value => setRight(v.i, value)}
                            />
                        } else if (mode == 1 || mode == 2) {
                            return <DanmakuFixedItem
                                {...commonProps}
                                initLeft={containerLayout.x + containerLayout.width / 2}
                                positon={mode == 1 ? 'top' : 'bottom'}
                            />
                        } else {
                            return <View key={v.i}></View>
                        }
                    })
                }
            </View>
        </View>
    )
})


export default Danmaku
