# react-native-simple-danmaku
react-native弹幕组件，纯RN编写。Android可用，Ios没有测试，但应该可用

# 安装

```shell
yarn add react-native-simple-danmaku
```

或

```shell
npm i react-native-simple-danmaku
```

# 开始使用

### 例子

```typescript
import React, { useEffect, useRef, useState } from 'react'

import Danmaku from 'react-native-simple-danmaku'

const App = () => {

  const ref = useRef<DanmakuRef>(null)
  const [data, setData] = useState<Array<DanmakuData>>([])

  useEffect(() => {
    setData([
      {
        msg: 'aaaaaa',
        playTime: 10,
      },
      {
        msg: 'bbbbbbbbbb',
        playTime: 0,
        mode: 0,
        color: '#f00'
      },
      {
        msg: 'cccccccccccccc',
        playTime: 100,
        mode: 1,
      }
    ])
    ref.current?.play()
  }, [])

  return (
    <>
      <Danmaku
        ref={ref}
        data={data}
        visible={true}
        itemFontSize={20}
        style={{
          flex: 1
        }}
      />
    </>
  )
}

export default App
```

### 弹幕格式

```typescript
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
```



### Methods

```typescript
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
```

### Props

```typescript
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
```
