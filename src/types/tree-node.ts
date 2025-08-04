import { Id } from './id';
import { TreeDataItem } from './tree';

export type TreeNodeConstructor = {
  id: Id;
  children?: TreeDataItem[];
  [key: string]: any;
}

export type ToJSONType = {
  id: Id;
  expand: boolean;
  deep: number;
  hasChildren: boolean;
  checked: boolean;
  indeterminate: boolean;
  [key: string]: any;
}