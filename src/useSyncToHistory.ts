import { useEffect } from 'react';
import qs from 'qs';
import { State } from './reducer';

/**
 * 将查询条件和分页信息同步到url中
 *
 * @param syncToUrl 是否同步url
 * @param state  状态
 */
function useSyncToHistory<T>(syncToUrl: boolean | undefined, state: State<T>) {
  useEffect(() => {
    if (!syncToUrl) {
      return;
    }
    const search = `?${qs.stringify({
      ...state.searchParams,
      pageNo: state.pagination.pageNo,
      pageSize: state.pagination.pageSize,
      sorts: state.pagination.sorts,
    })}`;
    if (search !== window.location.search) {
      window.history.pushState(window.history.state, document.title, search);
    }
  }, [state.searchParams, syncToUrl, state.pagination]);
}

export default useSyncToHistory;
