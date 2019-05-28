import qs from 'qs';
import { SortInfo } from './types';

export default function getSearchParams(
  pageNo: number,
  size: number,
  sorts?: SortInfo[],
) {
  return qs.stringify(
    {
      page: pageNo,
      size,
      sort: sorts
        ? sorts.map(
            (_sort) =>
              `${_sort.property}${_sort.direction === 'desc' ? '_desc' : ''}`,
          )
        : undefined,
    },
    {
      arrayFormat: 'comma',
    },
  );
}
