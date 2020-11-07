import {
    useRef,
    useEffect
} from 'react'

interface RafLoopProps {
    state: boolean,
    callback: (time: number, init: boolean) => boolean
}

export const useRafLoop = (props: RafLoopProps) => {
    const ref = useRef<any>()

    useEffect(() => {
        ref.current = props.callback
    })

    const loop = (time: number, init: boolean) => {
        const rv = ref.current(time, init)
        rv && props.state && requestAnimationFrame(time => loop(time, false))
    }
    useEffect(() => {
        props.state && requestAnimationFrame(time => loop(time, true))
    }, [props.state])
}
