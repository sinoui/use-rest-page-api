import { useRef, useEffect } from 'react';

/**
 * 在组件初始化或者deps发生变化时执行指定的副作用。
 *
 * 当心：eslint不会检查useEffect2的callback与deps之间的关系，所以一定要在使用useEffect2之前考虑清楚依赖关系。
 *
 * @param callback
 * @param deps
 */
function useEffect2(callback: () => void, deps: any[] = []) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    callbackRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useEffect2;
