import { TreeNode } from '@/models/tree-node';
import { Id } from './id';
import { TreeDataItem } from './tree';

export type TreeNodeConstructor = {
  id: Id;
  children?: TreeDataItem[];
  deep?:number;
  parent?: TreeNode;
  [key: string]: any;
}

export type ToJSONType = {
  id: Id;
  expand: boolean;
  deep: number;
  hasChildren: boolean;
  checked: boolean;
  indeterminate: boolean;
  _k: string;
  [key: string]: any;
}