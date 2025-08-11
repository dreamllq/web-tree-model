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
  checked: boolean;
  indeterminate: boolean;
  hasChildren: boolean;
  childrenIsArray: boolean;
  _k: string;
  _checkFlag: string;
  _expandFlag: string;
  [key: string]: any;
}