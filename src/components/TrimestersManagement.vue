<template>
  <div>
    <a-list
      itemLayout="horizontal"
      :dataSource="trimesters"
    >
      <a-list-item slot="renderItem" slot-scope="item">
        <a-button
          slot="actions"
          :type="hasColorSeed(item.key) ? 'primary' : 'default'"
          :ghost="hasColorSeed(item.key)"
          @click="showColorSeedDrawer(item)"
        >
          色彩Seed
        </a-button>
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
    <a-drawer
      width="100%"
      title="色彩Seed"
      placement="right"
      :destroy-on-close="true"
      :visible="colorSeedVisible"
      @close="colorSeedVisible = false"
    >
      <color-seed :trimester="colorSeedTrimester" />
    </a-drawer>
  </div>
</template>

<script>
  import {Modal} from 'ant-design-vue'
  import ColorSeed from './ColorSeed.vue'

  export default {
    name: 'TrimestersManagement',
    components: {
      ColorSeed,
    },
    data() {
      return {
        colorSeedVisible: false,
        colorSeedTrimester: null,
      };
    },
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
      hasColorSeed(trimesterKey) {
        return typeof this.$store.state.colorSeeds[trimesterKey] === 'string';
      },
      clearTrimesterReservedClasses(obj) {
        Modal.confirm({
          title: `正在清空“${obj.name}”的${obj.reservedCount}个待选项`,
          content: '该操作暂无法撤销，确定要继续吗？',
          okText: '确定',
          okType: 'danger',
          okButtonProps: {
            ghost: true,
          },
          cancelText: '取消',
          onOk: () => {
            this.$store.dispatch('clearReservedClasses', obj.key);
          },
        });
      },
      deleteTrimester(obj) {
        Modal.confirm({
          title: `正在删除“${obj.name}”`,
          content: (obj.reservedCount > 0 ? `该操作将清空此学期的${obj.reservedCount}个待选项，且` : '该操作') + '暂无法撤销，确定要继续吗？',
          okText: '确定',
          okType: 'danger',
          okButtonProps: {
            ghost: true,
          },
          cancelText: '取消',
          onOk: () => {
            this.$store.dispatch('deleteTrimester', obj.key);
          },
        });
      },
      showColorSeedDrawer(obj) {
        this.colorSeedTrimester = obj.key;
        this.colorSeedVisible = true;
      },
    },
  }
</script>

<style scoped>

</style>