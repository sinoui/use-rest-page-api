import qs from 'qs';
import { SortInfo } from './types';

export default function getSearchParams(
  pageNo: number,
  size: number,
  sorts?: SortInfo[],
  searchParams?: { [x: string]: string },
) {
  return qs.stringify(
    {
      ...searchParams,
      page: pageNo,
      size,
      sort: sorts
        ? sorts.map(
            (_sort) =>
              `${_sort.property}${_sort.direction === 'desc' ? ',desc' : ''}`,
          )
        : undefined,
    },
    {
      arrayFormat: 'repeat',
    },
  );
}
