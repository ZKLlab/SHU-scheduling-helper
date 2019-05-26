<template>
  <div>
    <p>开发者很懒，什么都没有留下。</p>
    <p>
      项目已开源，<br />
      <del>
        对于需要练习代码优化和重构/重写的人来说，<br />
        此项目必为最值得用于练习的案例（大雾）。
      </del>
    </p>
    <p>
      <a-icon type="github" />
      Github: <a href="https://github.com/ZKLlab/SHU-scheduling-helper" target="_blank">ZKLlab/SHU-scheduling-helper</a><br />
      <a-icon type="team" />
      Contributor(s): [ <a href="https://github.com/ZKLlab" target="_blank">ZKL</a> ]<br />
      <a-icon type="mail" />
      Email: <a :href="mailto">{{ email }}</a><br />
      <a-icon type="environment" />
      Location: SHUCES, Shanghai, China
    </p>
  </div>
</template>

<script>
  export default {
    name: 'AboutPage',
    computed: {
      email() {
        return atob('emtsQHprbGxhYi5jb20=');
      },
      mailto() {
        return `mailto:${this.email}`
      },
    },
  }
</script>

<style scoped>

</style>