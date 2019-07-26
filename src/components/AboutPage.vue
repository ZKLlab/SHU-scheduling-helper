<template>
  <div>
    <update-message />
    <p>开发者很懒，什么都没有留下。</p>
    <p>
      项目已开源，<br />
      <del>
        对于需要练习代码优化和重构/重写的人来说，<br />
        此项目必为最值得用于练习的案例（大雾）。
      </del>
    </p>
    <p><a href="https://chrome.google.com/webstore/detail/kmgdfejkkpmeimbkglbjmgbfiggimfhp" target="_blank">
      <img alt="Chrome Web Store"
           src="https://img.shields.io/chrome-web-store/v/kmgdfejkkpmeimbkglbjmgbfiggimfhp.svg?style=flat-square" />
    </a></p>
    <p>
      <!--suppress HtmlDeprecatedAttribute -->
      <iframe src="https://ghbtns.com/github-btn.html?user=ZKLlab&repo=SHU-scheduling-helper&type=star&count=true"
              frameborder="0" scrolling="0" width="100px" height="20px"></iframe>
      <!--suppress HtmlDeprecatedAttribute -->
      <iframe src="https://ghbtns.com/github-btn.html?user=ZKLlab&repo=SHU-scheduling-helper&type=fork&count=true"
              frameborder="0" scrolling="0" width="100px" height="20px"></iframe>
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
  import UpdateMessage from './UpdateMessage'

  export default {
    name: 'AboutPage',
    components: {UpdateMessage},
    computed: {
      email() {
        return atob('emtsQHprbGxhYi5jb20=');
      },
      mailto() {
        return `mailto:${this.email}`
      },
    },
  };
</script>

<style scoped>

</style>