import { TreeDataItem } from '@/types/tree';
import { TreeNode } from './tree-node';
import { Id } from '@/types/id';
import { Events } from '@/types/events';
import EventEmitter from 'eventemitter3';
export class Tree extends EventEmitter<Events, any> {
  root: TreeNode[];
  store: Map<Id, TreeNode> = new Map();
  constructor(data:TreeDataItem[]) {
    super();
    this.root = data.map(item => new TreeNode(item, this.store));
  }

  flat () {
    const data: ReturnType<typeof TreeNode.prototype.toJSON>[] = [];
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
      this.emit(Events.SELECTION_CHANGE);
    }
  }

  getCheckedNodes() {
    const nodes: TreeNode[] = [];
    this.store.forEach(node => {
      if (node.checked) {
        nodes.push(node);
      }
    });
    return nodes;
  }

  getExpandedNodes() {
    const nodes: TreeNode[] = [];
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
      node.add(new TreeNode(item, this.store));
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