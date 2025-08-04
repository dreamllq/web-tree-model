import { Id } from './id';

export type TreeDataItem = {
  id: Id,
  children?: TreeDataItem[],
  [key: string]: any
}