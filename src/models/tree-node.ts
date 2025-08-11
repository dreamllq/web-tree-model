import { Id } from '@/types/id';
import { ToJSONType, TreeNodeConstructor } from '@/types/tree-node';

export class TreeNode<TData = any> {
  id: Id;
  children?: TreeNode<TData>[];
  data: TData;
  expanded = false;
  parent?: TreeNode<TData>;
  checked = false;
  indeterminate = false;
  store: Map<Id, TreeNode<TData>>;

  constructor(options:TreeNodeConstructor, parent: TreeNode<TData> | undefined, store: Map<Id, TreeNode<TData>>) {
    const { id, children, ...data } = options;
    this.id = id;
    this.parent = parent;
    this.children = children?.map(child => {
      const childNode = new TreeNode<TData>({ ...child }, this, store);
      return childNode;
    });
    this.data = data as TData;

    store.set(id, this);
    this.store = store;
  }

  get deep() {
    if (this.parent) {
      return this.parent.deep + 1;
    } else {
      return 0;
    }
  }

  flat () {
    const data = [this.toJSON()];
    if (this.expanded && Array.isArray(this.children)) {
      this.children.forEach(child => {
        const list = child.flat();
        data.push(...list);
      });
    }
    return data;
  }

  expand(bool: boolean) {
    this.expanded = bool;
  }

  check(bool: boolean) {
    this.checked = bool;
    this.indeterminate = false;
    this.checkChildren(bool);
    this.updateParentChecked();
  }

  add(item: TreeNode<TData>) {
    this.children = this.children || [];
    this.children.push(item);
    if (this.checked) {
      item.checked = true;
      item.checkChildren(true);
    }
  }

  remove() {
    if (this.parent) {
      this.parent.removeChild(this.id);
    }

    this.removeChildren();
    this.updateParentChecked();
  }

  removeChild(id: Id) {
    if (Array.isArray(this.children)) {
      this.children = this.children.filter(item => item.id !== id);
    }
  }

  removeChildren() {
    this.children?.forEach(child => {
      child.removeChildren();
    });
    this.children = undefined;
    this.store.delete(this.id);
  }

  private checkChildren(bool: boolean) {
    this.children?.forEach(child => {
      child.checked = bool;
      child.indeterminate = false;
      child.checkChildren(bool);
    });
  }

  private updateParentChecked() { 
    if (this.parent) {
      const checked = !!this.parent.children?.every(child => child.checked);
      this.parent.checked = checked;
      if (checked) {
        this.parent.indeterminate = false;
      } else {
        const indeterminate = !!this.parent.children?.some(child => child.checked || child.indeterminate);
        this.parent.indeterminate = indeterminate;
      }
      this.parent.updateParentChecked();
    }
  }

  toJSON () {
    return {
      id: this.id,
      expanded: this.expanded,
      deep: this.deep,
      checked: this.checked,
      indeterminate: this.indeterminate,
      hasChildren: Array.isArray(this.children) && this.children.length > 0,
      childrenIsArray: Array.isArray(this.children),
      _k: btoa(`${this.id}_${this.checked}_${this.indeterminate}_${this.expanded}`),
      _checkFlag: btoa(`${this.id}_${this.checked}_${this.indeterminate}`),
      _expandFlag: btoa(`${this.id}_${this.expanded}`),
      data: this.data
    };
  }
}