<template>
  <a-list
    itemLayout="horizontal"
    :dataSource="trimesters"
  >
    <a-list-item slot="renderItem" slot-scope="item">
      <a-button
        type="dashed"
        slot="actions"
        :disabled="item.reservedCount === 0"
        @click="clearTrimesterReservedClasses(item)"
      >
        清空
      </a-button>
      <a-button
        type="danger"
        slot="actions"
        @click="deleteTrimester(item)"
      >
        删除
      </a-button>
      <a-list-item-meta :title="item.name" :description="`${item.reservedCount}个待选项`"></a-list-item-meta>
    </a-list-item>
  </a-list>
  <!--  <div>{{ $store.state.trimesters }}</div>-->
</template>

<script>
  import {Modal} from 'ant-design-vue'

  export default {
    name: 'TrimestersManagement',
    computed: {
      trimesters() {
        let result = [];
        this.$store.state.trimesters.forEach((value) => {
          result.push({
            name: value.name,
            key: value.key,
            reservedCount: Object.getOwnPropertyNames(this.$store.state.reservedClasses[value.key]).length - 1,
          })
        });
        return result;
      },
    },
    methods: {
      clearTrimesterReservedClasses(obj) {
        Modal.confirm({
          title: `正在清空“${obj.name}”的${obj.reservedCount}个待选项……`,
          content: '该操作暂无法撤销，确定要继续吗？',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            this.$store.dispatch('clearReservedClasses', obj.key);
          },
        });
      },
      deleteTrimester(obj) {
        Modal.confirm({
          title: `正在删除“${obj.name}”……`,
          content: (obj.reservedCount > 0 ? `该操作将清空此学期的${obj.reservedCount}个待选项，且` : '该操作') + '暂无法撤销，确定要继续吗？',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            this.$store.dispatch('deleteTrimester', obj.key);
          },
        });
      },
    },
  }
</script>

<style scoped>

</style>