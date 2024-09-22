import {formatClass, formatStyle} from '../utils/styleClassTransformer'
import options from '../options'
// import RenderReactNode from './RenderReactNode'

export default function getChildInfo(child, index, vueInReactCall, defaultSlotsFormatter, hashList) {

  // Filter out ref
  const {ref, ...props} = child.props || {}

  const reactScoped = {}
  Object.keys(child.children || {}).forEach((key) => {
    const fn = child.children[key]
    // get reactNode and children
    const prefix = options.react.vueNamedSlotsKey.find((prefix) => key.indexOf(prefix) === 0)
    if (prefix || key === 'default') {
      // replace slot's name to react props key name
      const newKey = key.replace(new RegExp(`^${prefix}`), '').replace(/^default$/, 'children')
      reactScoped[newKey] = defaultSlotsFormatter.call(child.__top__, fn(), vueInReactCall, hashList)
      return
    }

    if (typeof fn === 'function') {
      // react render props
      reactScoped[key] = function (...args) {
        fn.__reactArgs = args
        return defaultSlotsFormatter(fn.apply(this, args), vueInReactCall, hashList)
      }
    }
  })

  const newProps = {}
  const style = formatStyle(props.style)
  const className = Array.from(new Set(formatClass(props.class))).join(' ')
  if (Object.keys(style).length > 0) newProps.style = style
  if (className !== '') newProps.className = className

  Object.assign(props, {
    ...newProps,
    ...reactScoped,
  })
  delete props.class

  // if (child.type === RenderReactNode) {
  //     const reactNode = props.node
  //     props.node = () => reactNode
  // }

  // remove ref_for
  if (typeof props.ref_for === "boolean") delete props.ref_for

  return props
}
