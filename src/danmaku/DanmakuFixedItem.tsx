import * as React from 'react'
import {
    useEffect,
    useRef,
    useState,
    memo
} from 'react'
import {
    Text,
    Animated,
    LayoutChangeEvent,
    Easing,
} from 'react-native'

import { DanmakuFixedItemProps } from './types'


function DanmakuFixedItem(props: DanmakuFixedItemProps) {

    const timeValue = useRef(1000 / props.speed)
    const timeAnim = useRef(new Animated.Value(timeValue.current)).current

    const [nodeWidth, setNodeWidth] = useState(-1)

    const init = (event: LayoutChangeEvent) => {
        setNodeWidth(event.nativeEvent.layout.width)
        timeAnim.removeAllListeners()
        timeAnim.addListener(({ value }) => {
            if (value == 0) props.onEnd()
        })
    }
    useEffect(() => {
        timeAnim.stopAnimation((value) => {
            timeValue.current = value && 1000 / props.speed * value / timeValue.current
        })
        if (!props.playState) return
        Animated.timing(
            timeAnim,
            {
                toValue: 0,
                duration: timeValue.current,
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start()
    }, [props.playState, props.speed])
    return (
        <Text
            onLayout={init}
            numberOfLines={1}
            style={{
                position: 'absolute',
                [props.positon]: props.initVertical,
                right: nodeWidth == -1 ? props.containerWidth : props.initLeft - nodeWidth / 2,
                color: props.color ? props.color : '#fff',
                fontSize: props.fontSize,
                fontWeight: 'bold',
                textShadowRadius: props.shadowHidden ? undefined : 1,
                textShadowColor: props.shadowHidden ? undefined : `rgba(0,0,0,${props.opacity})`,
                opacity: props.opacity,
                borderWidth: props.mark ? 1 : 0,
                borderColor: '#777',
                paddingHorizontal: 2
            }}
        >
            {props.msg}
        </Text>
    )
}

export default memo(DanmakuFixedItem)
