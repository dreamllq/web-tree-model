import { TreeNode } from '@/models/tree-node';
import { Id } from './id';
import { TreeDataItem } from './tree';

export type TreeNodeConstructor = {
  id: Id;
  children?: TreeDataItem[];
  [key: string]: any;
}

export type ToJSONType<TData = any> = ReturnType<TreeNode<TData>['toJSON']>;