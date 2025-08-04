// tests/tree.test.ts
import { Tree } from '@/models/tree';
import { TreeDataItem } from '@/types/tree';

describe('Tree', () => {
  let treeData: TreeDataItem[];
  let tree: Tree;

  beforeEach(() => {
    treeData = [
      {
        id: '1',
        title: 'Node 1',
        children: [
          {
            id: '2',
            title: 'Node 2',
            children: [
              {
                id: '3',
                title: 'Node 3'
              }
            ]
          },
          {
            id: '4',
            title: 'Node 4'
          }
        ]
      },
      {
        id: '5',
        title: 'Node 5'
      }
    ];
    
    tree = new Tree(treeData);
  });

  describe('constructor', () => {
    test('should initialize root nodes correctly', () => {
      expect(tree.root).toHaveLength(2);
      expect(tree.root[0].id).toBe('1');
      expect(tree.root[1].id).toBe('5');
    });

    test('should initialize store with all nodes', () => {
      expect(tree.store.size).toBe(5);
      expect(tree.store.has('1')).toBeTruthy();
      expect(tree.store.has('2')).toBeTruthy();
      expect(tree.store.has('3')).toBeTruthy();
      expect(tree.store.has('4')).toBeTruthy();
      expect(tree.store.has('5')).toBeTruthy();
    });
  });

  describe('flat', () => {
    test('should return flattened tree data', () => {
      const flatData = tree.flat();
      expect(flatData).toHaveLength(2);
      expect(flatData.map(item => item.id)).toEqual(['1', '5']);
    });

    test('should return flattened tree data expanded', () => {
      tree.expand('1', true);
      const flatData = tree.flat();
      expect(flatData).toHaveLength(4);
      expect(flatData.map(item => item.id)).toEqual([
        '1',
        '2',
        '4',
        '5'
      ]);
    });
  });

  describe('expand', () => {
    test('should expand a node when it exists', () => {
      tree.expand('1', true);
      expect(tree.store.get('1')?.expanded).toBeTruthy();
    });

    test('should not throw error when expanding non-existent node', () => {
      expect(() => tree.expand('non-existent', true)).not.toThrow();
    });
  });

  describe('check', () => {
    test('should check a node when it exists', () => {
      tree.check('2', true);
      expect(tree.store.get('2')?.checked).toBeTruthy();
    });

    test('should not throw error when checking non-existent node', () => {
      expect(() => tree.check('non-existent', true)).not.toThrow();
    });
  });

  describe('getCheckedNodes', () => {
    test('should return all checked nodes', () => {
      tree.check('1', true);
      
      const checkedNodes = tree.getCheckedNodes();
      expect(checkedNodes).toHaveLength(4);
      expect(checkedNodes.some(node => node.id === '1')).toBeTruthy();
      expect(checkedNodes.some(node => node.id === '2')).toBeTruthy();
      expect(checkedNodes.some(node => node.id === '3')).toBeTruthy();
      expect(checkedNodes.some(node => node.id === '4')).toBeTruthy();
    });

    test('should return all checked nodes#2', () => {
      tree.check('3', true);
      
      const checkedNodes = tree.getCheckedNodes();
      expect(checkedNodes).toHaveLength(2);
      expect(checkedNodes.some(node => node.id === '3')).toBeTruthy();
      expect(checkedNodes.some(node => node.id === '2')).toBeTruthy();

      expect(tree.store.get('1')?.indeterminate).toBeTruthy();
      expect(tree.store.get('2')?.indeterminate).toBe(false);
      expect(tree.store.get('1')?.checked).toBe(false);
      expect(tree.store.get('2')?.checked).toBe(true);
    });

    test('should return empty array when no nodes are checked', () => {
      const checkedNodes = tree.getCheckedNodes();
      expect(checkedNodes).toHaveLength(0);
    });
  });

  describe('getExpandedNodes', () => {
    test('should return all expanded nodes', () => {
      tree.expand('2', true);
      tree.expand('5', true);
      
      const expandedNodes = tree.getExpandedNodes();
      expect(expandedNodes).toHaveLength(2);
      expect(expandedNodes.some(node => node.id === '2')).toBeTruthy();
      expect(expandedNodes.some(node => node.id === '5')).toBeTruthy();
    });

    test('should return empty array when no nodes are expanded', () => {
      const expandedNodes = tree.getExpandedNodes();
      expect(expandedNodes).toHaveLength(0);
    });
  });

  describe('add', () => {
    test('should add a new node to an existing parent node', () => {
      const newItem: TreeDataItem = {
        id: '6',
        title: 'Node 6'
      };

      // 确保添加前节点不存在
      expect(tree.store.has('6')).toBeFalsy();
      expect(tree.flat()).toHaveLength(2);

      // 添加节点
      tree.add('1', newItem);

      // 验证节点已添加
      expect(tree.store.has('6')).toBeTruthy();
      expect(tree.flat()).toHaveLength(2); // 仍然是2，因为节点1未展开
      expect(tree.store.get('1')?.children).toHaveLength(3);
      expect(tree.store.get('1')?.children?.[2].id).toBe('6');
    });

    test('should not add node when parent does not exist', () => {
      const newItem: TreeDataItem = {
        id: '7',
        title: 'Node 7'
      };

      const initialNodeCount = tree.flat().length;
      const initialStoreSize = tree.store.size;

      tree.add('non-existent', newItem);

      // 验证树结构没有变化
      expect(tree.flat()).toHaveLength(initialNodeCount);
      expect(tree.store.size).toBe(initialStoreSize);
      expect(tree.store.has('7')).toBeFalsy();
    });

    test('should add node to a parent without existing children', () => {
      const newItem: TreeDataItem = {
        id: '7',
        title: 'Node 7'
      };

      tree.add('5', newItem);

      expect(tree.store.has('7')).toBeTruthy();
      expect(tree.store.get('5')?.children).toHaveLength(1);
      expect(tree.store.get('5')?.children?.[0].id).toBe('7');
    });

    test('should maintain checked state when adding node to unchecked parent', () => {
      const newItem: TreeDataItem = {
        id: '6',
        title: 'Node 6'
      };

      tree.add('1', newItem);

      expect(tree.store.get('1')?.checked).toBe(false);
      expect(tree.store.get('6')?.checked).toBe(false);
    });

    test('should properly set checked state when adding node to checked parent', () => {
      const newItem: TreeDataItem = {
        id: '6',
        title: 'Node 6'
      };

      tree.check('1', true);
      tree.add('1', newItem);

      expect(tree.store.get('1')?.checked).toBe(true);
      expect(tree.store.get('6')?.checked).toBe(true);
    });

    test('should properly set indeterminate state when adding node to indeterminate parent', () => {
      const newItem: TreeDataItem = {
        id: '6',
        title: 'Node 6'
      };

      tree.check('2', true);
      tree.add('1', newItem);

      expect(tree.store.get('1')?.indeterminate).toBe(true);
      expect(tree.store.get('1')?.checked).toBe(false);
      // 新添加的节点应该继承父节点的选中状态（在这种情况下是false）
      expect(tree.store.get('6')?.checked).toBe(false);
    });
  });

  describe('remove', () => {
    test('should remove an existing node and its children', () => {
      // 确认初始状态
      expect(tree.store.has('2')).toBeTruthy();
      expect(tree.store.has('3')).toBeTruthy();
      expect(tree.flat()).toHaveLength(2);

      // 删除节点
      tree.remove('2');

      // 验证节点及其子节点已删除
      expect(tree.store.has('2')).toBeFalsy();
      expect(tree.store.has('3')).toBeFalsy();
      expect(tree.flat()).toHaveLength(2);
      expect(tree.store.get('1')?.children).toHaveLength(1);
      expect(tree.store.get('1')?.children?.[0].id).toBe('4');
    });

    test('should remove a root node', () => {
      // 确认初始状态
      expect(tree.store.has('1')).toBeTruthy();
      expect(tree.store.has('2')).toBeTruthy();
      expect(tree.store.has('3')).toBeTruthy();
      expect(tree.store.has('4')).toBeTruthy();
      expect(tree.flat()).toHaveLength(2);
      expect(tree.root).toHaveLength(2);

      // 删除根节点
      tree.remove('1');

      // 验证根节点已删除
      expect(tree.store.has('1')).toBeFalsy();
      expect(tree.store.has('2')).toBeFalsy();
      expect(tree.store.has('3')).toBeFalsy();
      expect(tree.store.has('4')).toBeFalsy();
      expect(tree.flat()).toHaveLength(1);
      expect(tree.root).toHaveLength(1);
      expect(tree.root[0].id).toBe('5');
    });

    test('should not throw error when removing non-existent node', () => {
      const initialNodeCount = tree.flat().length;
      const initialStoreSize = tree.store.size;
      const initialRootLength = tree.root.length;

      expect(() => tree.remove('non-existent')).not.toThrow();

      // 验证树结构没有变化
      expect(tree.flat()).toHaveLength(initialNodeCount);
      expect(tree.store.size).toBe(initialStoreSize);
      expect(tree.root).toHaveLength(initialRootLength);
    });

    test('should properly remove a leaf node', () => {
      // 确认初始状态
      expect(tree.store.has('3')).toBeTruthy();
      expect(tree.flat()).toHaveLength(2);

      // 删除叶子节点
      tree.remove('3');

      // 验证叶子节点已删除
      expect(tree.store.has('3')).toBeFalsy();
      expect(tree.store.get('2')?.children).toHaveLength(0);
    });

    test('should update parent checked state when removing a checked child', () => {
      // 选中节点2和3
      tree.check('2', true);
      
      expect(tree.store.get('2')?.checked).toBe(true);
      expect(tree.store.get('1')?.indeterminate).toBe(true);
      
      // 删除节点3
      tree.remove('3');
      
      // 验证节点3已删除
      expect(tree.store.has('3')).toBeFalsy();
      
      // 验证节点2和1的状态更新
      expect(tree.store.get('2')?.checked).toBe(true);
      expect(tree.store.get('2')?.indeterminate).toBe(false);
      expect(tree.store.get('1')?.indeterminate).toBe(true); // 仍然有选中的子节点(节点2)
    });

    test('should update parent checked state when removing an unchecked child from partially checked parent', () => {
      // 选中节点3(使节点1变为indeterminate)
      tree.check('3', true);
      
      expect(tree.store.get('1')?.indeterminate).toBe(true);
      expect(tree.store.get('1')?.checked).toBe(false);
      expect(tree.store.get('2')?.checked).toBe(true);
      
      // 删除节点4(未选中的兄弟节点)
      tree.remove('4');
      
      // 验证节点4已删除
      expect(tree.store.has('4')).toBeFalsy();
      
      // 验证节点1和2的状态
      expect(tree.store.get('1')?.indeterminate).toBe(false);
      expect(tree.store.get('1')?.checked).toBe(true);
      expect(tree.store.get('2')?.checked).toBe(true);
    });

    test('should properly handle removing a child that makes parent fully checked', () => {
      // 选中节点2和4(使节点1的所有子节点都被选中)
      tree.check('2', true);
      tree.check('4', true);
      
      expect(tree.store.get('1')?.checked).toBe(true);
      expect(tree.store.get('1')?.indeterminate).toBe(false);
      
      // 删除节点4
      tree.remove('4');
      
      // 验证节点4已删除
      expect(tree.store.has('4')).toBeFalsy();
      
      // 验证节点1的状态更新为部分选中
      expect(tree.store.get('1')?.checked).toBe(true);
      expect(tree.store.get('1')?.indeterminate).toBe(false);
    });
  });
});