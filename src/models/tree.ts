import { TreeDataItem } from '@/types/tree';
import { TreeNode } from './tree-node';
import { Id } from '@/types/id';
export class Tree<TData = any> {
  root: TreeNode<TData>[];
  store: Map<Id, TreeNode<TData>> = new Map();
  constructor(data:TreeDataItem[]) {
    this.root = data.map(item => new TreeNode<TData>(item, undefined, this.store));
  }

  getById(id: Id) {
    return this.store.get(id);
  }

  flat () {
    const data: ReturnType<TreeNode<TData>['toJSON']>[] = [];
    this.root.forEach(node => {
      const list = node.flat();
      data.push(...list);
    });
    return data;
  }

  expand(id: Id, expand: boolean) {
    const node = this.store.get(id);
    if (node) {
      node.expand(expand);
    }
  }

  check(id: Id, checked: boolean) {
    const node = this.store.get(id);
    if (node) {
      node.check(checked);
    }
  }

  getCheckedNodes() {
    const nodes: TreeNode<TData>[] = [];
    this.store.forEach(node => {
      if (node.checked) {
        nodes.push(node);
      }
    });
    return nodes;
  }

  getExpandedNodes() {
    const nodes: TreeNode<TData>[] = [];
    this.store.forEach(node => {
      if (node.expanded) {
        nodes.push(node);
      }
    });

    return nodes;
  }

  add(pid: Id, item: TreeDataItem) {
    const node = this.store.get(pid);
    if (node) {
      node.add(new TreeNode<TData>(item, node, this.store));
    }
  }

  remove(id: Id) {
    const node = this.store.get(id);
    if (node) {
      this.root = this.root.filter(item => item.id !== id);
      node.remove();
    }
  }
}